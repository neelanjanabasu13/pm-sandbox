# pm-sandbox

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-d5c5p4zm)
# PM Sandbox

**A flight simulator for product-manager interviews.**

PM Sandbox turns a huge bank of real PM interview questions into short, gamified daily drills. Instead of staring at a blank page, you work a question through the same structured stages a strong PM would in a real loop, then get AI feedback on where you were sharp and where you hedged.

🔗 **Live app:** https://product-sense-sandbox.bolt.host

---

## What it does

- **A real question bank.** ~3,400 interview questions across ~200 companies (product sense, execution, and strategy), sourced from a widely used community question bank and deduplicated so you practice distinct scenarios rather than near-repeats.
- **Guided, gamified drills.** Each question is broken into stages you actually get scored on: framing the problem, choosing a target user segment, ranking pain points, picking a solution, and committing to a north-star metric plus a guardrail, before you write a short pitch.
- **Rank-and-commit mechanics.** You rate options on concrete criteria (reach, frequency, intensity, ease of build, differentiation, and so on) and the app scores your choices, so the drill trains decisive prioritisation instead of endless "it depends."
- **AI evaluation.** After your pitch, an LLM scores the answer on insight, conviction, concreteness, prioritisation, and metrics, and returns a best-in-class rewrite built from your own arguments.
- **Practice by type or company.** Filter the bank to drill exactly what your upcoming interview needs.

## Why it exists

Most PM interview prep is passive: read frameworks, watch mock answers, forget them. PM Sandbox is built around a single idea, that interview skill is a muscle you build by making calls under mild pressure and getting fast, specific feedback. The gamified stages exist to force the two habits that trip most candidates up: leading with the insight, and committing to one direction with conviction.

## Tech stack

- **Frontend:** React + TypeScript + Vite, styled with Tailwind CSS
- **Backend:** Supabase (Postgres, Row Level Security, and Edge Functions)
- **AI:** Anthropic Claude (Haiku) for both per-question content generation and answer evaluation
- **Hosting:** deployed via bolt.new

## How content is generated

Each question's practice content (the segments, pains, solutions, and metrics you rank) is generated once by an edge function calling Claude and cached in the database, so drills load instantly and the model is only called when a new question is first opened. Answer evaluation runs on demand when you submit a pitch.

## Running it yourself

This project expects a Supabase project and an Anthropic API key. Secrets are supplied through environment variables and Supabase Edge Function secrets, never committed to the repo.

```bash
npm install
npm run dev
```

Required environment values (set in a local `.env`, which is git-ignored):

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Edge functions additionally need `ANTHROPIC_API_KEY` set as a Supabase secret.

> Note: no API keys or service credentials are stored in this repository. If you fork it, add your own via environment variables and Supabase secrets.

## Status

Actively built as a personal project. The question bank is largely pre-populated, with any remaining questions generating their content the first time they're opened.

## Acknowledgements

Question bank adapted from a community-maintained PM interview question collection. Built with [bolt.new](https://bolt.new).

## AI PM questions and sample answers

The **AI** filter selects all 167 prompts from the 24 October workbook. Questions without a known company appear under **Others**. Each includes an authored sample answer covering framing, recommendation, rationale, metrics, tradeoffs, and validation. Use **Reveal sample answer** during practice or on the session summary to compare your reasoning. These are illustrative practice answers, not company-endorsed responses or quotations from the question sources. Personal-experience examples are explicitly hypothetical.

Questions use the existing product sense, execution, and strategy drills, including on-demand practice options and AI feedback. Original categories, enterprise-agent relevance, source URLs, company attribution, and verbatim flags are retained in `source_metadata` and `data/ai_pm_questions.json`; answers are in `data/ai_pm_answers.json`. Figures and hypothetical capabilities in prompts are scenario premises, not verified current product claims.

Apply `supabase/migrations/20261025143000_add_ai_pm_question_bank.sql` through the normal Supabase migration process. It adds the collection and answers, enriches existing exact-text matches without changing their IDs or practice history, and can be reapplied without duplicating questions. No access policies change. Deploy the frontend as well to expose the AI PM filter and answer panels. Repository changes alone do not update the live database.

To rebuild and check the collection:

```bash
node scripts/build-ai-answers.mjs
node scripts/build-ai-question-migration.mjs
node scripts/build-ai-answers.mjs --check
node scripts/build-ai-question-migration.mjs --check
```
