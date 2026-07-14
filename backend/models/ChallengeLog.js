import mongoose from "mongoose";

const challengeLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

challengeLogSchema.index({ user: 1, challenge: 1, date: 1 }, { unique: true });

export default mongoose.model("ChallengeLog", challengeLogSchema);
