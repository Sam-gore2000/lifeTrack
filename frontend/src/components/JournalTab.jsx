import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { BRAND } from "../utils/theme.js";

const QUESTIONS = [
  { key: "wentWell", label: "What went well today?" },
  { key: "distractions", label: "What distracted you?" },
  { key: "grateful", label: "What are you grateful for?" },
  { key: "improveTomorrow", label: "What will you improve tomorrow?" },
];

export default function JournalTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ wentWell: "", distractions: "", grateful: "", improveTomorrow: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { entries } = await api.get("/journal?limit=30");
      setEntries(entries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit() {
    if (!Object.values(form).some((v) => v.trim())) return;
    setSaving(true);
    setError(null);
    try {
      await api.post("/journal", form);
      setForm({ wentWell: "", distractions: "", grateful: "", improveTomorrow: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Tonight's reflection</h3>
        {error && <p className="text-sm mb-3" style={{ color: BRAND.pink }}>{error}</p>}
        <div className="flex flex-col gap-4">
          {QUESTIONS.map((q) => (
            <div key={q.key}>
              <label className="text-sm font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>{q.label}</label>
              <textarea
                rows={2}
                value={form[q.key]}
                onChange={(e) => setForm((f) => ({ ...f, [q.key]: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={{ background: "var(--track)", color: "var(--text-primary)" }}
              />
            </div>
          ))}
          <button
            onClick={submit}
            disabled={saving}
            className="self-start rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: BRAND.blue, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : "Save entry"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Past entries</h3>
        {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>}
        {!loading && entries.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No entries yet. Write tonight's to start your reflection habit.</p>
        )}
        {entries.map((e) => (
          <div key={e._id} className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
              {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <div className="flex flex-col gap-1">
              {QUESTIONS.map((q) => e[q.key] && (
                <p key={q.key} className="text-sm" style={{ color: "var(--text-primary)" }}>
                  <span style={{ color: "var(--text-muted)" }}>{q.label} </span>{e[q.key]}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
