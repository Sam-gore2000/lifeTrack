# LifeOS API

Node.js/Express + MongoDB backend for the LifeOS frontend: auth, goals, daily
progress logs, focus sessions with XP awards, streaks, life score, journal,
and achievements.

## Setup

Requires Node.js 18+ and a MongoDB connection string (a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster works fine).

```bash
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm run dev
```

Seed the achievement catalog once per environment:

```bash
node seed/achievements.js
```

API runs at `http://localhost:5000` by default. Health check: `GET /api/health`.

## Environment variables

| Variable        | Description                                             |
|-----------------|----------------------------------------------------------|
| `PORT`          | Port to listen on (default 5000)                        |
| `MONGO_URI`      | MongoDB Atlas (or local) connection string               |
| `JWT_SECRET`     | Long random string used to sign auth tokens              |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                                |
| `CLIENT_ORIGIN`  | Comma-separated allowed CORS origins (your frontend URL) |

## API reference

All routes except signup/login are protected — send `Authorization: Bearer <token>`.

### Auth — `/api/auth`
- `POST /signup` — `{ name, email, password }`
- `POST /login` — `{ email, password }`
- `GET /me`
- `PATCH /me` — profile/settings fields
- `POST /change-password` — `{ currentPassword, newPassword }`
- `POST /forgot-password` — `{ email }`
- `POST /reset-password` — `{ token, password }`

### Goals — `/api/goals`
- `POST /` — create a goal
- `GET /?status=active|archived|all`
- `GET /:id`
- `PATCH /:id`
- `PATCH /:id/archive`
- `DELETE /:id`
- `POST /:goalId/log` — `{ completed, date? }` set today's (or a date's) progress
- `POST /:goalId/log/increment` — `{ delta }` bump progress
- `GET /logs/today`
- `GET /logs?from=&to=`
- `POST /:goalId/focus-sessions/start` — `{ ambientSound? }`
- `GET /focus-sessions?goalId=&from=&to=`

### Focus sessions — `/api/focus-sessions`
- `PATCH /:id/stop` — `{ notes? }` — ends the session, logs progress, awards
  proportional XP, updates level and streak

### Dashboard — `/api/dashboard`
- `GET /today` — today's per-goal progress, XP/level, streak, life score
- `GET /heatmap?days=365`
- `POST /life-score/recalculate` — recomputes and stores today's life score
  from the trailing 7-day completion rate per category
- `GET /life-score/trend?days=14`

### Challenges — `/api/challenges`
A 30-day commitment to a single daily habit — created once, then just checked
off each day (no need to re-add it). Kept intentionally separate from Goals,
which are for things that change day to day.
- `POST /` — `{ name, category, description?, difficulty?, durationDays? }` (defaults to 30 days, starting today)
- `GET /?status=active|completed|abandoned|all`
- `GET /:id`
- `POST /:id/log` — `{ status: "done"|"pending", date? }` — marks a day, awards/reverses daily XP
- `PATCH /:id/abandon`
- `DELETE /:id`

Note: challenge completions award XP and level progress the same way goals
do, but do **not** currently feed into the Goals-based consistency heatmap,
streak, or life score — those stay driven by the Goals tab only. If you want
challenges to count toward the same heatmap/life-score, that's a natural
next step (would mean writing a `DailyLog`-equivalent entry per challenge
completion, or merging both sources when computing the heatmap).

### Journal — `/api/journal`
- `POST /` — `{ wentWell, distractions, grateful, improveTomorrow, mood, date? }`
- `GET /?from=&to=&limit=`
- `DELETE /:id`

### Achievements — `/api/achievements`
- `GET /` — full catalog with unlocked flag
- `POST /check` — evaluates current XP/level/streak and unlocks any newly-earned ones

## Data model

Users, Goals, DailyLogs, FocusSessions, Journal entries, an Achievement
catalog + per-user unlock records, XPHistory, and LifeScoreHistory — matching
the collections from the original product spec.

## Connecting the frontend

In the frontend project, set an API base URL (e.g. via a `VITE_API_URL` env
var) and replace the local `useState` mock data with calls to these endpoints
(fetch or axios), storing the JWT from `/api/auth/login` in memory or an
httpOnly cookie set by your own thin proxy. The current frontend build is
demo-only and doesn't call this API yet — wiring it up is the natural next step.

## Deploy

### Render
1. Push this folder to a GitHub repo.
2. New Web Service → connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables above (use your Atlas `MONGO_URI`, a real
   `JWT_SECRET`, and your deployed frontend URL as `CLIENT_ORIGIN`).

### Railway / Fly.io / any Node host
Same idea: set the env vars, `npm install`, `npm start`. No Dockerfile needed
for Render/Railway; add one if your host requires it.

### MongoDB Atlas
Create a free cluster, add a database user, allow network access from your
host's IP range (or `0.0.0.0/0` for simplicity while testing), and copy the
connection string into `MONGO_URI`.
