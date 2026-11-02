const db = require("../db/database");

function findByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function create(username, passwordHash) {
  const info = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);
  return info.lastInsertRowid;
}

module.exports = { findByUsername, create };
