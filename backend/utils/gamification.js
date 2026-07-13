// XP required cumulatively to reach a given level.
// Level 1 = 0 XP, Level 2 = 500 XP, Level 3 = 1200 XP, then scales up smoothly.
export function xpForLevel(level) {
  if (level <= 1) return 0;
  if (level === 2) return 500;
  if (level === 3) return 1200;
  // beyond level 3: quadratic-ish growth
  return Math.round(1200 + (level - 3) * (700 + (level - 3) * 150));
}

export function levelFromXP(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function xpProgressWithinLevel(xp) {
  const level = levelFromXP(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    xpIntoLevel: xp - floor,
    xpNeededForNext: ceil - floor,
  };
}

export const DIFFICULTY_XP = {
  easy: 20,
  medium: 50,
  hard: 100,
  legendary: 250,
};

// Weighted life score. Each category is 0-100 based on that category's goal
// completion rate over the trailing window the caller provides.
const LIFE_SCORE_WEIGHTS = {
  discipline: 0.2,
  health: 0.18,
  career: 0.17,
  learning: 0.15,
  consistency: 0.2,
  mindfulness: 0.1,
};

export function calculateLifeScore(breakdown) {
  let total = 0;
  let weightSum = 0;
  for (const [key, weight] of Object.entries(LIFE_SCORE_WEIGHTS)) {
    const value = breakdown[key];
    if (typeof value === "number") {
      total += value * weight;
      weightSum += weight;
    }
  }
  if (weightSum === 0) return 0;
  return Math.round(total / weightSum);
}

// Map a goal category to the life score dimension it contributes to.
export const CATEGORY_TO_DIMENSION = {
  Gym: "health",
  Running: "health",
  Health: "health",
  Water: "health",
  Sleep: "health",
  Coding: "career",
  Business: "career",
  Career: "career",
  Reading: "learning",
  Learning: "learning",
  Meditation: "mindfulness",
  Finance: "discipline",
  Relationship: "mindfulness",
  Custom: "discipline",
};
