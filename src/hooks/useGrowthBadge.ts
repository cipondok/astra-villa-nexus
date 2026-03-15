export type EntryTiming = "TOO EARLY" | "EARLY OPPORTUNITY" | "GROWTH PHASE" | "MATURE MARKET";

export interface GrowthBadgeResult {
  label: string;
  variant: "prime" | "early" | "growth" | "stable" | "speculative";
}

/**
 * Generate a growth opportunity badge based on growth score and entry timing.
 * Pure client-side logic — no API call needed.
 */
export function generateGrowthBadge(
  growthScore: number,
  entryTiming: EntryTiming
): GrowthBadgeResult {
  // EARLY OPPORTUNITY + high score — future prime
  if (entryTiming === "EARLY OPPORTUNITY" && growthScore >= 80) {
    return { label: "🚀 FUTURE PRIME AREA", variant: "prime" };
  }

  // EARLY OPPORTUNITY + moderate score
  if (entryTiming === "EARLY OPPORTUNITY" && growthScore >= 60) {
    return { label: "🟡 EARLY INVESTOR ZONE", variant: "early" };
  }

  // EARLY OPPORTUNITY + lower score
  if (entryTiming === "EARLY OPPORTUNITY") {
    return { label: "🔍 EMERGING MICRO-MARKET", variant: "early" };
  }

  // GROWTH PHASE + high score
  if (entryTiming === "GROWTH PHASE" && growthScore >= 75) {
    return { label: "📈 RAPID GROWTH CORRIDOR", variant: "growth" };
  }

  // GROWTH PHASE + moderate score
  if (entryTiming === "GROWTH PHASE" && growthScore >= 50) {
    return { label: "🌱 ACTIVE GROWTH ZONE", variant: "growth" };
  }

  // GROWTH PHASE + lower score
  if (entryTiming === "GROWTH PHASE") {
    return { label: "📊 STEADY GROWTH AREA", variant: "stable" };
  }

  // MATURE MARKET + high score
  if (entryTiming === "MATURE MARKET" && growthScore >= 60) {
    return { label: "🏛️ STABLE MATURE MARKET", variant: "stable" };
  }

  // MATURE MARKET + lower score
  if (entryTiming === "MATURE MARKET") {
    return { label: "📉 YIELD-FOCUSED ZONE", variant: "stable" };
  }

  // TOO EARLY + high score — speculative with potential
  if (entryTiming === "TOO EARLY" && growthScore >= 65) {
    return { label: "⚡ SPECULATIVE LAND PLAY", variant: "speculative" };
  }

  // TOO EARLY + low score — high risk
  return { label: "🔴 HIGH-RISK FRONTIER", variant: "speculative" };
}
