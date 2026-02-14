import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROPERTY_SCHEMA = {
  title: "",
  property_type: "",
  listing_type: "",
  price: "",
  currency: "IDR",
  location: {
    full_address: "",
    city: "",
    province: "",
    country: "Indonesia"
  },
  specifications: {
    bedrooms: null,
    bathrooms: null,
    building_size_m2: null,
    land_size_m2: null,
    floors: null,
    carports: null
  },
  features: [],
  description: "",
  images: [],
  source: {
    url: "",
    website: ""
  }
};

const SYSTEM_PROMPT = `You are an AI data extractor for ASTRA Villa, a real estate platform in Indonesia.

Extract structured property listing data from the provided HTML content.

RULES:
- Only use information that exists in the HTML
- Do NOT invent or guess missing values
- Return pure JSON only, no markdown, no explanation

PROPERTY TYPE MAPPING:
- "Rumah" → house
- "Apartemen" → apartment
- "Villa" → villa
- "Tanah" → land
- "Ruko" → shop
- "Gudang" → warehouse
- "Kantor" → office
- "Hotel" → hotel
- "Komersial" → commercial

LISTING TYPE MAPPING:
- "Dijual" → sale
- "Disewa" / "Sewa" → rent

DATA CLEANING:
- Convert sizes to square meters (m2)
- Remove currency symbols from price, return only numbers as string
- Do not include watermark/logo/avatar images
- Only include real property photos

FOR MISSING FIELDS:
- null for numeric fields
- empty string "" for text fields
- empty array [] for list fields

REQUIRED OUTPUT SCHEMA:
${JSON.stringify(PROPERTY_SCHEMA, null, 2)}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { html, sourceUrl } = await req.json();

    if (!html || typeof html !== "string") {
      return new Response(
        JSON.stringify({ error: "HTML content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Truncate HTML if too long (keep first 50k chars)
    const truncatedHtml = html.length > 50000 ? html.substring(0, 50000) : html;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Extract property data from this HTML. Source URL: ${sourceUrl || "unknown"}\n\nHTML:\n${truncatedHtml}` 
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response (remove markdown code blocks if present)
    let extractedData;
    try {
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse extracted data");
    }

    // Ensure source URL is set
    if (sourceUrl) {
      extractedData.source = extractedData.source || {};
      extractedData.source.url = sourceUrl;
      
      // Extract website name from URL
      try {
        const urlObj = new URL(sourceUrl);
        extractedData.source.website = urlObj.hostname.replace("www.", "");
      } catch {
        extractedData.source.website = "";
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Extract property data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

