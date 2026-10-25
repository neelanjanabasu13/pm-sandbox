// Product Sense Gym — types, stage configs, scoring, unlock, and points logic.
// Pure functions only; no React, no Supabase. UI consumes these.

export type QuestionType = "product_sense" | "execution" | "strategy";

// ── Rating primitives ────────────────────────────────────────────────────
// Rating value: 3 = High, 2 = Med, 1 = Low, 0 = unrated.
export const RATING_VALUES = [3, 2, 1] as const;
export type RatingValue = (typeof RATING_VALUES)[number] | 0;
export const RATING_LABELS: Record<number, string> = { 3: "High", 2: "Med", 1: "Low" };

// ── Stage item (segment, pain, solution, hypothesis, metric, option) ────
export interface StageItem {
  id: string; // stable id; for pains this is the painId solutions tag
  name: string;
  desc: string;
  custom?: boolean; // user-authored
  painTags?: string[]; // solutions only: pain ids this addresses
}

// ── Criterion config per stage ────────────────────────────────────────────
export interface CriterionConfig {
  key: string;
  label: string;
  inverted?: boolean; // strong = less opportunity (e.g. workarounds, gameability)
}

// ── Framing MCQ ───────────────────────────────────────────────────────────
export interface FramingQuestion {
  id: string;
  prompt: string;
  options: string[];
}

// ── Stage definition ─────────────────────────────────────────────────────
export interface StageDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  criteria: CriterionConfig[];
  items?: StageItem[]; // authored rows (segments, solutions, etc.)
  framing?: FramingQuestion[]; // stage 1 only
  allowCustom?: boolean;
  pickVerb: string; // "Pick", "Target", "Build", "Chase", "Commit"
}

// ── Per-question content payload (stored in questions.chip_options) ───────
export interface GymContent {
  framing?: FramingQuestion[];
  stages: Record<string, StageItem[]>; // stageKey -> authored rows
}

// A nonempty stages object alone is insufficient: it can hide missing user,
// pain, solution, or metric stages and strand the rating-and-commit flow.
export function isCompleteGymContent(type: QuestionType, value: unknown): value is GymContent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as GymContent;
  if (!Array.isArray(candidate.framing) || candidate.framing.length === 0 ||
      candidate.framing.some(f => !f.id || !f.prompt || !Array.isArray(f.options) || f.options.length < 2)) return false;
  const required = type === 'product_sense' ? ['segments', 'pains', 'solutions', 'metrics']
    : type === 'execution' ? ['hypotheses', 'metrics'] : ['options'];
  return required.every(key => Array.isArray(candidate.stages?.[key]) && candidate.stages[key].length > 0 &&
    candidate.stages[key].every(item => item.id && item.name && item.desc));
}

// ── Runtime state ────────────────────────────────────────────────────────
export interface GymState {
  framingAnswers: Record<string, string>; // framingQuestionId -> selected option
  customAssumptions: string; // free text in framing
  ratings: Record<string, [RatingValue, RatingValue, RatingValue]>; // `${stageKey}:${itemName}` -> 3 ratings
  customRows: Record<string, StageItem[]>; // stageKey -> user-authored rows
  committed: Record<string, boolean>; // stageKey -> committed
  pick: Record<string, string>; // stageKey -> picked item name
  justification: Record<string, string>; // stageKey -> contrarian justification
  pitchText: string;
  elapsedSeconds: number;
  startedAt: number | null; // epoch ms when first framing answer given
  submittedAt: number | null;
}

export function emptyGymState(): GymState {
  return {
    framingAnswers: {},
    customAssumptions: "",
    ratings: {},
    customRows: {},
    committed: { framing: false, segments: false, pains: false, solutions: false, metrics: false, pitch: false },
    pick: {},
    justification: {},
    pitchText: "",
    elapsedSeconds: 0,
    startedAt: null,
    submittedAt: null,
  };
}

// ── Stage configs per question type ──────────────────────────────────────
export const STAGE_ORDER: Record<QuestionType, string[]> = {
  product_sense: ["framing", "segments", "pains", "solutions", "metrics", "pitch"],
  execution: ["framing", "hypotheses", "metrics", "decision"],
  strategy: ["framing", "options", "recommendation"],
};

