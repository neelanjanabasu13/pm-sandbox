import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../lib/auth";

interface AuthModalProps {
  onClose: () => void;
  mode?: "signin" | "signup";
}

export default function AuthModal({ onClose, mode: initialMode = "signup" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
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

        <p className="mt-6 text-center font-body text-sm">
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

