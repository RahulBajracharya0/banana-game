const { getPuzzle } = require("./services/bananaApi");

getPuzzle()
  .then(puzzle => console.log(puzzle))
  .catch(err => console.error("Failed:", err.message));