import { useEffect } from "react";
import { useAllBrandingLogos } from "@/hooks/useBrandingLogo";

/**
 * Syncs the configured Branding logo (from Settings → Branding, stored in
 * `system_settings`) to all browser/SEO/social surfaces at runtime:
 *
 * - <link rel="icon"> + shortcut icon (browser tab + Google search favicon)
 * - <link rel="apple-touch-icon"> (iOS home screen)
 * - <meta property="og:image"> (Facebook / LinkedIn / WhatsApp previews)
 * - <meta name="twitter:image"> (X / Twitter card)
 * - JSON-LD Organization / RealEstateAgent `logo` + `image` fields
 *
 * Does NOT create new assets. It only points existing head tags at the
 * branding URL already configured by the admin. Falls back through:
 *   faviconUrl → headerLogo → pwaLogo → existing static /icon-512.png
 */
const setLink = (rel: string, href: string, attrs: Record<string, string> = {}) => {
  const selector = `link[rel="${rel}"]${attrs.sizes ? `[sizes="${attrs.sizes}"]` : ""}`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
};

const setMeta = (selector: string, attr: "content", value: string) => {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute(attr, value);
};

const updateJsonLdLogo = (logoUrl: string) => {
  const scripts = document.head.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]'
  );
  scripts.forEach((s) => {
    try {
      const data = JSON.parse(s.textContent || "{}");
      let changed = false;
      if (data && typeof data === "object") {
        if ("logo" in data && data.logo !== logoUrl) {
          data.logo = logoUrl;
          changed = true;
        }
        if ("image" in data && data.image !== logoUrl) {
          data.image = logoUrl;
          changed = true;
        }
      }
      if (changed) s.textContent = JSON.stringify(data);
    } catch {
      /* ignore non-JSON */
    }
  });
};

export const DynamicBrandingSync = () => {
  const { data: logos } = useAllBrandingLogos();

  useEffect(() => {
    if (!logos) return;

    const faviconUrl =
      logos.faviconUrl || logos.headerLogo || logos.pwaLogo || "/icon-512.png";
    const appIconUrl =
      logos.mobileAppIcon || logos.pwaLogo || logos.headerLogo || "/icon-512.png";
    const socialUrl =
      logos.headerLogo || logos.pwaLogo || logos.faviconUrl || "/icon-512.png";

    // Browser tab + Google search favicon
    setLink("icon", faviconUrl);
    setLink("shortcut icon", faviconUrl);

    // iOS home screen
    setLink("apple-touch-icon", appIconUrl);

    // Open Graph / Twitter
    setMeta('meta[property="og:image"]', "content", socialUrl);
    setMeta('meta[name="twitter:image"]', "content", socialUrl);

    // Structured data
    updateJsonLdLogo(socialUrl);
  }, [logos]);

  return null;
};

export default DynamicBrandingSync;
