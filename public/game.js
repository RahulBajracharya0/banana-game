// Event-driven game logic: clicks, Enter key, a one-second timer, and score saving.
const ROUND_SECONDS = 30;
let score = 0;
let timeLeft = ROUND_SECONDS;
let currentSolution = null;
let timer = null;
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
  if (!res.ok) {
    window.location.href = "login.html";
    return;
  }
  const puzzle = await res.json();
  currentSolution = puzzle.solution;
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

// Event: button click
el("submit").addEventListener("click", checkAnswer);

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