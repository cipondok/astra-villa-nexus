import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROPERTY_SCHEMA = `{
  "title": "",
  "property_type": "",
  "listing_type": "",
  "price": "",
  "currency": "IDR",
  "location": {
    "full_address": "",
    "city": "",
    "province": "",
    "country": "Indonesia"
  },
  "specifications": {
    "bedrooms": null,
    "bathrooms": null,
    "building_size_m2": null,
    "land_size_m2": null,
    "floors": null,
    "carports": null
  },
  "features": [],
  "description": "",
  "images": [],
  "source": {
    "url": "",
    "website": ""
  }
}`;

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
- Extract all property image URLs (jpg, jpeg, png, webp)
- Do not include watermark/logo/avatar/icon images
- Only include real property photos

FOR MISSING FIELDS:
- null for numeric fields
- empty string "" for text fields
- empty array [] for list fields

REQUIRED OUTPUT SCHEMA:
${PROPERTY_SCHEMA}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Scraping property from: ${url}`);

    // Fetch the HTML content
    const fetchResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5,id;q=0.3",
      },
    });

    if (!fetchResponse.ok) {
      console.error(`Failed to fetch URL: ${fetchResponse.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch page (status ${fetchResponse.status})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await fetchResponse.text();
    console.log(`Fetched HTML: ${html.length} characters`);

    // Use Lovable AI to extract property data
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Truncate HTML if too long (keep first 60k chars for better extraction)
    const truncatedHtml = html.length > 60000 ? html.substring(0, 60000) : html;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Extract property data from this HTML. Source URL: ${url}\n\nHTML:\n${truncatedHtml}` 
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let extractedData;
    try {
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse extracted data");
    }

    // Ensure source info is set
    extractedData.source = extractedData.source || {};
    extractedData.source.url = url;
    extractedData.source.website = parsedUrl.hostname.replace("www.", "");

    console.log("Property extracted successfully:", extractedData.title);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Scrape property error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

