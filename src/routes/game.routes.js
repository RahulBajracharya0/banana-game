// Puzzle endpoint: the server fetches a puzzle from the Banana API and passes it on.
// Written with help from Claude (Anthropic), adapted by me.
const express = require("express");
const { getPuzzle } = require("../services/bananaApi");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await getPuzzle());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
