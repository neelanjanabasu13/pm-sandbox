import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';

const read = name => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const questions = read('ai_pm_questions.json');
const answers = read('ai_pm_answers.json');
const drills = read('ai_pm_drills.json');
const source = readFileSync(new URL('../src/lib/gym.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const gym = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
assert.equal(questions.length, 167);
assert.equal(questions.filter(q => q.source_company === 'Anthropic').length, 35);
for (const q of questions) {
  const content = drills[q.source_id];
  assert.ok(answers[q.source_id], `${q.source_id} answer missing`);
  assert.ok(gym.isCompleteGymContent(q.type, content), `${q.source_id} stages incomplete`);
  const state = gym.emptyGymState();
  const order = gym.STAGE_ORDER[q.type];
  assert.equal(gym.isStageUnlocked(order[1], order, state, content), false);
  state.framingAnswers[content.framing[0].id] = content.framing[0].options[0];
  assert.equal(gym.isStageUnlocked(order[1], order, state, content), true);
  for (const [key, items] of Object.entries(content.stages)) {
    assert.equal(gym.canCommitStage(key, items, state), false, `${q.source_id} ${key} starts prematurely committed`);
    for (const item of items) state.ratings[gym.ratingKey(key, item.name)] = [3, 2, 1];
    assert.equal(gym.canCommitStage(key, items, state), true, `${q.source_id} ${key} cannot commit`);
    assert.ok(gym.argmaxScore(key, items, state, gym.STAGE_DEFS[q.type][key].criteria));
  }
}
assert.equal(gym.isCompleteGymContent('product_sense', {
  framing: [{ id: 'f1', prompt: 'Choose a workflow', options: ['CRM', 'Reports'] }],
  stages: { segments: [{ id: 's1', name: 'Developers', desc: 'A partial mock' }] },
}), false, 'Partial test fixture must not be treated as a complete authored exercise');
console.log('PASS: 167 complete drills, 35 Anthropic questions, rating/commit progression, and partial-content rejection');
