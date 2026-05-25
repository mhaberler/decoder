'use strict';

// Nordic nRF Sniffer for BLE — UART protocol (SLIP framed).
// Reference: nrf_sniffer_ble.py / SnifferAPI/Packet.py / SnifferAPI/Types.py.

const SLIP_START = 0xAB;
const SLIP_END = 0xBC;
const SLIP_ESC = 0xCD;
const SLIP_ESC_START = SLIP_START + 1;
const SLIP_ESC_END = SLIP_END + 1;
const SLIP_ESC_ESC = SLIP_ESC + 1;

const PROTOVER_V3 = 3;
const REQ_SCAN_CONT = 0x07;
const PING_REQ = 0x0D;
const PING_RESP = 0x0E;
const REQ_VERSION = 0x1B;
const RESP_VERSION = 0x1C;
const GO_IDLE = 0xFE;
const EVENT_PACKET_ADV_PDU = 0x02;
const EVENT_PACKET_DATA_PDU = 0x06;

const ADV_IND = 0x0;
const ADV_DIRECT_IND = 0x1;
const ADV_NONCONN_IND = 0x2;
const SCAN_RSP = 0x4;
const ADV_SCAN_IND = 0x6;
const ADV_EXT_IND = 0x7;

const PHY_CODED = 2;
const HEADER_LENGTH = 6;
const BLE_HEADER_LEN_POS = HEADER_LENGTH;
const FLAGS_POS = BLE_HEADER_LEN_POS + 1;
const CHANNEL_POS = FLAGS_POS + 1;
const RSSI_POS = CHANNEL_POS + 1;
const TIMESTAMP_POS = RSSI_POS + 1 + 2;
const BLEPACKET_POS = TIMESTAMP_POS + 4;

function bytesToHex(arr) {
  let s = '';
  for (const b of arr) s += b.toString(16).padStart(2, '0');
  return s;
}

