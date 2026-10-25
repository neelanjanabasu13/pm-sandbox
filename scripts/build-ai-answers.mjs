import { readFileSync, writeFileSync } from 'node:fs';
import { drafts } from './ai-answer-drafts.mjs';

// Related prompts share a measurement contract, but preserve each prompt's focus.
const instagramPrompts = {
  Q087: 'The rationale is to help Instagram users move from inspiration to shared plans inside DMs without leaving the conversation.',
  Q088: 'For the broad experience prompt, I would clarify whether the interviewer wants product strategy, design, or measurement; I would start with a user job.',
  Q089: 'I would define goals before metrics: help people resolve an intended task in DMs while protecting the value of human conversation.',
  Q091: 'I would separate success, health, and performance: useful outcomes, ecosystem and trust guardrails, and operational service quality.',
  Q093: 'I would design an explicitly invoked assistant for shared planning in Instagram DMs, then connect its design to a measurable user outcome.',
  Q095: 'Given automated replies and fun experiences, I would distinguish useful assistance from novelty and protect authentic human communication.',
  Q097: 'The strategic rationale is reducing friction between discovering something on Instagram and coordinating it with another person.',
  Q098: 'For automated responses, inquiries, and fun experiences, I would define separate task-success rubrics instead of treating every AI exchange as equally valuable.',
  Q100: 'Before launching an Instagram DM chatbot, I would validate demand for an optional planning assistant rather than assume users want AI in their inbox.',
  Q102: 'For the Instagram messenger AI assistant, I would prioritize useful task completion and retained voluntary use over message generation.',
  Q103: 'Instagram should build the chatbot only if it helps users turn inspiration into action while maintaining trust in DMs.',
  Q104: 'For an Instagram DM assistant, I would define a completed assistance job and verify its value to the person using it.',
  Q105: 'I would connect the business rationale, goal, and metric through one clear job: helping people coordinate something they discovered on Instagram.',
  Q106: 'I would distinguish the launch goal from ongoing health: useful voluntary adoption first, then sustainable reliable use without harming messaging.',
  Q135: 'As the Meta AI PM for Instagram DMs, I would set a user-value goal and explicitly account for effects on human conversations.',
  Q136: 'I would define success as an incremental improvement in useful DM outcomes, then choose metrics with a stable denominator.',
  Q137: 'For the new Instagram AI chat, I would separate initial activation from repeat usefulness; curiosity alone does not justify the product.',
  Q139: 'For a bot in Instagram DMs, I would measure solved user jobs and avoid rewarding retries or unusually long chats.',
  Q140: 'I would measure Meta AI in Instagram DMs at three levels: useful task outcomes, retained adoption, and messaging health.',
  Q141: 'The rationale for building AI into Instagram DMs is helping users complete contextual tasks more easily, provided it creates incremental value.',
  Q142: 'I would define an AI session by an intended job, not an arbitrary message boundary, and audit whether the job actually completed.',
  Q147: 'For Instagram DM AI, I would establish a baseline and a long-term holdout so placement-driven activity is not mistaken for net product benefit.',
  Q150: 'For the underspecified AI-in-DMs strategy prompt, I would clarify the user and choose an optional shared-planning wedge before discussing broad assistant scope.',
  Q151: 'I would first clarify whether Meta AI means the DM assistant or another Instagram surface; assume DMs and define a useful task.',
  Q155: 'The goal is repeated useful assistance in DMs, with an explicit promise that core human messaging stays easy and reliable.',
  Q158: 'I would set goals for an initial Instagram DM AI launch using a metric tree, then choose a numerical target from baseline data rather than inventing one.',
};
for (const [id, framing] of Object.entries(instagramPrompts)) {
  drafts[id] = [framing,
    'Start with opt-in help planning activities from shared posts: summarize options, clarify constraints, and produce a proposal users can edit and share.',
    'This complements Instagram discovery and human coordination. Define a successful session as a completed intended task with confirmed usefulness, calibrated through sampled independent audits.',
    'North star: weekly people completing a useful AI task. Track exposure-to-activation, successful-session rate, repeat use, p95 latency, cost, harmful outputs, and human-message response time.',
    'AI engagement may displace valuable conversations. More messages or forced trials are not sufficient; preserve privacy, clear invocation, and easy dismissal.',
    'Run user-level randomized rollout with a persistent holdout, segment by new versus returning users and task, and expand only if incremental usefulness improves without breaching messaging or trust guardrails.'];
}
drafts.Q099 = [
  'I would clarify whether the north star rose or fell, whether the change is real, and whether its success definition or instrumentation changed.',
  'Decompose weekly successful users into exposure, activation, task success, and retention, then segment by placement, model version, language, and task.',
  'A rise can reflect genuine value or forced placement; a fall can reflect a regression or tasks becoming easier. Compare independent task audits and human-message health.',
  'Inspect verified useful tasks, success per exposed user, repeated use, latency, harmful output, DM response time, and a long-term untreated holdout.',
  'Do not launch growth features merely to recover the aggregate number. Repair quality or instrumentation if that is the causal constraint.',
  'Use the first changed cohort and timestamp to identify a hypothesis, test it against unaffected users, and keep or reverse the change based on total user value.'];
