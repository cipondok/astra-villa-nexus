import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare, Globe, Sparkles, DollarSign, Shield, Users,
  ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Target,
  TrendingUp, Brain, Layers, BarChart3, Zap, ChevronDown,
  ChevronUp, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Investor Q&A Preparation Checklist
   Structured due diligence answers for fundraising confidence
   ═══════════════════════════════════════════════════════════ */

interface QAItem {
  question: string;
  difficulty: 'standard' | 'tough' | 'critical';
  focusAreas: string[];
  keyData: string[];
  avoidPitfalls: string[];
}

interface QACategory {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  questions: QAItem[];
}

const categories: QACategory[] = [
  {
    id: 'market', title: 'Market Opportunity', icon: Globe, color: '--panel-accent',
    description: 'Why now, how big, and what timing advantages exist',
    questions: [
      {
        question: 'Why build a real estate intelligence platform now?',
        difficulty: 'standard',
        focusAreas: ['Indonesia property market is $300B+ and 95% offline', 'Digital adoption accelerated post-COVID across SEA', 'Property investment decisions still rely on gut feeling — no institutional-grade analytics available to retail investors', 'AI/ML capabilities now mature enough for accurate property scoring at scale'],
        keyData: ['Indonesia real estate market: ~$300B annually', '85%+ of transactions still offline/unstructured', 'Digital property search growing 40%+ YoY in SEA', 'Only 2% of Indonesian investors use data-driven tools'],
        avoidPitfalls: ['Don\'t just say "big market" — quantify the inefficiency', 'Avoid comparing to US/EU proptech — emphasize SEA-specific dynamics'],
      },
      {
        question: 'What differentiates ASTRA Villa from listing portals like 99.co or Rumah123?',
        difficulty: 'critical',
        focusAreas: ['Listing portals are directories — we are an intelligence layer', 'AI investment scoring that no portal offers', 'We help investors decide WHAT to buy, not just FIND listings', 'Network effects: more data → better AI → more users → more data'],
        keyData: ['Portals monetize agents (ads). We monetize intelligence (SaaS + commissions)', 'Investment score accuracy target: 87%+', 'Our AI analyzes 50+ data points per property vs 5–10 on portals'],
        avoidPitfalls: ['Never dismiss competitors — acknowledge their reach, then differentiate on depth', 'Avoid feature-list comparisons — focus on outcome difference for the user'],
      },
      {
        question: 'What is your TAM/SAM/SOM?',
        difficulty: 'standard',
        focusAreas: ['TAM: Southeast Asian real estate transaction value (~$1T)', 'SAM: Indonesian digital property services (~$5B)', 'SOM: AI-driven property investment tools for retail investors ($50–100M in 5 years)', 'Expand SOM narrative with B2B institutional analytics'],
        keyData: ['Indonesia property transactions: ~$300B/year', 'Digital penetration growing 40% YoY', 'Target 1% of digital-savvy investor segment initially'],
        avoidPitfalls: ['Top-down TAM alone is weak — show bottom-up SOM calculation', 'Investors want to see how you capture value, not just market size'],
      },
    ],
  },
  {
    id: 'product', title: 'Product & AI Advantage', icon: Brain, color: '--panel-info',
    description: 'Technical moat, AI defensibility, and data network effects',
    questions: [
      {
        question: 'How does your AI scoring create defensibility?',
        difficulty: 'critical',
        focusAreas: ['Proprietary scoring algorithm analyzing 50+ variables', 'Data flywheel: user interactions improve model accuracy continuously', 'Historical accuracy tracking builds trust and institutional credibility', 'Scoring model is trained on Indonesian market-specific patterns — not transferable from US/EU models'],
        keyData: ['Current prediction accuracy: 87.3%', '50+ data points per property assessment', 'Model retrained weekly with new transaction data', 'Investment recommendations validated against actual outcomes'],
        avoidPitfalls: ['Don\'t claim "unbeatable AI" — emphasize compounding data advantage', 'Show evidence of accuracy improvement over time, not just a static number'],
      },
      {
        question: 'What are the data network effects?',
        difficulty: 'tough',
        focusAreas: ['More listings → more investors → more behavioral data → better AI → more users', 'Each transaction enriches pricing models for similar properties', 'User preference signals improve personalization — competitors can\'t replicate without same user base', 'Developer partnerships create exclusive data streams'],
        keyData: ['Each new user contributes ~15 preference signals per session', 'Property scoring accuracy improves ~0.5% per 1,000 new data points', 'Marketplace liquidity threshold: 500 active listings creates self-sustaining engagement'],
        avoidPitfalls: ['Network effects must be quantified — vague claims don\'t convince', 'Show the flywheel diagram with specific data points at each stage'],
      },
      {
        question: 'What happens if a bigger player copies your AI features?',
        difficulty: 'critical',
        focusAreas: ['Data moat takes years to replicate — we have head start in Indonesian market data', 'Portals are ad-revenue models — pivoting to intelligence requires fundamental business model change', 'Our team has domain-specific AI expertise in Indonesian real estate', 'Speed of iteration in focused startup vs. feature-in-a-portfolio at large company'],
        keyData: ['12+ months of proprietary market data by seed stage', 'Indonesian real estate has unique patterns that global models miss', 'Dedicated AI team vs. portal companies with generalist engineering'],
        avoidPitfalls: ['Never say "they can\'t copy us" — say "the cost and time to replicate our data advantage is prohibitive"', 'Acknowledge the risk, then explain your speed advantage'],
      },
    ],
  },
  {
    id: 'revenue', title: 'Revenue & Business Model', icon: DollarSign, color: '--panel-success',
    description: 'Monetization timeline, unit economics, and scalability',
    questions: [
      {
        question: 'What is your path to consistent revenue?',
        difficulty: 'standard',
        focusAreas: ['4 revenue streams creating diversified income', 'Transaction commissions (1.5%) as primary near-term revenue', 'Premium subscriptions for recurring SaaS revenue', 'Developer promotion packages as B2B revenue', 'Service marketplace take rate for platform stickiness'],
        keyData: ['Break-even target: Month 10–14', 'Commission per transaction: ~IDR 37.5M on avg deal', 'Subscription ARPU: IDR 500K/month', 'Target 70%+ gross margin at scale'],
        avoidPitfalls: ['Don\'t promise profitability too early — focus on unit economics path', 'Show which revenue stream activates first and the sequencing logic'],
      },
      {
        question: 'How scalable are developer partnerships?',
        difficulty: 'tough',
        focusAreas: ['Indonesia has 10,000+ active property developers', 'Launch packages (IDR 15M/month) are high-value, low-touch revenue', 'Each developer brings 50–200 new listings — compounding marketplace supply', 'Developer success stories create referral loops to other developers'],
        keyData: ['Target: 10 developer partners by Month 12', '50+ by Month 24', 'Each partner contributes IDR 15M+/month in platform fees', 'Developer partnership LTV: IDR 360M+ over 24 months'],
        avoidPitfalls: ['Show the developer value proposition clearly — why they pay YOU vs. portals', 'Have at least 1–2 LOIs or pilot conversations to reference'],
      },
      {
        question: 'What are your unit economics?',
        difficulty: 'critical',
        focusAreas: ['CAC (Customer Acquisition Cost) by channel', 'LTV (Lifetime Value) by user segment', 'LTV:CAC ratio trajectory', 'Payback period and path to improvement'],
        keyData: ['Target CAC: IDR 150K for organic, IDR 500K for paid', 'Investor LTV (premium subscriber): IDR 6M+ (12 months)', 'Target LTV:CAC ratio: 3:1 by Month 12, 5:1+ by Month 24', 'Payback period target: <6 months'],
        avoidPitfalls: ['If you don\'t have real data yet, frame as "modeled targets" with assumptions stated', 'Show sensitivity analysis — investors respect intellectual honesty'],
      },
    ],
  },
  {
    id: 'competition', title: 'Competitive Strategy', icon: Shield, color: '--panel-warning',
    description: 'Market positioning, defensibility, and long-term moat',
    questions: [
      {
        question: 'How do you position against 99.co, Rumah123, OLX Property?',
        difficulty: 'tough',
        focusAreas: ['We complement rather than directly compete — different value layer', 'Portals = discovery. ASTRA Villa = investment intelligence + decision engine', 'We can partner with portals (data feeds) while building independent supply', 'Our monetization is investor-centric; theirs is agent/developer-ad-centric'],
        keyData: ['99.co raised $120M+ but focuses on agent tools', 'No SEA platform offers AI-driven investment scoring', 'Our NPS target: 50+ (vs industry avg 20–30 for portals)'],
        avoidPitfalls: ['Position as "different category" not "better version"', 'Show competitive landscape matrix with clear white space'],
      },
      {
        question: 'What is your long-term moat?',
        difficulty: 'critical',
        focusAreas: ['Data moat: largest proprietary Indonesian property intelligence dataset', 'Network effects: investor ↔ developer ↔ service provider ecosystem', 'AI moat: models trained on unique local data patterns', 'Brand trust: becoming the "Bloomberg of Asian real estate"'],
        keyData: ['Data advantage compounds 10x over 3 years', 'Switching cost increases with portfolio tracking history', 'Brand recognition target: top-3 property platform in Indonesia by Year 3'],
        avoidPitfalls: ['Moats take time — be honest about current vs. projected defensibility', '"We\'ll be the X of Y" needs concrete intermediate milestones'],
      },
    ],
  },
  {
    id: 'execution', title: 'Team & Execution', icon: Users, color: '--panel-error',
    description: 'Founder capability, hiring plan, and milestone track record',
    questions: [
      {
        question: 'Why is this team the right one to build this?',
        difficulty: 'critical',
        focusAreas: ['Founder domain expertise: real estate + technology intersection', 'Technical capability: built functional AI-powered MVP already', 'Market insight: deep understanding of Indonesian property investor pain points', 'Execution speed: MVP to full platform in accelerated timeline'],
        keyData: ['Working platform with 120+ pages, 200+ components, 18 edge functions', 'AI scoring, deal finder, market intelligence already operational', 'Full-stack technical founder reduces early-stage engineering risk'],
        avoidPitfalls: ['Show, don\'t just tell — demo the product', 'Acknowledge gaps and your plan to fill them (hiring roadmap)'],
      },
      {
        question: 'What are the key milestones you\'ve achieved?',
        difficulty: 'standard',
        focusAreas: ['MVP platform built and operational', 'AI investment scoring model live with 87%+ accuracy', '450+ database tables powering comprehensive data model', 'Multi-engine AI architecture (core, deal, AI, notification, payment)', 'Market intelligence and price prediction systems functional'],
        keyData: ['120+ pages built', '230+ custom hooks', '450+ database tables', '18 consolidated edge functions', '1,000+ RLS policies for security'],
        avoidPitfalls: ['Don\'t just list features — connect milestones to business value', 'Frame technical achievements as evidence of execution capability'],
      },
      {
        question: 'What is your hiring roadmap?',
        difficulty: 'standard',
        focusAreas: ['Phase 1 (Pre-Seed): Core team of 3–5, founder-led', 'Phase 2 (Seed): Scale to 8–12, add dedicated sales and marketing', 'Phase 3 (Series A): 20–30, build institutional sales team, AI research', 'Key hires: Head of Growth, Senior AI Engineer, Partnership Manager'],
        keyData: ['Current burn rate supports 12+ months runway', 'First 3 hires: growth marketer, backend engineer, partnership BD', 'ESOP pool: 15% allocated for talent attraction'],
        avoidPitfalls: ['Show you can do more with less first', 'Hiring plan should connect to revenue milestones, not just headcount'],
      },
    ],
  },
  {
    id: 'risk', title: 'Risk & Challenges', icon: AlertTriangle, color: '--panel-text-secondary',
    description: 'Honest risk acknowledgment and mitigation strategies',
    questions: [
      {
        question: 'What are the biggest risks to this business?',
        difficulty: 'critical',
        focusAreas: ['Market timing risk: real estate downturns reduce transaction volume', 'Regulatory risk: Indonesian fintech/proptech regulation evolving', 'Execution risk: scaling marketplace supply and demand simultaneously', 'Technology risk: AI accuracy dependent on data quality and volume'],
        keyData: ['Mitigation: subscription revenue is counter-cyclical (investors need more intelligence in downturns)', 'Legal entity structure designed for regulatory flexibility', 'Two-sided marketplace strategy with developer supply partnerships', 'Data quality pipeline with validation and cleansing automation'],
        avoidPitfalls: ['NEVER say "we have no risks" — investors will immediately lose trust', 'Show you\'ve thought deeply about each risk AND have mitigation plans'],
      },
      {
        question: 'What if the Indonesian property market crashes?',
        difficulty: 'tough',
        focusAreas: ['Intelligence becomes MORE valuable in downturns — investors need better data', 'Subscription revenue is recurring and less correlated to transaction volume', 'Market downturns create buying opportunities — our AI helps identify them', 'Geographic expansion to multiple SEA markets diversifies country risk'],
        keyData: ['During 2020 downturn, property search traffic increased 25%', 'Subscription businesses in fintech showed resilience during recessions', 'Counter-cyclical positioning: "Best time to invest is when others are fearful"'],
        avoidPitfalls: ['Acknowledge the impact on commission revenue honestly', 'Show how business model adapts, don\'t pretend it\'s immune'],
      },
    ],
  },
];

