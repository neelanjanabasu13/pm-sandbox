import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, ArrowRight, Lock, Check, Send, Plus, X, RotateCcw, Zap, Clock, Loader, AlertCircle } from "lucide-react";
import type { Question } from "../lib/supabase";
import {
  STAGE_DEFS,
  STAGE_ORDER,
  type QuestionType,
  type GymState,
  type GymContent,
  type StageItem,
  type StageDef,
  type CriterionConfig,
  type RatingValue,
  type FramingQuestion,
  RATING_VALUES,
  RATING_LABELS,
  ratingKey,
  itemScore,
  argmaxScore,
  isRowFullyRated,
  canCommitStage,
  isStageUnlocked,
  computePoints,
  formatTime,
  TARGET_SECONDS,
  emptyGymState,
  generateDefaultContent,
} from "../lib/gym";

export interface SessionData {
  state: GymState;
  content: GymContent;
  points: number;
}

interface SessionWizardProps {
  question: Question;
  onExit: () => void;
  onComplete: (data: SessionData) => void;
}

export default function SessionWizard({ question, onExit, onComplete }: SessionWizardProps) {
  const type = question.type as QuestionType;
  const order = STAGE_ORDER[type];
  const defs = STAGE_DEFS[type];
  const [content, setContent] = useState<GymContent>(() => parseContent(question));
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Fetch question-specific content from AI if none authored.
  useEffect(() => {
    const raw = question.chip_options as unknown as GymContent | null;
    const hasAuthored = raw && raw.stages && Object.keys(raw.stages).length > 0;
    if (hasAuthored) return;
    let cancelled = false;
    setContentLoading(true);
    setContentError(null);
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ questionId: question.id }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed (${r.status})`);
        const data = await r.json();
        if (data.error) throw new Error(data.error);
        if (!cancelled && data.content) {
          setContent(data.content as GymContent);
        }
      })
      .catch((err) => {
        if (!cancelled) setContentError(err instanceof Error ? err.message : "Failed to load content");
      })
      .finally(() => { if (!cancelled) setContentLoading(false); });
    return () => { cancelled = true; };
  }, [question.id, question.chip_options]);

  const [state, setState] = useState<GymState>(emptyGymState);
  const [currentStage, setCurrentStage] = useState(order[0]);
  const [justificationDraft, setJustificationDraft] = useState<string>("");
  const [showJustification, setShowJustification] = useState(false);

  // Timer: counts up once started, stops on submit.
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (state.startedAt !== null && state.submittedAt === null) {
      timerRef.current = window.setInterval(() => {
        setState((prev) => ({ ...prev, elapsedSeconds: Math.floor((Date.now() - (prev.startedAt ?? Date.now())) / 1000) }));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [state.startedAt, state.submittedAt]);

  const points = useMemo(() => computePoints(type, order, state, content), [type, order, state, content]);
  const stageIdx = order.indexOf(currentStage);
  const overTarget = state.elapsedSeconds >= TARGET_SECONDS;

  const goNext = () => {
    const idx = order.indexOf(currentStage);
    if (idx < order.length - 1) setCurrentStage(order[idx + 1]);
  };

  // ── Framing answer handler ────────────────────────────────────────────
  const setFramingAnswer = (qId: string, option: string) => {
    setState((prev) => {
      const next = { ...prev, framingAnswers: { ...prev.framingAnswers, [qId]: option } };
      if (next.startedAt === null) next.startedAt = Date.now();
      return next;
    });
  };

  // ── Rating handler ────────────────────────────────────────────────────
  const setRating = (stageKey: string, itemName: string, critIdx: number, value: RatingValue) => {
    const key = ratingKey(stageKey, itemName);
    setState((prev) => {
      const existing = prev.ratings[key] ?? [0, 0, 0];
      const updated = [...existing] as [RatingValue, RatingValue, RatingValue];
      updated[critIdx] = updated[critIdx] === value ? 0 : value;
      return { ...prev, ratings: { ...prev.ratings, [key]: updated } };
    });
  };

  // ── Custom row add/remove ─────────────────────────────────────────────
  const addCustomRow = (stageKey: string, name: string, desc: string) => {
    const item: StageItem = { id: `custom_${Date.now()}`, name, desc, custom: true };
    setState((prev) => ({
      ...prev,
      customRows: { ...prev.customRows, [stageKey]: [...(prev.customRows[stageKey] ?? []), item] },
    }));
  };
  const removeCustomRow = (stageKey: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      customRows: { ...prev.customRows, [stageKey]: (prev.customRows[stageKey] ?? []).filter((i) => i.id !== itemId) },
    }));
  };

  // ── Commit / change ────────────────────────────────────────────────────
  const stageItems = (stageKey: string): StageItem[] => {
    const authored = content.stages[stageKey] ?? [];
    const custom = state.customRows[stageKey] ?? [];
    return [...authored, ...custom];
  };

  const handlePick = (stageKey: string, itemName: string) => {
    const def = defs[stageKey];
    if (!def || def.criteria.length === 0) return;
    if (!isRowFullyRated(stageKey, itemName, state)) return;

    const items = stageItems(stageKey);
    const top = argmaxScore(stageKey, items, state, def.criteria);
    const isContrarian = top !== null && itemName !== top.name;

    if (isContrarian && !state.justification[stageKey]) {
      setShowJustification(true);
      setJustificationDraft("");
      // stage pick pending; store the intended pick
      setState((prev) => ({ ...prev, pick: { ...prev.pick, [`_pending_${stageKey}`]: itemName } }));
      return;
    }

    commitStage(stageKey, itemName);
  };

  const confirmContrarian = (stageKey: string) => {
    const itemName = state.pick[`_pending_${stageKey}`] ?? "";
    setState((prev) => {
      const { [`_pending_${stageKey}`]: _removed, ...restPick } = prev.pick;
      return {
        ...prev,
        pick: { ...restPick, [stageKey]: itemName },
        justification: { ...prev.justification, [stageKey]: justificationDraft },
        committed: { ...prev.committed, [stageKey]: true },
      };
    });
    setShowJustification(false);
    setJustificationDraft("");
    // unlock next
    const idx = order.indexOf(stageKey);
    if (idx < order.length - 1) setCurrentStage(order[idx + 1]);
  };

  const commitStage = (stageKey: string, itemName: string) => {
    setState((prev) => ({
      ...prev,
      pick: { ...prev.pick, [stageKey]: itemName },
      committed: { ...prev.committed, [stageKey]: true },
    }));
    const idx = order.indexOf(stageKey);
    if (idx < order.length - 1) setCurrentStage(order[idx + 1]);
  };

  const changeStage = (stageKey: string) => {
    // Un-commit stageKey and all downstream stages.
    const idx = order.indexOf(stageKey);
    setState((prev) => {
      const committed = { ...prev.committed };
      const pick = { ...prev.pick };
      const justification = { ...prev.justification };
      for (let i = idx; i < order.length; i++) {
        committed[order[i]] = false;
        delete pick[order[i]];
        delete justification[order[i]];
      }
      return { ...prev, committed, pick, justification };
    });
    setCurrentStage(stageKey);
  };

  // ── Pitch submit ───────────────────────────────────────────────────────
  const wordCount = state.pitchText.trim().split(/\s+/).filter(Boolean).length;
  const pitchReady = wordCount >= 20 && wordCount <= 150;

  const submitPitch = () => {
    setState((prev) => ({ ...prev, submittedAt: Date.now() }));
    onComplete({ state, content, points: points.total });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-in">
      {/* Header: question + timer + points */}
      <div className="flex items-start gap-3">
        <button onClick={onExit} className="hover:bg-paper-dark rounded-sketch p-1 transition-colors flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-hand text-xl font-bold leading-tight">{question.text}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-xs text-gray-mid">{question.source_company} - {question.type.replace("_", " ")}</span>
            <span className={`font-mono text-xs font-bold flex items-center gap-1 ${overTarget ? "text-amber-600" : "text-gray-dark"}`}>
              <Clock size={12} />
              {formatTime(state.elapsedSeconds)}
              {overTarget && <span className="text-amber-600">over target</span>}
            </span>
            <span className="font-mono text-xs font-bold flex items-center gap-1 border-2 border-ink px-2 py-0.5 rounded-sketch">
              <Zap size={12} />
              {points.total} pts
            </span>
          </div>
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="flex items-center gap-1 flex-wrap">
        {order.map((sKey, i) => {
          const def = defs[sKey];
          const isActive = sKey === currentStage;
          const isCompleted = !!state.committed[sKey] || (sKey === "framing" && Object.keys(state.framingAnswers).length > 0);
          const isLocked = !isStageUnlocked(sKey, order, state, content);
          return (
            <div key={sKey} className="flex items-center">
              <button
                onClick={() => { if (!isLocked) setCurrentStage(sKey); }}
                disabled={isLocked}
                className="flex flex-col items-center gap-1"
              >
                <div className={`stage-badge ${isActive ? "stage-badge-active" : isCompleted ? "stage-badge-completed" : isLocked ? "stage-badge-locked" : ""}`}>
                  {isCompleted ? <Check size={16} /> : isLocked ? <Lock size={14} /> : i + 1}
                </div>
                <span className={`font-body text-xs ${isActive ? "font-bold" : isLocked ? "text-gray-mid" : ""}`}>
                  {def.shortLabel}
                </span>
              </button>
              {i < order.length - 1 && <div className="w-6 sm:w-8 h-0.5 bg-gray-light mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Loading / error state */}
      {contentLoading && (
        <div className="sketch-card text-center py-16">
          <Loader className="w-8 h-8 mx-auto mb-3 animate-spin text-gray-mid" />
          <p className="font-hand text-xl text-gray-dark mb-1">Building your scenario...</p>
          <p className="font-body text-sm text-gray-mid">Generating question-specific segments, pains, and solutions.</p>
        </div>
      )}

      {contentError && !contentLoading && (
        <div className="sketch-card text-center py-12">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-600" />
          <p className="font-hand text-xl text-red-600 mb-1">Couldn't load content</p>
          <p className="font-body text-sm text-gray-mid mb-4">{contentError}</p>
          <button onClick={() => window.location.reload()} className="btn-outline text-sm">Retry</button>
        </div>
      )}

      {/* Current stage content */}
      {!contentLoading && !contentError && currentStage === "framing" ? (
        <FramingStage
          def={defs.framing}
          questions={content.framing ?? []}
          answers={state.framingAnswers}
          customAssumptions={state.customAssumptions}
          onAnswer={setFramingAnswer}
          onAssumptions={(v) => setState((prev) => ({ ...prev, customAssumptions: v }))}
          unlockedCount={Object.keys(state.framingAnswers).length}
          onNext={goNext}
          hasNext={stageIdx < order.length - 1}
        />
      ) : !contentLoading && !contentError && (currentStage === "pitch" || currentStage === "decision" || currentStage === "recommendation") ? (
        <PitchStage
          def={defs[currentStage]}
          state={state}
          order={order}
          defs={defs}
          content={content}
          stageItems={stageItems}
          onPitch={(v) => setState((prev) => ({ ...prev, pitchText: v }))}
          onSubmit={submitPitch}
          wordCount={wordCount}
          pitchReady={pitchReady}
          unlocked={isStageUnlocked(currentStage, order, state, content)}
          prevStageLabel={defs[order[stageIdx - 1]]?.label ?? "previous"}
        />
      ) : !contentLoading && !contentError ? (
        <RatingStage
          def={defs[currentStage]}
          items={stageItems(currentStage)}
          state={state}
          onRate={(itemName, critIdx, value) => setRating(currentStage, itemName, critIdx, value)}
          onPick={(itemName) => handlePick(currentStage, itemName)}
          onAddCustom={(name, desc) => addCustomRow(currentStage, name, desc)}
          onRemoveCustom={(itemId) => removeCustomRow(currentStage, itemId)}
          committed={!!state.committed[currentStage]}
          pickedName={state.pick[currentStage] ?? null}
          onChange={() => changeStage(currentStage)}
          showJustification={showJustification && state.pick[`_pending_${currentStage}`] !== undefined}
          justificationDraft={justificationDraft}
          onJustificationChange={setJustificationDraft}
          onConfirmContrarian={() => confirmContrarian(currentStage)}
          pendingPick={state.pick[`_pending_${currentStage}`] ?? null}
          unlocked={isStageUnlocked(currentStage, order, state, content)}
          prevStageLabel={defs[order[stageIdx - 1]]?.label ?? "previous"}
          committedSegmentId={state.pick.segments}
          committedPainId={state.pick.pains ? (content.stages.pains?.find((p) => p.name === state.pick.pains)?.id) : null}
          onNext={goNext}
          hasNext={stageIdx < order.length - 1}
        />
      ) : null}

      {/* Points breakdown */}
      {points.breakdown.length > 0 && (
        <div className="sketch-card flex flex-wrap gap-2 items-center">
          <span className="font-mono text-xs font-bold uppercase text-gray-dark">Points:</span>
          {points.breakdown.map((b, i) => (
            <span key={i} className="font-mono text-xs border border-ink px-1.5 py-0.5 rounded-sketch">
              {b.label} +{b.amount}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Parse content from question.chip_options ─────────────────────────────
function parseContent(q: Question): GymContent {
  const raw = q.chip_options as unknown as GymContent;
  if (raw && raw.stages && Object.keys(raw.stages).length > 0) return raw;
  return generateDefaultContent(q.type as QuestionType);
}

// ══════════════════════════════════════════════════════════════════════════
// Framing Stage
// ══════════════════════════════════════════════════════════════════════════
function FramingStage({
  def,
  questions,
  answers,
  customAssumptions,
  onAnswer,
  onAssumptions,
  unlockedCount,
  onNext,
  hasNext,
}: {
  def: StageDef;
  questions: FramingQuestion[];
  answers: Record<string, string>;
  customAssumptions: string;
  onAnswer: (qId: string, option: string) => void;
  onAssumptions: (v: string) => void;
  unlockedCount: number;
  onNext: () => void;
  hasNext: boolean;
}) {
  return (
    <div className="sketch-card" style={{ boxShadow: "4px 4px 0 var(--ink)" }}>
      <h3 className="font-hand text-2xl font-bold mb-1">{def.label}</h3>
      <p className="font-body text-sm text-gray-dark mb-4">{def.description}</p>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-body text-sm font-bold mb-2">
              <span className="font-mono text-xs text-gray-mid mr-1">{qi + 1}.</span>
              {q.prompt}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onAnswer(q.id, opt)}
                    className={`chip text-sm ${selected ? "chip-selected" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Optional assumptions */}
      <div className="mt-5 pt-4 border-t-2 border-gray-light">
        <p className="font-body text-sm font-bold mb-1">Assumptions (optional)</p>
        <textarea
          value={customAssumptions}
          onChange={(e) => onAssumptions(e.target.value)}
          className="sketch-textarea min-h-[80px] text-sm"
          placeholder="Add any assumptions you're making..."
        />
      </div>

      <div className="mt-4 pt-3 border-t-2 border-gray-light flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-gray-mid">
          {unlockedCount} of {questions.length} answered
          {unlockedCount > 0 ? " — next stage unlocked" : " — answer one to unlock the next stage"}
        </p>
        {hasNext && unlockedCount > 0 && (
          <button onClick={onNext} className="btn-ink flex items-center gap-2">
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Rating Stage (segments, pains, solutions, hypotheses, metrics, options)
// ══════════════════════════════════════════════════════════════════════════
function RatingStage({
  def,
  items,
  state,
  onRate,
  onPick,
  onAddCustom,
  onRemoveCustom,
  committed,
  pickedName,
  onChange,
  showJustification,
  justificationDraft,
  onJustificationChange,
  onConfirmContrarian,
  pendingPick,
  unlocked,
  prevStageLabel,
  committedSegmentId,
  committedPainId,
  onNext,
  hasNext,
}: {
  def: StageDef;
  items: StageItem[];
  state: GymState;
  onRate: (itemName: string, critIdx: number, value: RatingValue) => void;
  onPick: (itemName: string) => void;
  onAddCustom: (name: string, desc: string) => void;
  onRemoveCustom: (itemId: string) => void;
  committed: boolean;
  pickedName: string | null;
  onChange: () => void;
  showJustification: boolean;
  justificationDraft: string;
  onJustificationChange: (v: string) => void;
  onConfirmContrarian: () => void;
  pendingPick: string | null;
  unlocked: boolean;
  prevStageLabel: string;
  committedSegmentId?: string;
  committedPainId?: string | null;
  onNext: () => void;
  hasNext: boolean;
}) {
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  if (!unlocked) {
    return (
      <div className="sketch-card text-center py-12">
        <Lock className="w-8 h-8 mx-auto mb-3 text-gray-mid" />
        <p className="font-hand text-xl text-gray-mid mb-1">Locked</p>
        <p className="font-body text-sm text-gray-mid">Commit {prevStageLabel} first to unlock this stage.</p>
      </div>
    );
  }

  const stageCanCommit = canCommitStage(def.key, items, state);
  const top = argmaxScore(def.key, items, state, def.criteria);

  return (
    <div className="sketch-card" style={{ boxShadow: "4px 4px 0 var(--ink)" }}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="font-hand text-2xl font-bold">{def.label}</h3>
          <p className="font-body text-sm text-gray-dark">{def.description}</p>
        </div>
        {committed && pickedName && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono text-xs border-2 border-ink px-2 py-1 rounded-sketch font-bold flex items-center gap-1">
              <Check size={12} /> {def.pickVerb}: {pickedName}
            </span>
            <button onClick={onChange} className="btn-outline py-1 px-2 text-xs flex items-center gap-1">
              <RotateCcw size={12} /> Change
            </button>
          </div>
        )}
      </div>

      {/* Rating table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left font-mono text-xs uppercase py-2 pr-2 w-1/3">Item</th>
              {def.criteria.map((c) => (
                <th key={c.key} className="font-mono text-xs uppercase py-2 px-1 text-center">
                  {c.label}
                  {c.inverted && <span className="text-amber-600 ml-0.5" title="Inverted">*</span>}
                </th>
              ))}
              <th className="font-mono text-xs uppercase py-2 px-1 text-center">Score</th>
              <th className="font-mono text-xs uppercase py-2 pl-1 text-center">{def.pickVerb}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const score = itemScore(def.key, item.name, state, def.criteria);
              const fullyRated = isRowFullyRated(def.key, item.name, state);
              const isPicked = pickedName === item.name;
              const isPickable = isRowFullyRated(def.key, item.name, state);
              const isTop = top !== null && item.name === top.name && fullyRated;
              const targetsPain = def.key === "solutions" && committedPainId && item.painTags?.includes(committedPainId);

              return (
                <tr key={item.id} className={`border-b border-gray-light ${isPicked ? "bg-paper-dark" : ""}`}>
                  <td className="py-2 pr-2 align-top">
                    <p className="font-body font-bold leading-tight">
                      {item.name}
                      {item.custom && <span className="font-mono text-xs text-gray-mid ml-1">(custom)</span>}
                      {targetsPain && <span className="font-mono text-xs text-amber-600 ml-1">targets your pain</span>}
                    </p>
                    {item.desc && <p className="font-body text-xs text-gray-dark mt-0.5 leading-snug">{item.desc}</p>}
                    {item.custom && (
                      <button
                        onClick={() => onRemoveCustom(item.id)}
                        className="font-mono text-xs text-red-600 hover:underline mt-1"
                      >
                        remove
                      </button>
                    )}
                  </td>
                  {def.criteria.map((c, ci) => {
                    const r = state.ratings[ratingKey(def.key, item.name)] ?? [0, 0, 0];
                    return (
                      <td key={c.key} className="py-2 px-1 text-center">
                        <div className="flex justify-center gap-0.5">
                          {RATING_VALUES.map((v) => (
                            <button
                              key={v}
                              onClick={() => onRate(item.name, ci, v)}
                              className={`w-7 h-7 border border-ink rounded-sketch font-mono text-xs font-bold transition-all ${
                                r[ci] === v ? "bg-ink text-paper" : "bg-paper hover:bg-paper-dark"
                              }`}
                              title={RATING_LABELS[v]}
                            >
                              {v === 3 ? "H" : v === 2 ? "M" : "L"}
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-2 px-1 text-center">
                    {score !== null ? (
                      <span className={`font-mono text-sm font-bold ${isTop ? "text-amber-600" : ""}`}>
                        {score}
                        {isTop && " ★"}
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-gray-mid">—</span>
                    )}
                  </td>
                  <td className="py-2 pl-1 text-center">
                    <button
                      onClick={() => onPick(item.name)}
                      disabled={!isPickable || committed}
                      className={`btn-outline py-1 px-2 text-xs disabled:opacity-30 ${isPicked ? "bg-ink text-paper" : ""}`}
                    >
                      {isPicked ? <Check size={12} /> : def.pickVerb}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {def.criteria.some((c) => c.inverted) && (
        <p className="font-mono text-xs text-amber-600 mt-2">* Inverted: strong rating = less opportunity.</p>
      )}

      {/* Contrarian justification */}
      {showJustification && pendingPick && (
        <div className="mt-4 border-2 border-amber-500 rounded-sketch p-3 bg-amber-50">
          <p className="font-body text-sm font-bold mb-1">
            You picked "{pendingPick}" but it's not your top score. Explain why (one line):
          </p>
          <input
            type="text"
            value={justificationDraft}
            onChange={(e) => onJustificationChange(e.target.value)}
            className="sketch-input"
            placeholder="I'm picking this because..."
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={onConfirmContrarian}
              disabled={!justificationDraft.trim()}
              className="btn-ink py-1 text-xs disabled:opacity-30"
            >
              Confirm contrarian pick
            </button>
          </div>
        </div>
      )}

      {/* Custom row add */}
      {def.allowCustom && !committed && (
        <div className="mt-4 pt-3 border-t-2 border-gray-light">
          <p className="font-body text-sm font-bold mb-2">Add your own (optional, never blocks progression)</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="sketch-input flex-1"
              placeholder="Name..."
            />
            <input
              type="text"
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              className="sketch-input flex-1"
              placeholder="Short description..."
            />
            <button
              onClick={() => {
                if (customName.trim()) {
                  onAddCustom(customName.trim(), customDesc.trim());
                  setCustomName("");
                  setCustomDesc("");
                }
              }}
              disabled={!customName.trim()}
              className="btn-outline flex items-center gap-1 disabled:opacity-30"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}

      {/* Stage hint + Next */}
      {!committed && (
        <div className="mt-4 pt-3 border-t-2 border-gray-light flex items-center justify-between gap-3">
          <p className="font-mono text-xs text-gray-mid">
            {stageCanCommit
              ? `All provided rows rated — pick your ${def.pickVerb.toLowerCase()} to commit and unlock the next stage.`
              : "Rate all provided rows (H/M/L for each criterion) to enable picking."}
          </p>
        </div>
      )}
      {committed && hasNext && (
        <div className="mt-4 pt-3 border-t-2 border-gray-light flex justify-end">
          <button onClick={onNext} className="btn-ink flex items-center gap-2">
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Pitch / Decision / Recommendation Stage
// ══════════════════════════════════════════════════════════════════════════
function PitchStage({
  def,
  state,
  order,
  defs,
  content,
  stageItems,
  onPitch,
  onSubmit,
  wordCount,
  pitchReady,
  unlocked,
  prevStageLabel,
}: {
  def: StageDef;
  state: GymState;
  order: string[];
  defs: Record<string, StageDef>;
  content: GymContent;
  stageItems: (stageKey: string) => StageItem[];
  onPitch: (v: string) => void;
  onSubmit: () => void;
  wordCount: number;
  pitchReady: boolean;
  unlocked: boolean;
  prevStageLabel: string;
}) {
  const overLimit = wordCount > 150;

  if (!unlocked) {
    return (
      <div className="sketch-card text-center py-12">
        <Lock className="w-8 h-8 mx-auto mb-3 text-gray-mid" />
        <p className="font-hand text-xl text-gray-mid mb-1">Locked</p>
        <p className="font-body text-sm text-gray-mid">Commit {prevStageLabel} first to unlock this stage.</p>
      </div>
    );
  }

  // Build summary of committed picks
  const committedStages = order.filter((s) => s !== "framing" && state.committed[s] && defs[s].criteria.length > 0);

  return (
    <div className="sketch-card" style={{ boxShadow: "4px 4px 0 var(--ink)" }}>
      <h3 className="font-hand text-2xl font-bold mb-1">{def.label}</h3>
      <p className="font-body text-sm text-gray-dark mb-4">{def.description}</p>

      {/* Summary sidebar */}
      {committedStages.length > 0 && (
        <div className="space-y-2 mb-4 border-l-4 border-ink pl-3">
          {committedStages.map((sKey) => {
            const def = defs[sKey];
            const pick = state.pick[sKey];
            const items = stageItems(sKey);
            const picked = items.find((i) => i.name === pick);
            const score = pick ? itemScore(sKey, pick, state, def.criteria) : null;
            return (
              <div key={sKey}>
                <p className="font-mono text-xs text-gray-mid uppercase">{def.label}</p>
                <p className="font-body text-sm font-bold">
                  {pick ?? "—"} {score !== null && <span className="font-mono text-xs text-gray-dark">({score} pts)</span>}
                </p>
                {picked?.desc && <p className="font-body text-xs text-gray-dark">{picked.desc}</p>}
              </div>
            );
          })}
        </div>
      )}

      <textarea
        value={state.pitchText}
        onChange={(e) => onPitch(e.target.value)}
        className="sketch-textarea min-h-[200px]"
        placeholder={def.key === "pitch" ? "Insight in sentence one, then the solution, end with north star metric plus one guardrail." : "Write your recommendation..."}
      />

      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <span className={`font-mono text-sm ${overLimit ? "text-red-600 font-bold" : wordCount < 20 ? "text-gray-mid" : "text-gray-dark"}`}>
          {wordCount} / 150 words {wordCount < 20 && `(min 20)`} {overLimit && "(over limit)"}
        </span>
        <button
          onClick={onSubmit}
          disabled={!pitchReady}
          className="btn-ink flex items-center gap-2 disabled:opacity-30"
        >
          Submit for grading
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
