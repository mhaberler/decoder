'use strict';

import { loadDecoder, decodeEntry } from './decoder.js';
import { driverFactories, detectDongle } from './drivers/index.js';

const MAX_ROWS = 2000;

const ADV_ABBR = {
  ADV_IND: 'IND', ADV_NONCONN_IND: 'NCONN', SCAN_RSP: 'SCAN_RSP',
  ADV_SCAN_IND: 'SCAN_IND', ADV_DIRECT_IND: 'DIRECT', ADV_EXT_IND: 'EXT',
};
const LAST_SEEN_TTL_MS = 60_000;

const PROFILES = [
  { id: 'auto', label: 'Auto-detect', baud: null, flow: null },
  { id: 'nrf', label: 'nRF Sniffer (1 Mbaud)', baud: 1000000, flow: 'hardware', driverName: 'nRF Sniffer' },
  { id: 'adv2uart', label: 'adv2uart (ESP32-C3)', baud: 115200, flow: 'none', driverName: 'adv2uart' },
  { id: 'omg-115k', label: 'OMG @ 115200', baud: 115200, flow: 'none', driverName: 'OMG' },
  { id: 'omg-921k', label: 'OMG @ 921600', baud: 921600, flow: 'none', driverName: 'OMG' },
  { id: 'omg-9600', label: 'OMG @ 9600',   baud: 9600,   flow: 'none', driverName: 'OMG' },
];

