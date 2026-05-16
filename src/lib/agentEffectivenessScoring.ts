/**
 * Agent Lead Effectiveness Scoring Engine
 * 
 * Zero-latency client-side deterministic scoring.
 * Weights aligned with investor satisfaction and platform growth.
 */

export interface AgentEffectivenessInput {
  avgResponseTimeMinutes: number;   // Average inquiry response time
  totalListingViews: number;        // Total views across all listings
  totalInquiries: number;           // Total inquiries received
  dealsClosedCount: number;         // Successful deal closures
  totalLeads: number;               // Total leads assigned/received
  avgInvestorRating: number;        // 0-5 star rating from investors
  totalRatings: number;             // Number of ratings received
  listingCount: number;             // Active listings count
  lastActiveWithinDays: number;     // Days since last activity
}

export interface AgentEffectivenessResult {
  totalScore: number;               // 0-100
  tier: 'Elite Partner' | 'Active Contributor' | 'Needs Improvement';
  tierColor: string;
  factors: {
    responseSpeed: { score: number; weight: number; weighted: number; detail: string };
    engagement: { score: number; weight: number; weighted: number; detail: string };
    closureRate: { score: number; weight: number; weighted: number; detail: string };
    investorFeedback: { score: number; weight: number; weighted: number; detail: string };
  };
  strengths: string[];
  improvements: string[];
}

/*
 * WEIGHT MODEL:
 *   Response Speed   → 30%  (fastest trust signal for investors)
 *   Engagement       → 20%  (listing quality drives views & inquiries)
 *   Closure Rate     → 30%  (revenue impact, platform value)
 *   Investor Rating  → 20%  (satisfaction & repeat business)
 */

export function calculateAgentEffectiveness(input: AgentEffectivenessInput): AgentEffectivenessResult {
  // ── Response Speed (30%) ──
  // < 15 min = 100, < 30 min = 90, < 60 min = 75, < 120 min = 50, < 240 min = 30, > 240 = 10
  let responseScore: number;
  const rt = input.avgResponseTimeMinutes;
  if (rt <= 15) responseScore = 100;
  else if (rt <= 30) responseScore = 90;
  else if (rt <= 60) responseScore = 75;
  else if (rt <= 120) responseScore = 50;
  else if (rt <= 240) responseScore = 30;
  else responseScore = 10;

  const responseDetail = rt <= 30
    ? `${rt} min avg — exceptional speed`
    : rt <= 60
    ? `${rt} min avg — good, aim for <30 min`
    : `${rt} min avg — needs improvement, target <60 min`;

  // ── Engagement Volume (20%) ──
  // Views-per-listing and inquiry conversion rate
  const viewsPerListing = input.listingCount > 0 ? input.totalListingViews / input.listingCount : 0;
  const inquiryRate = input.totalListingViews > 0 ? (input.totalInquiries / input.totalListingViews) * 100 : 0;

  let engagementScore: number;
  if (viewsPerListing >= 100 && inquiryRate >= 5) engagementScore = 100;
  else if (viewsPerListing >= 50 && inquiryRate >= 3) engagementScore = 80;
  else if (viewsPerListing >= 20 && inquiryRate >= 1.5) engagementScore = 60;
  else if (viewsPerListing >= 10) engagementScore = 40;
  else engagementScore = 20;

  const engagementDetail = `${viewsPerListing.toFixed(0)} views/listing · ${inquiryRate.toFixed(1)}% inquiry rate`;

  // ── Closure Rate (30%) ──
  const closureRate = input.totalLeads > 0 ? (input.dealsClosedCount / input.totalLeads) * 100 : 0;

  let closureScore: number;
  if (closureRate >= 20) closureScore = 100;
  else if (closureRate >= 15) closureScore = 85;
  else if (closureRate >= 10) closureScore = 70;
  else if (closureRate >= 5) closureScore = 50;
  else if (closureRate > 0) closureScore = 30;
  else closureScore = 5;

  const closureDetail = `${closureRate.toFixed(1)}% close rate (${input.dealsClosedCount}/${input.totalLeads} leads)`;

  // ── Investor Feedback (20%) ──
  let feedbackScore: number;
  if (input.totalRatings === 0) {
    feedbackScore = 40; // neutral baseline if no ratings
  } else {
    feedbackScore = Math.min(100, (input.avgInvestorRating / 5) * 100);
    // Boost for volume of ratings
    if (input.totalRatings >= 10) feedbackScore = Math.min(100, feedbackScore + 5);
  }

  const feedbackDetail = input.totalRatings === 0
    ? 'No ratings yet — encourage investor reviews'
    : `${input.avgInvestorRating.toFixed(1)}/5.0 from ${input.totalRatings} reviews`;

  // ── Weighted Total ──
  const factors = {
    responseSpeed: { score: responseScore, weight: 30, weighted: responseScore * 0.3, detail: responseDetail },
    engagement: { score: engagementScore, weight: 20, weighted: engagementScore * 0.2, detail: engagementDetail },
    closureRate: { score: closureScore, weight: 30, weighted: closureScore * 0.3, detail: closureDetail },
    investorFeedback: { score: feedbackScore, weight: 20, weighted: feedbackScore * 0.2, detail: feedbackDetail },
  };

  let totalScore = Math.round(
    factors.responseSpeed.weighted +
    factors.engagement.weighted +
    factors.closureRate.weighted +
    factors.investorFeedback.weighted
  );

  // Activity penalty: if inactive > 14 days, cap at 60
  if (input.lastActiveWithinDays > 14) {
    totalScore = Math.min(totalScore, 60);
  }

  totalScore = Math.max(0, Math.min(100, totalScore));

  // ── Tier Assignment ──
  let tier: AgentEffectivenessResult['tier'];
  let tierColor: string;
  if (totalScore >= 75) {
    tier = 'Elite Partner';
    tierColor = 'text-chart-2';
  } else if (totalScore >= 45) {
    tier = 'Active Contributor';
    tierColor = 'text-primary';
  } else {
    tier = 'Needs Improvement';
    tierColor = 'text-chart-1';
  }

  // ── Strengths & Improvements ──
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (responseScore >= 90) strengths.push('Exceptional response speed builds investor trust');
  else if (responseScore < 50) improvements.push('Reduce response time to under 60 minutes');

  if (engagementScore >= 80) strengths.push('High listing engagement — strong content quality');
  else if (engagementScore < 50) improvements.push('Improve listing photos and descriptions to increase views');

  if (closureScore >= 70) strengths.push('Strong deal closure rate drives platform revenue');
  else if (closureScore < 50) improvements.push('Focus on lead nurturing to improve closure rate');

  if (feedbackScore >= 80) strengths.push('Excellent investor satisfaction ratings');
  else if (feedbackScore < 50 && input.totalRatings > 0) improvements.push('Address investor feedback to improve satisfaction');

  if (input.lastActiveWithinDays > 14) improvements.push('Increase platform activity — inactive agents lose visibility');

  return { totalScore, tier, tierColor, factors, strengths, improvements };
}
