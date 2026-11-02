# Banana Game

A web game where you solve banana equation puzzles. Each banana hides a digit, and you type the digit that makes every equation true. You have 3 lives, and every correct answer earns points.

Built with Node.js, Express and SQLite for CIS046-3 Software for Enterprise.

## Features

- Banana puzzles loaded from the Banana API (Marc Conrad, University of Bedfordshire)
- Register, log in and log out (passwords hashed with bcrypt, session cookie)
- Points system: 10 points per correct answer, plus a streak bonus
- 3 lives: the game ends when you get 3 answers wrong
- Hints: 3 per game, 2 points each (first hint says even or odd, second gives a range of five numbers)
- Leaderboard of the top 5 players (best game of each player)
- Personal best score, "New high score!" message, your rank, and your last 5 games
- On-screen number pad (3 x 4) that also works with the keyboard
- One-screen layout on laptops and desktops, scrolling layout on phones

## How to play

1. Look at the puzzle and work out which digit each banana stands for.
2. Type the digit with the number pad or your keyboard, then press **Check answer** (or Enter).
3. A correct answer earns 10 points. Answers in a row add a streak bonus: +5 for the second, +10 for the third, then +15 for each one after that.
4. A wrong answer costs one life. At 0 lives the game is over and your score is saved.
5. A hint costs 2 points, and you get 3 hints per game.

## Run it

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm start`.
4. Open http://localhost:3000/login.html and create an account.

The SQLite database file is created automatically in `data/` the first time you run the game. You need an internet connection, because the puzzles come from the Banana API.

Optional settings (environment variables): `PORT`, `SESSION_SECRET`, `BANANA_API_URL`, `DB_FILE`.

Other commands:

| Command | What it does |
|---|---|
| `npm start` | Starts the server |
| `npm run dev` | Starts the server and restarts it when files change |
| `npm run test:api` | Checks that the Banana API can be reached |

## Where each assignment theme lives

| Theme | Where to look |
|---|---|
| Version control | Git history, feature branches (`feature/hints`, `feature/points-system`, `feature/ui-redesign`, `feature/high-score`, `refactor/project-structure`), tags `v1.0` and `v1.1` |
| Event-driven programming | `public/js/game.js`: button clicks, number pad clicks, keyboard keys, puzzle image load, game-over event. `public/js/login.js`: login and register clicks, Enter key |
| Interoperability | `src/services/bananaApi.js`: HTTP GET request to the Banana API and a JSON response. The browser and the server also talk to each other with `fetch` and JSON |
| Virtual identity | `src/routes/auth.routes.js` (bcrypt hashing, session cookie), `src/middleware/requireLogin.js` (blocks users who are not logged in) |

## How it works

**Interoperability.** The server sends an HTTP GET request to the Banana API. The API answers with JSON containing the puzzle image URL (`question`) and the answer (`solution`). The server passes this to the browser through its own `/api/puzzle` route. If the Banana API is down, the server returns a 502 error and the game shows a message.

**Virtual identity.** Players register with a username and a password of 6 or more characters. The password is hashed with bcrypt and only the hash is stored. After login the server sets a session cookie (httpOnly, expires after 1 hour). The puzzle and score routes check the session and return 401 if the player is not logged in. Every score is saved against the player's user id.

**Events.** The game is driven by events: clicking Check answer, Hint, the number pad keys, Log out and Play again; pressing digits, Backspace, Delete, Escape and Enter; and the puzzle image finishing loading. Losing the last life triggers the game-over screen and saves the score.

## API endpoints

| Method and path | Login needed | What it does |
|---|---|---|
| `POST /api/auth/register` | No | Creates an account and logs in |
| `POST /api/auth/login` | No | Logs in |
| `POST /api/auth/logout` | No | Ends the session |
| `GET /api/auth/me` | Yes | Returns the logged-in username |
| `GET /api/puzzle` | Yes | Returns a puzzle from the Banana API |
| `POST /api/scores` | Yes | Saves a score. Returns `isNewBest`, `best` and `rank` |
| `GET /api/scores/leaderboard` | No | Returns the top 5 players |
| `GET /api/scores/me` | Yes | Returns your best score, games played, rank and last 5 games |

## Project structure

```
server.js              entry point
src/app.js             builds the Express app
src/config.js          all settings in one place
src/db/                database connection and tables
src/models/            database queries (users, scores)
src/routes/            HTTP endpoints (auth, puzzle, scores)
src/middleware/        shared checks (requireLogin)
src/services/          client for the external Banana API
public/                browser frontend (HTML, css/, js/)
scripts/               helper scripts (npm run test:api)
data/                  SQLite database file (not committed)
```

## Database

| Table | Columns |
|---|---|
| `users` | `id`, `username` (unique), `password_hash` |
| `scores` | `id`, `user_id`, `score`, `played_at` |

## Known limits and next steps

- The solution is sent to the browser and the server accepts any score, so a determined player could cheat. A next step is to check answers and calculate the score on the server.
- There is no timer yet. A timed mode and difficulty levels are possible additions.
- The session cookie is not marked `secure` because the game runs on http://localhost. It should be turned on when the game is hosted over HTTPS.
- Sessions are kept in memory, so everyone is logged out when the server restarts.
- Ideas for later: best streak stat, daily and weekly leaderboards, sound effects, and automated tests.

## Credits

- Banana API by Marc Conrad: https://marcconrad.com/uob/banana/doc.php
- Libraries: Express, express-session, bcrypt, better-sqlite3
- Code written with help from Claude (Anthropic) and adapted by me. Each file carries a comment saying so.