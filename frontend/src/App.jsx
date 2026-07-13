import React, { useState, useEffect, useCallback } from "react";
import {
  Home, Target, BarChart3, BookOpen, Award, CalendarDays, Sun, Moon,
  Flame, Plus, LogOut, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Cell,
} from "recharts";

import { useAuth } from "./context/AuthContext.jsx";
import { api } from "./api/client.js";
import AuthPage from "./pages/AuthPage.jsx";
import GoalCard from "./components/GoalCard.jsx";
import AddGoalModal from "./components/AddGoalModal.jsx";
import Heatmap from "./components/Heatmap.jsx";
import LifeScoreDial from "./components/LifeScoreDial.jsx";
import CalendarTab from "./components/Calendar.jsx";
import JournalTab from "./components/JournalTab.jsx";
import { BRAND, DIMENSION_META, themeVars } from "./utils/theme.js";
import { getGreeting, getTimeOfDayQuote, getPersonalizedInsight } from "./utils/quotes.js";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "goals", label: "Goals", icon: Target },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "journal", label: "Journal", icon: BookOpen },
  { key: "achievements", label: "Achievements", icon: Award },
];

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-2xl font-semibold tracking-tight" style={{ color: accent || "var(--text-primary)" }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{sub}</span>}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        No goals yet. Add your first one to start tracking your Life Score.
      </p>
      <button onClick={onAdd} className="text-sm font-medium px-4 py-2 rounded-xl text-white" style={{ background: BRAND.blue }}>
        Add your first goal
      </button>
    </div>
  );
}

