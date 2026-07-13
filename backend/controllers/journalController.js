import Journal from "../models/Journal.js";

function toDayKey(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function upsertJournalEntry(req, res, next) {
  try {
    const { wentWell, distractions, grateful, improveTomorrow, mood, date } = req.body;
    const day = toDayKey(date);

    const entry = await Journal.findOneAndUpdate(
      { user: req.user._id, date: day },
      { $set: { wentWell, distractions, grateful, improveTomorrow, mood } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ entry });
  } catch (err) {
    next(err);
  }
}

export async function getJournalEntries(req, res, next) {
  try {
    const { from, to, limit = 60 } = req.query;
    const filter = { user: req.user._id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = toDayKey(from);
      if (to) filter.date.$lte = toDayKey(to);
    }
    const entries = await Journal.find(filter).sort({ date: -1 }).limit(Number(limit));
    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

export async function deleteJournalEntry(req, res, next) {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: "Journal entry not found." });
    res.json({ message: "Journal entry deleted." });
  } catch (err) {
    next(err);
  }
}
