// Blocks a request unless the session cookie belongs to a logged-in user.
// Written with help from Claude (Anthropic), adapted by me.
module.exports = function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in" });
  }
  next();
};
