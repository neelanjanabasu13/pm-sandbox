import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SampleAnswerContent {
  label: string;
  framing: string;
  recommendation: string;
  rationale: string;
  metrics: string;
  tradeoff: string;
  validation: string;
}

export interface Question {
  id: string;
  text: string;
  type: "product_sense" | "execution" | "strategy";
  source_company: string | null;
  interview_type: string | null;
  job_title: string | null;
  source_companies: string[];
  source_metadata?: { collection?: string; [key: string]: unknown };
  sample_answer?: SampleAnswerContent | null;
  is_daily: boolean;
  daily_date: string | null;
  chip_options: Record<string, unknown>;
  created_at: string;
}

export interface Session {
  id: string;
  question_id: string;
  user_id: string | null;
  current_stage: string;
  status: "in_progress" | "completed" | "graded";
  pitch_text: string | null;
  score: number | null;
  grader_feedback: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionResponse {
  id: string;
  session_id: string;
  stage: string;
  items: string[];
  prioritization: string[];
  ai_suggestions: string[];
  created_at: string;
  updated_at: string;
}

export const STAGES = [
  { key: "frame_it", label: "Frame It", description: "Set the context, goal, and scope" },
  { key: "target_users", label: "Target Users", description: "Who are you building for?" },
  { key: "pain_points", label: "Pain Points", description: "What problems do they have?" },
  { key: "solutions", label: "Solutions", description: "How would you solve them?" },
  { key: "pitch", label: "The Pitch", description: "Put it all together in 150 words" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const LISTING_STAGES: StageKey[] = ["frame_it", "target_users", "pain_points", "solutions"];
export const PITCH_STAGE: StageKey = "pitch";

export function getStageIndex(stage: string): number {
  return STAGES.findIndex((s) => s.key === stage);
}

export function getNextStage(stage: string): string | null {
  const idx = getStageIndex(stage);
  if (idx < 0 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1].key;
}

export function isStageUnlocked(stage: string, completedStages: Set<string>): boolean {
  const idx = getStageIndex(stage);
  if (idx === 0) return true;
  const prevKey = STAGES[idx - 1].key;
  return completedStages.has(prevKey);
}
