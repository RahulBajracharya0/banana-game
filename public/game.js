// Event-driven game logic: button click, Enter key, and a timer event
let score = 0;
let timeLeft = 30;
let currentSolution = null;

const puzzleImg = document.getElementById("puzzle");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");

async function loadPuzzle() {
  const res = await fetch("/api/puzzle");
  const puzzle = await res.json();
  puzzleImg.src = puzzle.question;
  currentSolution = puzzle.solution;
  answerInput.value = "";
}

function checkAnswer() {
  if (Number(answerInput.value) === currentSolution) {
    score++;
    message.textContent = "Correct!";
  } else {
    message.textContent = "Wrong! It was " + currentSolution;
  }
  document.getElementById("score").textContent = score;
  loadPuzzle();
}

// Event: button click
document.getElementById("submit").addEventListener("click", checkAnswer);

// Event: pressing Enter in the input box
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});

// Event: timer fires every second
const timer = setInterval(() => {
  timeLeft--;
  document.getElementById("timer").textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timer);
    message.textContent = "Game over! Final score: " + score;
    document.getElementById("submit").disabled = true;
  }
}, 1000);

loadPuzzle();