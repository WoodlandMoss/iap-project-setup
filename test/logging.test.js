const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { createApp } = require('../src/index.js');
const { createDb } = require('../src/db.js');
const { createLogger } = require('../src/logger.js');

function startApp(db) {
  const lines = [];
  const logger = createLogger({ write: (line) => lines.push(line) });
  const app = createApp(db, { logger });
  const server = app.listen(0);
  const { port } = server.address();
  return { server, baseUrl: `http://localhost:${port}`, lines };
}

function parse(lines) {
  return lines.map((line) => JSON.parse(line));
}

test('every log line is one JSON object with the core fields', async () => {
  const { server, baseUrl, lines } = startApp(createDb(':memory:'));

  try {
    await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Lab 4', dueDate: '2026-11-10' }),
    });
    await fetch(`${baseUrl}/assignments`);
  } finally {
    server.close();
  }

  const records = parse(lines);
  assert.ok(records.length >= 6);
  for (const record of records) {
    assert.ok(!Number.isNaN(Date.parse(record.ts)), 'ts is an ISO timestamp');
    assert.ok(['debug', 'info', 'warn', 'error'].includes(record.level));
    assert.strictEqual(typeof record.event, 'string');
    assert.strictEqual(typeof record.requestId, 'string');
  }
});

test('one operation is traceable end to end by its requestId', async () => {
  const { server, baseUrl, lines } = startApp(createDb(':memory:'));

  let res;
  try {
    res = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': 'trace-me-1' },
      body: JSON.stringify({ title: 'Lab 4', dueDate: '2026-11-10' }),
    });
    await fetch(`${baseUrl}/assignments`);
  } finally {
    server.close();
  }

  assert.strictEqual(res.headers.get('x-request-id'), 'trace-me-1');
  const traced = parse(lines).filter((r) => r.requestId === 'trace-me-1');
  assert.deepStrictEqual(
    traced.map((r) => r.event),
    ['request.received', 'assignment.created', 'request.completed']
  );
  assert.strictEqual(traced[2].status, 201);
});

test('a generated requestId is returned when the caller sends none (or a bad one)', async () => {
  const { server, baseUrl, lines } = startApp(createDb(':memory:'));

  let res;
  try {
    res = await fetch(`${baseUrl}/health`, { headers: { 'x-request-id': 'bad id with spaces' } });
  } finally {
    server.close();
  }

  const id = res.headers.get('x-request-id');
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.ok(parse(lines).every((r) => r.requestId === id));
});

test('a locked database surfaces as a logged request.failed with the SQLite error (runbook RB-001)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iap-m8-'));
  const dbPath = path.join(dir, 'data.sqlite');
  const { server, baseUrl, lines } = startApp(createDb(dbPath));
  const otherProcess = new DatabaseSync(dbPath);
  otherProcess.exec('BEGIN IMMEDIATE');

  let res;
  let body;
  try {
    res = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Lab 4', dueDate: '2026-11-10' }),
    });
    body = await res.json();
  } finally {
    server.close();
    otherProcess.exec('ROLLBACK');
    otherProcess.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }

  assert.strictEqual(res.status, 500);
  assert.strictEqual(body.requestId, res.headers.get('x-request-id'));
  const failed = parse(lines).find((r) => r.event === 'request.failed');
  assert.strictEqual(failed.requestId, body.requestId);
  assert.strictEqual(failed.sqliteErrcode, 5);
  assert.strictEqual(failed.errorMessage, 'database is locked');
});
