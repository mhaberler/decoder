'use strict';

import { loadDecoder, decodeEntry } from './decoder.js';

const OMG_RE = /^N: \[ OMG->SERIAL \] data sent: (\{.*\})\s*$/;
const MAX_ROWS = 2000;

export function initSerial(root) {
  const els = {
    connect:    root.querySelector('#ser-connect'),
    disconnect: root.querySelector('#ser-disconnect'),
    scan:       root.querySelector('#ser-scan'),
    clear:      root.querySelector('#ser-clear'),
    showAll:    root.querySelector('#ser-showall'),
    baud:       root.querySelector('#ser-baud'),
    status:     root.querySelector('#ser-status'),
    indicator:  root.querySelector('#ser-indicator'),
    log:        root.querySelector('#ser-log'),
    portInfo:   root.querySelector('#ser-portinfo'),
  };

  let port = null;
  let reader = null;
  let readLoop = null;
  let buffer = '';
  let scanning = false;
  let decoder = null;
  let seen = 0;
  let decoded = 0;
  let autoScroll = true;

  if (!('serial' in navigator)) {
    els.status.textContent = 'WebSerial unavailable in this browser. Use Chrome/Edge on https or localhost.';
    els.connect.disabled = true;
    els.baud.disabled = true;
    return;
  }

  loadDecoder().then((d) => {
    decoder = d;
    setStatus('Decoder ready. Connect a port.');
  }).catch((e) => setStatus('Decoder load failed: ' + e.message));

  setIndicator('idle');
  els.disconnect.disabled = true;
  els.scan.disabled = true;

  els.log.addEventListener('scroll', () => {
    const nearBottom = els.log.scrollHeight - els.log.scrollTop - els.log.clientHeight < 40;
    autoScroll = nearBottom;
  });

  els.connect.addEventListener('click', onConnect);
  els.disconnect.addEventListener('click', onDisconnect);
  els.scan.addEventListener('click', onToggleScan);
  els.clear.addEventListener('click', () => {
    els.log.replaceChildren();
    seen = 0; decoded = 0; updateCounters();
  });

  async function onConnect() {
    try {
      port = await navigator.serial.requestPort();
      const baudRate = Number(els.baud.value) || 115200;
      await port.open({ baudRate });
      const info = port.getInfo?.() ?? {};
      els.portInfo.textContent = `usbVendorId=${info.usbVendorId ?? '?'} usbProductId=${info.usbProductId ?? '?'} @ ${baudRate}`;
      els.connect.disabled = true;
      els.disconnect.disabled = false;
      els.scan.disabled = false;
      els.baud.disabled = true;
      setStatus('Connected.');
      startReadLoop();
    } catch (e) {
      setStatus('Connect failed: ' + e.message);
    }
  }

  async function onDisconnect() {
    setScanning(false);
    await stopReadLoop();
    try { await port?.close(); } catch {}
    port = null;
    els.connect.disabled = false;
    els.disconnect.disabled = true;
    els.scan.disabled = true;
    els.baud.disabled = false;
    els.portInfo.textContent = '';
    setStatus('Disconnected.');
  }

  function onToggleScan() {
    setScanning(!scanning);
  }

  function setScanning(on) {
    scanning = on;
    const label = els.scan.querySelector('span:last-child');
    if (on) {
      if (label) label.textContent = 'Stop scan';
      setIndicator('scanning');
      setStatus('Scanning.');
    } else {
      if (label) label.textContent = 'Start scan';
      setIndicator(port ? 'connected' : 'idle');
      if (port) setStatus('Idle.');
    }
  }

  function startReadLoop() {
    const decoderStream = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoderStream.writable).catch(() => {});
    reader = decoderStream.readable.getReader();
    readLoop = (async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) onSerialChunk(value);
        }
      } catch (e) {
        setStatus('Read error: ' + e.message);
      } finally {
        try { reader.releaseLock(); } catch {}
        await readableStreamClosed;
      }
    })();
  }

  async function stopReadLoop() {
    if (!reader) return;
    try { await reader.cancel(); } catch {}
    try { await readLoop; } catch {}
    reader = null;
    readLoop = null;
    buffer = '';
  }

  function onSerialChunk(chunk) {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).replace(/\r$/, '');
      buffer = buffer.slice(idx + 1);
      if (line) handleLine(line);
    }
  }

  function handleLine(line) {
    if (!scanning) return;
    const m = line.match(OMG_RE);
    if (m) {
      let json = null;
      try { json = JSON.parse(m[1]); } catch {}
      if (json && json.origin === '/BTtoMQTT') {
        seen++;
        const dec = decoder ? decodeEntry(decoder, json) : null;
        if (dec) decoded++;
        appendBtRow(json, dec);
        updateCounters();
        return;
      }
      if (els.showAll.checked) appendRawRow(line, 'omg');
      return;
    }
    if (els.showAll.checked) appendRawRow(line, 'misc');
  }

  function appendBtRow(raw, dec) {
    const row = document.createElement('div');
    row.className = 'log-row ' + (dec ? 'log-decoded' : 'log-undecoded');
    const t = new Date().toISOString().slice(11, 23);
    const id = raw.id || '?';
    const rssi = raw.rssi !== undefined ? `${raw.rssi}dBm` : '';
    const model = dec?.model_id || dec?.model || '';
    const header = document.createElement('div');
    header.className = 'log-head';
    header.textContent = `[${t}] ${id} ${rssi} ${model ? '→ ' + model : '(undecoded)'}`;
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

  function setIndicator(state) {
    els.indicator.dataset.state = state;
  }

  function updateCounters() {
    const c = root.querySelector('#ser-counters');
    if (c) c.textContent = `decoded: ${decoded} / seen: ${seen}`;
  }
}
