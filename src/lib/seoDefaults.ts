// Central SEO defaults for ASTRA Villa Property.
// Title template: "{page} | ASTRA Villa Property"

export const SITE_NAME = "ASTRA Villa Property";
export const SITE_SLOGAN = "Indonesia's Premier AI-Powered Property Platform";
export const SITE_URL = "https://astravilla.com";
export const SITE_TWITTER = "@astravilla";

export const DEFAULT_KEYWORDS =
  "property indonesia, bali villa, luxury villa, real estate indonesia, property investment, villa for sale, villa rental, apartment indonesia, property marketplace, astra villa property";

export const DEFAULT_DESCRIPTION =
  "Discover luxury villas, apartments, land, and investment properties across Indonesia with AI-powered search, virtual tours, and verified listings.";

export const HOME_FULL_TITLE =
  "ASTRA Villa Property | Indonesian Real Estate";

export const OG_TITLE =
  "ASTRA Villa Property | Indonesia's AI-Powered Real Estate Platform";

export const OG_DESCRIPTION =
  "Buy, sell, rent, and invest in premium Indonesian properties with AI-powered search, virtual tours, and verified listings.";

export interface PageSeoDefault {
  /** Page title fragment — rendered as `{title} | ASTRA Villa Property` */
  title: string;
  description: string;
  keywords?: string;
  /** Optional canonical path (no domain) */
  path?: string;
}

/**
 * SEO defaults for the platform's main marketing pages.
 * Page components can spread these into <SEOHead />.
 */
export const PAGE_SEO: Record<string, PageSeoDefault> = {
  home: {
    title: "Buy, Sell, Rent & Invest in Indonesian Real Estate",
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    path: "/",
  },
  buy: {
    title: "Buy Property in Indonesia",
    description:
      "Browse verified villas, apartments, houses, and land for sale across Bali, Jakarta, and Indonesia. AI-powered search and virtual tours.",
    keywords:
      "buy property indonesia, villa for sale bali, house for sale jakarta, apartment for sale, land for sale indonesia",
    path: "/buy",
  },
  rent: {
    title: "Rent Property in Indonesia",
    description:
      "Find luxury villa rentals, monthly apartments, and long-term homes across Indonesia with verified listings and instant booking.",
    keywords:
      "villa rental bali, apartment rent jakarta, monthly villa, property for rent indonesia, long term rental",
    path: "/rent",
  },
  sell: {
    title: "Sell Your Property",
    description:
      "List your villa, apartment, or land on Indonesia's AI-powered property marketplace. Reach verified buyers and investors worldwide.",
    keywords:
      "sell property indonesia, list villa, sell house bali, property listing platform",
    path: "/sell",
  },
  newProjects: {
    title: "New Property Projects in Indonesia",
    description:
      "Discover the newest residential and investment property launches across Bali, Jakarta, and emerging Indonesian markets.",
    keywords:
      "new property projects indonesia, off-plan villa, new launch apartment, pre-sale property bali",
    path: "/new-projects",
  },
  investment: {
    title: "Property Investment Opportunities",
    description:
      "Invest in fractional villas, REITs, and high-yield Indonesian properties. AI-driven ROI analytics and verified opportunities.",
    keywords:
      "property investment indonesia, fractional villa, real estate REIT, bali property investment, ROI calculator",
    path: "/investment",
  },
  locations: {
    title: "Property Locations Across Indonesia",
    description:
      "Explore property markets in Bali, Jakarta, Surabaya, Bandung, and emerging Indonesian destinations.",
    keywords:
      "property bali, property jakarta, property surabaya, property bandung, indonesia real estate locations",
    path: "/locations",
  },
  propertyDetails: {
    title: "Property Details",
    description:
      "View full details, photos, 3D virtual tours, location insights, and investment analytics for this property.",
    keywords: DEFAULT_KEYWORDS,
  },
  blog: {
    title: "Property Insights & Market News",
    description:
      "Read the latest Indonesian property market trends, investment guides, and luxury real estate news from ASTRA Villa Property.",
    keywords:
      "indonesia property news, real estate blog, property market trends, investment guide",
    path: "/blog",
  },
  contact: {
    title: "Contact ASTRA Villa Property",
    description:
      "Get in touch with our property experts for buying, selling, renting, or investing in Indonesian real estate.",
    keywords: "contact astra villa, property consultation indonesia",
    path: "/contact",
  },
};
