export type DemandLevel = "LOW" | "MODERATE" | "HIGH" | "VERY HIGH";
export type PricePosition = "BELOW MARKET" | "FAIR MARKET" | "ABOVE MARKET" | "PREMIUM JUSTIFIED";

export interface UrgencyLabelResult {
  label: string;
  variant: "hot" | "warm" | "neutral" | "cool" | "cold";
}

/**
 * Generate an urgency signal label based on demand level and price position.
 * Pure client-side logic — no API call needed.
 */
export function generateUrgencyLabel(
  demandLevel: DemandLevel,
  pricePosition: PricePosition
): UrgencyLabelResult {
  // VERY HIGH demand
  if (demandLevel === "VERY HIGH" && (pricePosition === "BELOW MARKET" || pricePosition === "FAIR MARKET")) {
    return { label: "🔥 FAST SELLING ZONE", variant: "hot" };
  }
  if (demandLevel === "VERY HIGH" && pricePosition === "ABOVE MARKET") {
    return { label: "📈 HIGH DEMAND AREA", variant: "warm" };
  }
  if (demandLevel === "VERY HIGH" && pricePosition === "PREMIUM JUSTIFIED") {
    return { label: "💎 PREMIUM HOTSPOT", variant: "warm" };
  }

  // HIGH demand
  if (demandLevel === "HIGH" && pricePosition === "BELOW MARKET") {
    return { label: "🚀 INVESTOR HOTSPOT", variant: "hot" };
  }
  if (demandLevel === "HIGH" && pricePosition === "FAIR MARKET") {
    return { label: "📈 HIGH DEMAND AREA", variant: "warm" };
  }
  if (demandLevel === "HIGH" && pricePosition === "ABOVE MARKET") {
    return { label: "⚡ COMPETITIVE LISTING", variant: "neutral" };
  }
  if (demandLevel === "HIGH" && pricePosition === "PREMIUM JUSTIFIED") {
    return { label: "💎 PREMIUM MARKET", variant: "neutral" };
  }

  // MODERATE demand
  if (demandLevel === "MODERATE" && pricePosition === "BELOW MARKET") {
    return { label: "💰 VALUE OPPORTUNITY", variant: "warm" };
  }
  if (demandLevel === "MODERATE" && pricePosition === "FAIR MARKET") {
    return { label: "📊 STEADY MARKET", variant: "neutral" };
  }
  if (demandLevel === "MODERATE" && (pricePosition === "ABOVE MARKET" || pricePosition === "PREMIUM JUSTIFIED")) {
    return { label: "⏳ PREMIUM SLOW MARKET", variant: "cool" };
  }

  // LOW demand
  if (demandLevel === "LOW" && pricePosition === "BELOW MARKET") {
    return { label: "🔍 HIDDEN GEM", variant: "neutral" };
  }
  if (demandLevel === "LOW" && pricePosition === "FAIR MARKET") {
    return { label: "📉 LIMITED BUYER INTEREST", variant: "cool" };
  }
  if (demandLevel === "LOW" && (pricePosition === "ABOVE MARKET" || pricePosition === "PREMIUM JUSTIFIED")) {
    return { label: "🐢 SLOW MARKET ZONE", variant: "cold" };
  }

  return { label: "📊 STEADY MARKET", variant: "neutral" };
}
