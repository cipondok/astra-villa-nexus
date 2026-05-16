export interface ScriptLine {
  speaker: 'agent' | 'system' | 'note';
  text: string;
  tone?: string;
}

export interface NegotiationScript {
  id: string;
  module: string;
  title: string;
  stage: string;
  objective: string;
  lines: ScriptLine[];
  tips: string[];
}

export interface CommunicationTiming {
  stage: string;
  action: string;
  timing: string;
  channel: string;
  owner: string;
}

export interface ClosingKPI {
  label: string;
  benchmark: string;
  description: string;
}

export interface TrainingStep {
  phase: string;
  title: string;
  duration: string;
  activities: string[];
}

const SCRIPTS: NegotiationScript[] = [
  // Buyer Engagement
  {
    id: 'b1', module: 'Buyer Engagement', title: 'Investment Goal Discovery', stage: 'Inquiry',
    objective: 'Understand buyer motivation and establish advisory positioning',
    lines: [
      { speaker: 'agent', text: 'Thank you for your interest in [Property]. Before we dive into details, I\'d love to understand — what\'s driving your property search right now? Is this primarily for investment returns, personal use, or a combination?', tone: 'Warm, consultative' },
      { speaker: 'note', text: 'Listen actively. Classify: Capital appreciation, rental yield, lifestyle, or portfolio diversification.' },
      { speaker: 'agent', text: 'That\'s a great strategy. Based on what you\'re looking for, this property has some interesting signals — it\'s in a district where transaction velocity has been accelerating, meaning properties here are selling faster than the city average.' },
      { speaker: 'note', text: 'Reference specific liquidity data if available.' },
      { speaker: 'agent', text: 'If budget alignment is good, I can share our AI-generated fair market valuation and comparable transaction data so you can evaluate this with confidence. Would that be helpful?' },
    ],
    tips: ['Never lead with price — lead with investment thesis', 'Use data to build credibility, not to pressure', 'Match energy to buyer sophistication level'],
  },
  {
    id: 'b2', module: 'Buyer Engagement', title: 'Optimal Offer Range Guidance', stage: 'Offer Preparation',
    objective: 'Guide buyer to submit a competitive yet strategic offer',
    lines: [
      { speaker: 'agent', text: 'Based on our market intelligence, the AI fair market value for this property is [FMV]. The asking price is [Ask], which is [X]% above/below FMV.' },
      { speaker: 'agent', text: 'Given current demand in this district — [X] active inquiries in the last 30 days — I\'d recommend an initial offer in the range of [Low]–[High]. This positions you competitively while leaving room for negotiation.' },
      { speaker: 'note', text: 'Present the Intelligent Offer Formula: (0.5 × AI FMV) + (0.3 × Comps) + (0.2 × Ask Price)' },
      { speaker: 'agent', text: 'Would you like me to prepare a formal offer document with these terms? I can also include a brief investment summary highlighting the ROI projections.' },
    ],
    tips: ['Always anchor to data, never to opinion', 'Present offer range, not a single number', 'Frame the offer as strategic, not lowball'],
  },

  // Seller Alignment
  {
    id: 's1', module: 'Seller Alignment', title: 'Market Demand Communication', stage: 'Listing Consultation',
    objective: 'Align seller expectations with real market conditions',
    lines: [
      { speaker: 'agent', text: 'I\'ve prepared a market intelligence brief for your property. Let me walk you through what the data tells us about demand in [District].' },
      { speaker: 'agent', text: 'In the last 30 days, this district has seen [X] property inquiries and [Y] completed transactions. The average time-to-sell is currently [Z] days, which is [faster/slower] than the city average.' },
      { speaker: 'note', text: 'Use district-level liquidity data. Show trend direction.' },
      { speaker: 'agent', text: 'Our AI pricing model estimates fair market value at [FMV]. Properties priced within 5% of FMV are selling [X]x faster than those priced above. I\'d recommend positioning at [Price] to maximize both speed and value.' },
      { speaker: 'agent', text: 'The goal is to attract serious buyers quickly — the longer a property sits, the more negotiation leverage shifts to buyers.' },
    ],
    tips: ['Lead with market data, not personal judgment', 'Show the cost of overpricing with days-on-market stats', 'Position yourself as advisor, not salesperson'],
  },
  {
    id: 's2', module: 'Seller Alignment', title: 'Urgency Through Transaction Insights', stage: 'Pre-Negotiation',
    objective: 'Create legitimate urgency without pressure tactics',
    lines: [
      { speaker: 'agent', text: 'I wanted to share an update — we\'ve had [X] qualified inquiries on your property this week, and [Y] investors have requested viewings.' },
      { speaker: 'agent', text: 'Based on our urgency scoring, demand for your property type in this price range is currently [High/Moderate]. Properties with this demand signal typically receive offers within [X] days.' },
      { speaker: 'note', text: 'Reference Demand Urgency Score (DUS) if >70.' },
      { speaker: 'agent', text: 'I\'d suggest we prioritize the most qualified buyers and aim to receive offers this week. Shall I coordinate viewings for the top prospects?' },
    ],
    tips: ['Urgency must be backed by real data', 'Never fabricate competing interest', 'Frame urgency as opportunity, not scarcity'],
  },

  // Objection Handling
  {
    id: 'o1', module: 'Objection Handling', title: 'Financing Hesitation', stage: 'Negotiation',
    objective: 'Address financing concerns and maintain deal momentum',
    lines: [
      { speaker: 'note', text: 'Buyer says: "I\'m not sure I can secure financing in time."' },
      { speaker: 'agent', text: 'That\'s a valid concern, and I appreciate you raising it. We actually have partnerships with [X] banks that offer pre-approval in as little as [Y] business days.' },
      { speaker: 'agent', text: 'I can also connect you with our mortgage calculator tool — it factors in your income range and shows realistic monthly payment scenarios. Many investors find this helps clarify the decision.' },
      { speaker: 'agent', text: 'Would it help if I coordinated a preliminary eligibility check? There\'s no obligation, and it gives us both confidence in the timeline.' },
    ],
    tips: ['Never dismiss financing concerns', 'Offer concrete solutions, not vague reassurance', 'Use bank partnerships as credibility anchors'],
  },
  {
    id: 'o2', module: 'Objection Handling', title: 'Price Gap Negotiation', stage: 'Negotiation',
    objective: 'Bridge price expectations between buyer and seller',
    lines: [
      { speaker: 'note', text: 'Buyer offers significantly below asking. Seller resistant to counter.' },
      { speaker: 'agent', text: '[To Seller] I understand the offer feels low. Let me share context — the buyer is a qualified investor with verified funds. Their offer is based on comparable transactions in the area, which averaged [X].' },
      { speaker: 'agent', text: '[To Seller] Rather than rejecting outright, I recommend a counter at [Y] — this signals flexibility while protecting your position. The data suggests deals in this range close within [Z] days.' },
      { speaker: 'agent', text: '[To Buyer] The seller has countered at [Y]. This is [X]% below the original ask and aligns closely with recent comparable sales. Given the property\'s liquidity signals, this represents fair value with upside potential.' },
    ],
    tips: ['Always present data alongside the counter-offer', 'Position yourself as neutral advisor to both parties', 'Focus on value, not price concessions'],
  },
  {
    id: 'o3', module: 'Objection Handling', title: 'Timeline Concerns', stage: 'Negotiation',
    objective: 'Provide clarity on transaction timeline and process',
    lines: [
      { speaker: 'note', text: 'Buyer says: "This is moving too fast / too slow."' },
      { speaker: 'agent', text: 'I completely understand. Let me map out exactly what happens next and the realistic timeline for each step.' },
      { speaker: 'agent', text: 'Step 1: Offer acceptance and earnest money deposit — 2 business days. Step 2: Due diligence and documentation review — 5-7 days. Step 3: Legal verification and notary coordination — 7-10 days. Step 4: Final payment and transfer — 3-5 days.' },
      { speaker: 'agent', text: 'We track every milestone in our system, so you\'ll have full visibility into progress. I\'ll send you updates at each step. Does this timeline work for your plans?' },
    ],
    tips: ['Always provide specific day ranges, not vague promises', 'Proactively set expectations before they ask', 'Use milestone tracking as a trust-building tool'],
  },

  // Closing Confirmation
  {
    id: 'c1', module: 'Closing Confirmation', title: 'Terms Summary & Next Steps', stage: 'Closing',
    objective: 'Confirm agreement and transition to documentation',
    lines: [
      { speaker: 'agent', text: 'Congratulations — both parties have agreed on the following terms. Let me confirm everything:' },
      { speaker: 'agent', text: 'Property: [Title], [District]. Agreed price: Rp [Amount]. Payment structure: [Terms]. Target closing date: [Date]. Conditions: [Any special conditions].' },
      { speaker: 'agent', text: 'The next steps are: 1) Earnest money deposit of [X]% within 48 hours. 2) Our team will coordinate with the notary for document preparation. 3) I\'ll send you a detailed closing checklist by end of day.' },
      { speaker: 'agent', text: 'Do you have any questions about these terms or the process ahead? I\'m here to ensure this goes smoothly from start to finish.' },
    ],
    tips: ['Read back all terms explicitly — never assume understanding', 'Provide written summary within 1 hour of verbal agreement', 'Reinforce positive momentum with congratulatory tone'],
  },
  {
    id: 'c2', module: 'Closing Confirmation', title: 'Confidence Reinforcement', stage: 'Post-Agreement',
    objective: 'Prevent buyer remorse and maintain closing momentum',
    lines: [
      { speaker: 'agent', text: 'I wanted to follow up and say — you\'ve made an excellent investment decision. Let me share a few data points that reinforce this:' },
      { speaker: 'agent', text: 'Properties in [District] have appreciated [X]% over the past 12 months. The rental yield potential for this property type is [Y]%. And demand in this area is trending [up/stable], which supports long-term value.' },
      { speaker: 'agent', text: 'Our documentation team is already preparing your closing package. You\'ll receive the first draft within [X] business days. Is there anything else I can help with in the meantime?' },
    ],
    tips: ['Send reinforcement within 24 hours of agreement', 'Use forward-looking data, not just past performance', 'Keep communication frequency high during closing period'],
  },
];

