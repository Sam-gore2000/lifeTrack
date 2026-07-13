import React, { useMemo, useState } from "react";

function heatColor(pct) {
  if (pct === null || pct === undefined) return "var(--cell-empty)";
  if (pct >= 90) return "#0EA968";
  if (pct >= 70) return "#6FCB9F";
  if (pct >= 45) return "#E8850C";
  if (pct >= 20) return "#F2B366";
  return "#D64545";
}

export default function Heatmap({ data }) {
  const days = useMemo(() => {
    const map = new Map((data || []).map((d) => [d.date, d.pct]));
    const today = new Date();
    const list = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      list.push({ date: d, key, pct: map.has(key) ? map.get(key) : null });
    }
    return list;
  }, [data]);

  const weeks = useMemo(() => {
    const w = [];
    let cur = [];
    days.forEach((d, i) => {
      cur.push(d);
      if (d.date.getDay() === 6 || i === days.length - 1) {
        w.push(cur);
        cur = [];
      }
    });
    return w;
  }, [days]);

  const [hover, setHover] = useState(null);
  const hasAnyData = (data || []).length > 0;

  return (
    <div className="relative overflow-x-auto pb-2">
      <div className="flex gap-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = w.find((d) => d.date.getDay() === di);
              if (!cell) return <div key={di} className="w-3 h-3" />;
              return (
                <div
                  key={di}
                  onMouseEnter={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  className="w-3 h-3 rounded-[3px] cursor-pointer"
                  style={{ background: heatColor(cell.pct) }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {hover && (
        <div className="absolute -top-8 left-0 text-xs px-2 py-1 rounded-md shadow z-10" style={{ background: "var(--tooltip-bg)", color: "var(--tooltip-text)" }}>
          {hover.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          {" — "}
          {hover.pct === null ? "no data" : `${hover.pct}%`}
        </div>
      )}
      {!hasAnyData && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          No activity logged yet — mark a goal done to start filling this in.
        </p>
      )}
    </div>
  );
}
