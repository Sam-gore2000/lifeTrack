import DailyLog from "../models/DailyLog.js";
import Goal from "../models/Goal.js";
import Journal from "../models/Journal.js";
import { LifeScoreHistory } from "../models/LifeScoreHistory.js";
import { calculateLifeScore, CATEGORY_TO_DIMENSION, xpProgressWithinLevel } from "../utils/gamification.js";

function toDayKey(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Today's overview: per-goal progress + overall %, XP/level progress, streak.
export async function getTodaySummary(req, res, next) {
  try {
    const user = req.user;
    const day = toDayKey();

    const goals = await Goal.find({ user: user._id, status: "active" });
    const logs = await DailyLog.find({ user: user._id, date: day });
    const logByGoal = Object.fromEntries(logs.map((l) => [String(l.goal), l]));

    const goalsWithProgress = goals.map((g) => {
      const log = logByGoal[String(g._id)];
      return {
        goal: g,
        completed: log?.completed || 0,
        progressPct: log?.progressPct || 0,
      };
    });

    const overallPct = goalsWithProgress.length
      ? Math.round(goalsWithProgress.reduce((s, g) => s + g.progressPct, 0) / goalsWithProgress.length)
      : 0;

    res.json({
      date: day,
      overallPct,
      goals: goalsWithProgress,
      xp: xpProgressWithinLevel(user.xp),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lifeScore: user.lifeScore,
    });
  } catch (err) {
    next(err);
  }
}

// Heatmap: average daily completion % across all goals, for the last N days.
export async function getHeatmap(req, res, next) {
  try {
    const days = Number(req.query.days) || 365;
    const from = toDayKey();
    from.setDate(from.getDate() - days);

    const logs = await DailyLog.find({ user: req.user._id, date: { $gte: from } });

    const byDate = {};
    for (const log of logs) {
      const key = log.date.toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { sum: 0, count: 0 };
      byDate[key].sum += log.progressPct;
      byDate[key].count += 1;
    }

    const heatmap = Object.entries(byDate).map(([date, { sum, count }]) => ({
      date,
      pct: Math.round(sum / count),
    }));

    res.json({ heatmap });
  } catch (err) {
    next(err);
  }
}

// Recalculates today's life score from category-level completion rates
// (trailing 7 days) and stores it in the user's history.
export async function recalculateLifeScore(req, res, next) {
  try {
    const user = req.user;
    const from = toDayKey();
    from.setDate(from.getDate() - 6); // trailing 7-day window including today

    const goals = await Goal.find({ user: user._id, status: "active" });
    const goalById = Object.fromEntries(goals.map((g) => [String(g._id), g]));

    const logs = await DailyLog.find({ user: user._id, date: { $gte: from } });

    const dimensionTotals = {}; // dimension -> { sum, count }
    for (const log of logs) {
      const goal = goalById[String(log.goal)];
      if (!goal) continue;
      const dimension = CATEGORY_TO_DIMENSION[goal.category] || "discipline";
      if (!dimensionTotals[dimension]) dimensionTotals[dimension] = { sum: 0, count: 0 };
      dimensionTotals[dimension].sum += log.progressPct;
      dimensionTotals[dimension].count += 1;
    }

    // consistency = how many of the last 7 days had at least one logged goal
    const daysWithActivity = new Set(logs.map((l) => l.date.toISOString().slice(0, 10))).size;
    const consistency = Math.round((daysWithActivity / 7) * 100);

    const breakdown = {
      discipline: avgOrDefault(dimensionTotals.discipline, 50),
      health: avgOrDefault(dimensionTotals.health, 50),
      career: avgOrDefault(dimensionTotals.career, 50),
      learning: avgOrDefault(dimensionTotals.learning, 50),
      consistency,
      mindfulness: avgOrDefault(dimensionTotals.mindfulness, 50),
    };

    const score = calculateLifeScore(breakdown);

    await LifeScoreHistory.findOneAndUpdate(
      { user: user._id, date: toDayKey() },
      { $set: { score, breakdown } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    user.lifeScore = score;
    await user.save();

    res.json({ score, breakdown });
  } catch (err) {
    next(err);
  }
}

// Full detail for a single calendar day: every goal's status, journal entry,
// and the stored life score for that day (if any). Powers the calendar +
// "view yesterday/any day's report" feature.
export async function getDayDetail(req, res, next) {
  try {
    const day = toDayKey(req.query.date);

    const [goals, logs, journalEntry, scoreEntry] = await Promise.all([
      Goal.find({ user: req.user._id }),
      DailyLog.find({ user: req.user._id, date: day }),
      Journal.findOne({ user: req.user._id, date: day }),
      LifeScoreHistory.findOne({ user: req.user._id, date: day }),
    ]);

    const goalById = Object.fromEntries(goals.map((g) => [String(g._id), g]));
    const logsWithGoal = logs.map((l) => ({
      ...l.toObject(),
      goal: goalById[String(l.goal)] || null,
    }));

    const overallPct = logs.length
      ? Math.round(logs.reduce((s, l) => s + l.progressPct, 0) / logs.length)
      : 0;
    const xpEarned = logs.reduce((s, l) => s + (l.xpEarned || 0), 0);

    res.json({
      date: day,
      overallPct,
      xpEarned,
      logs: logsWithGoal,
      journal: journalEntry || null,
      lifeScore: scoreEntry || null,
    });
  } catch (err) {
    next(err);
  }
}

// Today's life score, computed fresh if it hasn't been calculated yet today.
export async function getCurrentLifeScore(req, res, next) {
  try {
    const day = toDayKey();
    const entry = await LifeScoreHistory.findOne({ user: req.user._id, date: day });
    if (entry) {
      return res.json({ score: entry.score, breakdown: entry.breakdown });
    }
    // Nothing computed yet today — fall through to the same logic used by
    // the explicit recalculate endpoint.
    return recalculateLifeScore(req, res, next);
  } catch (err) {
    next(err);
  }
}

function avgOrDefault(entry, fallback) {
  if (!entry || entry.count === 0) return fallback;
  return Math.round(entry.sum / entry.count);
}

export async function getLifeScoreTrend(req, res, next) {
  try {
    const days = Number(req.query.days) || 14;
    const from = toDayKey();
    from.setDate(from.getDate() - days);

    const history = await LifeScoreHistory.find({ user: req.user._id, date: { $gte: from } }).sort({ date: 1 });
    res.json({ history });
  } catch (err) {
    next(err);
  }
}
