'use strict';

// Shared BLE AD-structure parser used by every dongle driver.
// First match wins for each field — preserves the existing single-string
// shape that TheengsDecoder consumes.

function bytesToHex(arr) {
  let s = '';
  for (const b of arr) s += b.toString(16).padStart(2, '0');
  return s;
}

export function parseAdStructures(payload) {
  const out = {};
  let i = 0;
  while (i < payload.length) {
    const len = payload[i];
    if (len === 0) break;
    const type = payload[i + 1];
    const dataStart = i + 2;
    const dataEnd = i + 1 + len;
    if (dataEnd > payload.length) break;
    const data = payload.slice(dataStart, dataEnd);
    switch (type) {
      case 0x08:
      case 0x09:
        if (out.name === undefined) out.name = String.fromCharCode(...data);
        break;
      case 0x16: {
        if (out.servicedata === undefined && data.length >= 2) {
          const uuid = (data[1] << 8) | data[0];
          out.servicedatauuid = '0x' + uuid.toString(16).padStart(4, '0');
          out.servicedata = bytesToHex(data);
        }
        break;
      }
      case 0x20: {
        if (out.servicedata === undefined && data.length >= 4) {
          const uuid = ((data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]) >>> 0;
          out.servicedatauuid = '0x' + uuid.toString(16).padStart(8, '0');
          out.servicedata = bytesToHex(data);
        }
        break;
      }
      case 0x21: {
        if (out.servicedata === undefined && data.length >= 16) {
          const u = Array.from(data.slice(0, 16)).reverse();
          out.servicedatauuid = bytesToHex(u).replace(
            /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
            '$1-$2-$3-$4-$5',
          );
          out.servicedata = bytesToHex(data);
        }
        break;
      }
      case 0xFF:
        if (out.manufacturerdata === undefined) out.manufacturerdata = bytesToHex(data);
        break;
    }
    i = dataEnd;
  }
  return out;
}
