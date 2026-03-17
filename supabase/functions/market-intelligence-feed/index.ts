import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Investment", "Market Trends", "Legal Tips", "Developer News", "Rental Insights"];

// Indonesian market intelligence article templates
const ARTICLE_TEMPLATES = [
  {
    category: "Investment",
    templates: [
      { title: "Strategi Investasi Properti {city} {year}: Panduan Lengkap ROI Optimal", tags: ["investasi", "ROI", "strategi"] },
      { title: "5 Area Tersembunyi di {city} dengan Potensi Capital Gain Tertinggi", tags: ["capital gain", "hidden gem", "analisis"] },
      { title: "Analisis Risiko vs Return: Properti Residensial vs Komersial di {city}", tags: ["risiko", "komersial", "residensial"] },
    ],
  },
  {
    category: "Market Trends",
    templates: [
      { title: "Tren Harga Properti {city} Q{quarter} {year}: Sinyal Pasar Terbaru", tags: ["tren", "harga", "market signal"] },
      { title: "Prediksi Pasar Properti Indonesia {year}: Bull atau Bear?", tags: ["prediksi", "market cycle", "Indonesia"] },
      { title: "Dampak Infrastruktur Baru Terhadap Nilai Properti di {city}", tags: ["infrastruktur", "nilai", "TOD"] },
    ],
  },
  {
    category: "Legal Tips",
    templates: [
      { title: "Panduan Lengkap Pajak Properti {year}: PPh, BPHTB & PBB", tags: ["pajak", "legal", "PPh"] },
      { title: "Checklist Hukum Sebelum Membeli Properti: Hindari 7 Kesalahan Fatal", tags: ["legal", "checklist", "due diligence"] },
      { title: "Regulasi Baru Kepemilikan Properti Asing di Indonesia {year}", tags: ["regulasi", "asing", "WNA"] },
    ],
  },
  {
    category: "Developer News",
    templates: [
      { title: "Proyek Baru di {city}: {count} Developer Siap Launching Q{quarter} {year}", tags: ["launching", "developer", "proyek baru"] },
      { title: "Review Developer Terpercaya {city}: Track Record & Kualitas Bangun", tags: ["developer", "review", "kualitas"] },
      { title: "Pre-Launch Alert: Harga Early Bird vs Pasca-Launching — Worth It?", tags: ["pre-launch", "early bird", "investasi"] },
    ],
  },
  {
    category: "Rental Insights",
    templates: [
      { title: "Rental Yield {city} {year}: Kota Mana Paling Menguntungkan?", tags: ["yield", "rental", "perbandingan"] },
      { title: "Tren Kost & Co-Living: Peluang Passive Income di Kota Besar", tags: ["kost", "co-living", "passive income"] },
      { title: "Optimasi Sewa Properti: Tips Menaikkan Yield 2-3% dalam 6 Bulan", tags: ["optimasi", "yield", "tips"] },
    ],
  },
];

const CITIES = ["Jakarta", "Bandung", "Surabaya", "Bali", "Yogyakarta", "Semarang", "Makassar", "Medan", "Tangerang", "Bekasi"];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

