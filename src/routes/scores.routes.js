// Save a player's score and fetch the leaderboard.
// Written with help from Claude (Anthropic), adapted by me.
const express = require("express");
const scores = require("../models/scoreModel");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.post("/", requireLogin, (req, res) => {
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: "Invalid score" });
  }
  scores.save(req.session.userId, score);
  res.json({ ok: true });
});

router.get("/leaderboard", (req, res) => {
  res.json(scores.topScores(5));
});

module.exports = router;
