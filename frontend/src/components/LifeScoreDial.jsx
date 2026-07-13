import React from "react";
import { DIMENSION_META } from "../utils/theme.js";

export default function LifeScoreDial({ breakdown, score }) {
  const size = 220, cx = size / 2, cy = size / 2, baseR = 46, gap = 12;
  const entries = breakdown ? Object.entries(breakdown) : [];

  if (!entries.length) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Complete a few goals to generate your first life score.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Life score ${score ?? "unknown"} out of 100`}>
        {entries.map(([key, value], i) => {
          const r = baseR + i * gap;
          const c = 2 * Math.PI * r;
          const dash = (value / 100) * c;
          const color = DIMENSION_META[key]?.color || "#999";
          return (
            <g key={key} transform={`rotate(-90 ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--track)" strokeWidth="8" />
              <circle
                cx={cx} cy={cy} r={r} fill="none" stroke={color}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
              />
            </g>
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="34" fontWeight="600" fill="var(--text-primary)">{score ?? "–"}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">life score</text>
      </svg>
      <div className="flex flex-col gap-2 min-w-[160px]">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: DIMENSION_META[key]?.color }} />
              {DIMENSION_META[key]?.label || key}
            </span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
