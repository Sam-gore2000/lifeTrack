import FocusSession from "../models/FocusSession.js";
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

export async function startFocusSession(req, res, next) {
  try {
    const { goalId } = req.params;
    const { ambientSound } = req.body;

    const goal = await Goal.findOne({ _id: goalId, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });

    const session = await FocusSession.create({
      user: req.user._id,
      goal: goalId,
      startedAt: new Date(),
      ambientSound: ambientSound || null,
      status: "running",
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

// Stop a focus session: records duration, updates today's goal progress,
// awards proportional XP, and rolls the streak/life-score forward.
export async function stopFocusSession(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await FocusSession.findOne({ _id: id, user: req.user._id });
    if (!session) return res.status(404).json({ message: "Focus session not found." });
    if (session.status === "completed") {
      return res.status(400).json({ message: "This session was already completed." });
    }

    const goal = await Goal.findById(session.goal);
    const endedAt = new Date();
    const durationSeconds = Math.max(1, Math.round((endedAt - session.startedAt) / 1000));
    const minutes = Math.round(durationSeconds / 60);

    // proportional XP: full reward if the session covers the whole daily target
    const progressUnits = goal.unit === "min" || goal.goalType === "time" ? minutes : 1;
    const proportion = goal.dailyTarget > 0 ? Math.min(1, progressUnits / goal.dailyTarget) : 1;
    const xpAwarded = Math.max(5, Math.round(goal.xpReward * proportion));

    session.endedAt = endedAt;
    session.durationSeconds = durationSeconds;
    session.notes = notes || "";
    session.xpAwarded = xpAwarded;
    session.status = "completed";
    await session.save();

    // update today's daily log
    const day = toDayKey();
    let log = await DailyLog.findOne({ user: req.user._id, goal: goal._id, date: day });
    if (!log) {
      log = new DailyLog({ user: req.user._id, goal: goal._id, date: day, target: goal.dailyTarget, completed: 0 });
    }
    log.completed = Math.min(goal.dailyTarget, log.completed + progressUnits);
    log.xpEarned += xpAwarded;
    await log.save();

    // award XP to user + recompute level
    const user = await User.findById(req.user._id);
    user.xp += xpAwarded;
    user.level = levelFromXP(user.xp);

    // roll the streak forward based on today's overall completion
    const todayLogs = await DailyLog.find({ user: user._id, date: day });
    const avgPct = todayLogs.length
      ? Math.round(todayLogs.reduce((s, l) => s + l.progressPct, 0) / todayLogs.length)
      : 0;
    const streakResult = updateStreak(user, avgPct);
    user.currentStreak = streakResult.currentStreak;
    user.longestStreak = streakResult.longestStreak;
    if (streakResult.lastActiveDate) user.lastActiveDate = streakResult.lastActiveDate;

    await user.save();

    await XPHistory.create({
      user: user._id,
      date: new Date(),
      xpEarned: xpAwarded,
      source: "focus_session",
      reference: session._id,
    });

    res.json({
      session,
      log,
      xpAwarded,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

export async function getFocusSessions(req, res, next) {
  try {
    const { goalId, from, to } = req.query;
    const filter = { user: req.user._id };
    if (goalId) filter.goal = goalId;
    if (from || to) {
      filter.startedAt = {};
      if (from) filter.startedAt.$gte = new Date(from);
      if (to) filter.startedAt.$lte = new Date(to);
    }
    const sessions = await FocusSession.find(filter).sort({ startedAt: -1 }).limit(200);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}
