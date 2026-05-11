# Theengs sensorlog decoder — web app

Static browser app that reads a sensorlogs-style JSON array, decodes each entry
via TheengsDecoder (WebAssembly, in-page), and offers the decorated result as a
download. Each entry gets a nested `decoded` field (`null` on no match); the
original schema is preserved.

## Run locally

```sh
cd nodejs/theengs-decoder
npm run web   # serves http://localhost:8000/
```

Then upload any file from `sensorlogs/`, click **Decode**, then **Download
decoded JSON**.

The page is fully static — `serve.js` is just a zero-dependency static file
server for local development. Any static host that can serve both `web/` and
the sibling `dist/theengs_decoder_wasm.js` will work.
