import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Require a valid Authorization header (JWT) to prevent anonymous triggering
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Clear previous daily flags
  const clearResp = await fetch(`${supabaseUrl}/rest/v1/questions?is_daily=eq.true`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ is_daily: false, daily_date: null }),
  });

  if (!clearResp.ok) {
    return new Response(JSON.stringify({ error: "Failed to clear daily flags" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Pick a random question
  const pickResp = await fetch(
    `${supabaseUrl}/rest/v1/questions?order=random()&limit=1&select=id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  const picked = await pickResp.json();
  if (!picked || picked.length === 0) {
    return new Response(JSON.stringify({ error: "No questions found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const pickedId = picked[0].id;
  const today = new Date().toISOString().split("T")[0];

  // Set as daily
  const setResp = await fetch(
    `${supabaseUrl}/rest/v1/questions?id=eq.${pickedId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ is_daily: true, daily_date: today }),
    }
  );

  if (!setResp.ok) {
    return new Response(JSON.stringify({ error: "Failed to set daily question" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ success: true, question_id: pickedId, date: today }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