export const STAGE_DEFS: Record<QuestionType, Record<string, StageDef>> = {
  product_sense: {
    framing: {
      key: "framing",
      label: "Framing",
      shortLabel: "Frame",
      description: "Set the context, primary goal, and scope. Answer the MCQs; add assumptions if you want.",
      criteria: [],
      pickVerb: "Continue",
    },
    segments: {
      key: "segments",
      label: "Target Users",
      shortLabel: "Users",
      description: "Rate each segment, then pick the one you'd build for.",
      criteria: [
        { key: "reach", label: "Reach" },
        { key: "frequency", label: "Need freq" },
        { key: "underserved", label: "Underserved" },
      ],
      allowCustom: true,
      pickVerb: "Pick",
    },
    pains: {
      key: "pains",
      label: "Pain Points",
      shortLabel: "Pains",
      description: "Pains for your chosen segment. Rate them, then target one. Workarounds is inverted — strong workaround = less opportunity.",
      criteria: [
        { key: "intensity", label: "Intensity" },
        { key: "frequency", label: "Frequency" },
        { key: "workarounds", label: "Workarounds", inverted: true },
      ],
      allowCustom: true,
      pickVerb: "Target",
    },
    solutions: {
      key: "solutions",
      label: "Solutions",
      shortLabel: "Solutions",
      description: "Solutions tagged with the pain they address. Rate, then build one.",
      criteria: [
        { key: "solves", label: "Solves pain" },
        { key: "ease", label: "Ease of build" },
        { key: "differentiation", label: "Differentiation" },
      ],
      allowCustom: true,
      pickVerb: "Build",
    },
    metrics: {
      key: "metrics",
      label: "Metrics",
      shortLabel: "Metrics",
      description: "Rate each metric. Gameability is inverted — easily gamed metrics are weaker signals. Commit a north star + guardrail.",
      criteria: [
        { key: "signal", label: "Signal quality" },
        { key: "gameability", label: "Gameability", inverted: true },
        { key: "ease", label: "Ease of measurement" },
      ],
      allowCustom: true,
      pickVerb: "Commit",
    },
    pitch: {
      key: "pitch",
      label: "The Pitch",
      shortLabel: "Pitch",
      description: "Insight in sentence one, then the solution, end with north star metric plus one guardrail.",
      criteria: [],
      pickVerb: "Submit",
    },
  },
  execution: {
    framing: {
      key: "framing",
      label: "Reframe",
      shortLabel: "Frame",
      description: "Reframe the execution question. What's the goal and what would success look like?",
      criteria: [],
      pickVerb: "Continue",
    },
    hypotheses: {
      key: "hypotheses",
      label: "Hypotheses",
      shortLabel: "Hypo",
      description: "Rate each hypothesis, then commit to the one you'd validate first.",
      criteria: [
        { key: "likelihood", label: "Likelihood" },
        { key: "impact", label: "Impact if true" },
        { key: "speed", label: "Speed to validate" },
      ],
      allowCustom: true,
      pickVerb: "Commit",
    },
    metrics: {
      key: "metrics",
      label: "Metrics",
      shortLabel: "Metrics",
      description: "Rate each metric. Gameability is inverted — easily gamed metrics are weaker signals. Commit a north star + guardrail.",
      criteria: [
        { key: "signal", label: "Signal quality" },
        { key: "gameability", label: "Gameability", inverted: true },
        { key: "ease", label: "Ease of measurement" },
      ],
      allowCustom: true,
      pickVerb: "Commit",
    },
    decision: {
      key: "decision",
      label: "Decision",
      shortLabel: "Decide",
      description: "Make the call. State your decision, the biggest risk, and the reversal trigger.",
      criteria: [],
      pickVerb: "Submit",
    },
  },
  strategy: {
    framing: {
      key: "framing",
      label: "Frame",
      shortLabel: "Frame",
      description: "Frame the strategic context. What market and what bet?",
      criteria: [],
      pickVerb: "Continue",
    },
    options: {
      key: "options",
      label: "Strategic Options",
      shortLabel: "Options",
      description: "Rate each option, then commit to the one you'd recommend.",
      criteria: [
        { key: "market", label: "Market size" },
        { key: "win", label: "Right to win" },
        { key: "speed", label: "Speed to signal" },
      ],
      allowCustom: true,
      pickVerb: "Commit",
    },
    recommendation: {
      key: "recommendation",
      label: "Recommendation",
      shortLabel: "Rec",
      description: "Make the recommendation. State the bet, the risk, and what would change your mind.",
      criteria: [],
      pickVerb: "Submit",
    },
  },
};

