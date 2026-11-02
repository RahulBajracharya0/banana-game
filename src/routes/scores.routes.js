const express = require("express");
const scores = require("../models/scoreModel");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.post("/", requireLogin, (req, res) => {
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: "Invalid score" });
  }
  const userId = req.session.userId;
  const previousBest = scores.statsFor(userId).best;
  scores.save(userId, score);
  const isNewBest = score > 0 && (previousBest === null || score > previousBest);
  res.json({
    ok: true,
    isNewBest,
    best: isNewBest ? score : previousBest,
    rank: scores.rankFor(userId)
  });
});

router.get("/leaderboard", (req, res) => {
  res.json(scores.topScores(5));
});

router.get("/me", requireLogin, (req, res) => {
  const userId = req.session.userId;
  const { best, games } = scores.statsFor(userId);
  res.json({
    best: best || 0,
    games,
    rank: scores.rankFor(userId),
    recent: scores.recentFor(userId, 5)
  });
});

module.exports = router;