export type LuxeNavSubLink = { label: string; to: string; desc?: string };
export type LuxeNavLink = { label: string; to: string; match?: string; mega?: LuxeNavSubLink[] };

export const LUXE_NAV_LINKS: LuxeNavLink[] = [
  {
    label: "Properties", to: "/properties", match: "/properties",
    mega: [
      { label: "All Villas",       to: "/properties",           desc: "Every active listing" },
      { label: "For Sale (Dijual)",to: "/dijual",               desc: "Ownership opportunities" },
      { label: "For Rent (Disewa)",to: "/disewa",               desc: "Short & long-term stays" },
      { label: "Buy",              to: "/buy",                  desc: "International buyers" },
      { label: "New Projects",     to: "/new-projects",         desc: "Just-launched developments" },
      { label: "Pre-Launch",       to: "/pre-launching",        desc: "Early-access pricing" },
    ],
  },
  {
    label: "Locations", to: "/location", match: "/location",
    mega: [
      { label: "Bali",          to: "/properties?location=Bali",      desc: "Uluwatu, Ubud, Canggu" },
      { label: "Jakarta",       to: "/properties?location=Jakarta",   desc: "Capital metropolitan" },
      { label: "Lombok",        to: "/properties?location=Lombok",    desc: "Emerging coastline" },
      { label: "Destination Map", to: "/location",                    desc: "Interactive explorer" },
    ],
  },
  {
    label: "Experiences", to: "/properties?tag=experiences", match: "/experiences",
    mega: [
      { label: "Beachfront",     to: "/properties?tag=beachfront",  desc: "Ocean cliffs & sand" },
      { label: "Jungle Retreat", to: "/properties?tag=jungle",      desc: "Ubud, Sayan, Tabanan" },
      { label: "Wellness",       to: "/properties?tag=wellness",    desc: "Spa & yoga sanctuaries" },
      { label: "Family Villas",  to: "/properties?tag=family",      desc: "4+ bedrooms, secure" },
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
  {
    label: "Technology", to: "/vr-tour", match: "/vr-tour",
    mega: [
      { label: "Virtual Tours", to: "/vr-tour",        desc: "3D immersive showcases" },
      { label: "AI Concierge",  to: "/wealth-advisor", desc: "Personal property AI" },
    ],
  },
];

/** Nav links shown only when the user is authenticated. */
export const LUXE_NAV_LINKS_AUTH: LuxeNavLink[] = [
  { label: "Dashboard", to: "/dashboard", match: "/dashboard" },
];
