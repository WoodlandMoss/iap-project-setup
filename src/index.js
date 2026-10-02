const express = require('express');
const { createDb } = require('./db');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function createApp(db = createDb()) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/assignments', (req, res) => {
    const { title, course, dueDate } = req.body || {};
    if (!title || !dueDate || !DATE_RE.test(dueDate)) {
      return res
        .status(400)
        .json({ error: 'title and a valid dueDate (YYYY-MM-DD) are required' });
    }

    const stmt = db.prepare(
      'INSERT INTO assignment (title, course, dueDate, status) VALUES (?, ?, ?, ?)'
    );
    const { lastInsertRowid } = stmt.run(title, course || null, dueDate, 'open');

    res.status(201).json({
      id: lastInsertRowid,
      title,
      course: course || null,
      dueDate,
      status: 'open',
    });
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
