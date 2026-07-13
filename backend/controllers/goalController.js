import Goal from "../models/Goal.js";
import { DIFFICULTY_XP } from "../utils/gamification.js";

export async function createGoal(req, res, next) {
  try {
    const {
      name, category, description, goalType, dailyTarget, weeklyTarget,
      monthlyTarget, unit, deadline, frequency, reminderTime, difficulty,
      color, icon,
    } = req.body;

    if (!name || !category || !goalType || dailyTarget === undefined) {
      return res.status(400).json({ message: "name, category, goalType and dailyTarget are required." });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name, category, description, goalType, dailyTarget, weeklyTarget,
      monthlyTarget, unit, deadline, frequency, reminderTime,
      difficulty: difficulty || "medium",
      xpReward: DIFFICULTY_XP[difficulty] || DIFFICULTY_XP.medium,
      color, icon,
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