// ── Rating helpers ───────────────────────────────────────────────────────
export function ratingKey(stageKey: string, itemName: string): string {
  return `${stageKey}:${itemName}`;
}

export function isRowFullyRated(
  stageKey: string,
  itemName: string,
  state: GymState
): boolean {
  const r = state.ratings[ratingKey(stageKey, itemName)];
  if (!r) return false;
  return r.every((v) => v !== 0);
}

// ── Scoring ──────────────────────────────────────────────────────────────
// Item score = sum over 3 criteria; inverted criteria contribute (4 - value).
export function itemScore(
  stageKey: string,
  itemName: string,
  state: GymState,
  criteria: CriterionConfig[]
): number | null {
  const r = state.ratings[ratingKey(stageKey, itemName)];
  if (!r || r.some((v) => v === 0)) return null;
  let sum = 0;
  criteria.forEach((c, i) => {
    const v = r[i];
    sum += c.inverted ? 4 - v : v;
  });
  return sum;
}

// argmax over fully-rated provided (non-custom) rows. Returns [name, score] or null.
export function argmaxScore(
  stageKey: string,
  items: StageItem[],
  state: GymState,
  criteria: CriterionConfig[]
): { name: string; score: number } | null {
  let best: { name: string; score: number } | null = null;
  for (const item of items) {
    if (item.custom) continue;
    const s = itemScore(stageKey, item.name, state, criteria);
    if (s === null) continue;
    if (!best || s > best.score) best = { name: item.name, score: s };
  }
  return best;
}

// ── Unlock logic ──────────────────────────────────────────────────────────
export function isStageUnlocked(
  stageKey: string,
  order: string[],
  state: GymState,
  content: GymContent
): boolean {
  const idx = order.indexOf(stageKey);
  if (idx <= 0) return true;
  const prevKey = order[idx - 1];
  if (prevKey === "framing") {
    // Framing unlocks stage 2 on FIRST answer.
    return Object.keys(state.framingAnswers).length > 0;
  }
  return !!state.committed[prevKey];
}

export function canPickRow(
  stageKey: string,
  itemName: string,
  state: GymState
): boolean {
  return isRowFullyRated(stageKey, itemName, state);
}

// All provided (non-custom) rows fully rated → stage can be committed.
export function canCommitStage(
  stageKey: string,
  items: StageItem[],
  state: GymState
): boolean {
  const provided = items.filter((i) => !i.custom);
  if (provided.length === 0) return false;
  return provided.every((i) => isRowFullyRated(stageKey, i.name, state));
}

// ── Points ────────────────────────────────────────────────────────────────
export function computePoints(
  type: QuestionType,
  order: string[],
  state: GymState,
  content: GymContent
): { total: number; breakdown: { label: string; amount: number }[] } {
  const breakdown: { label: string; amount: number }[] = [];
  let total = 0;

  // Framing: 10 only when all MCQs answered.
  const framingQs = content.framing ?? [];
  if (framingQs.length > 0 && framingQs.every((q) => state.framingAnswers[q.id])) {
    total += 10;
    breakdown.push({ label: "Framing complete", amount: 10 });
  }

  // 10 per committed stage (excluding framing which is non-committing).
  for (const stageKey of order) {
    if (stageKey === "framing") continue;
    if (state.committed[stageKey]) {
      total += 10;
      breakdown.push({ label: `${stageKey} committed`, amount: 10 });
    }
  }

  // Consistency bonuses.
  const bonusMap: Record<string, number> = {
    segments: 15,
    pains: 15,
    solutions: 10,
    hypotheses: 15,
    metrics: 10,
    options: 15,
  };
  for (const stageKey of order) {
    const bonus = bonusMap[stageKey];
    if (!bonus || !state.committed[stageKey] || !state.pick[stageKey]) continue;
    const items = content.stages[stageKey] ?? [];
    const def = STAGE_DEFS[type][stageKey];
    if (!def || def.criteria.length === 0) continue;
    const top = argmaxScore(stageKey, items, state, def.criteria);
    if (!top) continue;
    if (state.pick[stageKey] === top.name) {
      total += bonus;
      breakdown.push({ label: `${stageKey} consistency`, amount: bonus });
    }
  }

  // Speed bonus: +20 if submitted under 10 minutes.
  if (state.submittedAt !== null && state.elapsedSeconds > 0 && state.elapsedSeconds < 600) {
    total += 20;
    breakdown.push({ label: "Speed bonus", amount: 20 });
  }

  return { total, breakdown };
}

