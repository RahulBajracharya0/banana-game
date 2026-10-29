// SQLite database setup (stores users; scores come in the next step)
const Database = require("better-sqlite3");
const db = new Database("game.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`);

module.exports = db;