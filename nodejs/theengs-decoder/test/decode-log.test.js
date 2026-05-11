'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { decodeLog } = require('../scripts/decode-log');

const LOG_DIR = path.join(__dirname, '..', 'sensorlogs');

function tally(results) {
  const byModel = {};
  let decoded = 0;
  for (const r of results) {
    if (!r.decoded) continue;
    decoded++;
    const k = r.decoded.model_id || r.decoded.model || '?';
    byModel[k] = (byModel[k] || 0) + 1;
  }
  return { total: results.length, decoded, byModel };
}

test('decodes entries from 2026-05-11_07-02-22.json', async () => {
  const entries = JSON.parse(
    fs.readFileSync(path.join(LOG_DIR, '2026-05-11_07-02-22.json'), 'utf8'),
  );
  const results = await decodeLog(entries);
  const { total, decoded, byModel } = tally(results);
  assert.ok(total > 0, 'expected non-empty log');
  assert.ok(decoded > 0, 'expected at least one decoded entry');
  assert.ok(
    byModel.RuuviTag_RAWv2 > 0 || byModel.M1017 > 0 || byModel.RC1010 > 0,
    `expected a known sensor model in tally, got ${JSON.stringify(byModel)}`,
  );
});

test('decodes entries from 2026-05-11_07-08-47.json', async () => {
  const entries = JSON.parse(
    fs.readFileSync(path.join(LOG_DIR, '2026-05-11_07-08-47.json'), 'utf8'),
  );
  const results = await decodeLog(entries);
  const { total, decoded, byModel } = tally(results);
  assert.ok(total > 0, 'expected non-empty log');
  assert.ok(decoded > 0, 'expected at least one decoded entry');
});

test('strips UUID prefix from serviceData', async () => {
  const { buildDecoderInput } = require('../scripts/decode-log');
  const input = buildDecoderInput({ serviceData: 'fcd2:4400a001643a00' });
  assert.strictEqual(input.servicedata, '4400a001643a00');
});

test('only forwards id when it looks like a MAC', async () => {
  const { buildDecoderInput } = require('../scripts/decode-log');
  const mac = buildDecoderInput({ id: 'A4:C1:38:9A:A7:24', manufacturerData: 'aa' });
  assert.strictEqual(mac.id, 'A4:C1:38:9A:A7:24');
  const uuid = buildDecoderInput({
    id: '536ef24e-38ea-8250-d9f9-e71f305c8171',
    manufacturerData: 'aa',
  });
  assert.strictEqual(uuid.id, undefined);
});
