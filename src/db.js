const { DatabaseSync } = require('node:sqlite');

function createDb(path = process.env.DB_PATH || 'data.sqlite') {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      course TEXT,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open'
    )
  `);
  return db;
}

module.exports = { createDb };