const TIMING_GUIDE: CommunicationTiming[] = [
  { stage: 'Inquiry received', action: 'Send acknowledgment + property brief', timing: 'Within 30 minutes', channel: 'WhatsApp + Email', owner: 'Agent' },
  { stage: 'Post-viewing', action: 'Send viewing summary + next steps', timing: 'Within 2 hours', channel: 'WhatsApp', owner: 'Agent' },
  { stage: 'Offer submitted', action: 'Confirm receipt + timeline expectations', timing: 'Within 1 hour', channel: 'WhatsApp + Email', owner: 'Agent' },
  { stage: 'Counter-offer', action: 'Present counter with market context', timing: 'Within 4 hours', channel: 'Phone + WhatsApp', owner: 'Agent' },
  { stage: 'Offer accepted', action: 'Confirm terms + send closing checklist', timing: 'Within 1 hour', channel: 'Email + WhatsApp', owner: 'Agent' },
  { stage: 'Documentation phase', action: 'Daily progress update', timing: 'Every 24 hours', channel: 'WhatsApp', owner: 'Ops Team' },
  { stage: 'Payment milestone', action: 'Confirm receipt + next step reminder', timing: 'Within 2 hours', channel: 'Email + WhatsApp', owner: 'Finance' },
  { stage: 'Deal closed', action: 'Congratulations + referral request', timing: 'Same day', channel: 'WhatsApp + Email', owner: 'Agent' },
];

