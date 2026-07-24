import { useEffect, useState } from "react";
import { supabase, type Question, type Session } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { TrendingUp, Clock, CheckCircle, RotateCcw, Award, Flame, Plus } from "lucide-react";
import AddQuestion from "./AddQuestion";

interface DashboardProps {
  onStartSession: (q: Question) => void;
}

interface SessionWithQuestion extends Session {
  question?: Question;
}

export default function Dashboard({ onStartSession }: DashboardProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionWithQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "graded" | "ungraded">("all");
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) console.error("[dashboard] fetch error:", error.message);
    if (data) {
      const s = data as Session[];
      const qIds = [...new Set(s.map((sess) => sess.question_id))];
      const { data: qs, error: qsErr } = await supabase.from("questions").select("*").in("id", qIds);
      if (qsErr) console.error("[dashboard] questions fetch error:", qsErr.message);
      const qMap: Record<string, Question> = {};
      if (qs) qs.forEach((q) => (qMap[q.id] = q as Question));

      const enriched = s.map((sess) => ({
        ...sess,
        question: qMap[sess.question_id],
      }));
      setSessions(enriched);
    }
    setLoading(false);
  };

  const completedSessions = sessions.filter((s) => s.status === "completed" || s.status === "graded");
  const gradedSessions = sessions.filter((s) => s.status === "graded" && s.score !== null);
  const scores = gradedSessions.map((s) => s.score!).filter((s) => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Streak calculation
  const practiceDates = new Set(
    completedSessions.map((s) => new Date(s.updated_at).toDateString())
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (practiceDates.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Type breakdown
  const typeBreakdown: Record<string, number> = {};
  completedSessions.forEach((s) => {
    const t = s.question?.type ?? "unknown";
    typeBreakdown[t] = (typeBreakdown[t] ?? 0) + 1;
  });

  const filteredSessions = sessions.filter((s) => {
    if (filter === "graded") return s.status === "graded";
    if (filter === "ungraded") return s.status === "completed";
    return s.status === "completed" || s.status === "graded";
  });

  const handleRedo = (s: SessionWithQuestion) => {
    if (s.question) onStartSession(s.question);
  };

  if (loading) {
    return <p className="font-body text-gray-mid text-center py-12">Loading...</p>;
  }

  return (
    <div className="space-y-6 fade-in">
      <h2 className="font-hand text-3xl font-bold">Your Dashboard</h2>

      <button
        onClick={() => setShowAddQuestion(true)}
        className="btn-ink flex items-center gap-2"
      >
        <Plus size={18} />
        Add a Question
      </button>

      {/* ── Stats cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle size={20} />} label="Practiced" value={completedSessions.length.toString()} />
        <StatCard icon={<Award size={20} />} label="Avg Score" value={avgScore !== null ? `${avgScore}/100` : "--"} />
        <StatCard icon={<Flame size={20} />} label="Day Streak" value={streak.toString()} />
        <StatCard icon={<Clock size={20} />} label="In Progress" value={sessions.filter((s) => s.status === "in_progress").length.toString()} />
      </div>

      {/* ── Type breakdown ──────────────────────────── */}
      {Object.keys(typeBreakdown).length > 0 && (
        <div className="sketch-card">
          <h3 className="font-hand text-xl font-bold mb-3">By Type</h3>
          <div className="space-y-2">
            {Object.entries(typeBreakdown).map(([type, count]) => {
              const pct = completedSessions.length > 0 ? (count / completedSessions.length) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-28 capitalize">{type.replace("_", " ")}</span>
                  <div className="flex-1 h-6 border-2 border-ink rounded-sketch overflow-hidden">
                    <div
                      className="h-full bg-ink flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="font-mono text-xs text-paper font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── History ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-hand text-2xl font-bold">History</h3>
          <div className="flex gap-1">
            <button onClick={() => setFilter("all")} className={`chip text-xs ${filter === "all" ? "chip-selected" : ""}`}>
              All
            </button>
            <button onClick={() => setFilter("graded")} className={`chip text-xs ${filter === "graded" ? "chip-selected" : ""}`}>
              Graded
            </button>
            <button onClick={() => setFilter("ungraded")} className={`chip text-xs ${filter === "ungraded" ? "chip-selected" : ""}`}>
              Ungraded
            </button>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="sketch-card text-center py-12">
            <p className="font-hand text-xl text-gray-mid mb-2">No sessions yet</p>
            <p className="font-body text-sm text-gray-mid">
              Start practicing to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((s) => (
              <div key={s.id} className="sketch-card flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm leading-relaxed truncate">
                    {s.question?.text ?? "Unknown question"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-xs text-gray-mid">
                      {new Date(s.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {s.question?.type && (
                      <span className="font-mono text-xs text-gray-dark capitalize">
                        {s.question.type.replace("_", " ")}
                      </span>
                    )}
                    {s.score !== null && (
                      <span className="font-mono text-xs border-2 border-ink px-1.5 py-0.5 rounded-sketch font-bold">
                        {s.score}/100
                      </span>
                    )}
                    {s.status === "completed" && (
                      <span className="font-mono text-xs text-gray-mid">Awaiting grade</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRedo(s)}
                  className="btn-outline py-1 text-xs flex items-center gap-1 flex-shrink-0"
                  title="Redo this question"
                >
                  <RotateCcw size={14} />
                  Redo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddQuestion && <AddQuestion onClose={() => setShowAddQuestion(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="sketch-card flex flex-col items-center text-center py-4">
      <div className="mb-1">{icon}</div>
      <p className="font-hand text-2xl font-bold leading-none">{value}</p>
      <p className="font-mono text-xs text-gray-mid mt-1">{label}</p>
    </div>
  );
}