function macFromBytes(addr) {
  return Array.from(addr.slice(0, 6))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

function encodeSLIP(payload) {
  const out = [SLIP_START];
  for (const b of payload) {
    if (b === SLIP_START) out.push(SLIP_ESC, SLIP_ESC_START);
    else if (b === SLIP_END) out.push(SLIP_ESC, SLIP_ESC_END);
    else if (b === SLIP_ESC) out.push(SLIP_ESC, SLIP_ESC_ESC);
    else out.push(b);
  }
  out.push(SLIP_END);
  return new Uint8Array(out);
}

function makeSlipReassembler() {
  let buf = [];
  let inPacket = false;
  let esc = false;
  return function feed(chunk, onPacket) {
    for (const b of chunk) {
      if (!inPacket) {
        if (b === SLIP_START) { inPacket = true; buf = []; esc = false; }
        continue;
      }
      if (b === SLIP_END) {
        if (buf.length) onPacket(buf);
        inPacket = false; buf = []; esc = false;
        continue;
      }
      if (esc) {
        if (b === SLIP_ESC_START) buf.push(SLIP_START);
        else if (b === SLIP_ESC_END) buf.push(SLIP_END);
        else if (b === SLIP_ESC_ESC) buf.push(SLIP_ESC);
        else buf.push(b);
        esc = false;
      } else if (b === SLIP_ESC) {
        esc = true;
      } else {
        buf.push(b);
      }
    }
  };
}

function parseAdStructures(payload) {
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
        out.name = String.fromCharCode(...data);
        break;
      case 0x16: {
        if (data.length >= 2) {
          const uuid = (data[1] << 8) | data[0];
          out.servicedatauuid = '0x' + uuid.toString(16).padStart(4, '0');
          out.servicedata = bytesToHex(data);
        }
        break;
      }
      case 0x20: {
        if (data.length >= 4) {
          const uuid = ((data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]) >>> 0;
          out.servicedatauuid = '0x' + uuid.toString(16).padStart(8, '0');
          out.servicedata = bytesToHex(data);
        }
        break;
      }
      case 0x21: {
        if (data.length >= 16) {
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
        out.manufacturerdata = bytesToHex(data);
        break;
    }
    i = dataEnd;
  }
  return out;
}

function parseSnifferAdvPacket(pkt) {
  if (pkt.length < BLEPACKET_POS + 4) return null;
  if (pkt[BLE_HEADER_LEN_POS] !== 10) return null;
  const flags = pkt[FLAGS_POS];
  if (!(flags & 1)) return null;
  const channel = pkt[CHANNEL_POS];
  const rssi = -pkt[RSSI_POS];
  const phy = (flags >> 4) & 7;

  let p = BLEPACKET_POS + 4;
  if (phy === PHY_CODED) p += 1;
  if (pkt.length < p + 2) return null;

  const header = pkt[p];
  const advType = header & 0x0f;
  p += 2; // skip PDU header byte + on-air length byte
  if (pkt.length < p + 1) return null;

  // Take everything from here to end-of-packet. The first byte is a HW pad
  // (not on air); the on-air length byte cannot be trusted because the sniffer
  // also appends bytes (e.g. CRC) outside it.
  const pdu = pkt.slice(p);
  pdu.splice(0, 1);

  let addr = null;
  let adPayload = [];
  if ([ADV_IND, ADV_NONCONN_IND, SCAN_RSP, ADV_SCAN_IND, ADV_DIRECT_IND].includes(advType)) {
    if (pdu.length < 6) return null;
    addr = pdu.slice(0, 6).reverse();
    adPayload = pdu.slice(6);
  } else if (advType === ADV_EXT_IND) {
    if (pdu.length < 2) return null;
    const extLen = pdu[0] & 0x3f;
    if (pdu.length < 1 + extLen) return null;
    const extFlags = pdu[1];
    let off = 2;
    if (extFlags & 0x01) {
      if (pdu.length < off + 6) return null;
      addr = pdu.slice(off, off + 6).reverse();
      off += 6;
    }
    adPayload = pdu.slice(1 + extLen);
  } else {
    return null;
  }
  if (!addr) return null;

  const ad = parseAdStructures(adPayload);
  if (!ad.servicedata && !ad.manufacturerdata && !ad.name) return null;

  const mac = macFromBytes(addr);
  const out = { id: mac, mac, rssi, channel, origin: '/BTtoMQTT' };
  if (ad.name) out.name = ad.name;
  if (ad.servicedata) out.servicedata = ad.servicedata;
  if (ad.servicedatauuid) out.servicedatauuid = ad.servicedatauuid;
  if (ad.manufacturerdata) out.manufacturerdata = ad.manufacturerdata;
  return out;
}

export function createNrfDriver() {
  let txCounter = 0;
  let sawPingResp = false;
  let version = null;
  const feedSlip = makeSlipReassembler();

  function buildPacket(id, payload) {
    const pkt = [
      HEADER_LENGTH,
      payload.length,
      PROTOVER_V3,
      txCounter & 0xff,
      (txCounter >> 8) & 0xff,
      id,
      ...payload,
    ];
    txCounter = (txCounter + 1) & 0xffff;
    return encodeSLIP(pkt);
  }

  return {
    name: 'nRF Sniffer',
    defaultBaud: 1000000,
    candidateBauds: [1000000],
    needsFlowControl: true,

    buildPing: () => buildPacket(PING_REQ, []),

    probeMatches(bytes) {
      let matched = false;
      feedSlip(bytes, (pkt) => {
        if (pkt.length < 6) return;
        // Any well-formed Nordic UART packet: V3 protover at offset 2, known id at offset 5.
        const protover = pkt[2];
        const id = pkt[5];
        const knownIds = [
          PING_RESP, RESP_VERSION,
          EVENT_PACKET_ADV_PDU, EVENT_PACKET_DATA_PDU,
        ];
        if (protover >= 1 && protover <= 3 && knownIds.includes(id)) {
          matched = true;
        }
      });
      return matched;
    },

    async start(write) {
      await write(buildPacket(REQ_VERSION, []));
      await write(buildPacket(REQ_SCAN_CONT, [0]));
    },

    async stop(write) {
      try { await write(buildPacket(GO_IDLE, [])); } catch {}
    },

    pingInterval: 1000,
    sendPing: (write) => write(buildPacket(PING_REQ, [])),

    ingest(bytes, { onAdvert, onInfo }) {
      feedSlip(bytes, (pkt) => {
        if (pkt.length < 6) return;
        const id = pkt[5];
        if (id === PING_RESP) { sawPingResp = true; return; }
        if (id === RESP_VERSION) {
          version = String.fromCharCode(...pkt.slice(6));
          onInfo?.({ version });
          return;
        }
        if (id !== EVENT_PACKET_ADV_PDU && id !== EVENT_PACKET_DATA_PDU) return;
        const adv = parseSnifferAdvPacket(pkt);
        if (adv) onAdvert(adv);
      });
    },
  };
}
