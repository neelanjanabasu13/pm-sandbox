import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Payload {
  question: { text: string; type: string; company?: string | null };
  framingAnswers: Record<string, string>;
  framingQuestions: { id: string; prompt: string; options: string[] }[];
  customAssumptions: string;
  rows: {
    stage: string;
    stageLabel: string;
    items: {
      name: string;
      desc: string;
      custom: boolean;
      ratings: [number, number, number];
      score: number | null;
      criteriaLabels: string[];
    }[];
    pick: string | null;
    justification: string | null;
  }[];
  pitchText: string;
  elapsedSeconds: number;
  points: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as Payload;

    const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("AI_API_KEY") ?? "";
    const model = Deno.env.get("AI_MODEL") ?? "gemini-2.0-flash";
    const provider = Deno.env.get("AI_PROVIDER") ?? "google";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No AI API key configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(payload);

    let result: string;
    if (provider === "google" || provider === "gemini") {
      result = await callGemini(apiKey, model, prompt);
    } else {
      result = await callOpenAICompatible(apiKey, model, prompt);
    }

    const parsed = parseResult(result);

    return new Response(
      JSON.stringify({ raw: result, ...parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Grading failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildPrompt(p: Payload): string {
  let s = `You are a senior PM interview grader. Grade this practice response strictly.\n\n`;
  s += `QUESTION: ${p.question.text}\n`;
  s += `TYPE: ${p.question.type}\n`;
  if (p.question.company) s += `COMPANY: ${p.question.company}\n`;
  s += `\n--- FRAMING ---\n`;
  p.framingQuestions.forEach((q) => {
    const ans = p.framingAnswers[q.id];
    s += `${q.prompt}\n  Options: ${q.options.join(" | ")}\n  Answer: ${ans ?? "SKIPPED"}\n`;
  });
  if (p.customAssumptions.trim()) {
    s += `Assumptions: ${p.customAssumptions}\n`;
  }

  p.rows.forEach((stage) => {
    s += `\n--- ${stage.stageLabel.toUpperCase()} ---\n`;
    stage.items.forEach((item) => {
      const r = item.ratings;
      const ratingStr = r.map((v, i) => `${item.criteriaLabels[i]}=${v === 3 ? "H" : v === 2 ? "M" : v === 1 ? "L" : "-"}`).join(", ");
      s += `- ${item.name}${item.custom ? " (custom)" : ""}: ${ratingStr} → score ${item.score ?? "-"}\n`;
      if (item.desc) s += `    ${item.desc}\n`;
    });
    if (stage.pick) {
      s += `PICK: ${stage.pick}`;
      if (stage.justification) s += ` (contrarian: ${stage.justification})`;
      s += `\n`;
    }
  });

  s += `\n--- PITCH ---\n${p.pitchText || "(empty)"}\n`;
  s += `Elapsed: ${Math.floor(p.elapsedSeconds / 60)}m ${p.elapsedSeconds % 60}s\n`;
  s += `Points: ${p.points}\n`;

  s += `\n--- GRADING RUBRIC ---\n`;
  s += `Score 1-5 each on:\n`;
  s += `1. insight — sentence one states a non-obvious principle, not a truism\n`;
  s += `2. conviction — picks are decisive and defended\n`;
  s += `3. concreteness — solutions/metrics are specific, not generic\n`;
  s += `4. decisive_prioritisation — clear ranking, trade-offs named\n`;
  s += `5. metrics — north star plus at least one guardrail metric\n`;
  s += `\nVERDICT: "Builder" or "Analyst" (Builder = decisive + concrete + insight-led).\n`;
  s += `Quote any hedging language verbatim (e.g. "might", "could", "possibly").\n`;
  s += `Then write a BEST-IN-CLASS spoken rewrite under 450 words using the candidate's OWN arguments, insight first.\n\n`;
  s += `Respond as STRICT JSON:\n`;
  s += `{\n`;
  s += `  "scores": { "insight": N, "conviction": N, "concreteness": N, "decisive_prioritisation": N, "metrics": N },\n`;
  s += `  "verdict": "Builder" | "Analyst",\n`;
  s += `  "hedging_quotes": ["...", "..."],\n`;
  s += `  "rewrite": "spoken rewrite under 450 words"\n`;
  s += `}\n`;
  s += `Do not include any text outside the JSON object.`;

  return s;
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gemini error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function callOpenAICompatible(apiKey: string, model: string, prompt: string): Promise<string> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty AI response");
  return text;
}

function parseResult(raw: string): Record<string, unknown> {
  // Extract JSON object from the response (it may be wrapped in ```json fences).
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : raw;
  const objMatch = candidate.match(/\{[\s\S]*\}/);
  if (!objMatch) return { parsed: null, raw };
  try {
    return { parsed: JSON.parse(objMatch[0]), raw };
  } catch {
    return { parsed: null, raw };
  }
}
