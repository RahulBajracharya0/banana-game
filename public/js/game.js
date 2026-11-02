// Event-driven game logic: clicks, Enter key, points, lives, hints and score saving.
// Written with help from Claude (Anthropic), adapted by me.
const MAX_LIVES = 3;
const POINTS_PER_ANSWER = 10;
const STREAK_BONUS = 5;        // extra points for each answer in a row
const MAX_STREAK_BONUS = 15;   // the streak bonus never goes above this
const MAX_HINTS = 3;
const HINT_COST_POINTS = 2;

let score = 0;
let lives = MAX_LIVES;
let gameOver = false;
let currentSolution = null;
let streak = 0;
let hintsLeft = MAX_HINTS;
let hintLevel = 0; // how many hints used on the current puzzle
let currentUser = "";

const el = (id) => document.getElementById(id);
const puzzleImg = el("puzzle");
const answerInput = el("answer");
const message = el("message");
const answerRow = el("answerRow");

function setMessage(text, kind) {
  message.textContent = text;
  message.className = "message " + (kind || "");
}

// Replays a CSS animation on an element (used for shake and bump feedback)
function playAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function showScore() {
  el("score").textContent = score;
  playAnimation(el("score"), "bump");
}

function showLives() {
  el("lives").textContent = lives;
}

async function loadPuzzle() {
  puzzleImg.classList.add("loading");
  const res = await fetch("/api/puzzle");
  if (res.status === 401) {
    window.location.href = "login.html";
    return;
  }
  if (!res.ok) {
    setMessage("Could not load a puzzle. Check your internet connection.", "bad");
    return;
  }
  const puzzle = await res.json();
  currentSolution = puzzle.solution;
  hintLevel = 0;
  el("hintText").textContent = "";
  await new Promise((resolve) => {
    puzzleImg.onload = puzzleImg.onerror = () => {
      puzzleImg.classList.remove("loading");
      resolve();
    };
    puzzleImg.src = puzzle.question;
  });
  answerInput.value = "";
  answerInput.focus();
}

function checkAnswer() {
  if (gameOver) return;
  if (answerInput.value === "") {
    setMessage("Type a number first.", "bad");
    return;
  }
  if (Number(answerInput.value) === currentSolution) {
    streak++;
    const bonus = Math.min((streak - 1) * STREAK_BONUS, MAX_STREAK_BONUS);
    const gained = POINTS_PER_ANSWER + bonus;
    score += gained;
    showScore();
    setMessage(
      "Correct! +" + gained + " points" + (streak > 1 ? " (streak x" + streak + ")" : ""),
      "good"
    );
  } else {
    streak = 0;
    lives--;
    showLives();
    playAnimation(answerRow, "shake");
    setMessage("Not quite. The last banana was " + currentSolution + ". Lives left: " + lives, "bad");
    if (lives <= 0) {
      endGame();
      return;
    }
  }
  loadPuzzle();
}

// Hint: costs points and uses one of your hint tokens.
// Level 1 = even or odd, level 2 = a range of five numbers.
function giveHint() {
  if (gameOver || currentSolution === null) return;
  if (hintsLeft <= 0) return;
  if (hintLevel >= 2) {
    el("hintText").textContent = "No more hints for this puzzle.";
    return;
  }
  hintLevel++;
  hintsLeft--;
  score = Math.max(0, score - HINT_COST_POINTS);
  showScore();

  let text;
  if (hintLevel === 1) {
    text = "Hint: the number is " + (currentSolution % 2 === 0 ? "even" : "odd") + ".";
  } else {
    const low = Math.max(0, currentSolution - 2);
    text = "Hint: the number is between " + low + " and " + (low + 4) + ".";
  }
  el("hintText").textContent = text + " (-" + HINT_COST_POINTS + " points)";
  el("hint").textContent = "Hint (" + hintsLeft + ")";
  el("hint").disabled = hintsLeft <= 0;
  answerInput.focus();
}

async function saveScore() {
  await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score })
  });
  loadLeaderboard();
}

async function loadLeaderboard() {
  const res = await fetch("/api/scores/leaderboard");
  const rows = await res.json();
  const list = el("leaderboard");
  list.innerHTML = "";
  if (rows.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No scores yet. Set the first one.";
    li.style.cssText = "display:block;color:#55657f";
    list.appendChild(li);
    return;
  }
  rows.forEach((r) => {
    const li = document.createElement("li");
    if (r.username === currentUser) li.className = "me";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = r.username; // textContent keeps usernames safe from HTML injection
    const pts = document.createElement("span");
    pts.className = "pts";
    pts.textContent = r.best;
    li.append(name, pts);
    list.appendChild(li);
  });
}

function endGame() {
  gameOver = true;
  el("submit").disabled = true;
  el("hint").disabled = true;
  answerInput.disabled = true;
  el("finalScore").textContent = score;
  el("overlay").hidden = false;
  el("playAgain").focus();
  saveScore();
}

// Event: button click
el("submit").addEventListener("click", checkAnswer);

// Event: hint button click
el("hint").addEventListener("click", giveHint);

// Event: Enter key in the answer box
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});

// Event: play again
el("playAgain").addEventListener("click", () => window.location.reload());

// Event: log out
el("logout").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "login.html";
});

// Check the session first; send to the login page if there is none
async function init() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    window.location.href = "login.html";
    return;
  }
  const me = await res.json();
  currentUser = me.username;
  el("username").textContent = me.username;
  showLives();
  loadLeaderboard();
  await loadPuzzle();
}
init();