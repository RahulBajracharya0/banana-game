// Fetches one puzzle from the Banana API (interoperability: HTTP request + JSON response)
const API_URL = "https://marcconrad.com/uob/banana/api.php";

async function getPuzzle() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Banana API error: " + response.status);
  }
  return await response.json();
}

module.exports = { getPuzzle };