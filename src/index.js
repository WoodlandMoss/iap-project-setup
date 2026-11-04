const crypto = require('node:crypto');
const express = require('express');
const { createDb } = require('./db');
const { validateAssignmentInput } = require('./validation');
const { createLogger } = require('./logger');

const REQUEST_ID_RE = /^[A-Za-z0-9._-]{1,64}$/;

function createApp(db = createDb(), { logger = createLogger() } = {}) {
  const app = express();
  app.use(express.json());

  // Correlation: every request gets a requestId (reused from the caller's
  // X-Request-Id if it's sane, otherwise generated). Every log line for the
  // request carries it, and it's echoed back in the X-Request-Id response
  // header so a user-visible error can be matched to its log lines.
  app.use((req, res, next) => {
    const incoming = req.get('x-request-id');
    req.id = incoming && REQUEST_ID_RE.test(incoming) ? incoming : crypto.randomUUID();
    req.log = logger.child({ requestId: req.id });
    res.set('X-Request-Id', req.id);

    const start = process.hrtime.bigint();
    req.log.info('request.received', { method: req.method, path: req.path });
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      req.log[res.statusCode >= 500 ? 'error' : 'info']('request.completed', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      });
    });
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/assignments', (req, res) => {
    const { title, course, dueDate } = req.body || {};
    const validation = validateAssignmentInput({ title, dueDate });
    if (!validation.ok) {
      req.log.warn('assignment.validation_failed', { reason: validation.error });
      return res.status(400).json({ error: validation.error });
    }

    const insertStmt = db.prepare(
      'INSERT INTO assignment (title, course, dueDate, status) VALUES (?, ?, ?, ?)'
    );
    const { lastInsertRowid } = insertStmt.run(title, course || null, dueDate, 'open');

    const created = db
      .prepare('SELECT * FROM assignment WHERE id = ?')
      .get(lastInsertRowid);

    req.log.info('assignment.created', { assignmentId: created.id, dueDate: created.dueDate });
    res.status(201).json(created);
  });

  app.get('/assignments', (req, res) => {
    const rows = db.prepare('SELECT * FROM assignment ORDER BY dueDate ASC').all();
    req.log.info('assignment.listed', { count: rows.length });
    res.json(rows);
  });

  // Unhandled errors (e.g. SQLite failures) are logged with the requestId and
  // the SQLite error details; the client gets the requestId, not a stack trace.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    (req.log || logger).error('request.failed', {
      method: req.method,
      path: req.path,
      errorCode: err.code,
      sqliteErrcode: err.errcode,
      errorMessage: err.message,
    });
    res.status(500).json({ error: 'internal error', requestId: req.id });
  });

  return app;
}

if (require.main === module) {
  const logger = createLogger();
  const app = createApp(createDb(), { logger });
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info('server.started', { port: Number(port), dbPath: process.env.DB_PATH || 'data.sqlite' });
  });
}

module.exports = { createApp };
