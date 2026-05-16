// ASTRA Villa — site-wide configuration
export const SITE = {
  name: "ASTRA Villa",
  domain: "astravilla.com",
  url: "https://astravilla.com",
  description: "Luxury villa sales and rentals across Indonesia.",
  whatsappNumber: "6285716008080", // international format, no +
  contactEmail: "astravillarealty@gmail.com",
  defaultLocale: "id" as const,
  supportedLocales: ["id", "en"] as const,
} as const;

export type Locale = (typeof SITE.supportedLocales)[number];
