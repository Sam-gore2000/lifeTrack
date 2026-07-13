import DailyLog from "../models/DailyLog.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { XPHistory } from "../models/LifeScoreHistory.js";
import { levelFromXP } from "../utils/gamification.js";
import { updateStreak } from "../utils/streak.js";

function toDayKey(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Upsert today's (or a given date's) progress for a goal.
export async function logProgress(req, res, next) {
  try {
    const { goalId } = req.params;
    const { completed, date } = req.body;

    if (completed === undefined) {
      return res.status(400).json({ message: "completed is required." });
    }

    const goal = await Goal.findOne({ _id: goalId, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });

    const day = toDayKey(date);

    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, goal: goalId, date: day },
      { $set: { target: goal.dailyTarget, completed } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ log });
  } catch (err) {
    next(err);
  }
}

// Increment today's completed amount by a delta (e.g. from a focus session).
export async function incrementProgress(req, res, next) {
  try {
    const { goalId } = req.params;
    const { delta } = req.body;
    if (!delta) return res.status(400).json({ message: "delta is required." });

    const goal = await Goal.findOne({ _id: goalId, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });

    const day = toDayKey();
    let log = await DailyLog.findOne({ user: req.user._id, goal: goalId, date: day });

    if (!log) {
      log = new DailyLog({ user: req.user._id, goal: goalId, date: day, target: goal.dailyTarget, completed: 0 });
    }

    log.completed = Math.min(goal.dailyTarget, log.completed + delta);
    await log.save();

    res.json({ log });
  } catch (err) {
    next(err);
  }
}

export async function getTodayLogs(req, res, next) {
  try {
    const day = toDayKey(req.query.date);
    const logs = await DailyLog.find({ user: req.user._id, date: day }).populate("goal");
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}

// Mark a goal "done" or "pending" for a given day (default today).
// Replaces free-form progress entry with the simple two-state toggle the UI uses.
export async function setGoalStatus(req, res, next) {
  try {
    const { goalId } = req.params;
    const { status, date } = req.body;

    if (!["done", "pending"].includes(status)) {
      return res.status(400).json({ message: "status must be 'done' or 'pending'." });
    }

    const goal = await Goal.findOne({ _id: goalId, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });

    const day = toDayKey(date);
    let log = await DailyLog.findOne({ user: req.user._id, goal: goalId, date: day });
    if (!log) {
      log = new DailyLog({ user: req.user._id, goal: goalId, date: day, target: goal.dailyTarget, completed: 0 });
    }

    const wasComplete = log.isComplete;
    const user = await User.findById(req.user._id);

    if (status === "done") {
      log.completed = goal.dailyTarget;
      if (!wasComplete) {
        log.xpEarned = goal.xpReward;
        user.xp += goal.xpReward;
        await XPHistory.create({
          user: user._id, date: new Date(), xpEarned: goal.xpReward,
          source: "goal_complete", reference: goal._id,
        });
      }
    } else {
      log.completed = 0;
      if (wasComplete) {
        user.xp = Math.max(0, user.xp - log.xpEarned);
      }
      log.xpEarned = 0;
    }

    await log.save();
    user.level = levelFromXP(user.xp);

    // Roll the streak forward/flat based on today's overall completion rate.
    const todayLogs = await DailyLog.find({ user: user._id, date: day });
    const avgPct = todayLogs.length
      ? Math.round(todayLogs.reduce((s, l) => s + l.progressPct, 0) / todayLogs.length)
      : 0;
    const streakResult = updateStreak(user, avgPct);
    user.currentStreak = streakResult.currentStreak;
    user.longestStreak = streakResult.longestStreak;
    if (streakResult.lastActiveDate) user.lastActiveDate = streakResult.lastActiveDate;

    await user.save();

    res.json({ log, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

export async function getLogsInRange(req, res, next) {
  try {
    const { from, to } = req.query;
    const filter = { user: req.user._id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = toDayKey(from);
      if (to) filter.date.$lte = toDayKey(to);
    }
    const logs = await DailyLog.find(filter).sort({ date: 1 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}