// ── Timer ─────────────────────────────────────────────────────────────────
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const TARGET_SECONDS = 600; // 10 minutes

// ── Default content generator ────────────────────────────────────────────
// For questions without authored chip_options, generate generic stage content
// so the engine always has rows to rate. Framing MCQs are generic but useful;
// stage items are sensible defaults that work for any question of that type.
export function generateDefaultContent(type: QuestionType): GymContent {
  const genericFraming: FramingQuestion[] = [
    {
      id: "f1",
      prompt: "What is the primary goal?",
      options: ["Maximize user growth", "Maximize engagement / retention", "Maximize revenue", "Build a competitive moat"],
    },
    {
      id: "f2",
      prompt: "Who is the primary user we should focus on?",
      options: ["Power users", "Mainstream / casual users", "New users (acquisition)", "Churning / at-risk users"],
    },
    {
      id: "f3",
      prompt: "What scope should we set for this round?",
      options: ["Focus on the core use case only", "Focus on acquisition funnel", "End-to-end: acquisition through retention", "Focus on monetization"],
    },
  ];

  if (type === "product_sense") {
    return {
      framing: genericFraming,
      stages: {
        segments: [
          { id: "s1", name: "Power users", desc: "Heavy, daily users who know the product inside out." },
          { id: "s2", name: "Casual users", desc: "Use the product occasionally for a specific task." },
          { id: "s3", name: "New users", desc: "Just signed up, still learning the ropes." },
          { id: "s4", name: "Churning users", desc: "Were active but engagement is declining." },
        ],
        pains: [
          { id: "p_s1_1", name: "Workflow is too manual", desc: "Power users: repeat the same steps every time, no automation." },
          { id: "p_s1_2", name: "Can't customize the experience", desc: "Power users: want settings/tweaks the product doesn't expose." },
          { id: "p_s1_3", name: "No integrations with their stack", desc: "Power users: have to context-switch between tools." },
          { id: "p_s1_4", name: "Performance bottlenecks at scale", desc: "Power users: hit slowness with large datasets / heavy use." },
          { id: "p_s2_1", name: "Hard to discover key features", desc: "Casual users: only use 20% of the product, miss value." },
          { id: "p_s2_2", name: "UI feels overwhelming", desc: "Casual users: too many options, don't know where to start." },
          { id: "p_s2_3", name: "Forgetting how to do things", desc: "Casual users: long gaps between uses, lose familiarity." },
          { id: "p_s2_4", name: "No quick-start or templates", desc: "Casual users: want to get in, do the thing, get out." },
          { id: "p_s3_1", name: "Onboarding is confusing", desc: "New users: don't understand what the product does in 30 seconds." },
          { id: "p_s3_2", name: "Empty state is intimidating", desc: "New users: sign up, see a blank canvas, don't know what to do." },
          { id: "p_s3_3", name: "No aha moment in first session", desc: "New users: leave before experiencing the core value." },
          { id: "p_s3_4", name: "Setup takes too long", desc: "New users: have to configure too much before seeing value." },
          { id: "p_s4_1", name: "Value proposition faded", desc: "Churning users: no longer feel the product is worth the time." },
          { id: "p_s4_2", name: "Found a substitute", desc: "Churning users: a competitor or manual process replaced the need." },
          { id: "p_s4_3", name: "Notifications feel spammy", desc: "Churning users: turned off by irrelevant pings." },
          { id: "p_s4_4", name: "No reason to come back", desc: "Churning users: nothing pulls them back after the first use." },
        ],
        solutions: [
          { id: "sol1", name: "Guided onboarding flow", desc: "Interactive walkthrough that surfaces the aha moment in the first session.", painTags: ["p_s3_1", "p_s3_2", "p_s3_3", "p_s3_4"] },
          { id: "sol2", name: "Templates and quick-starts", desc: "Pre-built templates so users start from a filled state, not a blank canvas.", painTags: ["p_s2_4", "p_s3_2", "p_s3_4"] },
          { id: "sol3", name: "Progressive disclosure UI", desc: "Show core actions first, reveal advanced features on demand.", painTags: ["p_s2_1", "p_s2_2", "p_s3_1"] },
          { id: "sol4", name: "Re-engagement campaigns", desc: "Smart, low-frequency notifications that pull users back with relevant value.", painTags: ["p_s4_1", "p_s4_3", "p_s4_4"] },
          { id: "sol5", name: "Automation and workflows", desc: "Let power users automate repetitive steps and integrate with their stack.", painTags: ["p_s1_1", "p_s1_3", "p_s1_4"] },
        ],
        metrics: [
          { id: "m1", name: "Activation rate", desc: "% of new users who reach the aha moment within first session." },
          { id: "m2", name: "7-day retention", desc: "% of users who return within 7 days of first use." },
          { id: "m3", name: "Guardrail: core metric stability", desc: "Ensure the primary business metric doesn't regress during the experiment." },
          { id: "m4", name: "Time-to-first-value", desc: "How long from signup to the user's first meaningful outcome." },
        ],
      },
    };
  }

  if (type === "execution") {
    return {
      framing: [
        {
          id: "f1",
          prompt: "What is the core hypothesis we need to validate?",
          options: ["Users will adopt the new feature", "The feature drives the target metric", "The feature won't harm existing metrics", "We can build and ship it fast enough"],
        },
        {
          id: "f2",
          prompt: "What's the biggest risk?",
          options: ["Low user adoption", "Cannibalizing existing behavior", "Technical complexity / delay", "Negative impact on a guardrail metric"],
        },
      ],
      stages: {
        hypotheses: [
          { id: "h1", name: "Users will adopt the feature", desc: "A meaningful % of target users try it within the first week." },
          { id: "h2", name: "The feature moves the primary metric", desc: "Adoption translates into the business outcome we care about." },
          { id: "h3", name: "No regression on guardrail metrics", desc: "The feature doesn't hurt retention, latency, or satisfaction." },
          { id: "h4", name: "We can ship a credible version quickly", desc: "An MVP can be built and tested within the target window." },
        ],
        metrics: [
          { id: "m1", name: "Adoption rate", desc: "% of target users who use the feature at least once." },
          { id: "m2", name: "Retention lift", desc: "Difference in retention between users who engage with the feature and those who don't." },
          { id: "m3", name: "Time-to-first-use", desc: "How long after signup/launch a user first interacts with the feature." },
          { id: "m4", name: "Guardrail: core metric stability", desc: "Ensure the primary business metric doesn't regress during the experiment." },
        ],
      },
    };
  }

  // strategy
  return {
    framing: [
      {
        id: "f1",
        prompt: "What market are we evaluating?",
        options: ["Adjacent market to current users", "New geographic market", "New vertical / use case", "New platform or distribution channel"],
      },
      {
        id: "f2",
        prompt: "What is the core strategic bet?",
        options: ["We can win on product quality", "We can win on distribution / brand", "We can win on price / cost", "We can win on speed to market"],
      },
    ],
    stages: {
      options: [
        { id: "o1", name: "Go deep in current market", desc: "Double down on the existing user base with more features and better retention." },
        { id: "o2", name: "Expand to adjacent market", desc: "Leverage existing capabilities to serve a related but new user segment." },
        { id: "o3", name: "Build a new platform", desc: "Invest in a platform play that opens up multiple future markets." },
        { id: "o4", name: "Acquire or partner", desc: "M&A or strategic partnership to enter the market faster than building." },
      ],
    },
  };
}
