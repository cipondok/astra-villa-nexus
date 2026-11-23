/** Share links for a property, each tagged with UTM parameters. */
export type ShareChannel =
  | "whatsapp" | "facebook" | "telegram" | "x" | "copy_link" | "qr" | "instagram" | "tiktok" | "native";

const MEDIUM: Record<ShareChannel, string> = {
  whatsapp: "messaging", telegram: "messaging", facebook: "social", x: "social",
  instagram: "social", tiktok: "social", copy_link: "referral", qr: "offline", native: "referral",
};

export interface ShareTarget {
  url: string; // absolute property URL (canonical)
  title: string;
  price?: string; // already formatted, e.g. "IDR 4.5 billion"
  place?: string;
}

/** Canonical URL + utm_source/medium/campaign for one channel. */
export function withUtm(url: string, channel: ShareChannel, campaign = "property_share"): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", channel);
  u.searchParams.set("utm_medium", MEDIUM[channel]);
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

/** Short human caption, e.g. for WhatsApp/Telegram/Instagram. */
export function shareCaption(t: ShareTarget): string {
  const bits = [t.title, [t.price, t.place].filter(Boolean).join(" · ")].filter(Boolean);
  return `${bits.join("\n")}\nASTRA Villa`;
}

/** Web intent URL for channels that have one; null for copy/QR/app-only channels. */
export function shareIntentUrl(channel: ShareChannel, t: ShareTarget, campaign?: string): string | null {
  const link = withUtm(t.url, channel, campaign);
  const caption = shareCaption(t);
  const e = encodeURIComponent;
  switch (channel) {
    case "whatsapp": return `https://wa.me/?text=${e(`${caption}\n${link}`)}`;
    case "facebook": return `https://www.facebook.com/sharer/sharer.php?u=${e(link)}`;
    case "telegram": return `https://t.me/share/url?url=${e(link)}&text=${e(caption)}`;
    case "x": return `https://x.com/intent/post?text=${e(`${t.title}${t.place ? ` — ${t.place}` : ""}`)}&url=${e(link)}`;
    default: return null;
  }
}
