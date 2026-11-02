// Manual check that the Banana API is reachable. Run: npm run test:api
const { getPuzzle } = require("../src/services/bananaApi");

getPuzzle()
  .then((puzzle) => console.log(puzzle))
  .catch((err) => console.error("Failed:", err.message));
