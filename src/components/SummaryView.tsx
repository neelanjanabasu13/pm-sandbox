import { useState } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Send, Save, Check, Award, Loader, AlertCircle } from "lucide-react";
import type { SessionData } from "./SessionWizard";
import type { Question } from "../lib/supabase";
import {
  STAGE_DEFS,
  STAGE_ORDER,
  type QuestionType,
  type GymState,
  type GymContent,
  type StageItem,
  type StageDef,
  itemScore,
  argmaxScore,
  formatTime,
} from "../lib/gym";

interface SummaryViewProps {
  sessionData: SessionData;
  question: Question;
  onExit: () => void;
  onShowAuth: () => void;
}

interface GradeResult {
  scores?: Record<string, number>;
  verdict?: string;
  hedging_quotes?: string[];
  rewrite?: string;
  raw?: string;
}

export default function SummaryView({ sessionData, question, onExit, onShowAuth }: SummaryViewProps) {
  const { user } = useAuth();
  const { state, content, points } = sessionData;
  const type = question.type as QuestionType;
  const order = STAGE_ORDER[type];
  const defs = STAGE_DEFS[type];

  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const stageItems = (stageKey: string): StageItem[] => {
    const authored = content.stages[stageKey] ?? [];
    const custom = state.customRows[stageKey] ?? [];
    return [...authored, ...custom];
  };

  const buildPayload = () => {
    const rows = order
      .filter((sKey) => sKey !== "framing" && defs[sKey].criteria.length > 0)
      .map((sKey) => {
        const def = defs[sKey];
        const items = stageItems(sKey);
        return {
          stage: sKey,
          stageLabel: def.label,
          items: items.map((item) => ({
            name: item.name,
            desc: item.desc,
            custom: !!item.custom,
            ratings: state.ratings[`${sKey}:${item.name}`] ?? [0, 0, 0],
            score: itemScore(sKey, item.name, state, def.criteria),
            criteriaLabels: def.criteria.map((c) => c.label),
          })),
          pick: state.pick[sKey] ?? null,
          justification: state.justification[sKey] ?? null,
        };
      });

    return {
      question: { text: question.text, type: question.type, company: question.source_company },
      framingAnswers: state.framingAnswers,
      framingQuestions: content.framing ?? [],
      customAssumptions: state.customAssumptions,
      rows,
      pitchText: state.pitchText,
      elapsedSeconds: state.elapsedSeconds,
      points,
    };
  };

  const handleGrade = async () => {
    setGrading(true);
    setGradeError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grade-session`;
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(buildPayload()),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Grader failed (${resp.status}): ${errText}`);
      }
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setGrade(data as GradeResult);
    } catch (err) {
      setGradeError(err instanceof Error ? err.message : "Grading failed");
    } finally {
      setGrading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      onShowAuth();
      return;
    }
    setSaving(true);
    const totalScore = grade?.scores
      ? Math.round((Object.values(grade.scores).reduce((a, b) => a + b, 0) / 25) * 100)
      : null;

    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .insert({
        question_id: question.id,
        current_stage: "pitch",
        pitch_text: state.pitchText,
        status: grade ? "graded" : "completed",
        score: totalScore,
        grader_feedback: grade ? JSON.stringify({ scores: grade.scores, verdict: grade.verdict, hedging: grade.hedging_quotes, rewrite: grade.rewrite }) : null,
        graded_at: grade ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (sessionErr) {
      console.error("[summary] save error:", sessionErr.message);
      setSaving(false);
      return;
    }

    const responseInserts = order
      .filter((sKey) => sKey !== "framing")
      .map((sKey) => ({
        session_id: session.id,
        stage: sKey,
        items: stageItems(sKey).map((i) => i.name),
      }));

    if (responseInserts.length > 0) {
      await supabase.from("session_responses").insert(responseInserts);
    }

    setSavedSessionId(session.id);
    setSaving(false);
  };

  const gradeScore = grade?.scores
    ? Math.round((Object.values(grade.scores).reduce((a, b) => a + b, 0) / 25) * 100)
    : null;

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="hover:bg-paper-dark rounded-sketch p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-hand text-2xl font-bold">Session Summary</h2>
        {gradeScore !== null && (
          <span className="font-mono text-sm border-2 border-ink px-3 py-1 rounded-sketch font-bold flex items-center gap-1">
            <Award size={14} /> {gradeScore}/100
          </span>
        )}
      </div>

      {/* Question */}
      <div className="sketch-card">
        <p className="font-hand text-lg font-bold leading-tight">{question.text}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="font-mono text-xs border-2 border-ink px-2 py-0.5 rounded-sketch">{question.type.replace("_", " ")}</span>
          {question.source_company && <span className="font-mono text-xs text-gray-dark">{question.source_company}</span>}
          <span className="font-mono text-xs text-gray-mid">{formatTime(state.elapsedSeconds)}</span>
          <span className="font-mono text-xs font-bold">{points} pts</span>
        </div>
      </div>

      {/* Picks summary */}
      <div className="sketch-card">
        <h3 className="font-hand text-xl font-bold mb-3">Your Approach</h3>
        <div className="space-y-3">
          {order.filter((s) => s !== "framing" && defs[s].criteria.length > 0).map((sKey) => {
            const def = defs[sKey];
            const pick = state.pick[sKey];
            if (!pick) return null;
            const items = stageItems(sKey);
            const picked = items.find((i) => i.name === pick);
            const score = itemScore(sKey, pick, state, def.criteria);
            const top = argmaxScore(sKey, items, state, def.criteria);
            const isContrarian = top !== null && pick !== top.name;
            return (
              <div key={sKey} className="border-l-4 border-ink pl-3">
                <p className="font-mono text-xs text-gray-mid uppercase mb-0.5">{def.label}</p>
                <p className="font-body text-sm font-bold">
                  {pick} {score !== null && <span className="font-mono text-xs text-gray-dark">({score} pts)</span>}
                  {isContrarian && <span className="font-mono text-xs text-amber-600 ml-2">contrarian</span>}
                </p>
                {picked?.desc && <p className="font-body text-xs text-gray-dark mt-0.5">{picked.desc}</p>}
                {state.justification[sKey] && (
                  <p className="font-body text-xs text-amber-600 mt-0.5 italic">"{state.justification[sKey]}"</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Framing answers */}
        {content.framing && content.framing.length > 0 && (
          <div className="mt-4 pt-3 border-t-2 border-gray-light">
            <p className="font-mono text-xs text-gray-mid uppercase mb-1">Framing</p>
            {content.framing.map((q) => (
              <p key={q.id} className="font-body text-xs">
                <span className="text-gray-mid">{q.prompt}</span>{" "}
                <span className="font-bold">{state.framingAnswers[q.id] ?? "skipped"}</span>
              </p>
            ))}
            {state.customAssumptions && (
              <p className="font-body text-xs mt-1"><span className="text-gray-mid">Assumptions:</span> {state.customAssumptions}</p>
            )}
          </div>
        )}

        {state.pitchText && (
          <div className="mt-4 pt-3 border-t-2 border-gray-light">
            <p className="font-mono text-xs text-gray-mid uppercase mb-1">The Pitch</p>
            <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{state.pitchText}</p>
          </div>
        )}
      </div>

      {/* Grading */}
      <div className="sketch-card" style={{ boxShadow: "4px 4px 0 var(--ink)" }}>
        <h3 className="font-hand text-xl font-bold mb-2">Get it graded</h3>
        <p className="font-body text-sm text-gray-dark mb-3">
          Send your full session to the AI grader. It scores insight, conviction, concreteness, prioritisation, and metrics — then gives a Builder vs Analyst verdict and a best-in-class rewrite.
        </p>

        {!grade && !grading && !gradeError && (
          <button onClick={handleGrade} className="btn-ink flex items-center gap-2">
            <Send size={16} /> Grade my session
          </button>
        )}

        {grading && (
          <div className="flex items-center gap-2 font-body text-sm text-gray-dark">
            <Loader size={16} className="animate-spin" /> Grading...
          </div>
        )}

        {gradeError && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-red-600 font-body text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{gradeError}</span>
            </div>
            <button onClick={handleGrade} className="btn-outline py-1 text-sm">Retry</button>
          </div>
        )}

        {grade && (
          <div className="space-y-4 fade-in">
            {/* Scores */}
            {grade.scores && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(grade.scores).map(([k, v]) => (
                  <div key={k} className="border-2 border-ink rounded-sketch p-2 text-center">
                    <p className="font-mono text-xs text-gray-mid uppercase">{k.replace(/_/g, " ")}</p>
                    <p className="font-hand text-2xl font-bold">{v}<span className="text-sm text-gray-mid">/5</span></p>
                  </div>
                ))}
              </div>
            )}

            {/* Verdict */}
            {grade.verdict && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-mid uppercase">Verdict:</span>
                <span className={`font-hand text-xl font-bold ${grade.verdict === "Builder" ? "text-green-700" : "text-amber-600"}`}>
                  {grade.verdict}
                </span>
              </div>
            )}

            {/* Hedging quotes */}
            {grade.hedging_quotes && grade.hedging_quotes.length > 0 && (
              <div>
                <p className="font-mono text-xs text-gray-mid uppercase mb-1">Hedging language spotted:</p>
                <div className="flex flex-wrap gap-2">
                  {grade.hedging_quotes.map((q, i) => (
                    <span key={i} className="font-body text-xs border-2 border-amber-500 text-amber-700 px-2 py-0.5 rounded-sketch italic">
                      "{q}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rewrite */}
            {grade.rewrite && (
              <div>
                <p className="font-mono text-xs text-gray-mid uppercase mb-1">Best-in-class rewrite:</p>
                <div className="border-2 border-ink rounded-sketch p-3 bg-paper-dark">
                  <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{grade.rewrite}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="sketch-card">
        <div className="flex items-center justify-between gap-3">
          {savedSessionId ? (
            <span className="font-mono text-sm font-bold flex items-center gap-1">
              <Check size={14} /> Saved to dashboard
            </span>
          ) : (
            <span className="font-mono text-sm text-gray-mid">
              {user ? "" : "Sign in to save this session"}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-ink flex items-center gap-2 disabled:opacity-30 ml-auto"
          >
            {saving ? "Saving..." : savedSessionId ? "Update" : user ? "Save to dashboard" : "Sign in to save"}
            {!savedSessionId && <Save size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
