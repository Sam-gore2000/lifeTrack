import React, { useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { BRAND } from "../utils/theme.js";

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

export default function SettingsTab() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user.name || "", bio: user.bio || "", dailyGoal: user.dailyGoal ?? 80,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  async function saveProfile() {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const { user: updated } = await api.patch("/auth/me", {
        name: profile.name, bio: profile.bio, dailyGoal: Number(profile.dailyGoal),
      });
      updateUser(updated);
      setProfileMsg({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword() {
    if (!pw.currentPassword || !pw.newPassword) return;
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.post("/auth/change-password", pw);
      setPw({ currentPassword: "", newPassword: "" });
      setPwMsg({ type: "ok", text: "Password changed." });
    } catch (err) {
      setPwMsg({ type: "error", text: err.message });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Profile</h3>
        <div className="flex flex-col gap-3">
          <Field label="Name">
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
          </Field>
          <Field label="Email">
            <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
          </Field>
          <Field label="Bio">
            <textarea rows={2} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} style={{ ...inputStyle, resize: "none" }} />
          </Field>
          <Field label="Daily goal threshold (% completion needed to keep your streak)">
            <input type="number" min={1} max={100} value={profile.dailyGoal} onChange={(e) => setProfile((p) => ({ ...p, dailyGoal: e.target.value }))} style={inputStyle} />
          </Field>
          {profileMsg && (
            <p className="text-xs" style={{ color: profileMsg.type === "ok" ? BRAND.green : BRAND.pink }}>{profileMsg.text}</p>
          )}
          <button
            onClick={saveProfile}
            disabled={profileSaving}
            className="self-start rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: BRAND.blue, opacity: profileSaving ? 0.7 : 1 }}
          >
            {profileSaving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Change password</h3>
        <div className="flex flex-col gap-3">
          <Field label="Current password">
            <input type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} style={inputStyle} />
          </Field>
          <Field label="New password">
            <input type="password" minLength={6} value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} style={inputStyle} />
          </Field>
          {pwMsg && (
            <p className="text-xs" style={{ color: pwMsg.type === "ok" ? BRAND.green : BRAND.pink }}>{pwMsg.text}</p>
          )}
          <button
            onClick={savePassword}
            disabled={pwSaving}
            className="self-start rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: BRAND.blue, opacity: pwSaving ? 0.7 : 1 }}
          >
            {pwSaving ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Account</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Longest streak</span>
          <span style={{ color: "var(--text-primary)" }}>{user.longestStreak} days</span>
          <span style={{ color: "var(--text-secondary)" }}>Total XP</span>
          <span style={{ color: "var(--text-primary)" }}>{user.xp}</span>
          <span style={{ color: "var(--text-secondary)" }}>Member since</span>
          <span style={{ color: "var(--text-primary)" }}>{new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}
