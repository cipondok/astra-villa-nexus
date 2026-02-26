const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PageAudit {
  url: string;
  path: string;
  pageName: string;
  status: number;
  loadTimeMs: number;
  issues: AuditIssue[];
  scores: CategoryScores;
  meta: PageMeta;
}

interface AuditIssue {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

interface CategoryScores {
  meta: number;
  headings: number;
  images: number;
  links: number;
  performance: number;
  mobile: number;
  content: number;
}

interface PageMeta {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  hasCanonical: boolean;
  hasViewport: boolean;
  hasCharset: boolean;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasTwitterCard: boolean;
  h1Count: number;
  h2Count: number;
  imgCount: number;
  imgWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  hasStructuredData: boolean;
  hasHreflang: boolean;
  hasFavicon: boolean;
  hasRobotsMeta: boolean;
}

function extractTag(html: string, regex: RegExp): string {
  const match = html.match(regex);
  return match ? match[1]?.trim() || '' : '';
}

function countMatches(html: string, regex: RegExp): number {
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

function analyzeHtml(html: string, url: string): { issues: AuditIssue[]; scores: CategoryScores; meta: PageMeta } {
  const issues: AuditIssue[] = [];

  // Extract meta
  const title = extractTag(html, /<title[^>]*>(.*?)<\/title>/is);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);
  const description = descMatch ? descMatch[1] : '';
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  const hasCharset = /<meta[^>]*charset/i.test(html);
  const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
  const hasOgDescription = /<meta[^>]*property=["']og:description["']/i.test(html);
  const hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(html);
  const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);
  const h1Count = countMatches(html, /<h1[\s>]/gi);
  const h2Count = countMatches(html, /<h2[\s>]/gi);
  const imgCount = countMatches(html, /<img[\s]/gi);
  const imgWithoutAlt = countMatches(html, /<img(?![^>]*alt=["'][^"']+["'])[^>]*>/gi);
  const internalLinks = countMatches(html, /<a[^>]*href=["']\/[^"']*/gi);
  const externalLinks = countMatches(html, /<a[^>]*href=["']https?:\/\/(?!.*astra-villa-realty)/gi);
  const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 1).length;
  const hasStructuredData = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);
  const hasHreflang = /<link[^>]*hreflang/i.test(html);
  const hasFavicon = /<link[^>]*rel=["'](?:shortcut )?icon["']/i.test(html);
  const hasRobotsMeta = /<meta[^>]*name=["']robots["']/i.test(html);

  const meta: PageMeta = {
    title, titleLength: title.length, description, descriptionLength: description.length,
    hasCanonical, hasViewport, hasCharset, hasOgTitle, hasOgDescription, hasOgImage, hasTwitterCard,
    h1Count, h2Count, imgCount, imgWithoutAlt, internalLinks, externalLinks, wordCount,
    hasStructuredData, hasHreflang, hasFavicon, hasRobotsMeta
  };

  // --- META SCORE ---
  let metaScore = 100;
  if (!title || title.length === 0) {
    issues.push({ category: 'Meta', severity: 'critical', message: 'Missing page title', recommendation: 'Add a unique <title> tag to every page' });
    metaScore -= 25;
  } else if (title.length < 30 || title.length > 60) {
    issues.push({ category: 'Meta', severity: 'warning', message: `Title length (${title.length}) not optimal`, recommendation: 'Keep title between 30-60 characters for best display in SERPs' });
    metaScore -= 10;
  }
  if (!description) {
    issues.push({ category: 'Meta', severity: 'critical', message: 'Missing meta description', recommendation: 'Add a meta description to improve CTR from search results' });
    metaScore -= 25;
  } else if (description.length < 120 || description.length > 160) {
    issues.push({ category: 'Meta', severity: 'warning', message: `Description length (${description.length}) not optimal`, recommendation: 'Keep description between 120-160 characters' });
    metaScore -= 10;
  }
  if (!hasCanonical) {
    issues.push({ category: 'Meta', severity: 'warning', message: 'Missing canonical URL', recommendation: 'Add <link rel="canonical"> to prevent duplicate content issues' });
    metaScore -= 10;
  }
  if (!hasRobotsMeta) {
    issues.push({ category: 'Meta', severity: 'info', message: 'No robots meta tag', recommendation: 'Consider adding robots meta tag for crawl control' });
    metaScore -= 5;
  }

  // --- HEADINGS SCORE ---
  let headingsScore = 100;
  if (h1Count === 0) {
    issues.push({ category: 'Headings', severity: 'critical', message: 'No H1 heading found', recommendation: 'Add exactly one H1 heading per page for SEO structure' });
    headingsScore -= 40;
  } else if (h1Count > 1) {
    issues.push({ category: 'Headings', severity: 'warning', message: `Multiple H1 tags (${h1Count})`, recommendation: 'Use only one H1 per page; use H2-H6 for subsections' });
    headingsScore -= 20;
  }
  if (h2Count === 0) {
    issues.push({ category: 'Headings', severity: 'info', message: 'No H2 subheadings', recommendation: 'Add H2 headings to structure content and improve readability' });
    headingsScore -= 15;
  }

  // --- IMAGES SCORE ---
  let imagesScore = 100;
  if (imgCount > 0 && imgWithoutAlt > 0) {
    const pct = Math.round((imgWithoutAlt / imgCount) * 100);
    const sev = pct > 50 ? 'critical' : 'warning';
    issues.push({ category: 'Images', severity: sev, message: `${imgWithoutAlt}/${imgCount} images missing alt text (${pct}%)`, recommendation: 'Add descriptive alt text to all images for accessibility and SEO' });
    imagesScore -= Math.min(pct, 60);
  }
  if (imgCount === 0) {
    issues.push({ category: 'Images', severity: 'info', message: 'No images found', recommendation: 'Consider adding relevant images to improve engagement' });
    imagesScore -= 10;
  }

  // --- LINKS SCORE ---
  let linksScore = 100;
  if (internalLinks < 3) {
    issues.push({ category: 'Links', severity: 'warning', message: `Low internal links (${internalLinks})`, recommendation: 'Add more internal links to improve crawlability and page authority distribution' });
    linksScore -= 20;
  }

  // --- PERFORMANCE HINTS ---
  let perfScore = 100;
  const htmlSize = html.length;
  if (htmlSize > 500000) {
    issues.push({ category: 'Performance', severity: 'warning', message: `Large HTML size (${Math.round(htmlSize / 1024)}KB)`, recommendation: 'Reduce HTML size by removing inline styles/scripts and optimizing content' });
    perfScore -= 20;
  }
  if (!hasCharset) {
    issues.push({ category: 'Performance', severity: 'info', message: 'Missing charset declaration', recommendation: 'Add <meta charset="utf-8"> for proper text encoding' });
    perfScore -= 5;
  }

  // --- MOBILE SCORE ---
  let mobileScore = 100;
  if (!hasViewport) {
    issues.push({ category: 'Mobile', severity: 'critical', message: 'Missing viewport meta tag', recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile responsiveness' });
    mobileScore -= 40;
  }

  // --- CONTENT SCORE ---
  let contentScore = 100;
  if (wordCount < 300) {
    issues.push({ category: 'Content', severity: 'warning', message: `Low word count (${wordCount})`, recommendation: 'Add more meaningful content (aim for 300+ words) for better ranking potential' });
    contentScore -= 25;
  }
  if (!hasStructuredData) {
    issues.push({ category: 'Content', severity: 'warning', message: 'No structured data found', recommendation: 'Add JSON-LD schema markup for rich search results' });
    contentScore -= 15;
  }

  // Social
  if (!hasOgTitle || !hasOgDescription) {
    issues.push({ category: 'Meta', severity: 'warning', message: 'Missing Open Graph tags', recommendation: 'Add og:title and og:description for better social media sharing' });
    metaScore -= 10;
  }
  if (!hasOgImage) {
    issues.push({ category: 'Meta', severity: 'warning', message: 'No Open Graph image', recommendation: 'Add og:image (1200×630px) for visual social sharing' });
    metaScore -= 5;
  }
  if (!hasTwitterCard) {
    issues.push({ category: 'Meta', severity: 'info', message: 'Missing Twitter Card tags', recommendation: 'Add twitter:card meta tag for Twitter sharing' });
  }

  const scores: CategoryScores = {
    meta: Math.max(0, metaScore),
    headings: Math.max(0, headingsScore),
    images: Math.max(0, imagesScore),
    links: Math.max(0, linksScore),
    performance: Math.max(0, perfScore),
    mobile: Math.max(0, mobileScore),
    content: Math.max(0, contentScore),
  };

  return { issues, scores, meta };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseUrl, pages } = await req.json();

    if (!baseUrl || !pages || !Array.isArray(pages)) {
      return new Response(
        JSON.stringify({ success: false, error: 'baseUrl and pages array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting SEO audit for ${baseUrl} with ${pages.length} pages`);

    const results: PageAudit[] = [];

    for (const page of pages) {
      const url = `${baseUrl}${page.path}`;
      const startTime = Date.now();

      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'AstraVilla-SEO-Auditor/1.0' },
          redirect: 'follow',
        });

        const loadTimeMs = Date.now() - startTime;
        const html = await response.text();

        const { issues, scores, meta } = analyzeHtml(html, url);

        results.push({
          url,
          path: page.path,
          pageName: page.name,
          status: response.status,
          loadTimeMs,
          issues,
          scores,
          meta,
        });

        console.log(`Audited ${page.path}: ${issues.length} issues, load=${loadTimeMs}ms`);
      } catch (err) {
        console.error(`Failed to audit ${url}:`, err);
        results.push({
          url,
          path: page.path,
          pageName: page.name,
          status: 0,
          loadTimeMs: 0,
          issues: [{ category: 'Network', severity: 'critical', message: `Failed to fetch page: ${err.message}`, recommendation: 'Ensure the page is accessible and the URL is correct' }],
          scores: { meta: 0, headings: 0, images: 0, links: 0, performance: 0, mobile: 0, content: 0 },
          meta: { title: '', titleLength: 0, description: '', descriptionLength: 0, hasCanonical: false, hasViewport: false, hasCharset: false, hasOgTitle: false, hasOgDescription: false, hasOgImage: false, hasTwitterCard: false, h1Count: 0, h2Count: 0, imgCount: 0, imgWithoutAlt: 0, internalLinks: 0, externalLinks: 0, wordCount: 0, hasStructuredData: false, hasHreflang: false, hasFavicon: false, hasRobotsMeta: false }
        });
      }
    }

    // Compute overall
    const totalPages = results.length;
    const avgScores = {
      meta: Math.round(results.reduce((s, r) => s + r.scores.meta, 0) / totalPages),
      headings: Math.round(results.reduce((s, r) => s + r.scores.headings, 0) / totalPages),
      images: Math.round(results.reduce((s, r) => s + r.scores.images, 0) / totalPages),
      links: Math.round(results.reduce((s, r) => s + r.scores.links, 0) / totalPages),
      performance: Math.round(results.reduce((s, r) => s + r.scores.performance, 0) / totalPages),
      mobile: Math.round(results.reduce((s, r) => s + r.scores.mobile, 0) / totalPages),
      content: Math.round(results.reduce((s, r) => s + r.scores.content, 0) / totalPages),
    };
    const overallScore = Math.round(Object.values(avgScores).reduce((a, b) => a + b, 0) / 7);
    const totalIssues = results.reduce((s, r) => s + r.issues.length, 0);
    const criticalIssues = results.reduce((s, r) => s + r.issues.filter(i => i.severity === 'critical').length, 0);
    const warningIssues = results.reduce((s, r) => s + r.issues.filter(i => i.severity === 'warning').length, 0);

    console.log(`Audit complete: overall=${overallScore}, issues=${totalIssues}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          auditedAt: new Date().toISOString(),
          overallScore,
          avgScores,
          totalIssues,
          criticalIssues,
          warningIssues,
          pages: results,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('SEO audit error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Audit failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
