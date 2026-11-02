const db = require("../db/database");

function save(userId, score) {
  db.prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)").run(userId, score);
}

// Best score per player, highest first
function topScores(limit = 5) {
  return db.prepare(`
    SELECT users.username, MAX(scores.score) AS best
    FROM scores JOIN users ON users.id = scores.user_id
    GROUP BY users.id
    ORDER BY best DESC
    LIMIT ?
  `).all(limit);
}

function statsFor(userId) {
  return db.prepare(
    "SELECT MAX(score) AS best, COUNT(*) AS games FROM scores WHERE user_id = ?"
  ).get(userId);
}

function rankFor(userId) {
  const mine = statsFor(userId).best;
  if (mine === null) return null;
  const row = db.prepare(`
    SELECT COUNT(*) AS higher FROM (
      SELECT MAX(score) AS best FROM scores GROUP BY user_id
    ) WHERE best > ?
  `).get(mine);
  return row.higher + 1;
}

function recentFor(userId, limit = 5) {
  return db.prepare(
    "SELECT score, played_at FROM scores WHERE user_id = ? ORDER BY id DESC LIMIT ?"
  ).all(userId, limit);
}

module.exports = { save, topScores, statsFor, rankFor, recentFor };
