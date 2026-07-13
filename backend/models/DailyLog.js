import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true, index: true },

    date: { type: Date, required: true }, // stored as midnight UTC of the log day
    target: { type: Number, required: true },
    completed: { type: Number, default: 0 },
    progressPct: { type: Number, default: 0 },

    xpEarned: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dailyLogSchema.index({ user: 1, goal: 1, date: 1 }, { unique: true });

dailyLogSchema.pre("save", function (next) {
  this.progressPct = this.target > 0 ? Math.min(100, Math.round((this.completed / this.target) * 100)) : 0;
  this.isComplete = this.progressPct >= 100;
  next();
});

export default mongoose.model("DailyLog", dailyLogSchema);
