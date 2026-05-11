'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ready, decodeBLE } = require('..');

const MAC_RE = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

function buildDecoderInput(entry) {
  const input = {};
  let sd = entry.serviceData || '';
  const colon = sd.indexOf(':');
  if (colon >= 0) sd = sd.slice(colon + 1);
  if (sd) input.servicedata = sd;
  const md = entry.manufacturerData || '';
  if (md) input.manufacturerdata = md;
  if (entry.id && MAC_RE.test(entry.id)) input.id = entry.id;
  return input;
}

async function decodeLog(entries) {
  await ready();
  const results = [];
  for (const entry of entries) {
    const input = buildDecoderInput(entry);
    let decoded = null;
    if (input.servicedata || input.manufacturerdata) {
      decoded = await decodeBLE(input);
    }
    results.push({ entry, decoded });
  }
  return results;
}

function nsToIso(ns) {
  if (!ns) return '';
  try {
    const ms = Number(BigInt(ns) / 1000000n);
    return new Date(ms).toISOString();
  } catch {
    return String(ns);
  }
}

function formatPretty({ entry, decoded }) {
  const time = nsToIso(entry.time);
  const id = entry.id || '?';
  const rssi = entry.rssi !== undefined ? `rssi=${entry.rssi}` : '';
  if (!decoded) return `${time} ${id} ${rssi} (no match)`.trim();
  const { brand, model, model_id, type, mac, ...rest } = decoded;
  const head = [brand, model_id || model].filter(Boolean).join('/');
  const kv = Object.entries(rest)
    .filter(([k]) => !['name', 'manufacturerdata', 'servicedata'].includes(k))
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' ');
  const macStr = mac ? `mac=${mac}` : '';
  return `${time} ${id} ${rssi} [${head}] ${macStr} ${kv}`.replace(/\s+/g, ' ').trim();
}

function formatJson({ entry, decoded }) {
  return JSON.stringify({
    time: entry.time,
    id: entry.id,
    rssi: entry.rssi,
    raw: {
      serviceData: entry.serviceData || '',
      manufacturerData: entry.manufacturerData || '',
    },
    decoded,
  });
}

async function runCli(argv) {
  const args = argv.slice(2);
  const jsonOut = args.includes('--json');
  const showAll = args.includes('--all');
  const files = args.filter((a) => a !== '--json' && a !== '--all');
  if (files.length === 0) {
    process.stderr.write('Usage: decode-log [--json] [--all] <log.json> [<log.json>...]\n');
    process.exit(1);
  }

  await ready();
  let total = 0;
  let decodedCount = 0;
  const byModel = {};

  for (const file of files) {
    let entries;
    try {
      entries = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      process.stderr.write(`error reading ${file}: ${err.message}\n`);
      process.exit(1);
    }
    if (!Array.isArray(entries)) {
      process.stderr.write(`${file}: expected a JSON array\n`);
      process.exit(1);
    }

    for (const entry of entries) {
      total++;
      const input = buildDecoderInput(entry);
      let decoded = null;
      if (input.servicedata || input.manufacturerdata) {
        decoded = await decodeBLE(input);
      }
      if (decoded) {
        decodedCount++;
        const key = decoded.model_id || decoded.model || '?';
        byModel[key] = (byModel[key] || 0) + 1;
      }
      if (!decoded && !showAll) continue;
      const line = jsonOut ? formatJson({ entry, decoded }) : formatPretty({ entry, decoded });
      process.stdout.write(line + '\n');
    }
  }

  process.stderr.write(
    `total=${total} decoded=${decodedCount} by_model=${JSON.stringify(byModel)}\n`,
  );
}

module.exports = { decodeLog, buildDecoderInput, formatPretty, formatJson };

if (require.main === module) {
  runCli(process.argv).catch((err) => {
    process.stderr.write(`${err && err.stack ? err.stack : err}\n`);
    process.exit(1);
  });
}
