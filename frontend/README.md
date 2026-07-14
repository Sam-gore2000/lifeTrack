# LifeOS — Personal Performance Dashboard

A premium, AI-styled personal performance dashboard prototype: goals, focus timers,
a life-score ring, a GitHub-style consistency heatmap, analytics, journal, and
achievements. Built with React, Vite, Tailwind CSS, Recharts, and lucide-react.

This is a frontend-only prototype with mock/local state — there is no backend or
database wired up yet (see "Next steps" below).

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

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
lifeos/
  index.html          entry HTML
  src/
    main.jsx          React root
    App.jsx           the whole app (dashboard, goals, analytics, journal, achievements)
    index.css         Tailwind + font imports
  tailwind.config.js
  postcss.config.js
  vite.config.js
  package.json
```

## Next steps (not included here)

This ships the frontend only. To make it a real product per the original spec you'd add:
- Node.js/Express API + MongoDB (Users, Goals, DailyLogs, FocusSessions, Journal,
  Achievements, XPHistory, LifeScoreHistory collections)
- JWT + bcrypt authentication, email verification
- Persisting goals/XP/streaks/journal entries server-side instead of local React state
- An AI coach endpoint that actually analyzes stored history
- PDF/Excel/CSV report export
- Push/email notifications

Happy to scaffold that backend next — best done in a local dev setup (e.g. Claude Code)
since it's a multi-file server project you'll want to run and iterate on directly.
