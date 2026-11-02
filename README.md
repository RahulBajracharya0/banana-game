# Banana game

A web game where players solve banana equation puzzles against a 30-second clock.
Built with Node.js, Express and SQLite for CIS046-3.

## Run it
1. Install Node.js 18 or newer.
2. `npm install`
3. `npm start`
4. Open http://localhost:3000/login.html

The SQLite database file is created automatically in `data/` on first run.
Optional settings (environment variables): `PORT`, `SESSION_SECRET`, `BANANA_API_URL`, `DB_FILE`.

## Where each assignment theme lives
| Theme | Where to look |
|---|---|
| Version control | Git history, branches (`feature/game-rules`, `refactor/project-structure`), tag `v1.0` |
| Event-driven programming | `public/js/game.js` (button click, Enter key, one-second timer, game-over overlay) |
| Interoperability | `src/services/bananaApi.js` (HTTP GET to the Banana API, JSON response) |
| Virtual identity | `src/routes/auth.routes.js` (bcrypt hashing, session cookie), `src/middleware/requireLogin.js` |

## Project structure
```
server.js              entry point
src/app.js             builds the Express app
src/config.js          all settings in one place
src/db/                database connection and tables
src/models/            database queries (users, scores)
src/routes/            HTTP endpoints (auth, puzzle, scores)
src/middleware/        shared checks (requireLogin)
src/services/          external web service client (Banana API)
public/                browser frontend (HTML, css/, js/)
scripts/               helper scripts (npm run test:api)
data/                  SQLite database file (not committed)
```

## Credits
- Banana API by Marc Conrad: https://marcconrad.com/uob/banana/doc.php
- Libraries: Express, express-session, bcrypt, better-sqlite3
- Code written with help from Claude (Anthropic) and adapted by me. Each file carries a comment saying so.