const CLOSING_KPIS: ClosingKPI[] = [
  { label: 'Inquiry-to-Viewing Rate', benchmark: '>40%', description: 'Percentage of inquiries that convert to scheduled viewings' },
  { label: 'Viewing-to-Offer Rate', benchmark: '>25%', description: 'Percentage of viewings that result in formal offers' },
  { label: 'Offer-to-Close Rate', benchmark: '>60%', description: 'Percentage of submitted offers that reach closing' },
  { label: 'Average Negotiation Rounds', benchmark: '≤3', description: 'Number of counter-offer exchanges before agreement' },
  { label: 'Time-to-Close', benchmark: '<28 days', description: 'Average days from first offer to completed transaction' },
  { label: 'Price-to-FMV Accuracy', benchmark: '±5%', description: 'Final price vs AI fair market valuation deviation' },
  { label: 'Agent Response SLA', benchmark: '<2 hours', description: 'Average first response time to new inquiries' },
  { label: 'Post-Close Referral Rate', benchmark: '>15%', description: 'Percentage of closed deals generating referral leads' },
];

const TRAINING_PLAN: TrainingStep[] = [
  { phase: 'Week 1', title: 'Script Familiarization', duration: '3 sessions × 1 hour', activities: ['Read-through of all 4 script modules', 'Role-play buyer engagement scenarios', 'Quiz on key data points to reference'] },
  { phase: 'Week 2', title: 'Objection Handling Practice', duration: '4 sessions × 45 min', activities: ['Practice financing hesitation responses', 'Simulate price gap negotiations', 'Record and review mock calls'] },
  { phase: 'Week 3', title: 'Live Shadowing', duration: '5 live deal observations', activities: ['Shadow senior agent on active negotiations', 'Document communication timing adherence', 'Debrief after each interaction'] },
  { phase: 'Week 4', title: 'Supervised Execution', duration: 'Full week with mentor', activities: ['Handle 3+ deals with mentor oversight', 'Track personal closing KPIs', 'Final certification assessment'] },
];

export function useNegotiationScripts() {
  return {
    scripts: SCRIPTS,
    timingGuide: TIMING_GUIDE,
    closingKPIs: CLOSING_KPIS,
    trainingPlan: TRAINING_PLAN,
    modules: ['Buyer Engagement', 'Seller Alignment', 'Objection Handling', 'Closing Confirmation'] as const,
  };
}
