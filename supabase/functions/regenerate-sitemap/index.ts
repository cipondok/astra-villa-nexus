import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sitemap-cron",
};

const BASE_URL = "https://astravilla.com";

interface SitemapRoute {
  path: string;
  changefreq?: string;
  priority?: string;
}

const PUBLIC_ROUTES: SitemapRoute[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/search", changefreq: "daily", priority: "0.9" },
  { path: "/dijual", changefreq: "daily", priority: "0.9" },
  { path: "/disewa", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/help", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const today = () => new Date().toISOString().slice(0, 10);

function buildLanguageSitemap(lang: "en" | "id"): string {
  const lastmod = today();
  const urls = PUBLIC_ROUTES.map((r) => {
    const loc = `${BASE_URL}${r.path}?lang=${lang}`;
    const enHref = `${BASE_URL}${r.path}?lang=en`;
    const idHref = `${BASE_URL}${r.path}?lang=id`;
    const defaultHref = `${BASE_URL}${r.path}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      r.changefreq ? `    <changefreq>${r.changefreq}</changefreq>` : null,
      r.priority ? `    <priority>${r.priority}</priority>` : null,
      `    <xhtml:link rel="alternate" hreflang="en" href="${enHref}" />`,
      `    <xhtml:link rel="alternate" hreflang="id" href="${idHref}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />`,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  }).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

function buildSitemapIndex(): string {
  const lastmod = today();
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <sitemap>",
    `    <loc>${BASE_URL}/sitemap-en.xml</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </sitemap>",
    "  <sitemap>",
    `    <loc>${BASE_URL}/sitemap-id.xml</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </sitemap>",
    "</sitemapindex>",
    "",
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Authz: either a logged-in admin user, OR pg_cron via the special header
  const isCron = req.headers.get("x-sitemap-cron") === "true";
  let triggeredBy = "cron";

  if (!isCron) {
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    triggeredBy = `user:${userData.user.id}`;
  }

  try {
    const files = [
      { file_name: "sitemap.xml", xml: buildSitemapIndex(), url_count: 2 },
      {
        file_name: "sitemap-en.xml",
        xml: buildLanguageSitemap("en"),
        url_count: PUBLIC_ROUTES.length,
      },
      {
        file_name: "sitemap-id.xml",
        xml: buildLanguageSitemap("id"),
        url_count: PUBLIC_ROUTES.length,
      },
    ];

    const generated_at = new Date().toISOString();
    const { error } = await supabase
      .from("sitemap_cache")
      .upsert(files.map((f) => ({ ...f, generated_at })), {
        onConflict: "file_name",
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        triggeredBy,
        generated_at,
        files: files.map((f) => ({ file_name: f.file_name, url_count: f.url_count })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
