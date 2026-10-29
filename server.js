// Express server: sessions (cookies), auth routes, scores, and a protected puzzle route
const express = require("express");
const session = require("express-session");
const { getPuzzle } = require("./services/bananaApi");
const authRoutes = require("./routes/auth");
const scoreRoutes = require("./routes/scores");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
  secret: "change-this-to-a-long-random-string",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour
}));
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Please log in" });
  next();
}

app.get("/api/puzzle", requireLogin, async (req, res) => {
  try {
    res.json(await getPuzzle());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});