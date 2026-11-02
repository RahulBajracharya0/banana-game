// Event-driven game logic: clicks, Enter key, a one-second timer, and score saving.
// Written with help from Claude (Anthropic), adapted by me.
const ROUND_SECONDS = 30;
let score = 0;
let timeLeft = ROUND_SECONDS;
let currentSolution = null;
let timer = null;
const MAX_HINTS = 3;
const HINT_PENALTY_SECONDS = 3;
let hintsLeft = MAX_HINTS;
let hintLevel = 0; // how many hints used on the current puzzle
let currentUser = "";

const el = (id) => document.getElementById(id);
const puzzleImg = el("puzzle");
const answerInput = el("answer");
const message = el("message");
const answerRow = el("answerRow");
const clockFill = el("clockFill");

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
  if (timeLeft <= 0) return;
  if (answerInput.value === "") {
    setMessage("Type a number first.", "bad");
    return;
  }
  if (Number(answerInput.value) === currentSolution) {
    score++;
    el("score").textContent = score;
    playAnimation(el("score"), "bump");
    setMessage("Correct. Here's the next one.", "good");
  } else {
    playAnimation(answerRow, "shake");
    setMessage("Not quite. The last banana was " + currentSolution + ".", "bad");
  }
  loadPuzzle();
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

function updateClock() {
  el("timer").textContent = timeLeft;
  clockFill.style.width = (timeLeft / ROUND_SECONDS) * 100 + "%";
  clockFill.classList.toggle("low", timeLeft <= 10);
}

function endGame() {
  clearInterval(timer);
  el("submit").disabled = true;
  answerInput.disabled = true;
  el("hint").disabled = true;
  el("finalScore").textContent = score;
  el("overlay").hidden = false;
  el("playAgain").focus();
  saveScore();
}

function startTimer() {
  updateClock();
  // Event: fires every second
  timer = setInterval(() => {
    timeLeft--;
    updateClock();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// Hint: costs a few seconds and a hint token. Level 1 = even/odd, level 2 = a range.
function giveHint() {
  if (timeLeft <= 0 || currentSolution === null) return;
  if (hintLevel >= 2) {
    el("hintText").textContent = "No more hints for this puzzle.";
    return;
  }
  hintLevel++;
  hintsLeft--;
  timeLeft = Math.max(1, timeLeft - HINT_PENALTY_SECONDS);
  updateClock();

  let text;
  if (hintLevel === 1) {
    text = "Hint: the number is " + (currentSolution % 2 === 0 ? "even" : "odd") + ".";
  } else {
    const low = Math.max(0, currentSolution - 2);
    text = "Hint: the number is between " + low + " and " + (low + 4) + ".";
  }
  el("hintText").textContent = text + " (-" + HINT_PENALTY_SECONDS + "s)";
  el("hint").textContent = "Hint (" + hintsLeft + ")";
  el("hint").disabled = hintsLeft <= 0;
  answerInput.focus();
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
  loadLeaderboard();
  await loadPuzzle();
  startTimer();
}
init();