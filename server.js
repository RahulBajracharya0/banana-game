// Entry point: starts the HTTP server.
// Written with help from Claude (Anthropic), adapted by me.
const app = require("./src/app");
const config = require("./src/config");

app.listen(config.port, () => {
  console.log("Server running at http://localhost:" + config.port);
});
