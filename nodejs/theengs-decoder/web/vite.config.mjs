import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WASM_SRC = resolve(__dirname, '..', 'dist', 'theengs_decoder_wasm.js');
const WASM_DST = resolve(__dirname, 'public', 'theengs_decoder_wasm.js');

function copyWasm() {
  return {
    name: 'copy-theengs-wasm',
    buildStart() {
      if (!existsSync(WASM_SRC)) {
        this.error(
          `Wasm bundle not found at ${WASM_SRC}. Run "npm run build" first to produce dist/theengs_decoder_wasm.js.`,
        );
      }
      mkdirSync(dirname(WASM_DST), { recursive: true });
      copyFileSync(WASM_SRC, WASM_DST);
    },
  };
}

export default defineConfig({
  root: __dirname,
  base: './',
  plugins: [copyWasm()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