function AppShell() {
  const { user, logout, updateUser } = useAuth();
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("dashboard");

  const [goals, setGoals] = useState([]);
  const [logsByGoal, setLogsByGoal] = useState({});
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [lifeScore, setLifeScore] = useState(null);
  const [trend, setTrend] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);

  const loadAll = useCallback(async () => {
    const [goalsRes, logsRes, summaryRes, heatmapRes, lifeScoreRes, trendRes, achRes] = await Promise.all([
      api.get("/goals?status=active"),
      api.get("/goals/logs/today"),
      api.get("/dashboard/today"),
      api.get("/dashboard/heatmap?days=365"),
      api.get("/dashboard/life-score/today"),
      api.get("/dashboard/life-score/trend?days=14"),
      api.get("/achievements"),
    ]);
    setGoals(goalsRes.goals);
    setLogsByGoal(Object.fromEntries(logsRes.logs.map((l) => [String(l.goal?._id || l.goal), l])));
    setSummary(summaryRes);
    setHeatmap(heatmapRes.heatmap);
    setLifeScore(lifeScoreRes);
    setTrend(trendRes.history);
    setAchievements(achRes.achievements);
  }, []);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    loadAll()
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [loadAll]);

  async function handleSetStatus(goalId, status) {
    const { user: updatedUser } = await api.post(`/goals/${goalId}/status`, { status });
    updateUser(updatedUser);

    const [logsRes, summaryRes, lifeScoreRes] = await Promise.all([
      api.get("/goals/logs/today"),
      api.get("/dashboard/today"),
      api.post("/dashboard/life-score/recalculate"),
    ]);
    setLogsByGoal(Object.fromEntries(logsRes.logs.map((l) => [String(l.goal?._id || l.goal), l])));
    setSummary(summaryRes);
    setLifeScore(lifeScoreRes);

    api.post("/achievements/check").then(({ newlyUnlocked }) => {
      if (newlyUnlocked?.length) {
        setToast(`Achievement unlocked: ${newlyUnlocked[0].name}`);
        setTimeout(() => setToast(null), 3000);
        api.get("/achievements").then(({ achievements }) => setAchievements(achievements));
      }
    });
  }

  async function handleCreateGoal(form) {
    await api.post("/goals", form);
    await loadAll();
  }

  const vars = themeVars(dark);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: vars["--bg"] }}>
        <p style={{ color: vars["--text-secondary"] }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 text-center" style={{ background: vars["--bg"] }}>
        <div>
          <p className="mb-3" style={{ color: vars["--text-primary"] }}>Couldn't reach the LifeOS API.</p>
          <p className="text-sm" style={{ color: vars["--text-secondary"] }}>{loadError}</p>
          <p className="text-xs mt-3" style={{ color: vars["--text-muted"] }}>
            Check that the backend is running and VITE_API_URL points to it.
          </p>
        </div>
      </div>
    );
  }

  const quote = getTimeOfDayQuote();
  const greeting = getGreeting();
  const insight = getPersonalizedInsight(lifeScore?.breakdown);

  return (
    <div style={{ ...vars, background: "var(--bg)", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }} className="w-full flex">
      <style>{`.lifeos-display { font-family: 'Sora', 'Inter', system-ui, sans-serif; }`}</style>

      <aside className="hidden sm:flex flex-col justify-between w-56 shrink-0 p-4" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--border)" }}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold lifeos-display" style={{ background: BRAND.blue }}>L</div>
            <span className="lifeos-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>LifeOS</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setTab(n.key)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left"
                  style={{ background: active ? BRAND.blueSoft : "transparent", color: active ? BRAND.blue : "var(--text-secondary)" }}
                >
                  <Icon size={17} /> {n.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? "Light mode" : "Dark mode"}
          </button>
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: BRAND.purpleSoft, color: BRAND.purple }}>
                {(user.name || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Level {user.level}</p>
              </div>
            </div>
            <button onClick={logout} title="Log out" aria-label="Log out">
              <LogOut size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8 flex flex-col gap-6">
        <div className="flex sm:hidden items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{ background: tab === n.key ? BRAND.blueSoft : "var(--track)", color: tab === n.key ? BRAND.blue : "var(--text-secondary)" }}
              >
                {n.label}
              </button>
            ))}
          </div>
          <button onClick={logout} aria-label="Log out"><LogOut size={16} style={{ color: "var(--text-muted)" }} /></button>
        </div>

        {tab === "dashboard" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="lifeos-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {greeting}, {(user.name || "").split(" ")[0]}
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{quote}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: BRAND.orangeSoft }}>
                <Flame size={16} style={{ color: BRAND.orange }} />
                <span className="text-sm font-semibold" style={{ color: BRAND.orange }}>{user.currentStreak} day streak</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Today's progress" value={`${summary?.overallPct ?? 0}%`} sub={`${goals.length} active goals`} accent={BRAND.blue} />
              <StatCard
                label="XP to next level"
                value={summary ? `${summary.xp.xpIntoLevel}/${summary.xp.xpNeededForNext}` : "–"}
                sub={`Level ${summary?.xp.level ?? user.level}`}
                accent={BRAND.orange}
              />
              <StatCard label="Total XP" value={user.xp} sub={`Level ${summary?.xp.level ?? user.level}`} accent={BRAND.purple} />
              <StatCard label="Life score" value={lifeScore?.score ?? "–"} sub="trailing 7 days" accent={BRAND.green} />
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="rounded-2xl p-5 lg:col-span-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Today's goals</h3>
                  <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ background: BRAND.blueSoft, color: BRAND.blue }}>
                    <Plus size={14} /> Add goal
                  </button>
                </div>
                {goals.length === 0 ? (
                  <EmptyState onAdd={() => setShowModal(true)} />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {goals.map((g) => (
                      <GoalCard key={g._id} goal={g} log={logsByGoal[g._id]} onSetStatus={handleSetStatus} />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-5 lg:col-span-2 flex flex-col gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Life score breakdown</h3>
                <LifeScoreDial breakdown={lifeScore?.breakdown} score={lifeScore?.score} />
                {insight && (
                  <div className="mt-2 rounded-xl p-3 flex gap-3 items-start" style={{ background: BRAND.blueSoft }}>
                    <Sparkles size={16} style={{ color: BRAND.blue, marginTop: 2 }} />
                    <p className="text-xs leading-relaxed" style={{ color: BRAND.blue }}>{insight}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Consistency heatmap</h3>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Last 365 days</span>
              </div>
              <Heatmap data={heatmap} />
            </div>
          </>
        )}

        {tab === "goals" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="lifeos-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Goals</h1>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl text-white" style={{ background: BRAND.blue }}>
                <Plus size={16} /> Add goal
              </button>
            </div>
            {goals.length === 0 ? (
              <EmptyState onAdd={() => setShowModal(true)} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((g) => (
                  <GoalCard key={g._id} goal={g} log={logsByGoal[g._id]} onSetStatus={handleSetStatus} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "analytics" && (
          <>
            <h1 className="lifeos-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Life score trend</h3>
                {trend.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Not enough history yet — check back after a few days.</p>
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <AreaChart data={trend.map((t) => ({ day: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), score: t.score }))}>
                        <defs>
                          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={BRAND.green} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={BRAND.green} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="score" stroke={BRAND.green} fill="url(#scoreFill)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Category performance</h3>
                {!lifeScore?.breakdown ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete goals to see category data.</p>
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={Object.entries(lifeScore.breakdown).map(([k, v]) => ({ label: DIMENSION_META[k]?.label || k, value: v, key: k }))}
                        layout="vertical" margin={{ left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {Object.keys(lifeScore.breakdown).map((k) => (
                            <Cell key={k} fill={DIMENSION_META[k]?.color || BRAND.blue} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "calendar" && (
          <>
            <h1 className="lifeos-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Calendar</h1>
            <CalendarTab />
          </>
        )}

        {tab === "journal" && (
          <>
            <h1 className="lifeos-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Journal</h1>
            <JournalTab />
          </>
        )}

        {tab === "achievements" && (
          <>
            <h1 className="lifeos-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Achievements</h1>
            {achievements.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No achievements catalog found. Run <code>node seed/achievements.js</code> on the backend.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {achievements.map((a) => (
                  <div key={a._id} className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: a.unlocked ? BRAND.orangeSoft : "var(--track)", color: a.unlocked ? BRAND.orange : "var(--text-muted)" }}
                    >
                      <Award size={20} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: a.unlocked ? "var(--text-primary)" : "var(--text-muted)" }}>{a.name}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && <AddGoalModal onClose={() => setShowModal(false)} onCreate={handleCreateGoal} />}

      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <AppShell /> : <AuthPage />;
}
