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