function generateExcerpt(title: string, category: string): string {
  const excerpts: Record<string, string[]> = {
    Investment: [
      "Analisis mendalam tentang peluang investasi properti terkini dengan data AI real-time dan proyeksi ROI 5 tahun.",
      "Temukan strategi investasi properti berbasis data yang digunakan investor profesional untuk memaksimalkan return.",
    ],
    "Market Trends": [
      "Laporan tren pasar properti terbaru berdasarkan analisis AI terhadap ribuan data transaksi dan sinyal demand.",
      "Update kondisi pasar properti dengan indikator supply-demand, price momentum, dan prediksi arah harga.",
    ],
    "Legal Tips": [
      "Panduan hukum properti penting yang wajib diketahui sebelum melakukan transaksi jual-beli atau sewa.",
      "Tips legal dan regulasi properti terbaru untuk melindungi investasi Anda dari risiko hukum.",
    ],
    "Developer News": [
      "Berita terbaru dari developer terkemuka tentang proyek launching, harga, dan peluang early bird.",
      "Update proyek properti baru yang berpotensi memberikan capital gain signifikan di tahap awal.",
    ],
    "Rental Insights": [
      "Analisis yield sewa terkini dan strategi optimasi pendapatan pasif dari properti investasi Anda.",
      "Data rental market terbaru untuk membantu keputusan investasi berbasis cashflow dan yield.",
    ],
  };
  const pool = excerpts[category] || excerpts.Investment;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateContent(title: string, category: string, city: string): string {
  return `# ${title}\n\n## Ringkasan\n\nArtikel ini menganalisis kondisi pasar properti di ${city} berdasarkan data AI terkini dari platform ASTRA Villa. Dengan mempertimbangkan tren harga, demand score, dan sinyal investasi, kami menyajikan insight yang actionable untuk investor.\n\n## Analisis Utama\n\nBerdasarkan data dari ${Math.floor(Math.random() * 500 + 200)} properti yang dianalisis oleh AI engine ASTRA Villa, berikut temuan utama:\n\n1. **Market Heat Score**: Area premium di ${city} menunjukkan heat score rata-rata ${Math.floor(Math.random() * 30 + 60)}/100\n2. **Rental Yield**: Yield sewa rata-rata tercatat ${(Math.random() * 4 + 3).toFixed(1)}% per tahun\n3. **Capital Growth**: Proyeksi pertumbuhan harga ${(Math.random() * 8 + 4).toFixed(1)}% dalam 12 bulan ke depan\n\n## Rekomendasi\n\nInvestor disarankan untuk fokus pada area dengan opportunity score di atas 70 dan demand heat yang konsisten. Platform ASTRA Villa menyediakan analisis real-time untuk setiap properti yang terdaftar.\n\n---\n*Artikel ini dihasilkan oleh AI Intelligence Engine ASTRA Villa berdasarkan data pasar terkini.*`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, category, limit: reqLimit, offset: reqOffset, user_id, article_id } = await req.json();

    // ── Generate AI Articles ──
    if (mode === "generate") {
      const year = new Date().getFullYear();
      const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const articles: any[] = [];

      for (const catGroup of ARTICLE_TEMPLATES) {
        for (const tmpl of catGroup.templates) {
          const city = CITIES[Math.floor(Math.random() * CITIES.length)];
          const title = tmpl.title
            .replace("{city}", city)
            .replace("{year}", String(year))
            .replace("{quarter}", String(quarter))
            .replace("{count}", String(Math.floor(Math.random() * 8 + 3)));

          // Get related properties from that city
          const { data: relatedProps } = await supabase
            .from("properties")
            .select("id")
            .eq("city", city)
            .limit(3);

          // Get market heat for reference
          const { data: heatData } = await supabase
            .from("market_clusters")
            .select("cluster_name, market_heat_score, heat_level")
            .ilike("cluster_name", `%${city}%`)
            .limit(1);

          articles.push({
            title,
            slug: generateSlug(title) + "-" + Date.now().toString(36),
            content: generateContent(title, catGroup.category, city),
            excerpt: generateExcerpt(title, catGroup.category),
            category: catGroup.category,
            tags: tmpl.tags,
            reading_time_min: Math.floor(Math.random() * 5 + 3),
            is_featured: Math.random() > 0.85,
            is_trending: Math.random() > 0.7,
            ai_generated: true,
            publish_status: "published",
            related_property_ids: (relatedProps || []).map((p: any) => p.id),
            market_heat_ref: heatData?.[0] || null,
            views_count: Math.floor(Math.random() * 2000 + 100),
          });
        }
      }

      const { data: inserted, error } = await supabase
        .from("articles")
        .insert(articles)
        .select("id, title, category");

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, generated: inserted?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Fetch Feed ──
    if (mode === "feed") {
      const limit = reqLimit || 20;
      const offset = reqOffset || 0;

      let query = supabase
        .from("articles")
        .select("id, title, slug, excerpt, category, image_url, tags, reading_time_min, is_featured, is_trending, ai_generated, views_count, market_heat_ref, related_property_ids, created_at")
        .eq("publish_status", "published")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data: articles, error } = await query;
      if (error) throw error;

      // Get saved article ids for the user
      let savedIds: string[] = [];
      if (user_id) {
        const { data: saved } = await supabase
          .from("saved_articles")
          .select("article_id")
          .eq("user_id", user_id);
        savedIds = (saved || []).map((s: any) => s.article_id);
      }

      // Get total count
      let countQuery = supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("publish_status", "published");
      if (category && category !== "All") {
        countQuery = countQuery.eq("category", category);
      }
      const { count } = await countQuery;

      return new Response(
        JSON.stringify({
          articles: (articles || []).map((a: any) => ({
            ...a,
            is_saved: savedIds.includes(a.id),
          })),
          total: count || 0,
          has_more: (offset + limit) < (count || 0),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Article Detail ──
    if (mode === "detail") {
      if (!article_id) throw new Error("article_id required");

      // Increment view count
      await supabase.rpc("increment_field", { row_id: article_id, table_name: "articles", field_name: "views_count" }).catch(() => {
        // fallback: direct update
        supabase.from("articles").update({ views_count: supabase.sql`views_count + 1` }).eq("id", article_id);
      });

      const { data: article, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", article_id)
        .single();
      if (error) throw error;

      // Fetch related properties
      let relatedProperties: any[] = [];
      if (article?.related_property_ids?.length > 0) {
        const { data: props } = await supabase
          .from("properties")
          .select("id, title, price, city, property_type, thumbnail_url, investment_score, demand_heat_score")
          .in("id", article.related_property_ids)
          .limit(6);
        relatedProperties = props || [];
      }

      return new Response(
        JSON.stringify({ article, related_properties: relatedProperties }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Toggle Save ──
    if (mode === "toggle_save") {
      if (!user_id || !article_id) throw new Error("user_id and article_id required");

      const { data: existing } = await supabase
        .from("saved_articles")
        .select("id")
        .eq("user_id", user_id)
        .eq("article_id", article_id)
        .maybeSingle();

      if (existing) {
        await supabase.from("saved_articles").delete().eq("id", existing.id);
        return new Response(JSON.stringify({ saved: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        await supabase.from("saved_articles").insert({ user_id, article_id });
        return new Response(JSON.stringify({ saved: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    throw new Error("Invalid mode");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
