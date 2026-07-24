// Product Sense Gym: one-time content pre-baker (scrape + dedup + generate).
// Runs OFFLINE at build time. One script does everything:
//   1. Fetches the Lewis Lin PM Question Bank (public Google Sheet).
//   2. Dedups to ~2,268 distinct, game-shaped questions (no near-duplicates,
//      so no repeated stage content downstream).
//   3. Writes questions-stems.json (the reviewable question list).
//   4. Calls Gemini once per question to author stage content, writing
//      questions-content.full.json. Resumable: writes as it goes, skips done.
//
// Because this runs ONCE at build time, it never touches your 500/day live
// budget, which stays reserved for the post-pitch evaluation step.
//
// Usage:
//   export GEMINI_API_KEY=your_key
//   node generate-content.mjs            # scrape+dedup, then generate all missing
//   node generate-content.mjs --stems    # only scrape+dedup+write stems, no Gemini
//   MAX=400 node generate-content.mjs    # generate at most 400 this run (stay under a daily cap)
//
// 2,268 questions is more than free Gemini tiers allow per day. The script is
// resumable, so either run it across several days (MAX=... per day) or use a paid
// key once. The 4 hand-authored seed questions are always used verbatim as the
// quality bar and as few-shot examples for the rest.

import fs from "node:fs";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MAX = process.env.MAX ? Number(process.env.MAX) : Infinity;
const STEMS_ONLY = process.argv.includes("--stems");
const SHEET_ID = "1rz10oEeLx-eGnilahKczYPhGfCUzIEKL-xRnjoQ-SX4";
const GID = "1024620532";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}&tq=${encodeURIComponent("select B, C, D")}`;

// ---------- 1. scrape ----------
function parseCSV(s) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else if (c !== "\r") f += c; }
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

// ---------- 2. dedup ----------
const KEEP = /product|sense|design|execution|strateg|metric|analytic|prioriti|roadmap|tradeoff|trade-off|diagnos|improvement|launch|growth|delivery|evaluation|insight/i;
const DROP = /behav|estimat|technical|system design|coding|traditional|program manage|market research|timeline/i;
const STOP = new Set("a an the to for of in on at as is are be would will you your our we us it this that with how what should design build create improve make new product feature app pm manager set define measure success metric metrics goal goals".split(" "));
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const sig = s => { const w = norm(s).split(" ").filter(x => x.length > 3 && !STOP.has(x)); return [...new Set(w)].sort().join(" "); };
const cat = ty => { const t = ty.toLowerCase(); if (/exec|metric|analytic|diagnos|tradeoff|trade-off|prioriti|goal|dashboard|insight|delivery|evaluation/.test(t)) return "execution"; if (/strateg|roadmap|launch|growth/.test(t)) return "strategy"; return "sense"; };

async function scrapeAndDedup() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error("Sheet fetch failed HTTP " + res.status + " (is the sheet public / link-viewable?)");
  const rows = parseCSV(await res.text());
  const out = [], seenExact = new Set(), clusters = new Set();
  for (const rw of rows.slice(1)) {
    const co = (rw[0] || "").trim(), qn = (rw[1] || "").trim().replace(/\s+/g, " "), ty = (rw[2] || "").trim();
    if (qn.length < 28 || qn.length > 260) continue;
    if (!KEEP.test(ty)) continue;
    if (DROP.test(ty) && !/product|sense|design|execution|strateg/i.test(ty)) continue;
    if (/test test|^na$|^n\/a$/i.test(qn)) continue;
    if ((qn.match(/\b[1-9]\)/g) || []).length >= 2) continue; // drop multi-part mega-questions
    const ex = norm(qn); if (seenExact.has(ex)) continue; seenExact.add(ex);
    const s = sig(qn); if (!s || s.split(" ").length < 2) continue;
    if (clusters.has(s)) continue; clusters.add(s); // near-duplicate: same content-word set
    out.push({ co, ty, qn });
  }
  const order = { sense: 0, execution: 1, strategy: 2 };
  return out.map(o => ({ ...o, c: cat(o.ty) }))
    .sort((a, b) => order[a.c] - order[b.c])
    .map((o, i) => ({ id: i + 1, company: (o.co || "Unknown").replace(/\s+/g, " ").trim(), type: o.c, text: o.qn }));
}

// ---------- 3. content generation ----------
const SEED = JSON.parse(fs.readFileSync("questions-content.seed.json", "utf8"));
const SHAPE = {
  sense: "Return JSON with keys: framing (array of 2-3 {q, opts[]}), segments (exactly 4 {n, d}), pains (array of 4 arrays matching segment order, each 4 {id, n, d}; ids A1-A4,B1-B4,C1-C4,D1-D4), solutions (4-5 {n, d, tags[]} referencing pain ids), metrics (array matching solution order, each 4-5 {n, d}; include 1-2 trap metrics like time-in-app or raw DAU).",
  execution: "Return JSON with keys: framing (array of 2-3 {q, opts[]}), hypotheses (4-5 {n, d} candidate causes/drivers), metrics (4-5 {n, d}; include 1-2 trap metrics like raw DAU or time-in-app).",
  strategy: "Return JSON with keys: framing (array of 2-3 {q, opts[]}), options (3-4 {n, d} strategic options), metrics (4-5 {n, d} success measures; include 1-2 trap metrics like vanity installs or time-in-app)."
};
function buildPrompt(stem) {
  const ex = SEED.questions.find(q => q.type === stem.type) || SEED.questions[0];
  const exSlim = { framing: ex.framing, ...(ex.segments ? { segments: ex.segments } : {}) };
  return `You author content for a PM interview practice game. Question (${stem.company}, ${stem.type}): "${stem.text}".
