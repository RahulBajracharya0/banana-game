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
let bestScore = 0; // the player's saved personal best

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
  // Beating your saved best during the game updates the Best card live
  if (score > bestScore) {
    el("best").textContent = score;
    el("best").classList.add("record");
  }
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
}

async function saveScore() {
  const bestLine = el("bestLine");
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score })
    });
    if (!res.ok) throw new Error("save failed");
    const data = await res.json();
    if (data.isNewBest) {
      bestLine.textContent = "New high score!";
      bestLine.className = "best-line new-best";
    } else {
      bestLine.textContent = "Your best: " + data.best + (data.rank ? "  (rank #" + data.rank + ")" : "");
      bestLine.className = "best-line";
    }
  } catch (err) {
    bestLine.textContent = "Could not save your score.";
    bestLine.className = "best-line";
  }
  loadLeaderboard();
  loadMyStats();
}

// The player's own best score, games played and recent games
async function loadMyStats() {
  const res = await fetch("/api/scores/me");
  if (!res.ok) return;
  const me = await res.json();
  bestScore = me.best;
  el("best").textContent = me.best;
  el("best").classList.remove("record");

  el("myStats").textContent = me.games === 0
    ? "Play a game to see it here."
    : "Games played: " + me.games + (me.rank ? " | Rank #" + me.rank : "");

  const list = el("recent");
  list.innerHTML = "";
  me.recent.forEach((g) => {
    const li = document.createElement("li");
    if (g.score === me.best && me.best > 0) li.className = "top";
    const when = document.createElement("span");
    when.className = "when";
    // SQLite stores UTC as "YYYY-MM-DD HH:MM:SS"; convert it to the player's local date
    when.textContent = new Date(g.played_at.replace(" ", "T") + "Z").toLocaleDateString();
    const pts = document.createElement("span");
    pts.className = "pts";
    pts.textContent = g.score;
    li.append(when, pts);
    list.appendChild(li);
  });
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
  document.querySelectorAll(".key").forEach((k) => (k.disabled = true));
  el("finalScore").textContent = score;
  el("overlay").hidden = false;
  el("playAgain").focus();
  saveScore();
}

// Event: button click
el("submit").addEventListener("click", checkAnswer);

// Event: hint button click
el("hint").addEventListener("click", giveHint);

// Number pad: add a digit, clear, or delete the last one (max 2 digits)
function pressKey(key) {
  if (gameOver) return;
  if (key === "clear") {
    answerInput.value = "";
  } else if (key === "back") {
    answerInput.value = answerInput.value.slice(0, -1);
  } else if (answerInput.value.length < 2) {
    answerInput.value += key;
  }
}

// Event: number pad buttons
el("numpad").addEventListener("click", (e) => {
  const btn = e.target.closest(".key");
  if (btn) pressKey(btn.dataset.key);
});

// Event: physical keyboard still works (digits, Backspace, Enter)
document.addEventListener("keydown", (e) => {
  if (gameOver || !el("overlay").hidden) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^[0-9]$/.test(e.key)) pressKey(e.key);
  else if (e.key === "Backspace") pressKey("back");
  else if (e.key === "Delete" || e.key === "Escape") pressKey("clear");
  else if (e.key === "Enter" && document.activeElement.tagName !== "BUTTON") checkAnswer();
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
  loadMyStats();
  await loadPuzzle();
}
init();