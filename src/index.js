const express = require('express');
const { createDb } = require('./db');
const { validateAssignmentInput } = require('./validation');

function createApp(db = createDb()) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/assignments', (req, res) => {
    const { title, course, dueDate } = req.body || {};
    const validation = validateAssignmentInput({ title, dueDate });
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const insertStmt = db.prepare(
      'INSERT INTO assignment (title, course, dueDate, status) VALUES (?, ?, ?, ?)'
    );
    const { lastInsertRowid } = insertStmt.run(title, course || null, dueDate, 'open');

    const created = db
      .prepare('SELECT * FROM assignment WHERE id = ?')
      .get(lastInsertRowid);

    res.status(201).json(created);
  });

  app.get('/assignments', (req, res) => {
    const rows = db.prepare('SELECT * FROM assignment ORDER BY dueDate ASC').all();
    res.json(rows);
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

module.exports = { createApp };
