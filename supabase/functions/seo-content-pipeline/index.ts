import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface HotspotRow {
  id: string;
  city: string;
  province: string;
  avg_price: number | null;
  avg_yield: number | null;
  demand_score: number | null;
  growth_rate: number | null;
  property_count: number | null;
  hot_areas: string[] | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "generate_batch";
    const batchLimit = Math.min(Number(body.limit) || 5, 20);

    if (action === "generate_batch") {
      return await handleBatchGenerate(supabase, LOVABLE_API_KEY, batchLimit);
    }

    if (action === "preview") {
      return await handlePreview(supabase);
    }

    if (action === "status") {
      return await handleStatus(supabase);
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-content-pipeline error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePreview(supabase: any) {
  // Get hotspots that don't yet have generated SEO content
  const { data: hotspots } = await supabase
    .from("investment_hotspots")
    .select("id, city, province, avg_price, avg_yield, demand_score, growth_rate, property_count, hot_areas")
    .order("demand_score", { ascending: false })
    .limit(50);

  const { data: existingSlugs } = await supabase
    .from("acquisition_seo_content")
    .select("slug")
    .eq("ai_generated", true);

  const existing = new Set((existingSlugs || []).map((r: any) => r.slug));
  const candidates = (hotspots || []).filter((h: HotspotRow) => {
    const slug = `investasi-properti-${h.city.toLowerCase().replace(/\s+/g, "-")}`;
    return !existing.has(slug);
  });

  return new Response(JSON.stringify({
    total_hotspots: hotspots?.length || 0,
    already_generated: existing.size,
    candidates: candidates.length,
    cities: candidates.slice(0, 20).map((h: HotspotRow) => ({
      city: h.city,
      province: h.province,
      demand_score: h.demand_score,
      avg_yield: h.avg_yield,
      property_count: h.property_count,
    })),
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function handleStatus(supabase: any) {
  const { data: content, count } = await supabase
    .from("acquisition_seo_content")
    .select("id, title, slug, status, seo_score, organic_traffic, created_at, primary_keyword", { count: "exact" })
    .eq("ai_generated", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: published } = await supabase
    .from("acquisition_seo_content")
    .select("id", { count: "exact", head: true })
    .eq("ai_generated", true)
    .eq("status", "published");

  return new Response(JSON.stringify({
    total_generated: count || 0,
    total_published: published?.length || 0,
    recent: content || [],
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function handleBatchGenerate(supabase: any, apiKey: string, limit: number) {
  // 1. Get hotspot cities without SEO content
  const { data: hotspots } = await supabase
    .from("investment_hotspots")
    .select("id, city, province, avg_price, avg_yield, demand_score, growth_rate, property_count, hot_areas")
    .order("demand_score", { ascending: false })
    .limit(100);

  const { data: existingSlugs } = await supabase
    .from("acquisition_seo_content")
    .select("slug")
    .eq("ai_generated", true);

  const existing = new Set((existingSlugs || []).map((r: any) => r.slug));

  const candidates = (hotspots || [])
    .filter((h: HotspotRow) => {
      const slug = `investasi-properti-${h.city.toLowerCase().replace(/\s+/g, "-")}`;
      return !existing.has(slug);
    })
    .slice(0, limit);

  if (candidates.length === 0) {
    return new Response(JSON.stringify({ generated: 0, message: "All hotspot cities already have content" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. Get trending keywords from recent property searches
  const { data: trendingSearches } = await supabase
    .from("ai_property_queries")
    .select("query_text, filters")
    .order("created_at", { ascending: false })
    .limit(200);

  const keywordFrequency: Record<string, number> = {};
  (trendingSearches || []).forEach((s: any) => {
    const words = (s.query_text || "").toLowerCase().split(/\s+/);
    words.forEach((w: string) => {
      if (w.length > 3) keywordFrequency[w] = (keywordFrequency[w] || 0) + 1;
    });
  });

  const trendingKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([kw]) => kw);

  // 3. Generate content for each candidate city
  const results: any[] = [];

  for (const hotspot of candidates) {
    try {
      // Get sample listings for this city
      const { data: listings } = await supabase
        .from("properties")
        .select("title, price, property_type, bedrooms, bathrooms, location")
        .ilike("city", `%${hotspot.city}%`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      const listingPreview = (listings || []).map((l: any) =>
        `- ${l.title}: Rp ${(l.price || 0).toLocaleString("id-ID")} | ${l.bedrooms}KT ${l.bathrooms}KM | ${l.location}`
      ).join("\n");

      const prompt = buildContentPrompt(hotspot, trendingKeywords, listingPreview);

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an expert Indonesian real estate SEO content writer for ASTRA Villa, producing investment analysis pages. Write in Bahasa Indonesia. Output ONLY valid JSON with this structure:
{
  "seo_title": "string (max 60 chars)",
  "meta_description": "string (max 160 chars)",
  "primary_keyword": "string",
  "secondary_keywords": ["string"],
  "investment_overview": "string (200-300 words, markdown)",
  "price_trend_summary": "string (150-200 words, markdown)",
  "listing_preview_intro": "string (50-80 words)",
  "market_signals": ["string (3-5 bullet points)"],
  "cta_text": "string"
}`
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.65,
        }),
      });

      if (!aiRes.ok) {
        const status = aiRes.status;
        if (status === 429 || status === 402) {
          results.push({ city: hotspot.city, error: status === 429 ? "rate_limited" : "credits_depleted" });
          break; // Stop batch on billing/rate issues
        }
        results.push({ city: hotspot.city, error: `ai_error_${status}` });
        continue;
      }

      const aiData = await aiRes.json();
      const raw = aiData.choices?.[0]?.message?.content || "";

      // Parse JSON from response (handle markdown code blocks)
      const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      // Build full content
      const fullContent = `## Peluang Investasi Properti di ${hotspot.city}\n\n${parsed.investment_overview}\n\n## Tren Harga Properti ${hotspot.city}\n\n${parsed.price_trend_summary}\n\n## Properti Unggulan\n\n${parsed.listing_preview_intro}\n\n## Sinyal Pasar\n\n${parsed.market_signals.map((s: string) => `- ${s}`).join("\n")}`;

      const slug = `investasi-properti-${hotspot.city.toLowerCase().replace(/\s+/g, "-")}`;

      // Deduplicate check one more time
      if (existing.has(slug)) {
        results.push({ city: hotspot.city, status: "skipped_duplicate" });
        continue;
      }

      // Save to acquisition_seo_content
      const { error: insertErr } = await supabase
        .from("acquisition_seo_content")
        .insert({
          title: parsed.seo_title,
          slug,
          content_type: "investment_page",
          primary_keyword: parsed.primary_keyword,
          secondary_keywords: parsed.secondary_keywords,
          meta_title: parsed.seo_title,
          meta_description: parsed.meta_description,
          content: fullContent,
          status: "draft",
          ai_generated: true,
          ai_model: "gemini-3-flash-preview",
          seo_score: 0,
          target_location: hotspot.city,
          word_count: fullContent.split(/\s+/).length,
        });

      if (insertErr) {
        results.push({ city: hotspot.city, error: insertErr.message });
      } else {
        existing.add(slug); // Prevent duplicates within same batch
        results.push({ city: hotspot.city, status: "generated", slug });
      }

      // Small delay between API calls
      await new Promise((r) => setTimeout(r, 500));
    } catch (cityErr) {
      results.push({ city: hotspot.city, error: cityErr instanceof Error ? cityErr.message : "Unknown" });
    }
  }

  return new Response(JSON.stringify({
    generated: results.filter(r => r.status === "generated").length,
    total_attempted: results.length,
    results,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function buildContentPrompt(hotspot: HotspotRow, trendingKeywords: string[], listingPreview: string): string {
  const avgPrice = hotspot.avg_price ? `Rp ${hotspot.avg_price.toLocaleString("id-ID")}` : "N/A";
  const yieldPct = hotspot.avg_yield ? `${hotspot.avg_yield.toFixed(1)}%` : "N/A";
  const growthPct = hotspot.growth_rate ? `${hotspot.growth_rate.toFixed(1)}%` : "N/A";
  const demandLabel = (hotspot.demand_score || 0) >= 80 ? "Sangat Tinggi" :
    (hotspot.demand_score || 0) >= 60 ? "Tinggi" :
    (hotspot.demand_score || 0) >= 40 ? "Sedang" : "Rendah";

  return `Buat konten halaman investasi properti SEO untuk kota: ${hotspot.city}, ${hotspot.province}.

DATA PASAR:
- Harga rata-rata: ${avgPrice}
- Yield rata-rata: ${yieldPct}
- Pertumbuhan harga: ${growthPct}
- Skor permintaan: ${hotspot.demand_score || 0}/100 (${demandLabel})
- Jumlah properti tersedia: ${hotspot.property_count || 0}
- Area populer: ${(hotspot.hot_areas || []).join(", ") || "N/A"}

KEYWORD TRENDING TERKINI:
${trendingKeywords.slice(0, 15).join(", ")}

CONTOH LISTING AKTIF:
${listingPreview || "Belum ada listing"}

INSTRUKSI:
1. Gunakan data pasar di atas secara natural dalam konten
2. Hindari pola kalimat generik - setiap kota harus unik
3. Masukkan angka spesifik (harga, yield, pertumbuhan)
4. Fokus pada perspektif investor: ROI, risiko, timing
5. Primary keyword harus mengandung nama kota
6. Gunakan Bahasa Indonesia yang profesional tapi mudah dipahami`;
}
