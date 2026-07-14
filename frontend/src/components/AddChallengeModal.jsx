import React, { useState } from "react";
import { X } from "lucide-react";
import { GOAL_CATEGORY_META, BRAND } from "../utils/theme.js";

const CATEGORIES = Object.keys(GOAL_CATEGORY_META);
const DIFFICULTIES = [
  { value: "easy", label: "Easy — 20 XP/day" },
  { value: "medium", label: "Medium — 50 XP/day" },
  { value: "hard", label: "Hard — 100 XP/day" },
  { value: "legendary", label: "Legendary — 250 XP/day" },
];

const inputStyle = {
  background: "var(--track)", color: "var(--text-primary)", width: "100%",
  marginTop: 4, borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function AddChallengeModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", category: "Health", description: "", difficulty: "medium" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim()) {
      setError("Challenge name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onCreate({ ...form, durationDays: 30 });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,18,26,0.5)" }}>
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Start a 30-day challenge</h3>
          <button aria-label="Close" onClick={onClose}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
        </div>

        {error && <p className="text-xs mb-3" style={{ color: BRAND.pink }}>{error}</p>}

        <div className="flex flex-col gap-3">
          <Field label="Challenge name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="30 pushups every day" style={inputStyle} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Description (optional)">
            <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...inputStyle, resize: "none" }} />
          </Field>
          <Field label="Difficulty (sets daily XP reward)">
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} style={inputStyle}>
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Runs for 30 days starting today. Come back daily and mark it Done — no need to re-add it.
          </p>
          <button
            onClick={submit}
            disabled={saving}
            className="mt-1 rounded-xl py-2 text-sm font-medium text-white"
            style={{ background: BRAND.blue, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Starting…" : "Start challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}
