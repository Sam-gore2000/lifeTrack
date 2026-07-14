import React, { useState } from "react";
import { X } from "lucide-react";
import { GOAL_CATEGORY_META, BRAND } from "../utils/theme.js";

const CATEGORIES = Object.keys(GOAL_CATEGORY_META);
const UNITS = ["min", "L", "pages", "km", "session", "reps"];
const DIFFICULTIES = [
  { value: "easy", label: "Easy — 20 XP" },
  { value: "medium", label: "Medium — 50 XP" },
  { value: "hard", label: "Hard — 100 XP" },
  { value: "legendary", label: "Legendary — 250 XP" },
];

const inputStyle = {
  background: "var(--track)", color: "var(--text-primary)", width: "100%",
  marginTop: 4, borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none",
};

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function AddGoalModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", category: "Health", goalType: "quantity",
    dailyTarget: 30, unit: "min", difficulty: "medium",
    scheduleRule: "", scheduleTime: "07:00",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isHabit = form.goalType === "boolean";

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim()) {
      setError("Goal name is required.");
      return;
    }
    if (!isHabit && (!form.dailyTarget || Number(form.dailyTarget) <= 0)) {
      setError("Daily target must be greater than 0.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = isHabit
        ? {
            name: form.name, category: form.category, goalType: form.goalType,
            difficulty: form.difficulty,
            scheduleRule: form.scheduleRule || null,
            scheduleTime: form.scheduleRule ? form.scheduleTime : null,
          }
        : {
            name: form.name, category: form.category, goalType: form.goalType,
            dailyTarget: Number(form.dailyTarget), unit: form.unit, difficulty: form.difficulty,
          };
      await onCreate(payload);
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
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>New goal</h3>
          <button aria-label="Close" onClick={onClose}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
        </div>

        {error && <p className="text-xs mb-3" style={{ color: BRAND.pink }}>{error}</p>}

        <div className="flex flex-col gap-3">
          <Field label="Goal name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={isHabit ? "No social media before 9 AM" : "Evening walk"}
              style={inputStyle}
            />
          </Field>

          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Goal type">
            <select value={form.goalType} onChange={(e) => set("goalType", e.target.value)} style={inputStyle}>
              <option value="quantity">Quantity (pages, liters, km…)</option>
              <option value="time">Time (minutes)</option>
              <option value="boolean">Habit / Yes-No (wake up at 5am, no social media…)</option>
            </select>
          </Field>

          {isHabit ? (
            <>
              <Field label="Time constraint (optional)">
                <select value={form.scheduleRule} onChange={(e) => set("scheduleRule", e.target.value)} style={inputStyle}>
                  <option value="">No specific time</option>
                  <option value="before">Must happen before a time (e.g. wake up by 5 AM)</option>
                  <option value="after">Must not happen after a time (e.g. no screens after 9 PM)</option>
                </select>
              </Field>
              {form.scheduleRule && (
                <Field label="Time">
                  <input type="time" value={form.scheduleTime} onChange={(e) => set("scheduleTime", e.target.value)} style={inputStyle} />
                </Field>
              )}
            </>
          ) : (
            <div className="flex gap-3">
              <Field label="Daily target" className="flex-1">
                <input type="number" min={1} value={form.dailyTarget} onChange={(e) => set("dailyTarget", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Unit" className="flex-1">
                <select value={form.unit} onChange={(e) => set("unit", e.target.value)} style={inputStyle}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
            </div>
          )}

          <Field label="Difficulty (sets XP reward)">
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} style={inputStyle}>
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>

          <button
            onClick={submit}
            disabled={saving}
            className="mt-2 rounded-xl py-2 text-sm font-medium text-white"
            style={{ background: BRAND.blue, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Creating…" : "Create goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
