# Theengs sensorlog decoder — web app

Static browser app that reads a sensorlogs-style JSON array, decodes each entry
via TheengsDecoder (WebAssembly, in-page), and offers the decorated result as a
download. Each entry gets a nested `decoded` field (`null` on no match); the
original schema is preserved.

## Run locally — no build step

```sh
cd nodejs/theengs-decoder
npm run web   # serves http://localhost:8000/
```

This uses the zero-dependency `serve.js`. The wasm bundle is read directly from
the sibling `dist/` so you must have run `npm run build` (or installed the
package) at least once.

## Run locally — Vite dev server

```sh
cd nodejs/theengs-decoder
npm install        # first time only, pulls vite
npm run web:dev    # http://localhost:5173/
```

## Build a deployable static site

```sh
cd nodejs/theengs-decoder
npm run web:build     # writes web/dist/
npm run web:preview   # serves the built output at http://localhost:4173/
```

`web/dist/` is fully self-contained: `index.html`, a hashed `assets/app-*.js`,
and `theengs_decoder_wasm.js`. Drop the directory on any static host
(GitHub Pages, Netlify, Cloudflare Pages, S3, etc.) — no server-side code or
runtime dependencies needed.

## Deploy to a static host via rsync

```sh
cd nodejs/theengs-decoder
cp .env.example .env       # then edit DEPLOY_HOST, DEPLOY_PATH, DEPLOY_BASE
npm run deploy-web
```

`scripts/deploy-web.sh` runs `vite build` with the configured `--base`, writes
the output to `web/dist/`, and `rsync -avz --delete`s it to
`$DEPLOY_HOST:$DEPLOY_PATH`. Process environment variables override `.env`,
so one-offs work too:

```sh
DEPLOY_BASE=/preview/ DEPLOY_PATH=/var/www/preview/ npm run deploy-web
```

If your host runs sshd on a non-default port, set `DEPLOY_PORT` in `.env` (or
the environment).

Pass `--no-rsync` to build the deploy bundle without uploading:

```sh
npm run deploy-web -- --no-rsync
```
