import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const SITE_NAME = 'ASTRA Villa Realty';
const DEFAULT_OG_IMAGE = 'https://lovable.dev/opengraph-image-p98pqg.png';
const SITE_URL = 'https://astra-villa-realty.lovable.app';

export const SEOHead = ({
  title,
  description = 'Platform properti premium Indonesia. Temukan villa, apartemen, dan rumah mewah dengan teknologi 3D & AI terdepan.',
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Platform Properti Premium Indonesia`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set/create a meta tag
    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = attr.split('=');
        el.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Basic meta
    setMeta('meta[name="description"]', 'name=description', description);
    if (keywords) setMeta('meta[name="keywords"]', 'name=keywords', keywords);
    if (noIndex) setMeta('meta[name="robots"]', 'name=robots', 'noindex, nofollow');
    else setMeta('meta[name="robots"]', 'name=robots', 'index, follow');

    // Open Graph
    setMeta('meta[property="og:title"]', 'property=og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property=og:description', description);
    setMeta('meta[property="og:type"]', 'property=og:type', ogType);
    setMeta('meta[property="og:image"]', 'property=og:image', ogImage);
    setMeta('meta[property="og:site_name"]', 'property=og:site_name', SITE_NAME);

    // Twitter Card
    setMeta('meta[name="twitter:title"]', 'name=twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name=twitter:image', ogImage);
    setMeta('meta[name="twitter:card"]', 'name=twitter:card', 'summary_large_image');

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const canonicalHref = canonical || `${SITE_URL}${window.location.pathname}`;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonicalHref;

    // JSON-LD
    const existingJsonLd = document.querySelectorAll('script[data-seo-jsonld]');
    existingJsonLd.forEach(el => el.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount - restore defaults
    return () => {
      document.title = SITE_NAME;
    };
  }, [fullTitle, description, keywords, ogImage, ogType, canonical, noIndex, jsonLd]);

  return null;
};

// Pre-built JSON-LD schemas
export const seoSchemas = {
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: ['https://twitter.com/astravilla'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['Indonesian', 'English'],
    },
  }),

  realEstateAgent: () => ({
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE_NAME,
    url: SITE_URL,
    areaServed: 'Indonesia',
    knowsAbout: ['Real Estate', 'Property Investment', 'Luxury Villas', 'Apartments'],
  }),

  property: (prop: {
    title: string;
    description: string;
    price: number;
    city: string;
    state: string;
    images?: string[];
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    url: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: prop.title,
    description: prop.description,
    url: prop.url,
    image: prop.images?.slice(0, 5) ?? [],
    offers: {
      '@type': 'Offer',
      price: prop.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: prop.city,
      addressRegion: prop.state,
      addressCountry: 'ID',
    },
    ...(prop.bedrooms !== undefined && { numberOfRooms: prop.bedrooms }),
    ...(prop.areaSqm !== undefined && { floorSize: { '@type': 'QuantitativeValue', value: prop.areaSqm, unitCode: 'MTK' } }),
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }),

  searchAction: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }),
};

export default SEOHead;
