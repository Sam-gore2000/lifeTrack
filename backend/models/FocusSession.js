import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },

    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },

    notes: { type: String, default: "" },
    ambientSound: { type: String, default: null },

    xpAwarded: { type: Number, default: 0 },
    status: { type: String, enum: ["running", "paused", "completed", "abandoned"], default: "running" },
  },
  { timestamps: true }
);

export default mongoose.model("FocusSession", focusSessionSchema);
