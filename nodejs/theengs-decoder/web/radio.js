'use strict';

import { loadDecoder, decodeEntry } from './decoder.js';

const MAX_ROWS = 2000;

function bytesToHex(dv) {
  let s = '';
  const len = dv.byteLength;
  for (let i = 0; i < len; i++) s += dv.getUint8(i).toString(16).padStart(2, '0');
  return s;
}

function eventToEntry(ev) {
  const e = { id: ev.device?.id || '?', rssi: ev.rssi };
  if (ev.device?.name) e.name = ev.device.name;
  if (ev.manufacturerData) {
    for (const [companyId, dv] of ev.manufacturerData) {
      const cidLo = (companyId & 0xff).toString(16).padStart(2, '0');
      const cidHi = ((companyId >> 8) & 0xff).toString(16).padStart(2, '0');
      e.manufacturerdata = cidLo + cidHi + bytesToHex(dv);
      break;
    }
  }
  if (ev.serviceData) {
    for (const [uuid, dv] of ev.serviceData) {
      e.servicedata = bytesToHex(dv);
      e.servicedatauuid = '0x' + uuid.replace(/-/g, '').slice(4, 8);
      break;
    }
  }
  e.origin = '/BTtoMQTT';
  return e;
}

export function initRadio(root) {
  const els = {
    scan:      root.querySelector('#rad-scan'),
    clear:     root.querySelector('#rad-clear'),
    status:    root.querySelector('#rad-status'),
    indicator: root.querySelector('#rad-indicator'),
    log:       root.querySelector('#rad-log'),
  };

  let decoder = null;
  let scanHandle = null;
  let scanning = false;
  let seen = 0;
  let decoded = 0;
  let autoScroll = true;

  loadDecoder().then((d) => { decoder = d; setStatus('Decoder ready. Click Start scan.'); })
    .catch((e) => setStatus('Decoder load failed: ' + e.message));

  setIndicator('idle');

  els.log.addEventListener('scroll', () => {
    autoScroll = els.log.scrollHeight - els.log.scrollTop - els.log.clientHeight < 40;
  });

  els.scan.addEventListener('click', onToggleScan);
  els.clear.addEventListener('click', () => {
    els.log.replaceChildren();
    seen = 0; decoded = 0; updateCounters();
  });

  async function onToggleScan() {
    if (scanning) await stopScan(); else await startScan();
  }

  async function startScan() {
    if (!('bluetooth' in navigator)) {
      setStatus('Web Bluetooth not available in this browser.');
      return;
    }
    try {
      scanHandle = await navigator.bluetooth.requestLEScan({
        acceptAllAdvertisements: true,
        keepRepeatedDevices: true,
      });
    } catch (e) {
      setStatus('Scan failed: ' + (e?.message ?? e));
      return;
    }
    navigator.bluetooth.addEventListener('advertisementreceived', onAdv);
    scanning = true;
    const label = els.scan.querySelector('span:last-child');
    if (label) label.textContent = 'Stop scan';
    setIndicator('scanning');
    setStatus('Scanning host BLE radio.');
  }

  async function stopScan() {
    scanning = false;
    try { scanHandle?.stop(); } catch {}
    scanHandle = null;
    navigator.bluetooth.removeEventListener('advertisementreceived', onAdv);
    const label = els.scan.querySelector('span:last-child');
    if (label) label.textContent = 'Start scan';
    setIndicator('idle');
    setStatus('Idle.');
  }

  function onAdv(ev) {
    if (!scanning) return;
    const entry = eventToEntry(ev);
    seen++;
    const dec = decoder ? decodeEntry(decoder, entry) : null;
    if (dec) decoded++;
    appendBtRow(entry, dec);
    updateCounters();
  }

  function appendBtRow(raw, dec) {
    const row = document.createElement('div');
    row.className = 'log-row ' + (dec ? 'log-decoded' : 'log-undecoded');
    const t = new Date().toISOString().slice(11, 23);
    const id = raw.id || '?';
    const rssi = raw.rssi !== undefined ? `${raw.rssi}dBm` : '';
    const name = raw.name ? ` "${raw.name}"` : '';
    const model = dec?.model_id || dec?.model || '';
    const header = document.createElement('div');
    header.className = 'log-head';
    header.textContent = `[${t}] ${id} ${rssi}${name} ${model ? '→ ' + model : '(undecoded)'}`;
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

    els.log.appendChild(row);
    while (els.log.childElementCount > MAX_ROWS) els.log.firstElementChild.remove();
    if (autoScroll) els.log.scrollTop = els.log.scrollHeight;
  }

  function setStatus(msg) { els.status.textContent = msg; }
  function setIndicator(state) { els.indicator.dataset.state = state; }
  function updateCounters() {
    const c = root.querySelector('#rad-counters');
    if (c) c.textContent = `decoded: ${decoded} / seen: ${seen}`;
  }
}
