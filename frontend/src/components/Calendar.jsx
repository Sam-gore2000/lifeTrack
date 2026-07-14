import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../api/client.js";
import { BRAND } from "../utils/theme.js";

// Local Y-M-D, deliberately not toISOString() — that converts through UTC
// and was shifting every selected day backward by one for timezones ahead
// of UTC (e.g. India), which is why the calendar always showed the wrong
// (empty) day.
function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarTab() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  async function selectDay(date) {
    setSelected(date);
    setLoading(true);
    setError(null);
    setDetail(null);
    try {
      const data = await api.get(`/dashboard/day?date=${toISO(date)}`);
      setDetail(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
            <ChevronLeft size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
            <ChevronRight size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs mb-2" style={{ color: "var(--text-muted)" }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selected && date.toDateString() === selected.toDateString();
            return (
              <button
                key={i}
                onClick={() => selectDay(date)}
                className="aspect-square rounded-lg text-xs flex items-center justify-center"
                style={{
                  background: isSelected ? BRAND.blue : isToday ? "var(--track)" : "transparent",
                  color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                  border: isToday && !isSelected ? `1px solid ${BRAND.blue}` : "1px solid transparent",
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          {selected ? selected.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : "Select a day"}
        </h3>

        {!selected && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pick a date to see that day's goals, XP, and journal entry.</p>
        )}
        {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>}
        {error && <p className="text-sm" style={{ color: BRAND.pink }}>{error}</p>}

        {!loading && !error && selected && detail && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                Overall: <b style={{ color: "var(--text-primary)" }}>{detail.overallPct}%</b>
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                XP earned: <b style={{ color: "var(--text-primary)" }}>+{detail.xpEarned}</b>
              </span>
              {detail.lifeScore && (
                <span style={{ color: "var(--text-secondary)" }}>
                  Life score: <b style={{ color: "var(--text-primary)" }}>{detail.lifeScore.score}</b>
                </span>
              )}
            </div>

            {detail.logs.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No goal activity logged this day.</p>
            )}
            {detail.logs.map((l) => (
              <div key={l._id} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ background: "var(--track)" }}>
                <span style={{ color: "var(--text-primary)" }}>{l.goal?.name || "Deleted goal"}</span>
                <span style={{ color: l.isComplete ? BRAND.green : "var(--text-muted)" }}>
                  {l.isComplete ? "Done" : `${l.progressPct}%`}
                </span>
              </div>
            ))}

            {detail.journal && (
              <div className="mt-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Journal</p>
                {["wentWell", "distractions", "grateful", "improveTomorrow"].map((k) => detail.journal[k] && (
                  <p key={k} className="text-sm mb-1" style={{ color: "var(--text-primary)" }}>{detail.journal[k]}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
