const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, isValidKey } = require('./server');

test('isValidKey validates cloud keys correctly', () => {
  assert.equal(isValidKey('meu-ranking_2025'), true);
  assert.equal(isValidKey('a'), true);
  assert.equal(isValidKey(''), false);
  assert.equal(isValidKey('invalid key with spaces'), false);
  assert.equal(isValidKey('../etc/passwd'), false);
  assert.equal(isValidKey('a'.repeat(65)), false);
});

test('server serves static IDE assets, health check, and rejects cloud KV with 501', async (t) => {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  t.after(() => server.close());

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  // Health check
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.equal(healthRes.status, 200);
  assert.deepEqual(await healthRes.json(), { ok: true });

  // Static index.html
  const indexRes = await fetch(`${baseUrl}/`);
  assert.equal(indexRes.status, 200);
  const indexHtml = await indexRes.text();
  assert.match(indexHtml, /<title>CrabCode IDE/);

  // Static JS module
  const mainJsRes = await fetch(`${baseUrl}/js/main.js`);
  assert.equal(mainJsRes.status, 200);
  assert.match(mainJsRes.headers.get('content-type') || '', /javascript/);

  // Static image asset
  const logoRes = await fetch(`${baseUrl}/assets/crabcode_logo.png`);
  assert.equal(logoRes.status, 200);

  // Cloud endpoints honestly report 501 Not Implemented
  const loadRes = await fetch(`${baseUrl}/load/any-key`);
  assert.equal(loadRes.status, 501);
  const saveRes = await fetch(`${baseUrl}/save/any-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pontos: 42 }),
  });
  assert.equal(saveRes.status, 501);
});
