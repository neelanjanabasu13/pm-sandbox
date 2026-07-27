-- Backfill default metrics for product_sense questions that have stages but no metrics.
-- ~317 questions have segments/pains/solutions but are missing the metrics stage,
-- which leaves the Metrics stage empty in the UI.

UPDATE questions
SET chip_options = jsonb_set(
  chip_options,
  '{stages,metrics}',
  '[
    {"id":"m1","name":"Activation rate","desc":"% of new users who reach the aha moment within first session."},
    {"id":"m2","name":"7-day retention","desc":"% of users who return within 7 days of first use."},
    {"id":"m3","name":"Guardrail: core metric stability","desc":"Ensure the primary business metric doesn''t regress during the experiment."},
    {"id":"m4","name":"Time-to-first-value","desc":"How long from signup to the user''s first meaningful outcome."}
  ]'::jsonb
)
WHERE type = 'product_sense'
  AND chip_options ? 'stages'
  AND NOT (chip_options->'stages' ? 'metrics');