export function initSerial(root) {
  const els = {
    connect:    root.querySelector('#ser-connect'),
    disconnect: root.querySelector('#ser-disconnect'),
    scan:       root.querySelector('#ser-scan'),
    clear:      root.querySelector('#ser-clear'),
    showAll:    root.querySelector('#ser-showall'),
    profile:    root.querySelector('#ser-profile'),
    status:     root.querySelector('#ser-status'),
    indicator:  root.querySelector('#ser-indicator'),
    log:        root.querySelector('#ser-log'),
    portInfo:   root.querySelector('#ser-portinfo'),
    kind:       root.querySelector('#ser-kind'),
    controls:   root.querySelector('#ser-driver-controls'),
  };

  let port = null;
  let reader = null;
  let readLoop = null;
  let writer = null;
  let writerLock = Promise.resolve();
  let driver = null;
  let pingTimer = null;
  let scanning = false;
  let decoder = null;
  let seen = 0;
  let decoded = 0;
  let autoScroll = true;
  const lastSeen = new Map();

  if (els.profile && !els.profile.dataset.populated) {
    for (const p of PROFILES) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.label;
      els.profile.appendChild(opt);
    }
    els.profile.value = 'auto';
    els.profile.dataset.populated = '1';
  }

  if (!('serial' in navigator)) {
    setStatus('WebSerial unavailable in this browser. Use Chrome/Edge on https or localhost.');
    els.connect.disabled = true;
    if (els.profile) els.profile.disabled = true;
    return;
  }

  loadDecoder().then((d) => {
    decoder = d;
    setStatus('Decoder ready. Connect a port.');
  }).catch((e) => setStatus('Decoder load failed: ' + e.message));

  setIndicator('idle');
  els.disconnect.disabled = true;
  els.scan.disabled = true;
  if (els.kind) els.kind.textContent = '';

  els.log.addEventListener('scroll', () => {
    const nearBottom = els.log.scrollHeight - els.log.scrollTop - els.log.clientHeight < 40;
    autoScroll = nearBottom;
  });

  els.connect.addEventListener('click', onConnect);
  els.disconnect.addEventListener('click', onDisconnect);
  els.scan.addEventListener('click', onToggleScan);
  els.clear.addEventListener('click', () => {
    els.log.replaceChildren();
    seen = 0; decoded = 0; lastSeen.clear(); updateCounters();
  });

  async function safeWrite(bytes) {
    if (!writer) return;
    writerLock = writerLock.then(() => writer.write(bytes)).catch(() => {});
    return writerLock;
  }

  async function openPort(p, baudRate, flowControl) {
    const opts = { baudRate };
    if (flowControl) opts.flowControl = flowControl;
    await p.open(opts);
    // Note: do NOT toggle DTR/RTS — ESP32-based dongles (OMG) reset on those edges.
  }

  async function onConnect() {
    try {
      port = await navigator.serial.requestPort();
      const profileId = els.profile?.value ?? 'auto';
      const profile = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0];

      const attempts = profile.id === 'auto'
        ? [
            { baud: 115200,  flow: 'none',     forceDriverName: null, timeoutMs: 1500 },
            { baud: 1000000, flow: 'hardware', forceDriverName: null, timeoutMs: 800 },
          ]
        : [{ baud: profile.baud, flow: profile.flow, forceDriverName: profile.driverName, timeoutMs: 1500 }];

      let chosen = null;
      let pendingBuffered = [];
      for (const a of attempts) {
        try {
          await openPort(port, a.baud, a.flow);
        } catch (e) {
          setStatus(`Open ${a.baud}/${a.flow} failed: ${e.message}`);
          continue;
        }

        if (a.forceDriverName) {
          const factory = driverFactories.find((f) => f().name === a.forceDriverName);
          chosen = { driver: factory ? factory() : null, baud: a.baud, flow: a.flow, buffered: [] };
          if (chosen.driver) {
            writer = port.writable.getWriter();
            reader = port.readable.getReader();
            break;
          }
        } else {
          writer = port.writable.getWriter();
          reader = port.readable.getReader();
          setStatus(`Probing dongle at ${a.baud}…`);
          const det = await detectDongle({ reader, write: safeWrite, timeoutMs: a.timeoutMs ?? 700 });
          if (det.driver) {
            chosen = { driver: det.driver, baud: a.baud, flow: a.flow, buffered: det.buffered };
            break;
          }
          // No match — tear down and try next baud
          try { await reader.cancel(); } catch {}
          try { reader.releaseLock(); } catch {}
          reader = null;
          try { writer.releaseLock(); } catch {}
          writer = null;
          writerLock = Promise.resolve();
          try { await port.close(); } catch (e) { setStatus('close failed: ' + e.message); }
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      if (!chosen || !chosen.driver) {
        setStatus('Could not detect a known dongle. Pick a profile manually and reconnect.');
        try { await port?.close(); } catch {}
        port = null;
        return;
      }

      driver = chosen.driver;
      pendingBuffered = chosen.buffered ?? [];

      const info = port.getInfo?.() ?? {};
      els.portInfo.textContent = `usbVendorId=0x${(info.usbVendorId ?? 0).toString(16)} usbProductId=0x${(info.usbProductId ?? 0).toString(16)} @ ${chosen.baud}${chosen.flow !== 'none' ? ' ' + chosen.flow : ''}`;
      if (els.kind) els.kind.textContent = driver.name;
      if (els.controls && typeof driver.renderControls === 'function') {
        driver.renderControls(els.controls);
      }
      els.connect.disabled = true;
      els.disconnect.disabled = false;
      els.scan.disabled = false;
      if (els.profile) els.profile.disabled = true;
      setStatus(`Connected (${driver.name}).`);

      startReadLoop(pendingBuffered);
    } catch (e) {
      setStatus('Connect failed: ' + e.message);
      await cleanup();
    }
  }

  async function onDisconnect() {
    await setScanning(false);
    await cleanup();
    setStatus('Disconnected.');
  }

  async function cleanup() {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    if (reader) {
      try { await reader.cancel(); } catch {}
    }
    try { await readLoop; } catch {}
    reader = null;
    readLoop = null;
    if (writer) {
      try { await writer.close(); } catch {}
      try { writer.releaseLock(); } catch {}
      writer = null;
    }
    if (port) {
      try { await port.close(); } catch {}
    }
    port = null;
    driver = null;
    els.connect.disabled = false;
    els.disconnect.disabled = true;
    els.scan.disabled = true;
    if (els.profile) els.profile.disabled = false;
    if (els.kind) els.kind.textContent = '';
    if (els.controls) els.controls.replaceChildren();
    els.portInfo.textContent = '';
    setIndicator('idle');
  }

  async function onToggleScan() {
    await setScanning(!scanning);
  }

  async function setScanning(on) {
    if (on === scanning) return;
    const label = els.scan.querySelector('span:last-child');
    if (on) {
      if (driver?.start) await driver.start(safeWrite);
      if (driver?.sendPing && driver.pingInterval) {
        pingTimer = setInterval(() => { driver?.sendPing(safeWrite); }, driver.pingInterval);
      }
      scanning = true;
      if (label) label.textContent = 'Stop scan';
      setIndicator('scanning');
      setStatus(`Scanning (${driver?.name ?? '?'}).`);
    } else {
      scanning = false;
      if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
      if (driver?.stop) await driver.stop(safeWrite);
      if (label) label.textContent = 'Start scan';
      setIndicator(port ? 'connected' : 'idle');
      if (port) setStatus('Idle.');
    }
  }

  function startReadLoop(buffered) {
    const onAdvert = (advJson) => {
      if (!scanning) return;
      seen++;
      const dec = decoder ? decodeEntry(decoder, advJson) : null;
      if (dec) decoded++;
      appendBtRow(advJson, dec);
      updateCounters();
    };
    const onLine = (line) => {
      if (!scanning) return;
      if (els.showAll?.checked) appendRawRow(line, 'omg');
    };
    const onInfo = (info) => {
      if (info?.version && els.kind) {
        els.kind.textContent = `${driver.name} (${info.version.trim()})`;
      }
    };

    readLoop = (async () => {
      try {
        for (const b of buffered) driver.ingest(b, { onAdvert, onLine, onInfo });
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) driver.ingest(value, { onAdvert, onLine, onInfo });
        }
      } catch (e) {
        setStatus('Read error: ' + e.message);
      } finally {
        try { reader.releaseLock(); } catch {}
      }
    })();
  }

  function appendBtRow(raw, dec) {
    const row = document.createElement('div');
    row.className = 'log-row ' + (dec ? 'log-decoded' : 'log-undecoded');
    const nowMs = Date.now();
    const t = new Date(nowMs).toISOString().slice(11, 23);
    const id = raw.id || '?';
    const rssi = raw.rssi !== undefined ? `${raw.rssi}dBm` : '';
    const ch = raw.channel !== undefined ? ` ch${raw.channel}` : '';
    const advAbbr = ADV_ABBR[raw.advType] ? ` ${ADV_ABBR[raw.advType]}` : '';
    const randomMark = raw.addrType === 'random' ? '(R)' : '';
    let dt = '';
    if (raw.mac) {
      const prev = lastSeen.get(raw.mac);
      if (prev !== undefined) dt = ` Δ${nowMs - prev}ms`;
      lastSeen.set(raw.mac, nowMs);
      if (lastSeen.size > 1024) {
        const cutoff = nowMs - LAST_SEEN_TTL_MS;
        for (const [k, v] of lastSeen) if (v < cutoff) lastSeen.delete(k);
      }
    }
    const model = dec?.model_id || dec?.model || '';
    const header = document.createElement('div');
    header.className = 'log-head';
    header.textContent = `[${t}] ${id}${randomMark} ${rssi}${ch}${advAbbr}${dt} ${model ? '→ ' + model : '(undecoded)'}`;
    row.appendChild(header);

    if (dec) {
      const decPre = document.createElement('pre');
      decPre.className = 'log-decoded-json';
      decPre.textContent = JSON.stringify(dec, null, 2);
      row.appendChild(decPre);
    }

    const det = document.createElement('details');
    const sum = document.createElement('summary');
    sum.textContent = 'raw';
    det.appendChild(sum);
    const rawPre = document.createElement('pre');
    rawPre.className = 'log-raw-json';
    rawPre.textContent = JSON.stringify(raw, null, 2);
    det.appendChild(rawPre);
    row.appendChild(det);

    pushRow(row);
  }

  function appendRawRow(line, cls) {
    const row = document.createElement('div');
    row.className = 'log-row log-' + cls;
    row.textContent = line;
    pushRow(row);
  }

  function pushRow(row) {
    els.log.appendChild(row);
    while (els.log.childElementCount > MAX_ROWS) els.log.firstElementChild.remove();
    if (autoScroll) els.log.scrollTop = els.log.scrollHeight;
  }

  function setStatus(msg) { els.status.textContent = msg; }
  function setIndicator(state) { els.indicator.dataset.state = state; }
  function updateCounters() {
    const c = root.querySelector('#ser-counters');
    if (c) c.textContent = `decoded: ${decoded} / seen: ${seen}`;
  }
}
