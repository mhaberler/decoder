'use strict';

const MAC_RE = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

export function buildDecoderInput(entry) {
  const input = {};
  let sd = entry.serviceData ?? entry.servicedata ?? '';
  const colon = sd.indexOf(':');
  if (colon >= 0) sd = sd.slice(colon + 1);
  if (sd) input.servicedata = sd;
  const md = entry.manufacturerData ?? entry.manufacturerdata ?? '';
  if (md) input.manufacturerdata = md;
  const id = entry.id;
  if (id && MAC_RE.test(id)) input.id = id;
  return input;
}

let decoderPromise = null;

function loadWasmScript() {
  if (window.createTheengsDecoderModule) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = './theengs_decoder_wasm.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load theengs_decoder_wasm.js'));
    document.head.appendChild(s);
  });
}

export function loadDecoder() {
  if (decoderPromise) return decoderPromise;
  decoderPromise = loadWasmScript()
    .then(() => window.createTheengsDecoderModule())
    .then((Module) => new Module.TheengsDecoder());
  return decoderPromise;
}

export function decodeEntry(decoder, entry) {
  const input = buildDecoderInput(entry);
  if (!input.servicedata && !input.manufacturerdata) return null;
  const out = decoder.decodeBLE(JSON.stringify(input));
  if (!out) return null;
  try { return JSON.parse(out); } catch { return null; }
}
