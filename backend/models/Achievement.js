import mongoose from "mongoose";

// Master catalog of achievements available in the app
const achievementSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "streak_7"
    name: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Award" },
    criteria: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { type: "streak", value: 7 }
  },
  { timestamps: true }
);

export const Achievement = mongoose.model("Achievement", achievementSchema);

// Per-user unlock record
const userAchievementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    achievement: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement", required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);
