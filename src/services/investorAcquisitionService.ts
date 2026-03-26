/**
 * Autonomous Investor Acquisition Engine
 * Detects intent signals, scores leads, and orchestrates investor journeys.
 */

export type LeadTier = 'cold' | 'warm' | 'hot' | 'qualified';
export type JourneyStage = 'awareness' | 'interest' | 'evaluation' | 'commitment' | 'active';

export interface InvestorLead {
  tier: LeadTier;
  score: number; // 0-100
  intentSignals: string[];
  recommendedAction: string;
}

export interface AcquisitionFunnel {
  totalLeads: number;
  warmLeads: number;
  hotLeads: number;
  qualifiedLeads: number;
  conversionRate: number; // %
  avgTimeToQualifyDays: number;
  funnelHealth: 'strong' | 'moderate' | 'weak';
  recommendations: string[];
}

export interface InvestorAcquisitionSignals {
  funnel: AcquisitionFunnel;
  topOpportunities: InvestorLead[];
  outreachPriority: string[];
  engagementSequences: { trigger: string; action: string; timing: string }[];
}

/**
 * Lead Scoring Formula:
 * Property Views (10%) + Saves (15%) + Inquiries (25%) + Viewings (20%)
 * + Return Visits (10%) + Profile Completion (10%) + Wallet Activity (10%)
 */
export function scoreInvestorLead(
  views: number,
  saves: number,
  inquiries: number,
  viewings: number,
  returnVisits: number,
  profileComplete: boolean,
  walletActive: boolean
): InvestorLead {
  const viewScore = Math.min(views / 15, 1) * 100;
  const saveScore = Math.min(saves / 5, 1) * 100;
  const inquiryScore = Math.min(inquiries / 3, 1) * 100;
  const viewingScore = Math.min(viewings / 2, 1) * 100;
  const returnScore = Math.min(returnVisits / 5, 1) * 100;
  const profileScore = profileComplete ? 100 : 0;
  const walletScore = walletActive ? 100 : 0;

  const score = Math.round(
    viewScore * 0.10 +
    saveScore * 0.15 +
    inquiryScore * 0.25 +
    viewingScore * 0.20 +
    returnScore * 0.10 +
    profileScore * 0.10 +
    walletScore * 0.10
  );

  const intentSignals: string[] = [];
  if (views > 10) intentSignals.push('High browsing activity');
  if (saves > 2) intentSignals.push('Multiple property saves');
  if (inquiries > 0) intentSignals.push('Direct inquiry submitted');
  if (viewings > 0) intentSignals.push('Viewing requested');
  if (returnVisits > 3) intentSignals.push('Repeat visitor');
  if (walletActive) intentSignals.push('Wallet funded');

  let tier: LeadTier = 'cold';
  if (score >= 75) tier = 'qualified';
  else if (score >= 50) tier = 'hot';
  else if (score >= 25) tier = 'warm';

  let recommendedAction = 'Add to nurture campaign';
  if (tier === 'qualified') recommendedAction = 'Assign dedicated agent — immediate outreach';
  else if (tier === 'hot') recommendedAction = 'Schedule personal call within 24 hours';
  else if (tier === 'warm') recommendedAction = 'Send curated property shortlist';

  return { tier, score, intentSignals, recommendedAction };
}

/**
 * Generate acquisition funnel analytics from platform data.
 */
export function computeAcquisitionFunnel(
  totalUsers: number,
  totalInquiries: number,
  totalViewings: number,
  totalEscrows: number
): AcquisitionFunnel {
  const totalLeads = Math.max(totalUsers, 1);
  const warmLeads = Math.round(totalLeads * Math.min(totalInquiries / Math.max(totalLeads, 1), 0.6));
  const hotLeads = Math.round(totalLeads * Math.min(totalViewings / Math.max(totalLeads, 1), 0.3));
  const qualifiedLeads = Math.round(totalLeads * Math.min(totalEscrows / Math.max(totalLeads, 1), 0.15));
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  const avgTimeToQualifyDays = qualifiedLeads > 0 ? Math.max(Math.round(30 / Math.max(qualifiedLeads * 0.5, 1)), 3) : 45;

  let funnelHealth: AcquisitionFunnel['funnelHealth'] = 'moderate';
  if (conversionRate >= 10 && hotLeads > 5) funnelHealth = 'strong';
  else if (conversionRate < 3 || hotLeads < 2) funnelHealth = 'weak';

  const recommendations: string[] = [];
  if (totalLeads < 50) recommendations.push('Expand top-of-funnel — increase content marketing and SEO.');
  if (warmLeads < totalLeads * 0.2) recommendations.push('Low engagement rate — improve property presentation quality.');
  if (hotLeads < warmLeads * 0.3) recommendations.push('Warm-to-hot conversion weak — activate automated follow-up sequences.');
  if (conversionRate < 5) recommendations.push('Conversion below 5% — review inquiry response time and agent quality.');
  if (avgTimeToQualifyDays > 21) recommendations.push('Slow qualification — implement urgency triggers and limited offers.');
  if (funnelHealth === 'strong') recommendations.push('Funnel performing well — scale acquisition spend.');
  if (recommendations.length === 0) recommendations.push('Maintain current acquisition cadence.');

  return { totalLeads, warmLeads, hotLeads, qualifiedLeads, conversionRate, avgTimeToQualifyDays, funnelHealth, recommendations };
}

/**
 * Full acquisition signals from platform state.
 */
export function generateAcquisitionSignals(
  totalUsers: number,
  totalInquiries: number,
  totalViewings: number,
  totalEscrows: number,
  totalProperties: number
): InvestorAcquisitionSignals {
  const funnel = computeAcquisitionFunnel(totalUsers, totalInquiries, totalViewings, totalEscrows);

  // Simulated top opportunities based on platform scale
  const topOpportunities: InvestorLead[] = [
    scoreInvestorLead(12, 4, 2, 1, 4, true, true),
    scoreInvestorLead(8, 3, 1, 1, 2, true, false),
    scoreInvestorLead(20, 2, 1, 0, 6, false, false),
  ].sort((a, b) => b.score - a.score);

  const outreachPriority: string[] = [];
  if (funnel.qualifiedLeads > 0) outreachPriority.push('Engage qualified leads with exclusive deal access.');
  if (funnel.hotLeads > funnel.qualifiedLeads) outreachPriority.push('Convert hot leads — personalized agent call scheduling.');
  outreachPriority.push('Nurture warm leads with curated property insights.');
  if (totalProperties > 20) outreachPriority.push('Leverage inventory depth for bulk investor presentations.');

  const engagementSequences = [
    { trigger: 'User saves 3+ properties', action: 'Send personalized investment comparison', timing: 'Within 2 hours' },
    { trigger: 'User views property 3D tour', action: 'Offer exclusive virtual viewing slot', timing: 'Within 4 hours' },
    { trigger: 'Inquiry submitted', action: 'Agent assignment + ROI analysis delivery', timing: 'Within 30 minutes' },
    { trigger: 'No activity for 5 days', action: 'Re-engagement email with new listings', timing: 'Day 5 automated' },
    { trigger: 'Wallet funded but no offer', action: 'Present curated high-match opportunities', timing: 'Within 1 hour' },
  ];

  return { funnel, topOpportunities, outreachPriority, engagementSequences };
}
