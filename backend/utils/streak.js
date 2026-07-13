// Given the user's lastActiveDate and today's completion percentage against
// their dailyGoal, decide how the streak changes.
export function updateStreak(user, todayCompletionPct) {
  const today = startOfDay(new Date());
  const last = user.lastActiveDate ? startOfDay(new Date(user.lastActiveDate)) : null;
  const metGoal = todayCompletionPct >= (user.dailyGoal || 80);

  if (!metGoal) {
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak, changed: false };
  }

  if (last && sameDay(last, today)) {
    // already counted today
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak, changed: false };
  }

  const isConsecutive = last && daysBetween(last, today) === 1;
  const newStreak = isConsecutive ? user.currentStreak + 1 : 1;
  const newLongest = Math.max(user.longestStreak, newStreak);

  return { currentStreak: newStreak, longestStreak: newLongest, changed: true, lastActiveDate: today };
}

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a, b) {
  return a.getTime() === b.getTime();
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
