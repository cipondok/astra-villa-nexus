import { supabase } from "@/integrations/supabase/client";
import { analyzeRoute } from "@/utils/routeAnalytics";
import { SITE_ORIGIN } from "@/lib/canonicalUrl";

/** Known social / messaging referrer hosts mapped to a readable source name. */
const REFERRER_SOURCES: Array<[RegExp, string]> = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$/i, "facebook"],
  [/(^|\.)instagram\.com$/i, "instagram"],
  [/(^|\.)(twitter|x)\.com$|(^|\.)t\.co$/i, "x"],
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/i, "linkedin"],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/i, "whatsapp"],
  [/(^|\.)t\.me$|(^|\.)telegram\.(org|me)$/i, "telegram"],
  [/(^|\.)pinterest\.[a-z.]+$/i, "pinterest"],
  [/(^|\.)tiktok\.com$/i, "tiktok"],
  [/(^|\.)reddit\.com$/i, "reddit"],
  [/(^|\.)line\.me$/i, "line"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, "youtube"],
  [/(^|\.)google\.[a-z.]+$/i, "google"],
  [/(^|\.)bing\.com$|(^|\.)duckduckgo\.com$/i, "search"],
  [/(^|\.)mail\.[a-z.]+$|(^|\.)outlook\.[a-z.]+$/i, "email"],
];

const SESSION_KEY = "astra_session_id";
const VISIT_FLAG_PREFIX = "astra_share_visit:";

export type ShareEventType = "share_click" | "share_visit";

export interface ShareEventInput {
  event_type: ShareEventType;
  /** whatsapp | native | clipboard | copy_link | ... */
  channel?: string | null;
  property_id?: string | null;
  metadata?: Record<string, unknown>;
}

function sessionId(): string | null {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

/** Hostname of the document referrer, or null for direct / same-origin traffic. */
export function referrerHost(referrer = document.referrer): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host === window.location.hostname) return null;
    return host;
  } catch {
    return null;
  }
}

/** Map a referrer hostname to a readable source label. */
export function referrerSource(host: string | null): string | null {
  if (!host) return null;
  for (const [re, name] of REFERRER_SOURCES) {
    if (re.test(host)) return name;
  }
  return "external";
}

/** Read the head tags this page currently advertises to crawlers. */
function currentHeadUrls() {
  const canonical =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || null;
  const og =
    document
      .querySelector<HTMLMetaElement>('meta[property="og:url"]')
      ?.getAttribute("content") || null;
  return { canonical_url: canonical, og_url: og };
}

/** Fire-and-forget insert — analytics must never break the UI. */
async function record(input: ShareEventInput) {
  try {
    const { pathname, search } = window.location;
    const params = new URLSearchParams(search);
    const host = referrerHost();
    const { canonical_url, og_url } = currentHeadUrls();
    const { data: auth } = await supabase.auth.getUser();

    await supabase.from("social_share_events").insert({
      event_type: input.event_type,
      channel: input.channel ?? null,
      path: `${pathname}${search}`,
      route_pattern: analyzeRoute(pathname).pattern,
      property_id: input.property_id ?? null,
      canonical_url,
      og_url,
      referrer: document.referrer || null,
      referrer_host: host,
      referrer_source: referrerSource(host),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      session_id: sessionId(),
      user_id: auth?.user?.id ?? null,
      user_agent: navigator.userAgent.slice(0, 400),
      metadata: {
        site_origin: SITE_ORIGIN,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        ...(input.metadata || {}),
      },
    });
  } catch (err) {
    console.warn("share analytics failed:", err);
  }
}

/** Track an outbound share action (share button, copy link, channel share). */
export function trackShareClick(opts: {
  channel: string;
  propertyId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  void record({
    event_type: "share_click",
    channel: opts.channel,
    property_id: opts.propertyId ?? null,
    metadata: opts.metadata,
  });
}

/**
 * Track an inbound visit that originated from a social share preview or a
 * campaign-tagged link. Deduped once per session + path.
 */
export function trackShareVisit(opts?: { propertyId?: string | null }) {
  const host = referrerHost();
  const source = referrerSource(host);
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");

  const isSocial =
    !!source && !["external", "search", "google"].includes(source);
  const isCampaign = !!utmSource || params.has("ref");
  if (!isSocial && !isCampaign) return;

  const key = `${VISIT_FLAG_PREFIX}${window.location.pathname}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode — still record once per page load */
  }

  void record({
    event_type: "share_visit",
    channel: source || utmSource,
    property_id: opts?.propertyId ?? null,
    metadata: { entry_kind: isSocial ? "social_referrer" : "campaign_link" },
  });
}
