import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * Maps the current pathname to a key in the `seo.*` translation namespace.
 * Falls back to `seo.home` for unknown routes.
 */
function resolveSeoKey(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';

  if (p === '/' || p === '/luxe') return 'home';
  if (p === '/properties' || p.startsWith('/properties/') || p.startsWith('/property/')) return 'properties';
  if (p === '/dijual' || p === '/buy') return 'dijual';
  if (p === '/disewa' || p === '/rent' || p === '/sewa') return 'disewa';
  if (p === '/search') return 'search';
  if (p.startsWith('/about')) return 'about';
  if (p.startsWith('/contact')) return 'contact';
  if (p.startsWith('/help')) return 'help';
  if (p.startsWith('/auth') || p === '/login' || p === '/register') return 'auth';
  if (p.startsWith('/investment')) return 'investment';
  if (p.startsWith('/community')) return 'community';
  if (p.startsWith('/agents') || p.startsWith('/agent-directory')) return 'agentDirectory';
  if (p.startsWith('/location') || p === '/locations') return 'locationMap';

  return 'home';
}

const HTML_LANG: Record<string, string> = {
  en: 'en',
  id: 'id',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  ru: 'ru',
};

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  id: 'id_ID',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  ru: 'ru_RU',
};

const BASE_URL = 'https://astravilla.com';

/**
 * Renders per-route, per-language title, description, og/twitter tags,
 * html lang, and canonical. Updates automatically when the user switches
 * language via the language selector.
 */
export const LocalizedHead = () => {
  const { t, language } = useTranslation();
  const location = useLocation();

  // Do NOT memoize — translation lookups need to re-evaluate on every render
  // so lazy-loaded locale bundles refresh the head as soon as they arrive.
  const key = resolveSeoKey(location.pathname);
  const title = t(`seo.${key}.title`);
  const description = t(`seo.${key}.description`);
  const canonical = `${BASE_URL}${location.pathname === '/' ? '' : location.pathname}`;

  const htmlLang = HTML_LANG[language] ?? 'en';
  const ogLocale = OG_LOCALE[language] ?? 'en_US';

  return (
    <Helmet>
      <html lang={htmlLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default LocalizedHead;
