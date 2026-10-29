// Event-driven game logic: button clicks, Enter key, timer, and score saving
let score = 0;
let timeLeft = 30;
let currentSolution = null;
let timer = null;

const puzzleImg = document.getElementById("puzzle");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");

async function loadPuzzle() {
  const res = await fetch("/api/puzzle");
  if (!res.ok) {
    window.location.href = "login.html";
    return;
  }
  const puzzle = await res.json();
  puzzleImg.src = puzzle.question;
  currentSolution = puzzle.solution;
  answerInput.value = "";
  answerInput.focus();
}

function checkAnswer() {
  if (timeLeft <= 0) return;
  if (Number(answerInput.value) === currentSolution) {
    score++;
    message.textContent = "Correct!";
  } else {
    message.textContent = "Wrong! Previous answer was " + currentSolution;
  }
  document.getElementById("score").textContent = score;
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
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";
  rows.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r.username + ": " + r.best;
    list.appendChild(li);
  });
}

function startTimer() {
  // Event: timer fires every second
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      message.textContent = "Game over! Final score: " + score;
      document.getElementById("submit").disabled = true;
      document.getElementById("playAgain").style.display = "inline";
      saveScore();
    }
  }, 1000);
}

// Event: button click
document.getElementById("submit").addEventListener("click", checkAnswer);

// Event: pressing Enter in the input box
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});

// Event: play again
document.getElementById("playAgain").addEventListener("click", () => {
  window.location.reload();
});

// Event: log out
document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "login.html";
});

// Check login first; send to the login page if there is no session
async function init() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    window.location.href = "login.html";
    return;
  }
  const me = await res.json();
  document.getElementById("username").textContent = me.username;
  loadLeaderboard();
  await loadPuzzle();
  startTimer();
}
init();