const difficultyConfig = {
  standard: { label: 'Standard', color: '--panel-success' },
  tough: { label: 'Tough', color: '--panel-warning' },
  critical: { label: 'Critical', color: '--panel-error' },
};

const InvestorQAPrep: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('market');
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const activeCat = categories.find(c => c.id === activeCategory)!;
  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);
  const criticalCount = categories.reduce((s, c) => s + c.questions.filter(q => q.difficulty === 'critical').length, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <MessageSquare className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Investor Q&A Preparation</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Structured answers for due diligence conversations — focus areas, key data points, and pitfalls to avoid</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Categories', value: String(categories.length), color: '--panel-accent' },
            { label: 'Total Questions', value: String(totalQuestions), color: '--panel-info' },
            { label: 'Critical Qs', value: String(criticalCount), color: '--panel-error' },
            { label: 'Prep Status', value: 'Ready', color: '--panel-success' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category tabs + Content */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setExpandedQ(null); }} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
              activeCategory === cat.id
                ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
            )}>
              <cat.icon className="h-3 w-3" />
              {cat.title}
              <span className="text-[8px] font-mono ml-0.5 opacity-60">{cat.questions.length}</span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Category header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-md border" style={{ backgroundColor: `hsl(var(${activeCat.color}) / 0.1)`, borderColor: `hsl(var(${activeCat.color}) / 0.2)` }}>
              <activeCat.icon className="h-3 w-3" style={{ color: `hsl(var(${activeCat.color}))` }} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{activeCat.title}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] ml-2">{activeCat.description}</span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3 animate-in fade-in duration-200">
            {activeCat.questions.map((q, qi) => {
              const qKey = `${activeCat.id}-${qi}`;
              const isOpen = expandedQ === qKey;
              const diff = difficultyConfig[q.difficulty];
              return (
                <div key={qKey} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <button
                    onClick={() => setExpandedQ(isOpen ? null : qKey)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--panel-hover)/.2)] hover:bg-[hsl(var(--panel-hover)/.4)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-[12px] font-bold font-mono text-[hsl(var(--panel-accent))] shrink-0">Q{qi + 1}</span>
                      <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] truncate">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{
                        color: `hsl(var(${diff.color}))`,
                        backgroundColor: `hsl(var(${diff.color}) / 0.08)`,
                        border: `1px solid hsl(var(${diff.color}) / 0.2)`,
                      }}>{diff.label}</span>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-3 divide-x divide-[hsl(var(--panel-border-subtle))] border-t border-[hsl(var(--panel-border-subtle))]">
                        {/* Focus Areas */}
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Target className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-accent))]">Answer Focus Areas</span>
                          </div>
                          <div className="space-y-1.5">
                            {q.focusAreas.map((f, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <ArrowRight className="h-2 w-2 shrink-0 mt-0.5 text-[hsl(var(--panel-accent)/.5)]" />
                                <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Data */}
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <BarChart3 className="h-3 w-3 text-[hsl(var(--panel-info))]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-info))]">Key Data Points</span>
                          </div>
                          <div className="space-y-1.5">
                            {q.keyData.map((d, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="h-2 w-2 shrink-0 mt-0.5 text-[hsl(var(--panel-info)/.5)]" />
                                <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{d}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pitfalls */}
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-error))]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))]">Avoid These Pitfalls</span>
                          </div>
                          <div className="space-y-1.5">
                            {q.avoidPitfalls.map((p, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <Shield className="h-2 w-2 shrink-0 mt-0.5 text-[hsl(var(--panel-error)/.5)]" />
                                <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick reference card */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <Lightbulb className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Golden Rules for Investor Meetings</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {[
            { rule: 'Show, Don\'t Tell', desc: 'Demo the product live. Working software > slide decks.', icon: Zap, color: '--panel-accent' },
            { rule: 'Data Over Claims', desc: 'Every statement backed by a number. "87% accuracy" > "very accurate".', icon: BarChart3, color: '--panel-info' },
            { rule: 'Honest About Risks', desc: 'Name your top 3 risks and mitigation plans. Builds massive trust.', icon: Shield, color: '--panel-warning' },
            { rule: 'Tell a Story Arc', desc: 'Problem → Insight → Solution → Traction → Vision. Make it memorable.', icon: Sparkles, color: '--panel-success' },
          ].map((r) => (
            <div key={r.rule} className="bg-[hsl(var(--panel-bg))] p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <r.icon className="h-3 w-3" style={{ color: `hsl(var(${r.color}))` }} />
                <span className="text-[10px] font-bold" style={{ color: `hsl(var(${r.color}))` }}>{r.rule}</span>
              </div>
              <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Investor Q&A Prep v1.0 — Practice answers aloud, refine with real data, and update after every investor conversation
      </p>
    </div>
  );
};

export default InvestorQAPrep;
