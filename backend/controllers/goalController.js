import Goal from "../models/Goal.js";
import { DIFFICULTY_XP } from "../utils/gamification.js";

export async function createGoal(req, res, next) {
  try {
    const {
      name, category, description, goalType, dailyTarget, weeklyTarget,
      monthlyTarget, unit, deadline, frequency, reminderTime, difficulty,
      color, icon, scheduleRule, scheduleTime,
    } = req.body;

    if (!name || !category || !goalType) {
      return res.status(400).json({ message: "name, category and goalType are required." });
    }

    // Habit-style ("boolean") goals don't need a numeric daily amount —
    // default them to a single daily check.
    const isHabit = goalType === "boolean";
    const resolvedTarget = isHabit ? (dailyTarget || 1) : dailyTarget;
    const resolvedUnit = isHabit ? (unit || "habit") : unit;

    if (!isHabit && (resolvedTarget === undefined || resolvedTarget === null)) {
      return res.status(400).json({ message: "dailyTarget is required for time/quantity goals." });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name, category, description, goalType,
      dailyTarget: resolvedTarget, weeklyTarget, monthlyTarget, unit: resolvedUnit,
      deadline, frequency, reminderTime,
      difficulty: difficulty || "medium",
      xpReward: DIFFICULTY_XP[difficulty] || DIFFICULTY_XP.medium,
      color, icon,
      scheduleRule: isHabit ? (scheduleRule || null) : null,
      scheduleTime: isHabit && scheduleRule ? (scheduleTime || null) : null,
    });

    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
}

export async function getGoals(req, res, next) {
  try {
    const { status = "active" } = req.query;
    const filter = { user: req.user._id };
    if (status !== "all") filter.status = status;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (err) {
    next(err);
  }
}

export async function getGoal(req, res, next) {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    res.json({ goal });
  } catch (err) {
    next(err);
  }
}

export async function updateGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    res.json({ goal });
  } catch (err) {
    next(err);
  }
}

export async function archiveGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "archived" },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    res.json({ goal });
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    res.json({ message: "Goal deleted." });
  } catch (err) {
    next(err);
  }
}
