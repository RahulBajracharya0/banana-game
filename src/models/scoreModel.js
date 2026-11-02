// Database queries for scores.
// Written with help from Claude (Anthropic), adapted by me.
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

module.exports = { save, topScores };
