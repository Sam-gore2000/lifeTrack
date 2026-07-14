import React, { useState } from "react";
import { Check, Clock, Archive, Trash2 } from "lucide-react";
import { GOAL_CATEGORY_META, BRAND } from "../utils/theme.js";

function subtitle(goal) {
  if (goal.goalType === "boolean") {
    if (goal.scheduleRule === "before" && goal.scheduleTime) return `${goal.category} · Before ${goal.scheduleTime}`;
    if (goal.scheduleRule === "after" && goal.scheduleTime) return `${goal.category} · Not after ${goal.scheduleTime}`;
    return `${goal.category} · Daily habit`;
  }
  return `${goal.category} · ${goal.dailyTarget} ${goal.unit} target`;
}

export default function GoalCard({ goal, log, onSetStatus, onArchive, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = GOAL_CATEGORY_META[goal.category] || GOAL_CATEGORY_META.Custom;
  const Icon = meta.icon;
  const isDone = !!log?.isComplete;
  const pct = log?.progressPct || 0;
  const isHabit = goal.goalType === "boolean";

  async function handle(status) {
    if (busy) return;
    setBusy(true);
    try {
      await onSetStatus(goal._id, status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 relative" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.soft, color: meta.color }}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{goal.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{subtitle(goal)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: BRAND.orangeSoft, color: BRAND.orange }}>
            +{goal.xpReward} XP
          </span>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="text-xs px-1.5" style={{ color: "var(--text-muted)" }} aria-label="Goal options">⋯</button>
            {menuOpen && (
              <div
                className="absolute right-0 top-6 z-10 rounded-xl overflow-hidden text-xs"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", minWidth: 130 }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onArchive(goal._id); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Archive size={13} /> Archive
                </button>
                <button
                  onClick={() => { setMenuOpen(false); if (confirm(`Delete "${goal.name}"? This can't be undone.`)) onDelete(goal._id); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left"
                  style={{ color: BRAND.pink }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isHabit && (
        <>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: meta.color }} />
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>{log?.completed || 0}/{goal.dailyTarget} {goal.unit}</span>
            <span>{pct}%</span>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={busy}
          onClick={() => handle("done")}
          className="flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2 transition-colors"
          style={{
            background: isDone ? meta.color : meta.soft,
            color: isDone ? "#FFFFFF" : meta.color,
            opacity: busy ? 0.6 : 1,
          }}
        >
          <Check size={14} /> Done
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
    </div>
  );
}
