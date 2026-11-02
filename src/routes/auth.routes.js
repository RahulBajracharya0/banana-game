// Registration, login, logout. Passwords are hashed with bcrypt, never stored in plain text.
// Written with help from Claude (Anthropic), adapted by me.
const express = require("express");
const bcrypt = require("bcrypt");
const users = require("../models/userModel");

const router = express.Router();
const SALT_ROUNDS = 10;

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Username and a password of 6+ characters required" });
  }
  if (users.findByUsername(username)) {
    return res.status(409).json({ error: "Username already taken" });
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = users.create(username, hash);
  req.session.userId = id;
  req.session.username = username;
  res.json({ ok: true });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Wrong username or password" });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  res.json({ username: req.session.username });
});

module.exports = router;
