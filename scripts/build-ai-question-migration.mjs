import { readFileSync, writeFileSync } from 'node:fs';

const rows = JSON.parse(readFileSync(new URL('../data/ai_pm_questions.json', import.meta.url), 'utf8'));
const answers = JSON.parse(readFileSync(new URL('../data/ai_pm_answers.json', import.meta.url), 'utf8'));
const drills = JSON.parse(readFileSync(new URL('../data/ai_pm_drills.json', import.meta.url), 'utf8'));
if (rows.length !== 167 || new Set(rows.map(q => q.source_id)).size !== 167) {
  throw new Error('Expected 167 distinct workbook questions');
}
for (const q of rows) {
  if (!q.text || !['product_sense', 'execution', 'strategy'].includes(q.type) || !answers[q.source_id] || !drills[q.source_id]) {
    throw new Error(`Invalid question or missing answer: ${q.source_id}`);
  }
}
const payload = JSON.stringify(rows.map(q => ({ ...q, sample_answer: answers[q.source_id], chip_options: drills[q.source_id] })));
if (payload.includes('$ai_questions$') || payload.includes('$import$')) throw new Error('SQL delimiter collision');
const sql = `-- Imported from AI PM Product Question Bank (167 questions, 24 Oct).xlsx.
-- Sample answers are illustrative authored practice material, not source quotations.
-- Full interactive stages are supplied; first-open AI generation is not required.
-- Exact-text matches keep their IDs and session history.
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS sample_answer jsonb;

DO $import$
DECLARE
  q jsonb;
  existing_id uuid;
  metadata jsonb;
  replace_content boolean;
BEGIN
  FOR q IN SELECT value FROM jsonb_array_elements($ai_questions$${payload}$ai_questions$::jsonb)
  LOOP
    metadata := (q - 'text' - 'type' - 'source_company' - 'sample_answer' - 'chip_options')
      || jsonb_build_object('collection', 'ai_pm_question_bank', 'reported_company', q->>'source_company',
        'drill_version', '2026-10-25-v1');
    SELECT id,
      coalesce(source_metadata->>'collection' = 'ai_pm_question_bank'
        AND source_metadata->>'drill_version' IS DISTINCT FROM '2026-10-25-v1', false)
      OR chip_options IS NULL OR chip_options = '{}'::jsonb
      OR jsonb_typeof(chip_options->'framing') IS DISTINCT FROM 'array'
      OR chip_options->'framing' = '[]'::jsonb
      OR NOT (coalesce(chip_options->'stages', '{}'::jsonb) ?&
        CASE type WHEN 'product_sense' THEN ARRAY['segments','pains','solutions','metrics']
          WHEN 'execution' THEN ARRAY['hypotheses','metrics'] ELSE ARRAY['options'] END)
      OR EXISTS (SELECT 1 FROM unnest(
        CASE type WHEN 'product_sense' THEN ARRAY['segments','pains','solutions','metrics']
          WHEN 'execution' THEN ARRAY['hypotheses','metrics'] ELSE ARRAY['options'] END
        ) AS required(stage_key)
        WHERE jsonb_typeof(chip_options->'stages'->stage_key) IS DISTINCT FROM 'array'
          OR chip_options->'stages'->stage_key = '[]'::jsonb)
      INTO existing_id, replace_content FROM public.questions
      WHERE lower(btrim(text)) = lower(btrim(q->>'text'))
      ORDER BY created_at, id LIMIT 1;
    IF existing_id IS NOT NULL THEN
      UPDATE public.questions
        SET source_metadata = coalesce(source_metadata, '{}'::jsonb) || metadata,
            sample_answer = q->'sample_answer',
            source_company = CASE
              WHEN source_company IS NULL OR btrim(source_company) = ''
                OR lower(btrim(source_company)) IN ('unknown', 'unattributed')
              THEN NULLIF(q->>'source_company', 'Unattributed') ELSE source_company END,
            chip_options = CASE WHEN replace_content THEN q->'chip_options' ELSE chip_options END,
            type = CASE WHEN replace_content THEN q->>'type' ELSE type END
        WHERE id = existing_id;
    ELSE
      INSERT INTO public.questions
        (text, type, source_company, source_companies, interview_type, chip_options, source_metadata, sample_answer)
      VALUES (q->>'text', q->>'type', NULLIF(q->>'source_company', 'Unattributed'),
        CASE WHEN q->>'source_company' = 'Unattributed' THEN '{}'::text[] ELSE ARRAY[q->>'source_company'] END,
        'AI PM', q->'chip_options', metadata, q->'sample_answer');
    END IF;
  END LOOP;
END $import$;
`;
const target = new URL('../supabase/migrations/20261025143000_add_ai_pm_question_bank.sql', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== sql) throw new Error('Migration differs from source data');
  console.log('Verified 167 questions, answers, and matching migration');
} else {
  writeFileSync(target, sql);
}
