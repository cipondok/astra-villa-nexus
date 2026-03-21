export interface TrustSignal {
  id: string;
  category: 'listing' | 'agent' | 'vendor' | 'platform';
  signal: string;
  weight: number;
  description: string;
  indicator: string;
  conversionImpact: string;
}

export interface TrustScoreComponent {
  label: string;
  weight: number;
  inputs: string[];
}

export interface CredibilityMessage {
  context: string;
  message: string;
  placement: string;
  trigger: string;
}

export interface LoyaltyTrigger {
  event: string;
  action: string;
  timing: string;
  expectedLift: string;
}

export interface TrustKPI {
  label: string;
  benchmark: string;
  description: string;
  status: 'excellent' | 'good' | 'caution' | 'critical';
}

export interface TrustRoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  initiatives: string[];
  successMetric: string;
}

export interface UITrustIndicator {
  name: string;
  location: string;
  visual: string;
  dataSource: string;
}

const TRUST_SIGNALS: TrustSignal[] = [
  { id: 'ls1', category: 'listing', signal: 'Verified Listing Badge', weight: 20, description: 'Property data independently verified — photos, legal docs, ownership confirmed', indicator: '✓ Verified shield badge on listing card', conversionImpact: '+18-25% inquiry rate uplift' },
  { id: 'ls2', category: 'listing', signal: 'AI Fair Market Value', weight: 15, description: 'AI-generated FMV displayed alongside asking price with accuracy confidence', indicator: 'FMV comparison bar with ±% deviation', conversionImpact: '+12% offer submission rate' },
  { id: 'ls3', category: 'listing', signal: 'Transaction History Transparency', weight: 12, description: 'District transaction data showing recent comparable sales', indicator: 'Comparable sales widget on listing detail', conversionImpact: '+15% buyer confidence score' },
  { id: 'ls4', category: 'listing', signal: 'Liquidity Score Display', weight: 10, description: 'Real-time demand signals showing how fast similar properties sell', indicator: 'Liquidity badge (High/Medium/Low)', conversionImpact: '+22% urgency-driven inquiries' },
  { id: 'ag1', category: 'agent', signal: 'Agent Performance Rating', weight: 15, description: 'Verified closing rate, response time SLA, and client satisfaction', indicator: '5-star rating + performance stats card', conversionImpact: '+20% agent selection preference' },
  { id: 'ag2', category: 'agent', signal: 'Agent Response SLA Badge', weight: 8, description: 'Guaranteed response time with tracked compliance history', indicator: '"Responds in <2h" badge', conversionImpact: '+30% first-inquiry conversion' },
  { id: 'ag3', category: 'agent', signal: 'Deal Completion Track Record', weight: 10, description: 'Number of verified completed transactions displayed publicly', indicator: '"X Deals Closed" counter on profile', conversionImpact: '+16% trust in agent capability' },
  { id: 'vn1', category: 'vendor', signal: 'Service Quality Score', weight: 10, description: 'Aggregated review score from verified service completions', indicator: 'Quality score badge + review count', conversionImpact: '+25% vendor booking rate' },
  { id: 'vn2', category: 'vendor', signal: 'On-Time Completion Rate', weight: 8, description: 'Percentage of jobs completed within agreed timeline', indicator: '"95% On-Time" badge', conversionImpact: '+18% repeat booking rate' },
  { id: 'vn3', category: 'vendor', signal: 'Verified Portfolio', weight: 7, description: 'Before/after project photos verified by platform team', indicator: 'Portfolio gallery with verified stamp', conversionImpact: '+20% initial booking confidence' },
  { id: 'pl1', category: 'platform', signal: 'Transaction Success Rate', weight: 12, description: 'Platform-wide deal completion statistics published transparently', indicator: '"X% deals close successfully" banner', conversionImpact: '+14% new user registration' },
  { id: 'pl2', category: 'platform', signal: 'Escrow Protection Badge', weight: 10, description: 'Secure payment handling with milestone-based release', indicator: 'Shield icon + "Payment Protected" label', conversionImpact: '+35% high-value transaction confidence' },
  { id: 'pl3', category: 'platform', signal: 'Client Testimonials', weight: 8, description: 'Verified buyer/seller testimonials with transaction context', indicator: 'Testimonial carousel on key pages', conversionImpact: '+12% conversion from browsing to inquiry' },
  { id: 'pl4', category: 'platform', signal: 'Real-Time Activity Feed', weight: 5, description: 'Live display of recent viewings, offers, and closings', indicator: '"X deals closed today" ticker', conversionImpact: '+10% social proof engagement' },
];

