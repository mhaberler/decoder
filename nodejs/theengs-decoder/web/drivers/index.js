'use strict';

import { createOmgDriver } from './omg.js';
import { createNrfDriver } from './nrf.js';
import { createAdv2UartDriver } from './adv2uart.js';

// Driver registry — append new dongle drivers here.
// Each factory returns a driver instance with:
//   name, defaultBaud, candidateBauds, needsFlowControl,
//   probeMatches(bytes) -> bool,
//   start(write), stop(write),
//   ingest(bytes, { onAdvert, onLine?, onInfo? }),
//   optional: buildPing(), sendPing(write), pingInterval.
export const driverFactories = [
  createNrfDriver,
  createAdv2UartDriver,
  createOmgDriver,
];

// Autodetect by listening to bytes via the provided reader for `timeoutMs`,
// feeding each candidate driver's probeMatches. nRF also gets an active
// PING_REQ written. First match wins; if nothing matches, returns null.
// The caller keeps owning `reader` — we never cancel or release it.
export async function detectDongle({ reader, write, timeoutMs = 600 }) {
  const drivers = driverFactories.map((f) => f());
  // Probe every driver that exposes a ping/probe-request builder. Their wire
  // formats are mutually unintelligible, so a dongle ignores the others.
  for (const d of drivers) {
    if (typeof d.buildPing === 'function') {
      try { await write(d.buildPing()); } catch {}
    }
  }

  const deadline = Date.now() + timeoutMs;
  const buffered = [];
  let winner = null;

  while (Date.now() < deadline && !winner) {
    const remain = deadline - Date.now();
    let r;
    try {
      r = await Promise.race([
        reader.read(),
        new Promise((resolve) => setTimeout(() => resolve({ __timeout: true }), Math.max(1, remain))),
      ]);
    } catch { break; }
    if (r.__timeout) {
      // Leave the pending read in flight for the caller to consume.
      break;
    }
    if (r.done) break;
    const chunk = r.value;
    if (!chunk || chunk.length === 0) continue;
    buffered.push(chunk);
    for (const d of drivers) {
      if (d.probeMatches(chunk)) { winner = d; break; }
    }
  }
  return { driver: winner, buffered };
}
