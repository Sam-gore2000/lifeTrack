import { Achievement, UserAchievement } from "../models/Achievement.js";

export async function getAllAchievements(req, res, next) {
  try {
    const [catalog, unlocked] = await Promise.all([
      Achievement.find().sort({ createdAt: 1 }),
      UserAchievement.find({ user: req.user._id }),
    ]);

    const unlockedKeys = new Set(unlocked.map((u) => String(u.achievement)));
    const result = catalog.map((a) => ({
      ...a.toObject(),
      unlocked: unlockedKeys.has(String(a._id)),
    }));

    res.json({ achievements: result });
  } catch (err) {
    next(err);
  }
}

// Evaluates the user's current stats against each achievement's criteria and
// unlocks any newly-earned ones. Call this after XP/streak-changing actions.
export async function checkAchievements(req, res, next) {
  try {
    const user = req.user;
    const catalog = await Achievement.find();
    const already = await UserAchievement.find({ user: user._id });
    const alreadyIds = new Set(already.map((u) => String(u.achievement)));

    const newlyUnlocked = [];

    for (const achievement of catalog) {
      if (alreadyIds.has(String(achievement._id))) continue;

      const { type, value } = achievement.criteria || {};
      let earned = false;

      if (type === "streak") earned = user.currentStreak >= value;
      if (type === "xp") earned = user.xp >= value;
      if (type === "level") earned = user.level >= value;

      if (earned) {
        await UserAchievement.create({ user: user._id, achievement: achievement._id });
        newlyUnlocked.push(achievement);
      }
    }

    res.json({ newlyUnlocked });
  } catch (err) {
    next(err);
  }
}
