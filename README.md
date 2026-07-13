# LifeOS — Full Stack Project

A personal performance dashboard: goals, a Done/Pending daily checklist, XP and
levels, streaks, a real GitHub-style consistency heatmap, a life score, a
calendar with day-by-day reports, a journal, and achievements — backed by a
real database, not mock data.

```
lifeos-fullstack/
  frontend/   React + Vite + Tailwind + Recharts UI — calls the backend API
  backend/    Node.js + Express + MongoDB API — auth, goals, XP, streaks, life score
```

## What changed from the first version

- **Real auth**: signup / login / logout pages, JWT-based sessions.
- **No more mock data**: goals, heatmap, life score, journal, achievements,
  and analytics all come from `frontend/src/api/client.js` calling the
  backend — nothing is hardcoded in the UI anymore.
- **Done / Pending** buttons on each goal card (replacing the old focus-timer
  mock) that call the API and immediately update XP, streak, and life score.
- **Daily target**: set when you create a goal (`dailyTarget` + unit);
  progress and Life Score are computed against it.
- **Calendar tab**: click any day to pull that day's real report — goals
  completed, XP earned, life score, and journal entry for that date
  (`GET /api/dashboard/day?date=...`).
- **Motivational quotes**: a real morning/afternoon/evening quote rotation,
  plus a personalized insight line generated from your actual life-score
  breakdown (not a canned message).

## Run it locally

```bash
# 1. backend
cd backend
npm install
cp .env.example .env      # set MONGO_URI (MongoDB Atlas) and JWT_SECRET
node seed/achievements.js  # populates the achievement catalog
npm run dev                # http://localhost:5000

# 2. frontend, in a second terminal
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

Sign up for an account in the browser, add a goal, and mark it Done — you'll
see XP, streak, and life score update live, and the heatmap/calendar fill in
as you go.

## Deploying

- **Frontend** → Vercel or Netlify. Build command `npm run build`, output
  `dist`. Set `VITE_API_URL` to your deployed backend's URL as a build-time
  environment variable.
- **Backend** → Render, Railway, or Fly.io. Build `npm install`, start
  `npm start`. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` (your
  deployed frontend URL) as environment variables.
- **Database** → MongoDB Atlas free tier works fine for this.

Full details, including the complete API reference, are in
`backend/README.md`.

## Still not included

Email delivery for verification/password-reset links (the tokens are
generated server-side but no email is actually sent — wire in something like
Resend or SES), push/browser notifications, PDF/Excel/CSV report export, and
social features. These weren't part of this round of changes.