const SCORE_COMPONENTS: TrustScoreComponent[] = [
  { label: 'Verification Completeness', weight: 25, inputs: ['Photo verification status', 'Legal document upload', 'Ownership confirmation', 'Agent site visit log'] },
  { label: 'Pricing Transparency', weight: 20, inputs: ['AI FMV deviation %', 'Comparable sales available', 'Price history visible', 'Market context displayed'] },
  { label: 'Agent Credibility', weight: 20, inputs: ['Closing rate', 'Response SLA compliance', 'Client satisfaction score', 'Active listings count'] },
  { label: 'Transaction Evidence', weight: 20, inputs: ['District completed deals', 'Platform success rate', 'Escrow protection active', 'Review volume'] },
  { label: 'Engagement Signals', weight: 15, inputs: ['Recent inquiry volume', 'Viewing frequency', 'Watchlist additions', 'Social proof mentions'] },
];

const CREDIBILITY_MESSAGES: CredibilityMessage[] = [
  { context: 'Listing Card', message: '"Verified by ASTRA — ownership confirmed, legal docs validated"', placement: 'Below listing title', trigger: 'When listing passes full verification' },
  { context: 'Price Display', message: '"AI estimates fair value at Rp X — this listing is Y% below market"', placement: 'Next to asking price', trigger: 'When FMV deviation > 5%' },
  { context: 'Agent Profile', message: '"Top 10% agent — X deals closed with avg 4.8★ rating"', placement: 'Agent card on listing detail', trigger: 'When agent performance score > 80' },
  { context: 'Offer Submission', message: '"Secure transaction — payment protected with milestone escrow"', placement: 'Above offer form CTA', trigger: 'Always on offer pages' },
  { context: 'Search Results', message: '"X properties sold in this district this month — active market"', placement: 'District header in search', trigger: 'When district liquidity > 70' },
  { context: 'Inactivity Return', message: '"Welcome back — X new verified deals match your profile since your last visit"', placement: 'Homepage banner', trigger: 'User returns after 7+ days' },
];

const LOYALTY_TRIGGERS: LoyaltyTrigger[] = [
  { event: 'First deal closed', action: 'Send congratulations + exclusive investor community invite', timing: 'Within 1 hour of closing', expectedLift: '+40% retention at 90 days' },
  { event: 'Portfolio crosses Rp 5B', action: 'Unlock premium analytics + personal account manager intro', timing: 'Same day', expectedLift: '+25% platform stickiness' },
  { event: '3rd property viewing', action: 'Offer priority scheduling + personalized deal alerts activation', timing: 'After 3rd viewing completion', expectedLift: '+30% viewing-to-offer conversion' },
  { event: 'Positive review submitted', action: 'Grant visibility boost on referral code + thank-you reward', timing: 'Within 24 hours', expectedLift: '+20% referral generation' },
  { event: 'Subscription anniversary', action: 'Send ROI summary report + loyalty discount on renewal', timing: 'Anniversary date', expectedLift: '+35% renewal rate' },
  { event: 'Referral converts', action: 'Instant reward notification + leaderboard position update', timing: 'On referral first transaction', expectedLift: '+50% continued referral activity' },
];

const TRUST_KPIS: TrustKPI[] = [
  { label: 'Listing Verification Rate', benchmark: '≥85%', description: 'Percentage of active listings with full verification badges', status: 'good' },
  { label: 'Trust Score Average', benchmark: '≥75/100', description: 'Platform-wide average Trust Confidence Score across all listings', status: 'good' },
  { label: 'Inquiry-to-Viewing Rate', benchmark: '≥45%', description: 'Conversion from inquiry to scheduled viewing (trust-driven)', status: 'caution' },
  { label: 'Offer Submission Rate', benchmark: '≥25%', description: 'Percentage of viewings converting to formal offers', status: 'caution' },
  { label: 'Agent SLA Compliance', benchmark: '≥95%', description: 'Percentage of inquiries responded to within SLA window', status: 'good' },
  { label: 'Vendor Review Score', benchmark: '≥4.5/5.0', description: 'Average vendor service rating from verified completions', status: 'excellent' },
  { label: 'Escrow Adoption Rate', benchmark: '≥70%', description: 'Percentage of transactions using platform escrow protection', status: 'good' },
  { label: 'Repeat Transaction Rate', benchmark: '≥20%', description: 'Users who complete 2+ transactions within 12 months', status: 'caution' },
  { label: 'Testimonial Collection Rate', benchmark: '≥30%', description: 'Percentage of closed deals generating client testimonials', status: 'good' },
  { label: 'Net Promoter Score', benchmark: '≥50', description: 'Platform NPS from post-transaction surveys', status: 'good' },
];

