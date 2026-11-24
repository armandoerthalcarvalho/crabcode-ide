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

test('server serves static IDE assets and supports cloud KV round-trip', async (t) => {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  t.after(() => server.close());

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

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

  // Missing cloud key returns empty object
  const emptyRes = await fetch(`${baseUrl}/load/nonexistent-key`);
  assert.equal(emptyRes.status, 200);
  assert.deepEqual(await emptyRes.json(), {});

  // Invalid cloud key returns 400
  const invalidRes = await fetch(`${baseUrl}/load/bad%20key`);
  assert.equal(invalidRes.status, 400);

  // Save and load round-trip
  const saveRes = await fetch(`${baseUrl}/save/test-score-1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pontos: 42, jogador: 'Ana' }),
  });
  assert.equal(saveRes.status, 200);
  assert.deepEqual(await saveRes.json(), { ok: true });

  const loadRes = await fetch(`${baseUrl}/load/test-score-1`);
  assert.equal(loadRes.status, 200);
  assert.deepEqual(await loadRes.json(), { pontos: 42, jogador: 'Ana' });
});
