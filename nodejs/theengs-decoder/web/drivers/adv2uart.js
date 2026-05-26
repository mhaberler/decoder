'use strict';

import {
  FrameParser,
  buildScanPayload,
  appendCrc,
  CMD,
} from './adv2uart_api.mjs';
import { parseAdStructures } from './ad.js';

// ESP-IDF esp_ble_gap_adv_type_t event_type bitfield (BLE 5 Extended Adv Report).
// Bit 4 set => legacy advertiser, low nibble distinguishes legacy PDU types.
const LEGACY_BIT = 0x10;
const LEGACY_NAMES = {
  0x13: 'ADV_NONCONN_IND', // not connectable, not scannable, no scan resp
  0x15: 'ADV_DIRECT_IND',  // directed
  0x12: 'ADV_SCAN_IND',    // scannable
  0x1B: 'ADV_IND',         // connectable + scannable
  0x1A: 'SCAN_RSP',        // scan response (bit 3)
};
const PHY_NAMES = { 1: '1M', 2: '2M', 3: 'Coded' };

function macFromHexStr(hex) {
  // adv2uart_api's macFromWire returns already host-order upper-hex without separators.
  return hex.match(/.{2}/g).join(':');
}

function decodeAdvType(eventType) {
  if (eventType & LEGACY_BIT) {
    return LEGACY_NAMES[eventType] || `LEGACY_0x${eventType.toString(16)}`;
  }
  // Extended adv — describe by capability bits.
  const parts = [];
  if (eventType & 0x01) parts.push('CONN');
  if (eventType & 0x02) parts.push('SCAN');
  if (eventType & 0x04) parts.push('DIRECT');
  if (eventType & 0x08) parts.push('SCAN_RSP');
  return 'EXT_' + (parts.join('|') || 'NONE');
}

export function createAdv2UartDriver() {
  const parser = new FrameParser();
  let scanCfg = { phy1m: true, phyCoded: true, windowMs: 30 };
  let scanning = false;
  let writeRef = null;

  const stats = (typeof window !== 'undefined' ? (window.__adv2uartStats = {
    writes: 0, writeBytes: 0,
    feeds: 0, feedBytes: 0,
    advCount: 0, responseCount: 0, crcErrors: 0, otherEvents: 0,
    lastResponse: null,
    lastFeedHex: null,
    startCalls: 0, stopCalls: 0,
    scanning: false,
    parser,
  }) : null);
  const wrap = (write) => async (bytes) => {
    if (stats) { stats.writes++; stats.writeBytes += bytes.length; }
    return write(bytes);
  };

  function buildScan(cfg) { return appendCrc(buildScanPayload(cfg)); }
  function buildInfo()    { return appendCrc(new Uint8Array([CMD.INFO])); }
  function buildStop()    { return appendCrc(buildScanPayload({ phy1m: false, phyCoded: false })); }

  function handleAdv(ev, onAdvert) {
    const ad = parseAdStructures(Array.from(ev.payload));
    if (!ad.servicedata && !ad.manufacturerdata && !ad.name) return;
    const mac = macFromHexStr(ev.mac);
    const primaryPhy = ev.phys & 0x0f;
    const secondaryPhy = (ev.phys >> 4) & 0x0f;
    const out = {
      id: mac,
      mac,
      rssi: ev.rssi,
      advType: decodeAdvType(ev.eventType),
      addrType: (ev.addressType & 0x0f) === 1 ? 'random' : 'public',
      phy: PHY_NAMES[primaryPhy] || `phy${primaryPhy}`,
      origin: '/BTtoMQTT',
      ...ad,
    };
    if (secondaryPhy) out.secondaryPhy = PHY_NAMES[secondaryPhy] || `phy${secondaryPhy}`;
    onAdvert(out);
  }

  return {
    name: 'adv2uart',
    defaultBaud: 115200,
    candidateBauds: [115200],
    needsFlowControl: false,

    buildPing: () => buildInfo(),

    probeMatches(bytes) {
      for (const ev of parser.feed(bytes)) {
        if (ev.type === 'response') return true;
      }
      return false;
    },

    async start(write) {
      if (stats) { stats.startCalls++; stats.scanning = true; }
      writeRef = wrap(write);
      scanning = true;
      await writeRef(buildInfo());
      await new Promise((r) => setTimeout(r, 80));
      await writeRef(buildScan(scanCfg));
    },

    async stop(write) {
      if (stats) { stats.stopCalls++; stats.scanning = false; }
      scanning = false;
      try { await wrap(write)(buildStop()); } catch {}
    },

    ingest(bytes, { onAdvert, onInfo }) {
      if (stats) {
        stats.feeds++;
        stats.feedBytes += bytes.length;
        stats.lastFeedHex = Array.from(bytes.slice(0, 64))
          .map(b => b.toString(16).padStart(2, '0')).join(' ');
      }
      for (const ev of parser.feed(bytes)) {
        if (ev.type === 'adv') {
          if (stats) stats.advCount++;
          handleAdv(ev, onAdvert);
        } else if (ev.type === 'response') {
          if (stats) {
            stats.responseCount++;
            stats.lastResponse = {
              cmd: ev.command, cmdName: ev.commandName,
              status: ev.status, statusName: ev.statusName,
              dataHex: Array.from(ev.data).map(b => b.toString(16).padStart(2, '0')).join(' '),
            };
          }
          if (ev.command === CMD.INFO && ev.info?.localMac) {
            const mac = macFromHexStr(ev.info.localMac);
            onInfo?.({ version: `adv2uart ${mac}` });
          }
        } else if (ev.type === 'crc_error') {
          if (stats) stats.crcErrors++;
        } else {
          if (stats) stats.otherEvents++;
        }
      }
    },

    renderControls(host, onChange) {
      host.replaceChildren();
      const row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '.5rem';

      const mk = (label, prop) => {
        const lb = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = scanCfg[prop];
        cb.addEventListener('change', async () => {
          scanCfg[prop] = cb.checked;
          onChange?.(scanCfg);
          if (scanning && writeRef) {
            try { await writeRef(buildScan(scanCfg)); } catch {}
          }
        });
        lb.appendChild(cb);
        lb.appendChild(document.createTextNode(' ' + label));
        return lb;
      };

      const winLb = document.createElement('label');
      winLb.textContent = 'Window ms ';
      const win = document.createElement('input');
      win.type = 'number';
      win.min = '10';
      win.max = '10240';
      win.step = '5';
      win.value = String(scanCfg.windowMs);
      win.style.width = '5em';
      win.addEventListener('change', async () => {
        const v = Number(win.value);
        if (Number.isFinite(v) && v >= 10) {
          scanCfg.windowMs = v;
          onChange?.(scanCfg);
          if (scanning && writeRef) {
            try { await writeRef(buildScan(scanCfg)); } catch {}
          }
        }
      });
      winLb.appendChild(win);

      row.appendChild(mk('PHY 1M', 'phy1m'));
      row.appendChild(mk('PHY Coded', 'phyCoded'));
      row.appendChild(winLb);
      host.appendChild(row);
    },
  };
}
