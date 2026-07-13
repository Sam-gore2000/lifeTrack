import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const inputStyle = {
  background: "#1D2536", color: "#F4F6FB", borderRadius: 10,
  padding: "10px 12px", fontSize: 14, outline: "none", border: "1px solid #232B3D",
};

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#0B0F19" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#141A28", border: "1px solid #232B3D" }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: "#3B5BDB" }}>L</div>
          <span className="text-lg font-semibold" style={{ color: "#F4F6FB" }}>LifeOS</span>
        </div>

        <h1 className="text-xl font-semibold mb-1" style={{ color: "#F4F6FB" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm mb-5" style={{ color: "#9AA4BC" }}>
          {mode === "login" ? "Log in to pick up your streak." : "Start building your Life Score."}
        </p>

        {error && <p className="text-sm mb-3" style={{ color: "#E0568C" }}>{error}</p>}

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            style={inputStyle}
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password (min. 6 characters)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-xl py-2.5 text-sm font-medium text-white"
            style={{ background: "#3B5BDB", opacity: busy ? 0.7 : 1 }}
          >
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-sm mt-5 text-center" style={{ color: "#9AA4BC" }}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="font-medium"
            style={{ color: "#3B5BDB" }}
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
