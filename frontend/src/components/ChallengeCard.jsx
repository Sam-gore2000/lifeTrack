import React, { useState } from "react";
import { Check, Clock, X, Trophy } from "lucide-react";
import { GOAL_CATEGORY_META, BRAND } from "../utils/theme.js";

function cellColor(day, meta) {
  if (day.isFuture) return "var(--track)";
  if (day.completed) return meta.color;
  return "#D64545"; // missed day (past, not completed)
}

export default function ChallengeCard({ challenge, onSetStatus, onRemove }) {
  const [busy, setBusy] = useState(false);
  const meta = GOAL_CATEGORY_META[challenge.category] || GOAL_CATEGORY_META.Custom;

  async function handle(status) {
    if (busy) return;
    setBusy(true);
    try {
      await onSetStatus(challenge._id, status);
    } finally {
      setBusy(false);
    }
  }

  const isDone = challenge.todayCompleted;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{challenge.name}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {challenge.category} · Day {challenge.dayIndex}/{challenge.durationDays}
            {challenge.isFinished && " · Finished"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: BRAND.orangeSoft, color: BRAND.orange }}>
            +{challenge.xpReward} XP/day
          </span>
          <button
            onClick={() => { if (confirm(`Remove "${challenge.name}"? This ends the challenge and can't be undone.`)) onRemove(challenge._id); }}
            aria-label="Remove challenge"
          >
            <X size={15} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${challenge.pct}%`, background: meta.color }} />
        </div>
        <span className="text-xs shrink-0" style={{ color: "var(--text-secondary)" }}>{challenge.completedCount}/{challenge.durationDays} days</span>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
        {challenge.days.map((day) => (
          <div
            key={day.dayNumber}
            title={`Day ${day.dayNumber}: ${day.isFuture ? "upcoming" : day.completed ? "done" : "missed"}`}
            className="aspect-square rounded-[3px]"
            style={{
              background: cellColor(day, meta),
              outline: day.isToday ? `2px solid ${meta.color}` : "none",
              outlineOffset: 1,
            }}
          />
        ))}
      </div>

      {challenge.isFinished ? (
        <div className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium" style={{ background: BRAND.greenSoft, color: BRAND.green }}>
          <Trophy size={14} /> Challenge complete — {challenge.completedCount}/{challenge.durationDays} days
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={() => handle("done")}
            className="flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2 transition-colors"
            style={{ background: isDone ? meta.color : meta.soft, color: isDone ? "#FFFFFF" : meta.color, opacity: busy ? 0.6 : 1 }}
          >
            <Check size={14} /> Done today
          </button>
          <button
            disabled={busy}
            onClick={() => handle("pending")}
            className="flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2 transition-colors"
            style={{
              background: !isDone ? "var(--track)" : "transparent",
              color: !isDone ? "var(--text-primary)" : "var(--text-muted)",
              border: "1px solid var(--border)",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Clock size={14} /> Pending
          </button>
        </div>
      )}
    </div>
  );
}
