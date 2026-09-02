const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/index.js');

test('test runner is working', () => {
  assert.strictEqual(1 + 1, 2);
});

test('app boots and responds on /health', async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  const res = await fetch(`http://localhost:${port}/health`);
  const body = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.status, 'ok');

  server.close();
});
