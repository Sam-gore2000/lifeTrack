const MORNING = [
  "Discipline is choosing what you want most over what you want now.",
  "Small steps today build the life you want tomorrow.",
  "Momentum starts the moment you begin.",
];

const AFTERNOON = [
  "You're only one completed task away from building momentum.",
  "Halfway through the day is still enough time to win it.",
  "Progress compounds — keep stacking today's wins.",
];

const EVENING = [
  "You don't have to be perfect. Just don't break the chain.",
  "Reflect, reset, and get ready to show up again tomorrow.",
  "A finished day, however messy, still counts as a day moved forward.",
];

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getTimeOfDayQuote(date = new Date()) {
  const hour = date.getHours();
  const pool = hour < 12 ? MORNING : hour < 18 ? AFTERNOON : EVENING;
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return pool[dayIndex % pool.length];
}

// Built entirely from the real life-score breakdown returned by the API —
// no canned/dummy text, just a templated read of the actual weakest and
// strongest categories.
export function getPersonalizedInsight(breakdown) {
  if (!breakdown) return null;
  const entries = Object.entries(breakdown);
  if (!entries.length) return null;

  const weakest = entries.reduce((min, e) => (e[1] < min[1] ? e : min), entries[0]);
  const strongest = entries.reduce((max, e) => (e[1] > max[1] ? e : max), entries[0]);

  if (weakest[1] >= 85) {
    return "Every category is in great shape this week — keep the routine going.";
  }
  if (weakest[0] === strongest[0]) {
    return `Your ${weakest[0]} score is at ${weakest[1]} — keep building on it.`;
  }
  return `Your ${strongest[0]} is strong, but ${weakest[0]} is trailing at ${weakest[1]}%. A little focus there tomorrow would round things out.`;
}
