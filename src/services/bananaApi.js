// Client for the external Banana API (interoperability: HTTP GET request + JSON response).
// Written with help from Claude (Anthropic), adapted by me.
const config = require("../config");

async function getPuzzle() {
  const response = await fetch(config.bananaApiUrl);
  if (!response.ok) {
    throw new Error("Banana API error: " + response.status);
  }
  return await response.json(); // { question: <image url>, solution: <number> }
}

module.exports = { getPuzzle };
