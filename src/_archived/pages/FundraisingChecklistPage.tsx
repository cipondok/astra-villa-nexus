import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, ChevronDown, CheckCircle2, Circle, Clock,
  Target, Sparkles, TrendingUp, Users, Building2, Globe,
  BarChart3, FileText, Presentation, DollarSign, Shield,
  ArrowRight, Star, Flame, Layers, Zap, Eye, Lock,
  LineChart, PieChart, MapPin, Award, Megaphone, GitBranch
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

type CheckStatus = 'done' | 'in-progress' | 'not-started';
type Priority = 'critical' | 'high' | 'medium';
type AreaId = 'product' | 'traction' | 'narrative' | 'materials' | 'legal' | 'operations';

interface CheckItem {
  id: string;
  task: string;
  detail: string;
  priority: Priority;
  status: CheckStatus;
  owner: string;
  evidence: string;
  tip: string;
}

interface CheckArea {
  id: AreaId;
  title: string;
  subtitle: string;
  icon: typeof Briefcase;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  items: CheckItem[];
}

const STATUS_MAP: Record<CheckStatus, { cls: string; icon: typeof CheckCircle2; label: string }> = {
  done: { cls: 'text-emerald-400', icon: CheckCircle2, label: 'Ready' },
  'in-progress': { cls: 'text-amber-400', icon: Clock, label: 'In Progress' },
  'not-started': { cls: 'text-muted-foreground/40', icon: Circle, label: 'Not Started' },
};

const PRIORITY_CLS: Record<Priority, string> = {
  critical: 'text-rose-400 border-rose-400/30',
  high: 'text-amber-400 border-amber-400/30',
  medium: 'text-sky-400 border-sky-400/30',
};

