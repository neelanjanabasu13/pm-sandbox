import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { productProfiles, executionProfiles, strategyOptions } from './ai-drill-profiles.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const questions = read('ai_pm_questions.json');
const assignments = {};
const assign = (name, ids) => ids.split(' ').forEach(id => { assignments[`Q${id.padStart(3, '0')}`] = name; });
assign('enterpriseSafety', '1 8 13 22 23 25 64 67');
assign('enterpriseReports', '2 9 21');
assign('gleanHome', '14');
assign('supportAgent', '16 26 27 28');
assign('geminiProactive', '17');
assign('assistantArchitecture', '29 111');
assign('scheduling', '38');
assign('abuseSafety', '39 114 145');
assign('travelAgents', '42');
assign('hallucinationEvidence', '46 110');
assign('claudeWorkflows', '47 161');
assign('sonnetModel', '48');
assign('claudeCode', '50 116');
assign('recruiterOutreach', '54');
assign('aiDiscovery', '55 72');
assign('datadog', '57');
assign('newClaudeUsers', '59 70');
assign('careerCoach', '71');
assign('researchDelta', '79');
assign('codeReview', '82');
assign('shoppingFraud', '85');
assign('mobileAssistant', '96');
assign('searchAssistant', '107');
assign('chatAds', '112');
assign('smartFridge', '115');
assign('memoryMachine', '119');
assign('beliefMachine', '121 122');
assign('imageCreation', '123 125');
assign('autonomousFleet', '124');
assign('grocery', '148');
assign('animalCommunication', '152');
assign('pickupCoordinator', '156');
assign('netflixPlacement', '160');
assign('inboxAssistant', '163');
assign('renovation', '164');
assign('airbnbPets', '166');
assign('zoom', '19 132');
assign('bias', '40 78');
assign('codingMetrics', '63 86');
assign('instagram', '74 87 89 91 93 95 97 98 100 102 103 104 105 106 135 136 137 139 140 141 142 147 151 155 158');
assign('syntheticSocial', '117 162');

function item(raw, id) {
  const [name, desc] = raw.split('~');
  assert.ok(name && desc, `Incomplete item ${id}: ${raw}`);
  return { id, name, desc };
}
const painId = n => `p_s${Math.floor((n - 1) / 2) + 1}_${(n - 1) % 2 + 1}`;
const framing = (id, prompt, options) => ({ id, prompt, options });
const result = {};
for (const q of questions) {
  const name = assignments[q.source_id] ?? q.source_id;
  if (q.type === 'product_sense') {
    const p = productProfiles[name];
    assert.ok(p, `Missing product profile ${q.source_id}`);
    const segments = p.users.map(([user, pain], i) => ({ id: `s${i + 1}`, name: user, desc: `${user}: ${pain.split('~')[1]}` }));
    const pains = p.users.flatMap(([, a, b], i) => [item(a, `p_s${i + 1}_1`), item(b, `p_s${i + 1}_2`)]);
    const solutions = p.solutions.map(([title, desc, tags], i) => ({ id: `sol${i + 1}`, name: title, desc, painTags: tags.map(painId) }));
    const metrics = p.metrics.map((v, i) => item(v, `m${i + 1}`));
    result[q.source_id] = {
      framing: [
        framing('f1', `For “${q.text}”, which outcome would you prioritize?`, metrics.map(m => m.name)),
        framing('f2', `Whose needs should lead the ${p.scope} scope?`, segments.map(s => s.name)),
        framing('f3', `Which intervention boundary would you choose first for ${p.scope}?`, solutions.slice(0, 4).map(s => s.name)),
      ],
      stages: { segments, pains, solutions, metrics },
    };
    if (q.source_id === 'Q161') result[q.source_id] = JSON.parse(JSON.stringify(result[q.source_id]).replaceAll('Claude', 'Gemini'));
    if (q.source_id === 'Q070') result[q.source_id] = JSON.parse(JSON.stringify(result[q.source_id]).replaceAll('Claude.ai', 'AI assistant').replaceAll('Claude', 'AI assistant'));
    if (q.source_id === 'Q116') result[q.source_id] = JSON.parse(JSON.stringify(result[q.source_id]).replaceAll('Claude Code', 'AI coding assistant'));
  } else if (q.type === 'execution') {
    const p = executionProfiles[name];
    assert.ok(p, `Missing execution profile ${q.source_id}`);
    const hypotheses = p.hypotheses.map((v, i) => item(v, `h${i + 1}`));
    const metrics = p.metrics.map((v, i) => item(v, `m${i + 1}`));
    result[q.source_id] = {
      framing: [
        framing('f1', `For “${q.text}”, which hypothesis would you validate first?`, hypotheses.map(h => h.name)),
        framing('f2', `Which measurement would anchor your decision about ${p.scope}?`, metrics.map(m => m.name)),
      ],
      stages: { hypotheses, metrics },
    };
  } else {
    const options = strategyOptions[q.source_id]?.map((v, i) => item(v, `o${i + 1}`));
    assert.ok(options, `Missing strategy options ${q.source_id}`);
    result[q.source_id] = {
      framing: [
        framing('f1', `For “${q.text}”, which strategic direction would you investigate first?`, options.map(o => o.name)),
        framing('f2', 'Which evidence would most change your commitment between these directions?', options.map(o => `Evidence supporting: ${o.name}`)),
      ],
      stages: { options },
    };
  }
}

// Validate the actual payload consumed by the existing rating-and-commit engine.
for (const q of questions) {
  const c = result[q.source_id];
  assert.equal(c.framing.length, q.type === 'product_sense' ? 3 : 2, q.source_id);
  for (const f of c.framing) assert.equal(f.options.length, 4, `${q.source_id} ${f.id}`);
  const expected = q.type === 'product_sense' ? { segments: 4, pains: 8, solutions: 5, metrics: 4 }
    : q.type === 'execution' ? { hypotheses: 4, metrics: 4 } : { options: 4 };
  for (const [key, count] of Object.entries(expected)) {
    assert.equal(c.stages[key].length, count, `${q.source_id} ${key}`);
    assert.equal(new Set(c.stages[key].map(x => x.id)).size, count);
    assert.equal(new Set(c.stages[key].map(x => x.name)).size, count);
  }
  if (q.type === 'product_sense') {
    const pains = new Set(c.stages.pains.map(p => p.id));
    for (const s of c.stages.segments) assert.equal(c.stages.pains.filter(p => p.id.startsWith(`p_${s.id}_`)).length, 2);
    for (const s of c.stages.solutions) for (const tag of s.painTags) assert.ok(pains.has(tag), `${q.source_id} bad pain tag`);
    for (const p of pains) assert.ok(c.stages.solutions.some(s => s.painTags.includes(p)), `${q.source_id} unaddressed pain ${p}`);
  }
  if (q.type !== 'strategy') assert.ok(c.stages.metrics.some(m => m.name.startsWith('Guardrail:')));
}
const output = JSON.stringify(result, null, 2) + '\n';
const target = new URL('../data/ai_pm_drills.json', import.meta.url);
if (process.argv.includes('--check')) assert.equal(readFileSync(target, 'utf8'), output);
else writeFileSync(target, output);
console.log(`Verified complete authored drill stages for ${questions.length} questions`);
