import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
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

    goalType: {
      type: String,
      enum: ["time", "quantity", "boolean", "money", "expense", "custom"],
      required: true,
    },

    dailyTarget: { type: Number, required: true },
    weeklyTarget: { type: Number, default: null },
    monthlyTarget: { type: Number, default: null },
    unit: { type: String, default: "" }, // minutes, liters, pages, km, sessions, etc.

    deadline: { type: Date, default: null },
    frequency: {
      type: String,
      enum: ["daily", "weekdays", "weekly", "custom"],
      default: "daily",
    },
    reminderTime: { type: String, default: null }, // "HH:mm"

    // For habit-style goals with no numeric amount ("wake up by 6am", "no
    // social media before 9am"): an optional time constraint instead of a
    // daily target.
    scheduleRule: { type: String, enum: ["before", "after", null], default: null },
    scheduleTime: { type: String, default: null }, // "HH:mm"

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "legendary"],
      default: "medium",
    },
    xpReward: { type: Number, default: 50 },

    color: { type: String, default: "#3B5BDB" },
    icon: { type: String, default: "Target" },

    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, status: 1 });

export default mongoose.model("Goal", goalSchema);