const AREAS: CheckArea[] = [
  {
    id: 'product', title: 'Product Readiness', subtitle: 'Stable demo, clear AI differentiation, live marketplace examples',
    icon: Sparkles, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    items: [
      { id: 'p1', task: 'Stable Demo Environment', priority: 'critical', status: 'done', owner: 'Engineering', detail: 'Production-ready platform accessible via public URL with no critical bugs. All core flows functional: search → detail → inquiry → watchlist → portfolio.', evidence: 'Live URL: astra-villa-realty.lovable.app — walkable in investor meetings without crashes or loading errors.', tip: 'Do a full demo run-through 1 hour before every investor call. Check: does search work? Do property cards load? Does the map render?' },
      { id: 'p2', task: 'AI Intelligence Differentiation Demo', priority: 'critical', status: 'in-progress', owner: 'Product / AI', detail: 'Clearly demonstrable AI features that no competitor offers: Opportunity Score, Market Heat Map, AI Demand Forecast, Price Prediction.', evidence: 'Demo mode (/admin-dashboard?section=pitch) with 5-scene guided flow showing AI scoring, heat surge, price prediction, portfolio ROI, and strategic buy advisory.', tip: 'Investors ask: "What\'s your moat?" Answer: "Proprietary AI scoring on 12 market factors + behavioral learning from user signals. Accuracy improves with every interaction."' },
      { id: 'p3', task: 'Live Marketplace Inventory', priority: 'critical', status: 'in-progress', owner: 'Operations', detail: 'Minimum 50 real property listings across 3 cities (Jakarta, Bali, Surabaya) with photos, specs, and AI scores calculated.', evidence: 'Properties table with active listings. Each has ≥5 photos, GPS coordinates, and opportunity score. Visible on /properties and /investment-map-explorer.', tip: 'Quality > quantity. 50 well-curated listings with full data impresses more than 500 incomplete ones. Ensure map view shows geographic spread.' },
      { id: 'p4', task: 'Mobile Responsiveness', priority: 'high', status: 'done', owner: 'Engineering', detail: 'Platform renders correctly on mobile devices. Investors often check on phones during/after meetings.', evidence: 'Responsive design tested on iPhone 14, Samsung S24, iPad Pro viewports.', tip: 'After every pitch, investors will pull out their phone and check the URL you gave them. Make sure it works.' },
      { id: 'p5', task: 'Demo Mode Controller', priority: 'high', status: 'done', owner: 'Product', detail: 'Guided demo flow at /admin-dashboard with scene-by-scene progression for consistent storytelling in investor presentations.', evidence: 'DemoModeController with 5 scenes, presenter notes, and simulated live signal feed. Accessible via "Start Demo" toggle.', tip: 'Practice the 5-scene flow until you can narrate it without looking at notes. Each scene should take 60-90 seconds.' },
    ],
  },
  {
    id: 'traction', title: 'Traction Proof', subtitle: 'Growth metrics, inventory trends, and early revenue signals',
    icon: TrendingUp, accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    items: [
      { id: 't1', task: 'User Signup Growth Metrics', priority: 'critical', status: 'in-progress', owner: 'Growth / Data', detail: 'Week-over-week signup growth chart showing consistent upward trend. Target: demonstrate 15-20% WoW growth during soft launch.', evidence: 'Dashboard showing: total registered users, weekly new signups, signup sources (organic, paid, referral). Pull from profiles table + acquisition_analytics.', tip: 'Even small numbers with strong growth rate impress. "50 users growing 20% weekly = 1,000+ in 3 months" is a powerful narrative.' },
      { id: 't2', task: 'Listings Inventory Expansion', priority: 'critical', status: 'in-progress', owner: 'Operations / Data', detail: 'Demonstrate supply-side momentum: listings added per week, cities covered, agent network growth.', evidence: 'Chart: cumulative listings over time. Breakdown by city. Agent count from agent_acquisition_pipeline.', tip: 'Show the trajectory, not just the number. "3 listings/day × 30 days = 90 new listings/month" shows operational cadence.' },
      { id: 't3', task: 'Engagement Metrics', priority: 'high', status: 'not-started', owner: 'Product / Data', detail: 'Active user behavior: searches performed, properties viewed, watchlist additions, inquiries sent. Shows product-market fit signals.', evidence: 'From ai_behavior_tracking: event counts by type (property_card_viewed, watchlist_added, search_filter_applied). Session depth metrics.', tip: 'Key metric: "X% of users who search add at least 1 property to watchlist" = intent signal. Investors love activation metrics.' },
      { id: 't4', task: 'Early Transaction or Revenue Signals', priority: 'high', status: 'not-started', owner: 'BD / Operations', detail: 'Any evidence of monetization: developer partnership fees, premium inquiry conversions, affiliate commissions, or letter of intent.', evidence: 'Even pre-revenue is OK if you have: signed LOIs, pipeline of developer discussions, or waitlist of paying agents.', tip: 'If pre-revenue, show the pipeline: "3 developers in discussion, 1 LOI signed, estimated first revenue in X weeks." Intent > revenue at seed stage.' },
      { id: 't5', task: 'Referral Program Performance', priority: 'medium', status: 'not-started', owner: 'Growth', detail: 'Referral conversion rate, viral coefficient, and organic growth signals from the referral program.', evidence: 'From acquisition_referrals: links generated, conversions, K-factor. Target: K-factor > 0.3 for viral coefficient.', tip: 'Even low K-factor with good conversion rate shows word-of-mouth potential. "30% of new users come from referrals" is strong.' },
    ],
  },
  {
    id: 'narrative', title: 'Business Narrative', subtitle: 'Vision positioning, revenue model, and expansion roadmap',
    icon: Globe, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    items: [
      { id: 'n1', task: 'Vision Positioning Statement', priority: 'critical', status: 'done', owner: 'Founder', detail: 'One-line vision: "ASTRA Villa is the AI-powered intelligence layer for property investment in Southeast Asia." Clear, ambitious, defensible.', evidence: '30-second elevator pitch memorized. 2-minute expanded version with problem-solution-market framing.', tip: 'Test with non-tech people. If they understand the vision in 30 seconds, it\'s clear enough. Avoid: "We\'re Zillow meets Bloomberg for Indonesia."' },
      { id: 'n2', task: 'Revenue Model Explanation', priority: 'critical', status: 'in-progress', owner: 'Founder / Finance', detail: '4 revenue streams clearly explained: (1) Developer featured placement, (2) Premium investor subscriptions, (3) Services marketplace commission, (4) Transaction facilitation fee.', evidence: 'One-slide summary with unit economics: CAC, LTV, payback period estimates. Even rough estimates show business thinking.', tip: 'Investors want to see you\'ve thought about monetization, not that you have all the answers. Show the model, acknowledge what\'s validated vs assumed.' },
      { id: 'n3', task: 'Regional Expansion Roadmap', priority: 'high', status: 'done', owner: 'Founder', detail: 'Clear 3-year expansion path: Year 1 Indonesia (5 cities) → Year 2 SEA (Malaysia, Thailand, Vietnam) → Year 3 Global intelligence layer.', evidence: 'Documented in .lovable/plan.md and /go-to-market strategy. Super App Vision targets regional scale by 2027, global by 2029.', tip: 'Don\'t just show a map with dots. Explain WHY each market: "Malaysia next because similar property laws, Malay-speaking overlap, and 2x average ticket size."' },
      { id: 'n4', task: 'Competitive Moat Articulation', priority: 'high', status: 'in-progress', owner: 'Founder', detail: 'Why ASTRA Villa wins: (1) AI scoring improves with usage (data network effects), (2) Investor behavior data is proprietary, (3) First-mover in AI proptech for Indonesia.', evidence: 'Competitive landscape slide showing differentiation vs Rumah123, 99.co, PropertyGuru on AI capability axis.', tip: 'Frame as "intelligence layer" not "listing portal." Portals compete on listings. Intelligence competes on data quality + AI accuracy — much harder to replicate.' },
      { id: 'n5', task: 'Market Size & Opportunity', priority: 'critical', status: 'done', owner: 'Founder / Research', detail: 'TAM/SAM/SOM for Indonesia property market: TAM $180B property market, SAM $12B online-influenced transactions, SOM $120M addressable in Year 3.', evidence: 'Market sizing slide with sources: Bank Indonesia data, property portal annual reports, JLL Indonesia market outlook.', tip: 'Use bottom-up SOM calculation: "500 developers × $2K/year + 10,000 investors × $120/year = $2.2M ARR Year 3" is more credible than TAM percentages.' },
    ],
  },
  {
    id: 'materials', title: 'Investor Materials', subtitle: 'Pitch deck, demo script, financial projections, and data room',
    icon: Presentation, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    items: [
      { id: 'm1', task: 'Pitch Deck (12–15 slides)', priority: 'critical', status: 'in-progress', owner: 'Founder', detail: 'Structure: Problem → Solution → Product Demo → Market Size → Business Model → Traction → Team → Competition → Financials → Ask.', evidence: 'PDF + presentation mode. Clean design matching ASTRA Villa brand identity (dark theme, Playfair Display headings, gold accents).', tip: 'Rule of thumb: if you can\'t explain a slide in 60 seconds, it\'s too complex. 12 slides for seed, 15 max for Series A.' },
      { id: 'm2', task: 'Live Product Demo Script', priority: 'critical', status: 'done', owner: 'Founder / Product', detail: '12-minute guided demo flow with 6 steps: Vision Context → Opportunity Discovery → Market Heat → Decision Tools → Portfolio Intelligence → Monetization.', evidence: 'Available at /live-demo with keyboard navigation, talking points, demo actions, and transition scripts.', tip: 'Demo should feel like a "wow tour" not a feature walkthrough. Lead with outcomes: "Watch AI find a deal" not "Here\'s our search feature."' },
      { id: 'm3', task: 'Financial Projection Summary', priority: 'high', status: 'not-started', owner: 'Founder / Finance', detail: '3-year projection: revenue by stream, costs, burn rate, break-even timeline. Conservative / Base / Optimistic scenarios.', evidence: 'Spreadsheet + one summary slide. Key metrics: monthly burn, runway, revenue milestones, path to profitability.', tip: 'Seed investors care about: (1) How long does this money last? (2) What milestones will you hit? (3) When do you need to raise again? Answer all three clearly.' },
      { id: 'm4', task: 'One-Pager Executive Summary', priority: 'high', status: 'not-started', owner: 'Founder', detail: 'Single-page PDF: problem, solution, market, traction, team, ask. For cold outreach and warm introductions.', evidence: 'PDF with ASTRA Villa branding. QR code linking to platform. Contact info for founder.', tip: 'This is what gets forwarded in email chains. Make it visually striking and self-explanatory. No one reads beyond page 1 in cold outreach.' },
      { id: 'm5', task: 'Data Room Preparation', priority: 'medium', status: 'not-started', owner: 'Founder / Legal', detail: 'Organized folder: company registration, pitch deck, financial model, cap table, team bios, product screenshots, press/media mentions.', evidence: 'Google Drive or Notion with organized folders. Access controlled with view-only links.', tip: 'Having a data room ready BEFORE investors ask signals professionalism. Most founders scramble when asked — don\'t be that founder.' },
    ],
  },
  {
    id: 'legal', title: 'Legal & Corporate', subtitle: 'Entity structure, IP protection, and compliance basics',
    icon: Shield, accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    items: [
      { id: 'l1', task: 'Company Entity Registered', priority: 'critical', status: 'in-progress', owner: 'Founder / Legal', detail: 'PT (Perseroan Terbatas) registered in Indonesia, or Singapore PTE LTD for international investors. Clean cap table with founder allocation.', evidence: 'Company registration documents, AHU (Administrasi Hukum Umum) confirmation, NPWP (tax ID).', tip: 'Singapore entity preferred for international VCs. Indonesian PT required for local operations. Many founders do both with holding structure.' },
      { id: 'l2', task: 'Cap Table Clean & Current', priority: 'critical', status: 'not-started', owner: 'Founder / Legal', detail: 'Clear ownership structure: founder shares, any advisor equity, ESOP pool allocation (10-15% reserved). No messy convertible notes or unclear obligations.', evidence: 'Cap table spreadsheet showing pre-money ownership. ESOP pool carved out. No outstanding disputes.', tip: 'Investors will ask for this immediately. A messy cap table is the #1 deal killer. If you have co-founders, have a signed agreement.' },
      { id: 'l3', task: 'IP Assignment & Protection', priority: 'high', status: 'not-started', owner: 'Legal', detail: 'All code and IP formally assigned to the company (not personal). Trademark application for "ASTRA Villa" filed.', evidence: 'IP assignment agreement signed. Trademark filing receipt from DJKI (Direktorat Jenderal Kekayaan Intelektual).', tip: 'Investors want to fund a company, not a person. IP must be owned by the entity. This is non-negotiable for institutional investors.' },
      { id: 'l4', task: 'Basic Terms Sheet Understanding', priority: 'medium', status: 'not-started', owner: 'Founder', detail: 'Understand: pre/post-money valuation, liquidation preference, anti-dilution, board seats, pro-rata rights, SAFE vs priced round.', evidence: 'Founder has read YC SAFE documents and understands standard seed terms.', tip: 'Don\'t negotiate blind. Read: YC SAFE, Venture Deals by Brad Feld, and 3-4 sample term sheets. Know your non-negotiables before conversations start.' },
    ],
  },
  {
    id: 'operations', title: 'Operational Readiness', subtitle: 'Team positioning, advisor network, and fundraise execution plan',
    icon: Users, accentClass: 'text-primary', borderClass: 'border-primary/30', bgClass: 'bg-primary',
    items: [
      { id: 'o1', task: 'Founder Story & Credibility', priority: 'critical', status: 'in-progress', owner: 'Founder', detail: 'Clear narrative: Why you? Why now? Why this market? Domain expertise in real estate, technology, or both. Previous startup/industry experience.', evidence: '2-minute founder story rehearsed. LinkedIn profile updated with ASTRA Villa. Any media mentions or speaking engagements.', tip: '"Why you?" is the most important question. Answer with domain insight: "I saw X problem firsthand and built the AI to solve it."' },
      { id: 'o2', task: 'Advisory Board (2-3 advisors)', priority: 'high', status: 'not-started', owner: 'Founder', detail: 'At least 1 real estate industry expert + 1 tech/AI advisor. Provides credibility and opens investor networks.', evidence: 'Advisor agreements signed (0.25-1% equity each). Advisors listed on pitch deck team slide.', tip: 'Quality > quantity. One well-known property industry figure as advisor opens more doors than 5 unknown advisors. Ask: "Who would make an investor say wow?"' },
      { id: 'o3', task: 'Target Investor List (30-50)', priority: 'high', status: 'not-started', owner: 'Founder', detail: 'Curated list of angel investors, VCs, and strategic partners relevant to proptech / Southeast Asia / AI.', evidence: 'Spreadsheet: investor name, fund, check size, portfolio companies, warm intro available (Y/N), status.', tip: 'Prioritize: (1) Proptech-focused funds, (2) SEA-focused VCs, (3) AI-focused angels, (4) Strategic (property portals, developers). Warm intros convert 10x better than cold.' },
      { id: 'o4', task: 'Fundraise Timeline & Process', priority: 'high', status: 'not-started', owner: 'Founder', detail: 'Plan: 2 weeks prep → 4 weeks active outreach → 4 weeks due diligence → 2 weeks closing. Total: ~12 weeks. Raise enough for 18 months runway.', evidence: 'Calendar with investor meeting schedule. Weekly pipeline review. Target: 3-5 investor meetings per week during active phase.', tip: 'Fundraising is a full-time job. Block 60% of your time during active phase. The remaining 40% keeps the product moving — stalling product during fundraise is a red flag.' },
      { id: 'o5', task: 'Ask Amount & Use of Funds', priority: 'critical', status: 'in-progress', owner: 'Founder / Finance', detail: 'Clear ask: "$X to achieve Y milestones in Z months." Breakdown: Engineering (40%), Growth/Marketing (30%), Operations (20%), Legal/Admin (10%).', evidence: 'One slide showing: raise amount, 18-month milestone targets, use of funds pie chart, and what the next raise looks like.', tip: '"We\'re raising $500K to reach 1,000 investors and 200 listings in 6 months, positioning us for a $3M Series A." — specific, milestone-driven, shows forward thinking.' },
    ],
  },
];

