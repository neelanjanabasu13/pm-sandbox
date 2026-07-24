# Content Generation Instructions for PM Interview Questions

## What You're Generating

For each question, you need to generate **practice exercise content** (chip options) that users interact with in the PM Interview Gym. This content is cached in the database so it only needs to be generated once. The content must be **specific to each question** — not generic.

## The Data

All 2,986 remaining questions are in `remaining_questions.json`. Each question has:
- `id` — UUID (use this as the key in your output)
- `text` — the interview question
- `type` — one of: `product_sense`, `execution`, `strategy`
- `source_company` — the company asked this question (may be null)

## JSON Format by Question Type

### For `product_sense` questions:

```json
{
  "framing": [
    { "id": "f1", "prompt": "<question-specific framing prompt>", "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"] },
    { "id": "f2", "prompt": "...", "options": ["...", "...", "...", "..."] },
    { "id": "f3", "prompt": "...", "options": ["...", "...", "...", "..."] }
  ],
  "stages": {
    "segments": [
      { "id": "s1", "name": "<specific user segment>", "desc": "<1 sentence why this segment matters for THIS product>" },
      { "id": "s2", "name": "...", "desc": "..." },
      { "id": "s3", "name": "...", "desc": "..." },
      { "id": "s4", "name": "...", "desc": "..." }
    ],
    "pains": [
      { "id": "p_s1_1", "name": "<specific pain>", "desc": "<1 sentence for THIS segment>" },
      { "id": "p_s1_2", "name": "...", "desc": "..." },
      { "id": "p_s1_3", "name": "...", "desc": "..." },
      { "id": "p_s2_1", "name": "...", "desc": "..." },
      { "id": "p_s2_2", "name": "...", "desc": "..." },
      { "id": "p_s3_1", "name": "...", "desc": "..." },
      { "id": "p_s3_2", "name": "...", "desc": "..." },
      { "id": "p_s4_1", "name": "...", "desc": "..." }
    ],
    "solutions": [
      { "id": "sol1", "name": "<specific solution>", "desc": "<1 sentence>", "painTags": ["p_s1_1", "p_s2_2"] },
      { "id": "sol2", "name": "...", "desc": "...", "painTags": ["p_s1_2", "p_s3_1"] },
      { "id": "sol3", "name": "...", "desc": "...", "painTags": ["p_s2_1"] },
      { "id": "sol4", "name": "...", "desc": "...", "painTags": ["p_s1_3", "p_s4_1"] },
      { "id": "sol5", "name": "...", "desc": "...", "painTags": ["p_s3_2", "p_s4_1"] }
    ]
  }
}
```

### For `execution` questions:

```json
{
  "framing": [
    { "id": "f1", "prompt": "<question-specific framing prompt>", "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"] },
    { "id": "f2", "prompt": "...", "options": ["...", "...", "...", "..."] }
  ],
  "stages": {
    "hypotheses": [
      { "id": "h1", "name": "<specific hypothesis for THIS feature/product>", "desc": "<1 sentence>" },
      { "id": "h2", "name": "...", "desc": "..." },
      { "id": "h3", "name": "...", "desc": "..." },
      { "id": "h4", "name": "...", "desc": "..." }
    ],
    "metrics": [
      { "id": "m1", "name": "<specific metric>", "desc": "<1 sentence>" },
      { "id": "m2", "name": "...", "desc": "..." },
      { "id": "m3", "name": "...", "desc": "..." },
      { "id": "m4", "name": "<guardrail metric>", "desc": "..." }
    ]
  }
}
```

### For `strategy` questions:

```json
{
  "framing": [
    { "id": "f1", "prompt": "<question-specific framing prompt>", "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"] },
    { "id": "f2", "prompt": "...", "options": ["...", "...", "...", "..."] }
  ],
  "stages": {
    "options": [
      { "id": "o1", "name": "<specific strategic option for THIS scenario>", "desc": "<1 sentence>" },
      { "id": "o2", "name": "...", "desc": "..." },
      { "id": "o3", "name": "...", "desc": "..." },
      { "id": "o4", "name": "...", "desc": "..." }
    ]
  }
}
```

## Rules

1. **Be SPECIFIC to the question.** Reference the actual product, domain, users, and scenario in the question. Do NOT generate generic content that could apply to any question.
2. **Names** should be 2-5 words. **Descriptions** should be 1 sentence.
3. **Pain IDs** must follow the pattern `p_s{segmentNum}_{painNum}` (e.g., `p_s1_1`, `p_s2_3`). Solutions must tag real pain IDs in `painTags`.
4. **Framing prompts** should help the user think about the question from different angles. Options should be plausible choices, not obvious wrong answers.
5. Output **only JSON**, no markdown fences, no explanations.

