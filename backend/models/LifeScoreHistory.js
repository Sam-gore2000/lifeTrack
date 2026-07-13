import mongoose from "mongoose";

const xpHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    xpEarned: { type: Number, required: true },
    source: { type: String, enum: ["focus_session", "goal_complete", "challenge", "achievement", "manual"], required: true },
    reference: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

export const XPHistory = mongoose.model("XPHistory", xpHistorySchema);

const lifeScoreHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    score: { type: Number, required: true },
    breakdown: {
      discipline: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      career: { type: Number, default: 0 },
      learning: { type: Number, default: 0 },
      consistency: { type: Number, default: 0 },
      mindfulness: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

lifeScoreHistorySchema.index({ user: 1, date: 1 }, { unique: true });

export const LifeScoreHistory = mongoose.model("LifeScoreHistory", lifeScoreHistorySchema);