const ROADMAP_PHASES: TrustRoadmapPhase[] = [
  { phase: 1, title: 'Foundation Trust Signals', duration: 'Weeks 1-3', initiatives: ['Deploy verified listing badge system', 'Launch AI FMV display on all listing cards', 'Implement agent performance rating cards', 'Add escrow protection badge to transaction flow'], successMetric: '≥50% listings with verified badge + FMV display live on all listings' },
  { phase: 2, title: 'Social Proof Layer', duration: 'Weeks 4-6', initiatives: ['Build testimonial collection + display system', 'Launch real-time activity feed ticker', 'Add district transaction history widget', 'Deploy "X deals closed" agent counters'], successMetric: '≥20% listings with testimonials + activity feed live on homepage' },
  { phase: 3, title: 'Credibility Messaging', duration: 'Weeks 7-9', initiatives: ['Implement contextual credibility messages', 'Launch Trust Confidence Score per listing', 'Add vendor quality scores and portfolios', 'Deploy loyalty trigger automation'], successMetric: 'Trust Score visible on ≥80% listings + loyalty triggers active' },
  { phase: 4, title: 'Optimization & Measurement', duration: 'Weeks 10-12', initiatives: ['A/B test trust signal placements', 'Analyze conversion uplift per signal type', 'Optimize credibility message content', 'Scale to full vendor and agent coverage'], successMetric: 'All KPIs at ≥"good" threshold + measurable conversion uplift ≥15%' },
];

const UI_INDICATORS: UITrustIndicator[] = [
  { name: 'Verified Shield Badge', location: 'Listing card top-right + detail header', visual: 'Green shield icon with checkmark', dataSource: 'Verification status from listing_verifications table' },
  { name: 'FMV Comparison Bar', location: 'Listing detail price section', visual: 'Horizontal bar showing ask vs FMV with deviation %', dataSource: 'AI price prediction engine output' },
  { name: 'Liquidity Badge', location: 'Listing card + search results', visual: 'Colored badge (Green/Amber/Red) with demand label', dataSource: 'Property liquidity score calculation' },
  { name: 'Agent Performance Card', location: 'Listing detail sidebar + agent profile', visual: 'Star rating + deals closed + response time stats', dataSource: 'Agent metrics aggregation from transactions' },
  { name: 'Escrow Protection Label', location: 'Offer submission page + transaction dashboard', visual: 'Shield icon with "Payment Protected" text', dataSource: 'Escrow service integration status' },
  { name: 'Social Proof Ticker', location: 'Homepage footer bar', visual: 'Scrolling text: "X deals closed today in [City]"', dataSource: 'Real-time transaction completion events' },
  { name: 'Testimonial Carousel', location: 'Homepage + listing detail bottom', visual: 'Rotating cards with photo, quote, transaction context', dataSource: 'Verified testimonials from post-close surveys' },
  { name: 'Trust Confidence Score', location: 'Listing detail header', visual: 'Circular progress gauge (0-100) with color coding', dataSource: 'Weighted composite of all trust signals' },
];

export function useTrustSignalSystem() {
  return {
    signals: TRUST_SIGNALS,
    scoreComponents: SCORE_COMPONENTS,
    credibilityMessages: CREDIBILITY_MESSAGES,
    loyaltyTriggers: LOYALTY_TRIGGERS,
    trustKPIs: TRUST_KPIS,
    roadmapPhases: ROADMAP_PHASES,
    uiIndicators: UI_INDICATORS,
    categories: ['listing', 'agent', 'vendor', 'platform'] as const,
  };
}
