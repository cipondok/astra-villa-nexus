import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Mode handlers (scaffolds) ───────────────────────────────────────

async function handleGenerateDescription(payload: Record<string, unknown>) {
  return json({ mode: "generate_description", status: "not_implemented", payload });
}

async function handleGenerateImage(payload: Record<string, unknown>) {
  return json({ mode: "generate_image", status: "not_implemented", payload });
}

async function handleNlpSearch(payload: Record<string, unknown>) {
  return json({ mode: "nlp_search", status: "not_implemented", payload });
}

async function handleMatchProperty(payload: Record<string, unknown>) {
  return json({ mode: "match_property", status: "not_implemented", payload });
}

async function handleSeoGeneration(payload: Record<string, unknown>) {
  return json({ mode: "seo_generate", status: "not_implemented", payload });
}

async function handleRecommendations(payload: Record<string, unknown>) {
  return json({ mode: "recommendations", status: "not_implemented", payload });
}

async function handleTranscription(payload: Record<string, unknown>) {
  return json({ mode: "transcribe_audio", status: "not_implemented", payload });
}

// ── Main router ─────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, payload = {} } = await req.json();

    if (!mode) {
      return json({ error: "mode is required" }, 400);
    }

    switch (mode) {
      case "generate_description":
        return await handleGenerateDescription(payload);
      case "generate_image":
        return await handleGenerateImage(payload);
      case "nlp_search":
        return await handleNlpSearch(payload);
      case "match_property":
        return await handleMatchProperty(payload);
      case "seo_generate":
        return await handleSeoGeneration(payload);
      case "recommendations":
        return await handleRecommendations(payload);
      case "transcribe_audio":
        return await handleTranscription(payload);
      default:
        return json({ error: `Invalid AI mode: ${mode}` }, 400);
    }
  } catch (e) {
    console.error("ai-engine error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
