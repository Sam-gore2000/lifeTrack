# LifeOS — Frontend

The LifeOS UI: dashboard, goals with Done/Pending tracking, a life-score ring,
a real consistency heatmap, analytics, a calendar with day reports, journal,
and achievements. Built with React, Vite, Tailwind CSS, Recharts, and
lucide-react.

This app calls a real backend (see `../backend`) for everything — auth,
goals, progress, XP, streaks, life score, journal, and achievements. There is
no mock/local data left in this build.

## Run locally

Requires Node.js 18+ and the backend running (see `../backend/README.md`).

```bash
npm install
cp .env.example .env   # VITE_API_URL should point at your backend, e.g. http://localhost:5000/api
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). Sign up for
an account to get started — there's no seeded demo user.

## Build for production

```bash
npm run build
npm run preview   # optional local check of the production build
```

The static output goes to `dist/`.

## Deploy

### Vercel
1. Push this folder to a GitHub repo.
2. Import the repo at vercel.com/new.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

### Netlify
1. Push to GitHub, import at app.netlify.com.
2. Build command: `npm run build`. Publish directory: `dist`.

### Any static host
Run `npm run build` and upload the contents of `dist/` (it's plain static
HTML/CSS/JS, no server required).

## Project structure

```
frontend/
  index.html
  src/
    main.jsx              React root, wraps App in AuthProvider
    App.jsx                main shell: sidebar, tabs, dashboard layout
    api/client.js           fetch wrapper that talks to the backend
    context/AuthContext.jsx  login/signup/logout/session state
    pages/AuthPage.jsx       login + signup screen
    components/              GoalCard, AddGoalModal, Heatmap, LifeScoreDial,
                             Calendar, JournalTab
    utils/theme.js           brand colors, category icons, dark/light vars
    utils/quotes.js          time-of-day quotes + personalized insight
  tailwind.config.js
  postcss.config.js
  vite.config.js
  package.json
```