function CheckItemCard({ item }: { item: CheckItem }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_MAP[item.status];
  const StIcon = st.icon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <StIcon className={`h-3.5 w-3.5 shrink-0 ${st.cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{item.task}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${PRIORITY_CLS[item.priority]}`}>{item.priority}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 ${st.cls}`}>{st.label}</Badge>
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">{item.owner}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              <Separator className="opacity-10" />
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider font-bold">What's Needed</span>
                <p className="text-foreground leading-relaxed mt-0.5">{item.detail}</p>
              </div>
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider font-bold">Evidence / Deliverable</span>
                <p className="text-foreground leading-relaxed mt-0.5">{item.evidence}</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Founder Tip</span>
                <p className="text-[10px] text-foreground leading-relaxed mt-0.5">{item.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AreaCard({ area }: { area: CheckArea }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = area.icon;
  const done = area.items.filter(i => i.status === 'done').length;
  const progress = (done / area.items.length) * 100;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${area.borderClass} ${area.bgClass}/10 shrink-0`}>
          <Icon className={`h-5 w-5 ${area.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{area.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{area.items.length} items</Badge>
            <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-400/30">{done} ready</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{area.subtitle}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progress} className="h-1 flex-1 max-w-[120px]" />
            <span className="text-[9px] text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-1.5">
              <Separator className="opacity-15" />
              {area.items.map(i => <CheckItemCard key={i.id} item={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FundraisingChecklistPage() {
  const allItems = AREAS.flatMap(a => a.items);
  const done = allItems.filter(i => i.status === 'done').length;
  const inProgress = allItems.filter(i => i.status === 'in-progress').length;
  const notStarted = allItems.filter(i => i.status === 'not-started').length;
  const critical = allItems.filter(i => i.priority === 'critical').length;
  const criticalDone = allItems.filter(i => i.priority === 'critical' && i.status === 'done').length;
  const overallProgress = (done / allItems.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Fundraising Preparation Checklist</h1>
              <p className="text-xs text-muted-foreground">Growth capital readiness — product, traction, narrative, materials, legal, and operations</p>
            </div>
          </div>

          {/* Overall readiness */}
          <div className="rounded-xl border border-border/20 bg-card/30 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Overall Fundraise Readiness</span>
              <span className="text-lg font-bold text-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Total Items', value: allItems.length, icon: Target },
                { label: 'Ready', value: done, icon: CheckCircle2 },
                { label: 'In Progress', value: inProgress, icon: Clock },
                { label: 'Not Started', value: notStarted, icon: Circle },
                { label: 'Critical Path', value: `${criticalDone}/${critical}`, icon: Flame },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-border/10 bg-muted/5 p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-lg font-bold text-foreground">{s.value}</span>
                  </div>
                  <span className="text-[8px] text-muted-foreground uppercase">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fundraise timeline */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Fundraise Execution Timeline (~12 weeks)</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'Preparation', sub: 'Weeks 1–2', detail: 'Complete this checklist' },
                { label: 'Active Outreach', sub: 'Weeks 3–6', detail: '3-5 meetings/week' },
                { label: 'Deep Dives', sub: 'Weeks 7–8', detail: 'Follow-up & due diligence' },
                { label: 'Term Sheets', sub: 'Weeks 9–10', detail: 'Negotiate & compare' },
                { label: 'Closing', sub: 'Weeks 11–12', detail: 'Legal docs & wire' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-2 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[90px]">
                    <span className="text-foreground font-bold block">{step.label}</span>
                    <span className="text-foreground text-[10px] block">{step.sub}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.detail}</span>
                  </div>
                  {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Investor meeting prep */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Pre-Meeting Checklist (30 min before every call)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {[
                'Platform demo tested — all flows working',
                'Pitch deck loaded — latest version',
                'Demo mode ready — /live-demo bookmarked',
                'Key metrics memorized — users, listings, growth rate',
                'Investor background researched — portfolio, thesis',
                'Ask amount and use of funds rehearsed',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border/10 bg-muted/5 px-3 py-2">
                  <Circle className="h-3 w-3 text-muted-foreground/30 mt-0.5 shrink-0" />
                  <span className="text-[10px] text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {AREAS.map(a => <AreaCard key={a.id} area={a} />)}
      </div>
    </div>
  );
}