## Output Format

Generate a JSON object mapping question IDs to their content:

```json
{
  "7af6386b-a120-4b83-8998-8b279396ac66": { ...content... },
  "cee99ac6-36de-49aa-ae31-800e513eb427": { ...content... },
  ...
}
```

## Example (product_sense)

Question: "How would you improve Netflix for fitness enthusiasts?"

```json
{
  "framing": [
    { "id": "f1", "prompt": "What's the primary goal of this improvement?", "options": ["Increase engagement from fitness users", "Acquire new fitness-focused subscribers", "Create a new revenue stream", "Build brand association with fitness"] },
    { "id": "f2", "prompt": "Which fitness content approach makes most sense?", "options": ["License existing fitness content", "Produce original Netflix fitness shows", "Partner with fitness influencers", "Build interactive workout features"] },
    { "id": "f3", "prompt": "How should we measure success?", "options": ["Watch time from fitness content", "New signups citing fitness content", "Retention of fitness-focused users", "Cross-usage between entertainment and fitness"] }
  ],
  "stages": {
    "segments": [
      { "id": "s1", "name": "Serious gym-goers", "desc": "Lift weights 4+ times per week, follow structured programs, want content that complements their training." },
      { "id": "s2", "name": "Home workout beginners", "desc": "New to fitness, want guided workouts at home, motivated by convenience and variety." },
      { "id": "s3", "name": "Endurance athletes", "desc": "Runners and cyclists who use Netflix for recovery days and cross-training inspiration." },
      { "id": "s4", "name": "Yoga/wellness practitioners", "desc": "Regular yoga and meditation practitioners seeking calming, mindful content." }
    ],
    "pains": [
      { "id": "p_s1_1", "name": "No structured programs", "desc": "Serious gym-goers used to structured programs (e.g., 5/3/1), nothing on Netflix follows a progression." },
      { "id": "p_s1_2", "name": "Can't track progress", "desc": "Serious gym-goers want to log sets/reps/PRs; Netflix has no tracking layer." },
      { "id": "p_s1_3", "name": "Content too generic", "desc": "Existing fitness videos are one-size-fits-all, not tailored to their program." },
      { "id": "p_s2_1", "name": "Overwhelmed by where to start", "desc": "Beginners don't know which video matches their level; choice paralysis." },
      { "id": "p_s2_2", "name": "Fear of bad form", "desc": "Beginners worried about doing moves wrong with no feedback." },
      { "id": "p_s3_1", "name": "No cross-training plans", "desc": "Endurance athletes need strength/mobility cross-training tailored to race prep." },
      { "id": "p_s3_2", "name": "Can't fit training around schedule", "desc": "Rigid class times clash with training; want on-demand." },
      { "id": "p_s4_1", "name": "No mindfulness integration", "desc": "Yoga practitioners want meditation and wellness content integrated with their practice." }
    ],
    "solutions": [
      { "id": "sol1", "name": "Structured fitness programs", "desc": "Multi-week progressive series (e.g., '4-Week Strength Foundations') with episodes that build on each other.", "painTags": ["p_s1_1", "p_s2_1"] },
      { "id": "sol2", "name": "Netflix Fit Tracker", "desc": "In-app tracking for workouts completed, streaks, and milestones with optional wearable sync.", "painTags": ["p_s1_2", "p_s1_3"] },
      { "id": "sol3", "name": "Form guidance overlays", "desc": "On-screen cues and tips during workout videos to help beginners understand proper form.", "painTags": ["p_s2_2"] },
      { "id": "sol4", "name": "Athlete cross-training channel", "desc": "Curated content for runners/cyclists with strength, mobility, and recovery sessions.", "painTags": ["p_s3_1", "p_s3_2"] },
      { "id": "sol5", "name": "Mindful movement hub", "desc": "Dedicated section for yoga, meditation, and wellness with mood-based recommendations.", "painTags": ["p_s4_1"] }
    ]
  }
}
```

## How to Process

1. Open `remaining_questions.json` — it contains 2,986 questions
2. For each question, generate content following the format for its `type`
3. Output a JSON object mapping question `id` → content object
4. Save the output as `generated_content.json`

You can batch questions (e.g., 10-20 at a time) when pasting into ChatGPT/Claude to speed things up. Just make sure each question's content is specific to that question.
