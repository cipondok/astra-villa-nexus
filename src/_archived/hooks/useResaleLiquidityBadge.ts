export type ResaleRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ResaleLiquidityBadgeResult {
  label: string;
  variant: "excellent" | "good" | "neutral" | "caution" | "warning";
}

/**
 * Generate a resale liquidity badge based on liquidity score and resale risk.
 * Pure client-side logic — no API call needed.
 */
export function generateResaleLiquidityBadge(
  liquidityScore: number,
  resaleRiskLevel: ResaleRiskLevel
): ResaleLiquidityBadgeResult {
  // High liquidity + Low risk
  if (liquidityScore >= 80 && resaleRiskLevel === "LOW") {
    return { label: "🟢 EASY RESALE PROPERTY", variant: "excellent" };
  }

  // High liquidity + Medium risk
  if (liquidityScore >= 80 && resaleRiskLevel === "MEDIUM") {
    return { label: "💧 STRONG EXIT LIQUIDITY", variant: "good" };
  }

  // High liquidity + High risk
  if (liquidityScore >= 80 && resaleRiskLevel === "HIGH") {
    return { label: "⚡ LIQUID BUT VOLATILE", variant: "caution" };
  }

  // Medium liquidity + Low risk
  if (liquidityScore >= 50 && resaleRiskLevel === "LOW") {
    return { label: "📊 STABLE MARKET ASSET", variant: "good" };
  }

  // Medium liquidity + Medium risk
  if (liquidityScore >= 50 && resaleRiskLevel === "MEDIUM") {
    return { label: "🎯 SELECTIVE BUYER MARKET", variant: "neutral" };
  }

  // Medium liquidity + High risk
  if (liquidityScore >= 50 && resaleRiskLevel === "HIGH") {
    return { label: "⏳ LONG HOLD INVESTMENT", variant: "caution" };
  }

  // Low liquidity + Low risk
  if (liquidityScore < 50 && resaleRiskLevel === "LOW") {
    return { label: "🔍 NICHE MARKET ASSET", variant: "neutral" };
  }

  // Low liquidity + Medium risk
  if (liquidityScore < 50 && resaleRiskLevel === "MEDIUM") {
    return { label: "⏳ LONG HOLD INVESTMENT", variant: "caution" };
  }

  // Low liquidity + High risk
  if (liquidityScore < 50 && resaleRiskLevel === "HIGH") {
    return { label: "🔴 RESALE RISK ALERT", variant: "warning" };
  }

  return { label: "📊 STABLE MARKET ASSET", variant: "neutral" };
}
