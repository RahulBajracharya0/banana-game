// Save a player's score and fetch the leaderboard
const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Please log in" });
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: "Invalid score" });
  }
  db.prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)").run(req.session.userId, score);
  res.json({ ok: true });
});

router.get("/leaderboard", (req, res) => {
  const rows = db.prepare(`
    SELECT users.username, MAX(scores.score) AS best
    FROM scores JOIN users ON users.id = scores.user_id
    GROUP BY users.id
    ORDER BY best DESC
    LIMIT 5
  `).all();
  res.json(rows);
});

module.exports = router;