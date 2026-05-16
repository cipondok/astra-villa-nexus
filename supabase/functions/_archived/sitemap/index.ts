import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://astra-villa-realty.lovable.app";

// Public routes that should be indexed (exclude admin, protected, and redirect-only routes)
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/landing", priority: "0.9", changefreq: "weekly" },
  { path: "/dijual", priority: "0.9", changefreq: "daily" },
  { path: "/disewa", priority: "0.9", changefreq: "daily" },
  { path: "/properties", priority: "0.9", changefreq: "daily" },
  { path: "/search", priority: "0.8", changefreq: "daily" },
  { path: "/pre-launching", priority: "0.8", changefreq: "weekly" },
  { path: "/new-projects", priority: "0.8", changefreq: "weekly" },
  { path: "/agents", priority: "0.7", changefreq: "weekly" },
  { path: "/investment", priority: "0.8", changefreq: "weekly" },
  { path: "/early-investment", priority: "0.7", changefreq: "weekly" },
  { path: "/market-trends", priority: "0.7", changefreq: "weekly" },
  { path: "/market-intelligence", priority: "0.7", changefreq: "weekly" },
  { path: "/areas", priority: "0.7", changefreq: "weekly" },
  { path: "/services", priority: "0.6", changefreq: "monthly" },
  { path: "/community", priority: "0.6", changefreq: "weekly" },
  { path: "/marketplace", priority: "0.6", changefreq: "weekly" },
  { path: "/vr-tour", priority: "0.6", changefreq: "monthly" },
  { path: "/kpr-calculator", priority: "0.6", changefreq: "monthly" },
  { path: "/calculators/construction", priority: "0.5", changefreq: "monthly" },
  { path: "/calculators/loan", priority: "0.5", changefreq: "monthly" },
  { path: "/calculators/area", priority: "0.5", changefreq: "monthly" },
  { path: "/ai-pricing", priority: "0.6", changefreq: "monthly" },
  { path: "/visual-search", priority: "0.5", changefreq: "monthly" },
  { path: "/help", priority: "0.4", changefreq: "monthly" },
  { path: "/about", priority: "0.4", changefreq: "monthly" },
  { path: "/contact", priority: "0.4", changefreq: "monthly" },
  { path: "/auth", priority: "0.3", changefreq: "monthly" },
  { path: "/agent-registration", priority: "0.5", changefreq: "monthly" },
  { path: "/partners/become", priority: "0.5", changefreq: "monthly" },
  { path: "/partners/benefits", priority: "0.5", changefreq: "monthly" },
  { path: "/flash-deals", priority: "0.7", changefreq: "daily" },
  { path: "/price-drop-deals", priority: "0.7", changefreq: "daily" },
  { path: "/membership", priority: "0.5", changefreq: "monthly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Fetch published properties
    const { data: properties } = await supabase
      .from("properties")
      .select("id, updated_at, city")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(5000);

    // Fetch investment hotspot cities for /invest/:citySlug pages
    const { data: hotspots } = await supabase
      .from("investment_hotspots")
      .select("city_slug")
      .limit(100);

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static routes
    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    }

    // Dynamic property pages
    if (properties?.length) {
      for (const prop of properties) {
        const lastmod = prop.updated_at
          ? new Date(prop.updated_at).toISOString().split("T")[0]
          : today;
        xml += `  <url>
    <loc>${SITE_URL}/properties/${prop.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Dynamic city investment pages
    if (hotspots?.length) {
      for (const hs of hotspots) {
        if (hs.city_slug) {
          xml += `  <url>
    <loc>${SITE_URL}/invest/${hs.city_slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        }
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
