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

// The adv2uart firmware reads up to 64 bytes per usb_serial_jtag_read_bytes
// call and CRC-checks the whole buffer as a single frame — there is no
// in-band delimiter or length-prefix re-sync. WebSerial may coalesce two
// back-to-back writes into one USB bulk transfer, which then fails CRC
// and is silently dropped. A small host-side gap forces two transfers.
const INFO_TO_SCAN_GAP_MS = 80;

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
      writeRef = write;
      scanning = true;
      await write(buildInfo());
      await new Promise((r) => setTimeout(r, INFO_TO_SCAN_GAP_MS));
      await write(buildScan(scanCfg));
    },

    async stop(write) {
      scanning = false;
      try { await write(buildStop()); } catch {}
    },

    ingest(bytes, { onAdvert, onInfo }) {
      for (const ev of parser.feed(bytes)) {
        if (ev.type === 'adv') {
          handleAdv(ev, onAdvert);
        } else if (ev.type === 'response' && ev.command === CMD.INFO && ev.info?.localMac) {
          const mac = macFromHexStr(ev.info.localMac);
          onInfo?.({ version: `adv2uart ${mac}` });
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
