const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/index.js');
const { createDb } = require('../src/db.js');

function startApp() {
  const app = createApp(createDb(':memory:'));
  const server = app.listen(0);
  const { port } = server.address();
  return { server, baseUrl: `http://localhost:${port}` };
}

test('walking skeleton: create an assignment, then see it in the list', async () => {
  const { server, baseUrl } = startApp();

  const createRes = await fetch(`${baseUrl}/assignments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Read chapter 3', course: 'CS101', dueDate: '2026-10-10' }),
  });
  const created = await createRes.json();

  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(created.title, 'Read chapter 3');
  assert.strictEqual(created.course, 'CS101');
  assert.strictEqual(created.dueDate, '2026-10-10');
  assert.strictEqual(created.status, 'open');
  assert.ok(Number.isInteger(created.id));

  const listRes = await fetch(`${baseUrl}/assignments`);
  const assignments = await listRes.json();

  assert.strictEqual(listRes.status, 200);
  assert.strictEqual(assignments.length, 1);
  assert.strictEqual(assignments[0].id, created.id);
  assert.strictEqual(assignments[0].title, 'Read chapter 3');

  server.close();
});

test('rejects creating an assignment with no title (NFR-3)', async () => {
  const { server, baseUrl } = startApp();

  const res = await fetch(`${baseUrl}/assignments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dueDate: '2026-10-10' }),
  });

  assert.strictEqual(res.status, 400);

  const listRes = await fetch(`${baseUrl}/assignments`);
  const assignments = await listRes.json();
  assert.strictEqual(assignments.length, 0);

  server.close();
});
