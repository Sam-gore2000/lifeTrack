import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },

    wentWell: { type: String, default: "" },
    distractions: { type: String, default: "" },
    grateful: { type: String, default: "" },
    improveTomorrow: { type: String, default: "" },

    mood: {
      type: String,
      enum: ["excellent", "good", "normal", "sad", "tired"],
      default: null,
    },
  },
  { timestamps: true }
);

journalSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Journal", journalSchema);