drafts.Q101 = [
  'Meta should add AI to DMs only if it helps people complete useful tasks around communication and discovery; top-center placement and music or video are separate hypotheses.',
  'Start with optional planning assistance, test prominent placement against a smaller entry point, and add multimodal inputs only for jobs where they materially improve completion.',
  'Leadership preference is not evidence. Music and video may help shared discovery but also increase latency, cost, content-rights complexity, and privacy exposure.',
  'Track weekly useful-task users, success per exposed user, retained use, human-message response, satisfaction, harmful outputs, p95 latency, and cost.',
  'Prominence can increase AI trials while making unread messages harder to find. Predefine a messaging-health floor and allow dismissal.',
  'Run placement and modality experiments separately so effects are identifiable; expand only when incremental task value outweighs displacement and operational cost.'];
drafts.Q154 = [
  'I would define useful voluntary task completion as the goal, then investigate whether rising AI usage and falling Instagram search reflect healthy substitution or harm.',
  'Compare total successful discovery across search and AI, not just surface-level volume, using matched tasks and a randomized holdout.',
  'If AI answers the same jobs better, lower search usage may be acceptable. If it hides creator discovery or reduces useful human connections, the apparent AI gain is misleading.',
  'Measure combined discovery success, creator reach, retained satisfaction, useful AI tasks, search success, latency, cost, and DM health.',
  'Different surfaces may use incompatible event definitions or double-count one task. Reconcile user journeys before drawing conclusions.',
  'Segment by task and cohort, inspect downstream engagement quality, and recommend broader rollout only if the combined ecosystem outcome improves.'];

const questions = JSON.parse(readFileSync(new URL('../data/ai_pm_questions.json', import.meta.url), 'utf8'));
const fields = ['framing', 'recommendation', 'rationale', 'metrics', 'tradeoff', 'validation'];
const answers = {};
for (const q of questions) {
  const draft = drafts[q.source_id];
  if (!draft || draft.length !== fields.length || draft.some(s => typeof s !== 'string' || s.length < 40)) {
    throw new Error(`Missing or incomplete answer: ${q.source_id}`);
  }
  answers[q.source_id] = { label: 'Illustrative sample answer', ...Object.fromEntries(fields.map((key, i) => [key, draft[i]])) };
}
const output = JSON.stringify(answers, null, 2) + '\n';
const target = new URL('../data/ai_pm_answers.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Answers differ from authored drafts');
  console.log(`Verified ${Object.keys(answers).length} complete sample answers`);
} else {
  writeFileSync(target, output);
  console.log(`Wrote ${Object.keys(answers).length} complete sample answers`);
}
