import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../lib/auth";

interface AuthModalProps {
  onClose: () => void;
  mode?: "signin" | "signup";
}

export default function AuthModal({ onClose, mode: initialMode = "signup" }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="sketch-card w-full max-w-md mx-4 fade-in"
        style={{ boxShadow: "6px 6px 0 var(--ink)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-hand text-3xl font-bold">
            {mode === "signup" ? "Create account" : "Sign in"}
          </h2>
          <button onClick={onClose} className="text-gray-dark hover:text-ink transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sketch-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sketch-input"
              placeholder="At least 8 characters, mix letters & numbers"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-red-600 border-2 border-red-600 rounded-sketch px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-ink w-full disabled:opacity-50">
            {loading ? "..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-mid/30" />
          <span className="font-mono text-xs text-gray-mid">or</span>
          <div className="flex-1 h-px bg-gray-mid/30" />
        </div>

        <button
          onClick={async () => { setError(null); const r = await signInWithGoogle(); if (r.error) setError(r.error); }}
          className="btn-outline w-full flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-4 text-center font-body text-sm">
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="underline-squiggle font-bold"
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
