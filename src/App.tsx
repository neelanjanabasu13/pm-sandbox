import { useState } from "react";
import LandingPage from "./components/LandingPage";
import SessionWizard from "./components/SessionWizard";
import type { SessionData } from "./components/SessionWizard";
import SummaryView from "./components/SummaryView";
import Dashboard from "./components/Dashboard";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./lib/auth";
import type { Question } from "./lib/supabase";
import { Notebook, LayoutDashboard, LogOut } from "lucide-react";

type Tab = "practice" | "dashboard";

type View =
  | { name: "landing" }
  | { name: "session"; question: Question }
  | { name: "summary"; question: Question; data: SessionData };

function App() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("practice");
  const [view, setView] = useState<View>({ name: "landing" });
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setView({ name: "landing" });
    setTab("practice");
  };

  return (
    <div className="paper-bg min-h-screen">
      {/* ── Header ──────────────────────────────────── */}
      <header className="border-b-2 border-ink sticky top-0 z-40 bg-paper">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Notebook className="w-7 h-7" strokeWidth={2} />
            <div className="flex flex-col leading-none">
              <span className="font-hand text-2xl font-bold tracking-tight">PM Sandbox</span>
              <span className="font-body text-xs text-gray-dark mt-0.5">The flight simulator for PM interviews.</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setTab("practice");
                setView({ name: "landing" });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-body text-sm font-bold transition-all rounded-sketch ${
                tab === "practice"
                  ? "bg-ink text-paper"
                  : "hover:bg-paper-dark"
              }`}
            >
              <Notebook size={16} />
              Practice
            </button>
            <button
              onClick={() => setTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-body text-sm font-bold transition-all rounded-sketch ${
                tab === "dashboard"
                  ? "bg-ink text-paper"
                  : "hover:bg-paper-dark"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 font-body text-sm font-bold hover:bg-paper-dark rounded-sketch ml-2"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="btn-outline ml-2 py-1.5 text-sm"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "dashboard" && user ? (
          <Dashboard
            onStartSession={(q) => {
              setView({ name: "session", question: q });
              setTab("practice");
            }}
          />
        ) : tab === "dashboard" && !user ? (
          <div className="sketch-card text-center py-16">
            <p className="font-hand text-3xl mb-4">Sign in to track your progress</p>
            <p className="font-body text-gray-dark mb-6">
              Your practice history, scores, and streaks live here once you create an account.
            </p>
            <button onClick={() => setShowAuth(true)} className="btn-ink">
              Create account
            </button>
          </div>
        ) : view.name === "landing" ? (
          <LandingPage
            onStartSession={(q) => setView({ name: "session", question: q })}
          />
        ) : view.name === "session" ? (
          <SessionWizard
            question={view.question}
            onExit={() => setView({ name: "landing" })}
            onComplete={(data) => setView({ name: "summary", question: view.question, data })}
          />
        ) : view.name === "summary" ? (
          <SummaryView
            sessionData={view.data}
            question={view.question}
            onExit={() => setView({ name: "landing" })}
            onShowAuth={() => setShowAuth(true)}
          />
        ) : null}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default App;
