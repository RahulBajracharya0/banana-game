
const config = require("../config");

async function getPuzzle() {
  const response = await fetch(config.bananaApiUrl);
  if (!response.ok) {
    throw new Error("Banana API error: " + response.status);
  }
  return await response.json(); // { question: <image url>, solution: <number> }
}

module.exports = { getPuzzle };
