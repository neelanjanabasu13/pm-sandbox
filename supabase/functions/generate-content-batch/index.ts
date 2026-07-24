import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Batch content generator: processes questions lacking authored chip_options.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Question {
  id: string;
  text: string;
  type: "product_sense" | "execution" | "strategy";
  source_company: string | null;
}

interface StageItem {
  id: string;
  name: string;
  desc: string;
  painTags?: string[];
}

interface FramingQuestion {
  id: string;
  prompt: string;
  options: string[];
}

interface GymContent {
  framing?: FramingQuestion[];
  stages: Record<string, StageItem[]>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({})) as { limit?: number };
    const limit = body.limit ?? 50;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find questions lacking authored stage content (empty {} object, not NULL).
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("id, text, type, source_company, chip_options")
      .eq("chip_options", "{}")
      .limit(limit);

    if (qErr) throw new Error(`DB error: ${qErr.message}`);
    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ processed: 0, remaining: 0, message: "All questions have content." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
    const model = "claude-haiku-4-5-20251001";
    if (!apiKey) throw new Error("No ANTHROPIC_API_KEY configured.");

    let processed = 0;
    let failed = 0;

    // Process questions with limited concurrency (5 at a time) to avoid rate limits.
    const CONCURRENCY = 5;
    const results: { ok: boolean }[] = [];
    for (let i = 0; i < questions.length; i += CONCURRENCY) {
      const slice = questions.slice(i, i + CONCURRENCY);
      const sliceResults = await Promise.all(
        slice.map(async (q) => {
          try {
            const content = await generateContentWithRetry(q as Question, apiKey, model);
            const { error } = await supabase
              .from("questions")
              .update({ chip_options: content as unknown as Record<string, unknown> })
              .eq("id", q.id);
            if (error) throw new Error(`Update failed for ${q.id}: ${error.message}`);
            return { ok: true };
          } catch (err) {
            console.error(`Failed ${q.id}:`, err instanceof Error ? err.message : err);
            return { ok: false };
          }
        })
      );
      results.push(...sliceResults);
    }

    for (const r of results) {
      if (r.ok) processed++;
      else failed++;
    }

    // Count remaining (empty objects)
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("chip_options", "{}");

    return new Response(JSON.stringify({ processed, failed, remaining: count ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Batch failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateContentWithRetry(q: Question, apiKey: string, model: string): Promise<GymContent> {
  const MAX_RETRIES = 4;
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const content = await generateContent(q, apiKey, model);
      if (!content.stages || Object.keys(content.stages).length === 0) {
        throw new Error("Empty stages in generated content");
      }
      return content;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes("429") || msg.includes("rate limit") || msg.includes("Rate limit");
      if (is429 && attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Max retries exceeded");
}

async function generateContent(q: Question, apiKey: string, model: string): Promise<GymContent> {
  const prompt = buildPrompt(q);
  const result = await callAnthropic(apiKey, model, prompt);
  return parseContent(result, q.type);
}

function buildPrompt(q: Question): string {
  const company = q.source_company ? `Company: ${q.source_company}\n` : "";
  let s = `You are a senior PM interview coach. Generate practice exercise content tailored to this specific interview question.\n\n`;
  s += `Question: "${q.text}"\nType: ${q.type}\n${company}\n`;
  s += `Generate content that is SPECIFIC to this question — not generic. The segments, pains, solutions, hypotheses, metrics, or options should reference the actual product, domain, and scenario in the question.\n\n`;

  if (q.type === "product_sense") {
    s += `Generate JSON with this EXACT structure:\n`;
    s += `{\n`;
    s += `  "framing": [\n`;
    s += `    { "id": "f1", "prompt": "<question-specific framing prompt>", "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"] },\n`;
    s += `    { "id": "f2", "prompt": "...", "options": ["...", "...", "...", "..."] },\n`;
    s += `    { "id": "f3", "prompt": "...", "options": ["...", "...", "...", "..."] }\n`;
    s += `  ],\n`;
    s += `  "stages": {\n`;
    s += `    "segments": [\n`;
    s += `      { "id": "s1", "name": "<specific user segment>", "desc": "<1 sentence why this segment matters for THIS product>" },\n`;
    s += `      ...4 segments...\n`;
    s += `    ],\n`;
    s += `    "pains": [\n`;
    s += `      { "id": "p_s1_1", "name": "<specific pain>", "desc": "<1 sentence for THIS segment>" },\n`;
    s += `      ...3-4 pains per segment, ids like p_s1_1, p_s1_2, p_s2_1, etc...\n`;
    s += `    ],\n`;
    s += `    "solutions": [\n`;
    s += `      { "id": "sol1", "name": "<specific solution>", "desc": "<1 sentence>", "painTags": ["p_s1_1", "p_s2_2"] },\n`;
    s += `      ...5 solutions, each tagging pains it addresses by id...\n`;
    s += `    ],\n`;
    s += `    "metrics": [\n`;
    s += `      { "id": "m1", "name": "<specific success metric>", "desc": "<1 sentence for THIS product>" },\n`;
    s += `      ...4 metrics including at least one guardrail metric...\n`;
    s += `    ]\n`;
    s += `  }\n`;
    s += `}\n`;
  } else if (q.type === "execution") {
    s += `Generate JSON with this EXACT structure:\n`;
    s += `{\n`;
    s += `  "framing": [\n`;
    s += `    { "id": "f1", "prompt": "<question-specific framing prompt>", "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"] },\n`;
    s += `    { "id": "f2", "prompt": "...", "options": ["...", "...", "...", "..."] }\n`;
    s += `  ],\n`;
    s += `  "stages": {\n`;
    s += `    "hypotheses": [\n`;
    s += `      { "id": "h1", "name": "<specific hypothesis for THIS feature/product>", "desc": "<1 sentence>" },\n`;
    s += `      ...4 hypotheses...\n`;
    s += `    ],\n`;
    s += `    "metrics": [\n`;
    s += `      { "id": "m1", "name": "<specific metric>", "desc": "<1 sentence>" },\n`;
    s += `      ...4 metrics including at least one guardrail...\n`;
    s += `    ]\n`;
    s += `  }\n`;
    s += `}\n`;
  } else {
    s += `Generate JSON with this EXACT structure:\n`;
    s += `{\n`;
    s += `  "framing": [\n`;
    s += `    { "id": "f1", "prompt": "<question-specific framing prompt>", "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"] },\n`;
    s += `    { "id": "f2", "prompt": "...", "options": ["...", "...", "...", "..."] }\n`;
    s += `  ],\n`;
    s += `  "stages": {\n`;
    s += `    "options": [\n`;
    s += `      { "id": "o1", "name": "<specific strategic option for THIS scenario>", "desc": "<1 sentence>" },\n`;
    s += `      ...4 options...\n`;
    s += `    ]\n`;
    s += `  }\n`;
    s += `}\n`;
  }

  s += `\nRules:\n`;
  s += `- Be SPECIFIC to the question. Reference the actual product, domain, users, and scenario.\n`;
  s += `- Names should be 2-5 words. Descriptions 1 sentence.\n`;
  s += `- Pain IDs must follow the pattern p_s{segmentNum}_{painNum} and solutions must tag real pain IDs.\n`;
  s += `- Respond with ONLY the JSON object, no markdown fences, no explanation.\n`;

  return s;
}

async function callAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}

function parseContent(raw: string, type: string): GymContent {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : raw;
  const objMatch = candidate.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error("No JSON in AI response");
  let parsed;
  try {
    parsed = JSON.parse(objMatch[0]);
  } catch {
    throw new Error("Truncated or malformed JSON in AI response");
  }

  const content: GymContent = { stages: {} };

  if (parsed.framing && Array.isArray(parsed.framing)) {
    content.framing = parsed.framing.map((f: FramingQuestion, i: number) => ({
      id: f.id || `f${i + 1}`,
      prompt: f.prompt,
      options: f.options,
    }));
  }

  if (parsed.stages && typeof parsed.stages === "object") {
    for (const [key, items] of Object.entries(parsed.stages)) {
      if (Array.isArray(items)) {
        content.stages[key] = (items as StageItem[]).map((item, i) => ({
          id: item.id || `${key}_${i + 1}`,
          name: item.name,
          desc: item.desc || "",
          ...(item.painTags ? { painTags: item.painTags } : {}),
        }));
      }
    }
  }

  return content;
}
