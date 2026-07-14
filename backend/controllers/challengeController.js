import Challenge from "../models/Challenge.js";
import ChallengeLog from "../models/ChallengeLog.js";
import User from "../models/User.js";
import { XPHistory } from "../models/LifeScoreHistory.js";
import { DIFFICULTY_XP, levelFromXP } from "../utils/gamification.js";

function toDayKey(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export async function createChallenge(req, res, next) {
  try {
    const { name, category, description, difficulty, durationDays } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: "name and category are required." });
    }

    const challenge = await Challenge.create({
      user: req.user._id,
      name,
      category,
      description,
      durationDays: durationDays || 30,
      startDate: toDayKey(),
      difficulty: difficulty || "medium",
      xpReward: DIFFICULTY_XP[difficulty] || DIFFICULTY_XP.medium,
    });

    res.status(201).json({ challenge: await withProgress(challenge) });
  } catch (err) {
    next(err);
  }
}

// Builds the day-by-day grid + progress stats for a challenge.
async function withProgress(challenge) {
  const today = toDayKey();
  const start = toDayKey(challenge.startDate);
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + challenge.durationDays - 1);

  const logs = await ChallengeLog.find({ challenge: challenge._id });
  const logByDate = new Map(logs.map((l) => [toDayKey(l.date).getTime(), l]));

  const elapsedDays = Math.min(challenge.durationDays, Math.max(0, daysBetween(start, today) + 1));
  const dayIndex = Math.min(challenge.durationDays, Math.max(1, daysBetween(start, today) + 1));

  const days = [];
  for (let i = 0; i < challenge.durationDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const isFuture = d.getTime() > today.getTime();
    const log = logByDate.get(d.getTime());
    days.push({
      dayNumber: i + 1,
      date: d,
      completed: !!log?.completed,
      isFuture,
      isToday: d.getTime() === today.getTime(),
    });
  }

  const completedCount = days.filter((d) => d.completed).length;
  const isFinished = today.getTime() > endDate.getTime();
  const pct = challenge.durationDays > 0 ? Math.round((completedCount / challenge.durationDays) * 100) : 0;

  if (isFinished && challenge.status === "active") {
    challenge.status = "completed";
    await challenge.save();
  }

  return {
    ...challenge.toObject(),
    endDate,
    dayIndex,
    elapsedDays,
    completedCount,
    pct,
    isFinished,
    days,
    todayCompleted: !!logByDate.get(today.getTime())?.completed,
  };
}

export async function getChallenges(req, res, next) {
  try {
    const { status = "active" } = req.query;
    const filter = { user: req.user._id };
    if (status !== "all") filter.status = status;

    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
    const withStats = await Promise.all(challenges.map(withProgress));
    res.json({ challenges: withStats });
  } catch (err) {
    next(err);
  }
}

export async function getChallenge(req, res, next) {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.user._id });
    if (!challenge) return res.status(404).json({ message: "Challenge not found." });
    res.json({ challenge: await withProgress(challenge) });
  } catch (err) {
    next(err);
  }
}

// Mark today (or a given date) done / pending for a challenge.
export async function setChallengeDayStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, date } = req.body;
    if (!["done", "pending"].includes(status)) {
      return res.status(400).json({ message: "status must be 'done' or 'pending'." });
    }

    const challenge = await Challenge.findOne({ _id: id, user: req.user._id });
    if (!challenge) return res.status(404).json({ message: "Challenge not found." });

    const day = toDayKey(date);
    let log = await ChallengeLog.findOne({ user: req.user._id, challenge: id, date: day });
    if (!log) {
      log = new ChallengeLog({ user: req.user._id, challenge: id, date: day, completed: false });
    }

    const wasComplete = log.completed;
    const user = await User.findById(req.user._id);

    if (status === "done") {
      log.completed = true;
      if (!wasComplete) {
        log.xpEarned = challenge.xpReward;
        user.xp += challenge.xpReward;
        await XPHistory.create({
          user: user._id, date: new Date(), xpEarned: challenge.xpReward,
          source: "challenge", reference: challenge._id,
        });
      }
    } else {
      log.completed = false;
      if (wasComplete) {
        user.xp = Math.max(0, user.xp - log.xpEarned);
      }
      log.xpEarned = 0;
    }

    await log.save();
    user.level = levelFromXP(user.xp);
    await user.save();

    res.json({ challenge: await withProgress(challenge), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

export async function deleteChallenge(req, res, next) {
  try {
    const challenge = await Challenge.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!challenge) return res.status(404).json({ message: "Challenge not found." });
    await ChallengeLog.deleteMany({ challenge: challenge._id });
    res.json({ message: "Challenge deleted." });
  } catch (err) {
    next(err);
  }
}

export async function abandonChallenge(req, res, next) {
  try {
    const challenge = await Challenge.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "abandoned" },
      { new: true }
    );
    if (!challenge) return res.status(404).json({ message: "Challenge not found." });
    res.json({ challenge: await withProgress(challenge) });
  } catch (err) {
    next(err);
  }
}