${SHAPE[stem.type]}
Keep n fields under 8 words and d fields under 12 words. Be specific to THIS exact question, not generic. Segments/options must be genuinely distinct. Pains must be specific to their segment. Include at least one deliberately tempting BAD metric.
Match this example's structure and tone (a different question):
${JSON.stringify(exSlim)}
Output ONLY minified JSON, no markdown, no commentary.`;
}
async function genContent(stem, tries = 3) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body = { contents: [{ parts: [{ text: buildPrompt(stem) }] }], generationConfig: { temperature: 0.6, responseMimeType: "application/json" } };
  for (let a = 1; a <= tries; a++) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const data = JSON.parse(j.candidates?.[0]?.content?.parts?.[0]?.text);
      return { ...stem, ...data };
    } catch (e) {
      console.warn(`  id ${stem.id} attempt ${a} failed: ${e.message}`);
      await new Promise(res => setTimeout(res, 1500 * a));
    }
  }
  return null;
}

// ---------- run ----------
console.log("Scraping and deduping the question bank...");
const stems = await scrapeAndDedup();
fs.writeFileSync("questions-stems.json", JSON.stringify({ count: stems.length, source: "Lewis Lin PM Question Bank, deduped", questions: stems }, null, 2));
const breakdown = stems.reduce((m, s) => (m[s.type] = (m[s.type] || 0) + 1, m), {});
console.log(`Wrote questions-stems.json: ${stems.length} distinct (${JSON.stringify(breakdown)})`);
if (STEMS_ONLY) { console.log("--stems: stopping before generation."); process.exit(0); }
if (!KEY) { console.error("Set GEMINI_API_KEY to generate content (or run with --stems)."); process.exit(1); }

const OUT = "questions-content.full.json";
const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { questions: [] };
const byNorm = new Map(existing.questions.map(q => [norm(q.text), q]));
// hand-authored seeds always win
for (const q of SEED.questions) byNorm.set(norm(q.text), q);

const todo = stems.filter(s => { const done = byNorm.get(norm(s.text)); return !(done && done.framing); });
console.log(`${todo.length} to generate with ${MODEL} (cap this run: ${MAX}).`);
let n = 0;
for (const stem of todo) {
  if (n >= MAX) { console.log(`Hit MAX=${MAX}, stopping (resume later).`); break; }
  const seed = SEED.questions.find(q => norm(q.text) === norm(stem.text));
  const q = seed ? { ...seed, id: stem.id, company: stem.company } : await genContent(stem);
  if (!q) { console.error(`  SKIPPED id ${stem.id}`); continue; }
  byNorm.set(norm(stem.text), { ...q, id: stem.id });
  const all = stems.map(s => byNorm.get(norm(s.text))).filter(x => x && x.framing);
  fs.writeFileSync(OUT, JSON.stringify({ count: all.length, questions: all }, null, 2));
  if (!seed) n++;
  console.log(`  done ${stem.id}/${stems.length} (${stem.type})`);
  await new Promise(res => setTimeout(res, 300));
}
console.log(`Done. ${OUT} now holds ${JSON.parse(fs.readFileSync(OUT, "utf8")).count} authored questions.`);
