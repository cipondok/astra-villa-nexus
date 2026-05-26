export type LuxeNavSubLink = { label: string; to: string; desc?: string };
export type LuxeNavLink = { label: string; to: string; match?: string; mega?: LuxeNavSubLink[] };

export const LUXE_NAV_LINKS: LuxeNavLink[] = [
  {
    label: "Villas", to: "/properties", match: "/properties",
    mega: [
      { label: "Luxury Collection",   to: "/properties?collection=luxury",    desc: "Editor-curated icons" },
      { label: "Beachfront Villas",   to: "/properties?tag=beachfront",       desc: "Ocean cliffs & sand" },
      { label: "Jungle Sanctuaries",  to: "/properties?tag=jungle",           desc: "Ubud, Sayan, Tabanan" },
      { label: "Family Villas",       to: "/properties?tag=family",           desc: "4+ bedrooms, secure" },
      { label: "Investment Villas",   to: "/properties?intent=investment",    desc: "ROI-ranked picks" },
    ],
  },
  {
    label: "Investment", to: "/investment", match: "/investment",
    mega: [
      { label: "ROI Insights",        to: "/investment",          desc: "Yield, occupancy, IRR" },
      { label: "Market Intelligence", to: "/market-intelligence", desc: "Live Bali micro-market" },
      { label: "Investor Dashboard",  to: "/dashboard",           desc: "Your portfolio at a glance" },
      { label: "Price Estimator",     to: "/ai-pricing",          desc: "AI valuation & forecast" },
    ],
  },
  { label: "Virtual Tours", to: "/vr-tour",        match: "/vr-tour" },
  { label: "AI Concierge",  to: "/wealth-advisor", match: "/wealth-advisor" },
];

/** Nav links shown only when the user is authenticated. */
export const LUXE_NAV_LINKS_AUTH: LuxeNavLink[] = [
  { label: "Dashboard", to: "/dashboard", match: "/dashboard" },
];
