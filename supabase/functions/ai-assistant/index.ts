import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

/**
 * AI ASSISTANT ENGINE — Centralized router for all AI chat, NLP, and assistant modes.
 * Proxies to ai-engine for backward compatibility while providing
 * a clean API surface for assistant-related features.
 * 
 * Modes handled:
 *   property_assistant, property_chatbot, investment_assistant,
 *   nlp_search, property_advisor, transcribe_audio, recommendations
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_MODES = new Set([
  "property_assistant",
  "property_chatbot",
  "investment_assistant",
  "nlp_search",
  "property_advisor",
  "transcribe_audio",
  "recommendations",
  "match_property",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode = body.mode || body.payload?.mode;

    if (!mode) {
      return new Response(
        JSON.stringify({ error: "mode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_MODES.has(mode)) {
      return new Response(
        JSON.stringify({ error: `Invalid ai-assistant mode: ${mode}. Valid: ${[...VALID_MODES].join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward to ai-engine
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("authorization") || `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;

    const targetUrl = `${supabaseUrl}/functions/v1/ai-engine`;

    // For streaming modes (property_chatbot), pass through the stream
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    // Stream through the response (supports SSE for property_chatbot)
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    console.error("ai-assistant error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
