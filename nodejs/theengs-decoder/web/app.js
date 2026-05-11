'use strict';

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

const fileEl = document.getElementById('file');
const runEl = document.getElementById('run');
const statusEl = document.getElementById('status');
const summaryEl = document.getElementById('summary');
const downloadEl = document.getElementById('download');
const dlEl = document.getElementById('dl');

let decoder = null;
let lastBlobUrl = null;

window.createTheengsDecoderModule().then((Module) => {
  decoder = new Module.TheengsDecoder();
  statusEl.textContent = 'Decoder ready. Select a file.';
  runEl.disabled = false;
}).catch((err) => {
  statusEl.textContent = 'Failed to load decoder: ' + err.message;
});

function decodeEntry(entry) {
  const input = buildDecoderInput(entry);
  if (!input.servicedata && !input.manufacturerdata) return null;
  const out = decoder.decodeBLE(JSON.stringify(input));
  if (!out) return null;
  try { return JSON.parse(out); } catch { return null; }
}

function nextTick() {
  return new Promise((r) => setTimeout(r, 0));
}

async function processEntries(entries) {
  const out = new Array(entries.length);
  const byModel = {};
  let decoded = 0;
  const CHUNK = 500;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const d = decodeEntry(e);
    out[i] = { ...e, decoded: d };
    if (d) {
      decoded++;
      const k = d.model_id || d.model || '?';
      byModel[k] = (byModel[k] || 0) + 1;
    }
    if ((i + 1) % CHUNK === 0) {
      statusEl.textContent = `Decoding ${i + 1} / ${entries.length}…`;
      await nextTick();
    }
  }
  return { out, total: entries.length, decoded, byModel };
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

runEl.addEventListener('click', async () => {
  const file = fileEl.files && fileEl.files[0];
  if (!file) {
    statusEl.textContent = 'Pick a file first.';
    return;
  }
  if (!decoder) {
    statusEl.textContent = 'Decoder not ready yet.';
    return;
  }
  runEl.disabled = true;
  downloadEl.style.display = 'none';
  summaryEl.textContent = '(processing…)';
  statusEl.textContent = 'Reading file…';

  try {
    const text = await readFile(file);
    const entries = JSON.parse(text);
    if (!Array.isArray(entries)) throw new Error('Expected a JSON array at the top level.');

    const { out, total, decoded, byModel } = await processEntries(entries);

    summaryEl.textContent =
      `file:       ${file.name}\n` +
      `total:      ${total}\n` +
      `decoded:    ${decoded}\n` +
      `by_model:   ${JSON.stringify(byModel, null, 2)}`;

    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
    lastBlobUrl = URL.createObjectURL(blob);
    dlEl.href = lastBlobUrl;
    const base = file.name.replace(/\.json$/i, '');
    dlEl.download = `${base}.decoded.json`;
    downloadEl.style.display = 'block';
    statusEl.textContent = `Done. ${decoded} of ${total} entries decoded.`;
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    summaryEl.textContent = '(no file processed yet)';
  } finally {
    runEl.disabled = false;
  }
});
