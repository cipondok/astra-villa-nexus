/**
 * Property Pricing Psychology Optimization Engine
 *
 * Composite Buyer Perception Score (0-100):
 *   anchoring_effect   × 0.25
 * + charm_pricing      × 0.20
 * + negotiation_margin × 0.20
 * + urgency_signal     × 0.20
 * + segment_alignment  × 0.15
 */

export type PriceSegment = 'value' | 'mid' | 'premium' | 'luxury';
export type UrgencyLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

export interface PsychPricingInput {
  listing_price: number;
  fair_market_value: number;
  avg_nearby_price: number;
  days_on_market: number;
  competing_listings: number;
  inquiry_count_7d: number;
  segment: PriceSegment;
}

export interface PsychPricingOutput {
  buyer_perception_score: number;
  perception_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggested_psychological_price: number;
  charm_price: number;
  anchor_price: number;
  negotiation_flexibility: { min: number; max: number; margin_pct: number };
  urgency_level: UrgencyLevel;
  urgency_messages: string[];
  agent_tips: string[];
  signal_breakdown: {
    anchoring: number;
    charm: number;
    negotiation: number;
    urgency: number;
    segment: number;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

/* ── Signal scorers (each returns 0-100) ── */

export function scoreAnchoring(listingPrice: number, avgNearby: number): number {
  if (avgNearby <= 0) return 50;
  const ratio = listingPrice / avgNearby;
  // Sweet spot: 0.90-1.05 of nearby avg → high score
  if (ratio >= 0.90 && ratio <= 1.05) return 85 + (1 - Math.abs(ratio - 0.975) / 0.075) * 15;
  if (ratio < 0.90) return Math.max(40, 85 - (0.90 - ratio) * 300);
  // Overpriced relative to anchor
  return Math.max(10, 85 - (ratio - 1.05) * 250);
}

export function scoreCharmPricing(price: number): number {
  const str = price.toString();
  // Ending in 9s is ideal for charm pricing
  if (str.endsWith('9000000') || str.endsWith('99000000') || str.endsWith('999000000')) return 95;
  if (str.endsWith('49000000') || str.endsWith('9500000')) return 80;
  // Round numbers work for luxury but score lower generally
  const lastSig = Math.floor(price / 100_000_000) * 100_000_000;
  if (price === lastSig) return 45;
  return 55;
}

export function scoreNegotiationMargin(listingPrice: number, fmv: number): number {
  if (fmv <= 0) return 50;
  const marginPct = ((listingPrice - fmv) / fmv) * 100;
  // Ideal margin: 3-8% above FMV → room to negotiate without loss
  if (marginPct >= 3 && marginPct <= 8) return 90;
  if (marginPct >= 0 && marginPct < 3) return 70;
  if (marginPct > 8 && marginPct <= 15) return 60;
  if (marginPct > 15) return Math.max(15, 60 - (marginPct - 15) * 3);
  // Below FMV
  return Math.max(30, 70 + marginPct * 4);
}

export function scoreUrgency(dom: number, inquiries7d: number, competing: number): number {
  let score = 50;
  // DOM pressure
  if (dom > 90) score -= 20;
  else if (dom > 60) score -= 10;
  else if (dom < 14) score += 15;
  // Inquiry heat
  if (inquiries7d >= 10) score += 25;
  else if (inquiries7d >= 5) score += 15;
  else if (inquiries7d <= 1) score -= 10;
  // Competition scarcity
  if (competing <= 3) score += 15;
  else if (competing >= 15) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function scoreSegmentAlignment(price: number, segment: PriceSegment): number {
  // Check if price bracket matches declared segment
  const billions = price / 1_000_000_000;
  let implied: PriceSegment;
  if (billions < 1) implied = 'value';
  else if (billions < 3) implied = 'mid';
  else if (billions < 8) implied = 'premium';
  else implied = 'luxury';

  if (implied === segment) return 90;
  const order: PriceSegment[] = ['value', 'mid', 'premium', 'luxury'];
  const diff = Math.abs(order.indexOf(implied) - order.indexOf(segment));
  return Math.max(20, 90 - diff * 30);
}

/* ── Charm price generator ── */
export function computeCharmPrice(price: number): number {
  if (price >= 1_000_000_000) {
    const hundreds = Math.floor(price / 100_000_000);
    return hundreds * 100_000_000 - 1_000_000;
  }
  const tens = Math.floor(price / 10_000_000);
  return tens * 10_000_000 - 1_000_000;
}

/* ── Urgency level classifier ── */
function classifyUrgency(dom: number, inquiries7d: number): UrgencyLevel {
  if (dom > 90 && inquiries7d <= 1) return 'critical';
  if (dom > 60 || inquiries7d <= 2) return 'high';
  if (dom > 30) return 'moderate';
  if (inquiries7d >= 5) return 'low';
  return 'none';
}

/* ── Main optimizer ── */
export function optimizePricingPsychology(input: PsychPricingInput): PsychPricingOutput {
  const { listing_price, fair_market_value, avg_nearby_price, days_on_market, competing_listings, inquiry_count_7d, segment } = input;

  const anchoring = scoreAnchoring(listing_price, avg_nearby_price);
  const charm = scoreCharmPricing(listing_price);
  const negotiation = scoreNegotiationMargin(listing_price, fair_market_value);
  const urgency = scoreUrgency(days_on_market, inquiry_count_7d, competing_listings);
  const seg = scoreSegmentAlignment(listing_price, segment);

  const composite = Math.round(
    anchoring * 0.25 + charm * 0.20 + negotiation * 0.20 + urgency * 0.20 + seg * 0.15
  );

  const grade = composite >= 85 ? 'A' : composite >= 70 ? 'B' : composite >= 55 ? 'C' : composite >= 40 ? 'D' : 'F';

  const charmPrice = computeCharmPrice(listing_price);
  const anchorPrice = Math.round(listing_price * 1.12);
  const marginPct = fair_market_value > 0 ? Math.round(((listing_price - fair_market_value) / fair_market_value) * 100) : 0;

  const urgencyLevel = classifyUrgency(days_on_market, inquiry_count_7d);

  // Suggested psychological price: blend charm + anchor positioning
  const suggested = segment === 'luxury'
    ? Math.round(listing_price / 100_000_000) * 100_000_000 // Round for luxury
    : charmPrice;

  // Negotiation flexibility
  const negMin = Math.round(fair_market_value * 0.97);
  const negMax = listing_price;

  // Urgency messages
  const urgencyMessages: string[] = [];
  if (inquiry_count_7d >= 5) urgencyMessages.push(`${inquiry_count_7d} calon pembeli tertarik minggu ini`);
  if (competing_listings <= 3) urgencyMessages.push('Stok terbatas di area ini — hanya tersisa beberapa unit');
  if (days_on_market < 14) urgencyMessages.push('Listing baru — harga awal berlaku terbatas');
  if (days_on_market > 60) urgencyMessages.push('Harga spesial untuk percepatan closing bulan ini');
  if (urgencyMessages.length === 0) urgencyMessages.push('Hubungi sekarang untuk jadwal kunjungan prioritas');

  // Agent tips
  const agentTips: string[] = [];
  if (anchoring < 60) agentTips.push(`Harga listing ${listing_price > avg_nearby_price ? 'di atas' : 'terlalu jauh di bawah'} rata-rata area (${fmt(avg_nearby_price)}). Pertimbangkan reposisi.`);
  if (charm < 60) agentTips.push(`Gunakan charm price ${fmt(charmPrice)} — secara psikologis terlihat di bracket lebih rendah.`);
  if (marginPct > 12) agentTips.push('Margin negosiasi terlalu lebar, pembeli mungkin ragu memulai penawaran.');
  if (marginPct < 2) agentTips.push('Ruang negosiasi sempit — pastikan harga kompetitif atau tawarkan insentif.');
  if (urgencyLevel === 'critical') agentTips.push('Listing stagnant — pertimbangkan reprice agresif + bundling insentif.');
  if (segment === 'luxury' && charm > 70) agentTips.push('Untuk segmen luxury, harga bulat (rounded) lebih efektif daripada charm pricing.');

  return {
    buyer_perception_score: composite,
    perception_grade: grade,
    suggested_psychological_price: suggested,
    charm_price: charmPrice,
    anchor_price: anchorPrice,
    negotiation_flexibility: { min: negMin, max: negMax, margin_pct: marginPct },
    urgency_level: urgencyLevel,
    urgency_messages: urgencyMessages,
    agent_tips: agentTips,
    signal_breakdown: { anchoring, charm, negotiation, urgency, segment: seg },
  };
}
