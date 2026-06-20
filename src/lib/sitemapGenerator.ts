// Client-side sitemap generator for the admin Regenerate action.
// Mirrors the static files in /public (sitemap.xml + sitemap-{en,id}.xml).

export const SITEMAP_BASE_URL = "https://astravilla.com";

export interface SitemapRoute {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

// Public, indexable routes only. Keep in sync with src/App.tsx.
export const PUBLIC_ROUTES: SitemapRoute[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/buy", changefreq: "daily", priority: "0.9" },
  { path: "/rent", changefreq: "daily", priority: "0.9" },
  { path: "/sell", changefreq: "weekly", priority: "0.8" },
  { path: "/new-projects", changefreq: "weekly", priority: "0.8" },
  { path: "/investment", changefreq: "weekly", priority: "0.8" },
  { path: "/investment-opportunities", changefreq: "weekly", priority: "0.7" },
  { path: "/locations", changefreq: "weekly", priority: "0.7" },
  { path: "/search", changefreq: "daily", priority: "0.9" },
  { path: "/dijual", changefreq: "daily", priority: "0.9" },
  { path: "/disewa", changefreq: "daily", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/help", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const today = () => new Date().toISOString().slice(0, 10);

export function buildLanguageSitemap(
  lang: "en" | "id",
  routes: SitemapRoute[] = PUBLIC_ROUTES,
  base = SITEMAP_BASE_URL,
): string {
  const lastmod = today();
  const urls = routes
    .map((r) => {
      const locPath = r.path === "/" ? "/" : r.path;
      const loc = `${base}${locPath}?lang=${lang}`;
      const enHref = `${base}${locPath}?lang=en`;
      const idHref = `${base}${locPath}?lang=id`;
      const defaultHref = `${base}${locPath}`;
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
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

export function buildSitemapIndex(base = SITEMAP_BASE_URL): string {
  const lastmod = today();
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <sitemap>",
    `    <loc>${base}/sitemap-en.xml</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </sitemap>",
    "  <sitemap>",
    `    <loc>${base}/sitemap-id.xml</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </sitemap>",
    "</sitemapindex>",
    "",
  ].join("\n");
}

export interface GeneratedSitemaps {
  index: string;
  en: string;
  id: string;
  routeCount: number;
  generatedAt: string;
}

export function regenerateAllSitemaps(
  routes: SitemapRoute[] = PUBLIC_ROUTES,
  base = SITEMAP_BASE_URL,
): GeneratedSitemaps {
  return {
    index: buildSitemapIndex(base),
    en: buildLanguageSitemap("en", routes, base),
    id: buildLanguageSitemap("id", routes, base),
    routeCount: routes.length,
    generatedAt: new Date().toISOString(),
  };
}

export interface SitemapVerification {
  url: string;
  ok: boolean;
  status: number;
  urlCount?: number;
  error?: string;
}

export async function verifyPublishedSitemap(
  url: string,
): Promise<SitemapVerification> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { url, ok: false, status: res.status };
    }
    const text = await res.text();
    const urlCount = (text.match(/<loc>/g) || []).length;
    return { url, ok: true, status: res.status, urlCount };
  } catch (e) {
    return {
      url,
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
