// Basic Express server: serves the frontend and exposes a puzzle route
const express = require("express");
const { getPuzzle } = require("./services/bananaApi");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/api/puzzle", async (req, res) => {
  try {
    const puzzle = await getPuzzle();
    res.json(puzzle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});