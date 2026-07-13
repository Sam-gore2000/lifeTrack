// Populates the Achievement catalog. Run once per environment:
//   node seed/achievements.js
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { Achievement } from "../models/Achievement.js";

dotenv.config();

const CATALOG = [
  { key: "first_goal", name: "First goal", description: "Create your first goal", icon: "Target", criteria: { type: "xp", value: 1 } },
  { key: "streak_7", name: "7 day streak", description: "Keep a 7-day streak alive", icon: "Flame", criteria: { type: "streak", value: 7 } },
  { key: "streak_30", name: "30 day streak", description: "Keep a 30-day streak alive", icon: "Flame", criteria: { type: "streak", value: 30 } },
  { key: "streak_100", name: "100 day streak", description: "Keep a 100-day streak alive", icon: "Flame", criteria: { type: "streak", value: 100 } },
  { key: "level_5", name: "Level 5", description: "Reach level 5", icon: "TrendingUp", criteria: { type: "level", value: 5 } },
  { key: "level_10", name: "Level 10", description: "Reach level 10", icon: "TrendingUp", criteria: { type: "level", value: 10 } },
  { key: "xp_5000", name: "5,000 XP", description: "Earn 5,000 lifetime XP", icon: "Zap", criteria: { type: "xp", value: 5000 } },
];

async function run() {
  await connectDB();
  for (const item of CATALOG) {
    await Achievement.findOneAndUpdate({ key: item.key }, item, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Seeded ${CATALOG.length} achievements.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
