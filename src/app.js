const path = require("path");
const express = require("express");
const session = require("express-session");
const config = require("./config");
const requireLogin = require("./middleware/requireLogin");
const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");
const scoreRoutes = require("./routes/scores.routes");

const app = express();

app.use(express.json());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: config.sessionMaxAgeMs }
}));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api/puzzle", requireLogin, gameRoutes);
app.use("/api/scores", scoreRoutes);

module.exports = app;
