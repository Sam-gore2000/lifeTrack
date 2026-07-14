import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Gym", "Coding", "Reading", "Meditation", "Water", "Running", "Sleep",
        "Learning", "Business", "Finance", "Relationship", "Career", "Health", "Custom",
      ],
    },
    description: { type: String, default: "" },

    durationDays: { type: Number, default: 30 },
    startDate: { type: Date, required: true }, // midnight of day 1

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "legendary"],
      default: "medium",
    },
    xpReward: { type: Number, default: 50 }, // awarded per completed day

    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
  },
  { timestamps: true }
);

challengeSchema.index({ user: 1, status: 1 });

export default mongoose.model("Challenge", challengeSchema);
