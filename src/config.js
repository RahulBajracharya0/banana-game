// Central settings in one place. Values can be overridden with environment variables.
// Written with help from Claude (Anthropic), adapted by me.
const path = require("path");

module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
  bananaApiUrl: process.env.BANANA_API_URL || "https://marcconrad.com/uob/banana/api.php",
  dbFile: process.env.DB_FILE || path.join(__dirname, "..", "data", "game.db"),
  sessionMaxAgeMs: 1000 * 60 * 60 // 1 hour
};
