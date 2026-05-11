'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const pkgDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
};

function resolveFile(urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/web/index.html';
  else if (!rel.startsWith('/')) rel = '/' + rel;
  if (!rel.startsWith('/web/') && !rel.startsWith('/dist/')) {
    rel = '/web' + rel;
  }
  const abs = path.normalize(path.join(pkgDir, rel));
  if (!abs.startsWith(pkgDir)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url);
  if (!file) {
    res.writeHead(400).end('bad path');
    return;
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404).end('not found: ' + req.url);
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(port, () => {
  process.stdout.write(`Theengs decoder web app: http://localhost:${port}/\n`);
});
