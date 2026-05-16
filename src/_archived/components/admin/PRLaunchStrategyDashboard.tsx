import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Newspaper, Megaphone, Users, TrendingUp, Target,
  FileText, Globe, Mic, Send, Calendar, CheckCircle2,
  ArrowRight, Star, Zap, BarChart3, Clock, MessageSquare,
  ChevronDown, ChevronRight, Crown, Eye, Sparkles,
  Share2, Image, Award, Quote, ExternalLink, Layers,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — PR & Media Launch Strategy
   Brand awareness, media exposure, and credibility engine
   ═══════════════════════════════════════════════════════════ */

// ── Brand Story Angles ──────────────────────────────────
const brandStoryAngles = [
  {
    angle: 'AI Transforms Investment Decisions',
    headline: '"Institutional-grade property intelligence, now accessible to every Indonesian investor"',
    hook: 'Position ASTRA Villa as the AI brain behind smarter property decisions — valuation, ROI forecasting, and risk scoring that replaces gut-feeling investing.',
    icon: Sparkles,
    color: '--panel-accent',
  },
  {
    angle: 'Smart Marketplace Ecosystem',
    headline: '"Not just listings — a living intelligence ecosystem connecting investors, developers, and agents"',
    hook: 'Showcase the marketplace as a multi-sided platform with AI at its core, creating network effects between verified agents, qualified buyers, and data-driven developers.',
    icon: Layers,
    color: '--panel-info',
  },
  {
    angle: 'Local Market Intelligence Leader',
    headline: '"The deepest AI-powered property data layer across Indonesia — from province to kelurahan"',
    hook: 'Emphasize programmatic coverage depth and Indonesia-first intelligence that global competitors cannot replicate. Data moat as competitive advantage.',
    icon: Globe,
    color: '--panel-success',
  },
  {
    angle: 'Founder Vision — Proptech Future',
    headline: '"Why Indonesia\'s $350B property market is ready for its AI moment"',
    hook: 'Personal narrative connecting market inefficiency to AI opportunity. Authentic founder story about building technology for a real pain point.',
    icon: Crown,
    color: '--panel-warning',
  },
];

// ── Media Outreach Targets ──────────────────────────────
const mediaTargets = [
  { tier: 'Property & Investment Platforms', icon: BarChart3, outlets: ['Rumah.com News', 'Properti Indonesia', 'Property & Bank Magazine', 'Real Estate Asia', 'Bisnis Indonesia Property', 'Investor Daily'], goal: 'Industry legitimacy + agent/developer trust', priority: 'High' },
  { tier: 'Startup & Technology Publications', icon: Zap, outlets: ['TechCrunch', 'e27', 'Tech in Asia', 'DailySocial.id', 'KrASIA', 'The Ken Asia'], goal: 'Credibility + global startup visibility', priority: 'High' },
  { tier: 'Real Estate Influencer Network', icon: Users, outlets: ['Property TikTok Creators', 'Investment YouTube Educators', 'LinkedIn Thought Leaders', 'Instagram Home/Design Creators', 'Podcast Hosts (Finansialku, Property Talks)'], goal: 'Authentic storytelling + viral potential', priority: 'Medium' },
  { tier: 'Business & Mainstream Media', icon: Newspaper, outlets: ['Kompas Tekno', 'CNBC Indonesia', 'Katadata', 'IDN Times', 'Detik Finance'], goal: 'Mass market awareness + user acquisition', priority: 'Medium' },
];

// ── Launch Campaign Ideas ───────────────────────────────
const launchCampaigns = [
  {
    title: '"Top AI-Ranked Investment Opportunities" Feature',
    description: 'Weekly or monthly curated report showcasing the highest AI-scored properties across Indonesia. Designed for media syndication and social sharing.',
    deliverables: ['Interactive web page with live AI scores', 'Downloadable PDF report', 'Social media carousel assets', 'Media-ready data visualizations'],
    mediaAngle: 'Pitch as exclusive data story to property journalists — first-of-its-kind AI-ranked investment guide',
    icon: Star,
    color: '--panel-accent',
  },
  {
    title: 'City Market Intelligence Report Release',
    description: 'Data-driven deep-dive into property markets of top Indonesian cities. AI-generated insights on pricing trends, demand hotspots, and investment outlook.',
    deliverables: ['Quarterly PDF report (30+ pages)', 'Press release with key findings', 'Infographic summary per city', 'Embeddable data widgets for media partners'],
    mediaAngle: 'Offer under embargo to tier-1 outlets. Position ASTRA Villa as the authoritative data source for Indonesian property intelligence.',
    icon: BarChart3,
    color: '--panel-info',
  },
  {
    title: 'Founder Interview Series — Proptech Future',
    description: 'Coordinated media tour positioning the founder as a thought leader on AI × real estate. Podcast circuit, written interviews, and conference speaking.',
    deliverables: ['Founder talking points document', 'Bio + headshot media kit', '5–8 podcast bookings', 'LinkedIn thought leadership articles'],
    mediaAngle: 'Angle: "Why a tech founder bet everything on fixing Indonesian property with AI" — personal story meets market opportunity.',
    icon: Mic,
    color: '--panel-success',
  },
];

// ── Digital PR Support Assets ───────────────────────────
const digitalPRAssets = [
  {
    asset: 'Press Release Landing Page',
    description: 'Dedicated /press page with latest releases, media kit download, founder bio, platform screenshots, and press contact form.',
    specs: ['SEO-optimized for "[Brand] press" queries', 'Embeddable logo pack (SVG/PNG)', 'High-res product screenshots', 'One-click media kit download'],
    icon: FileText,
  },
  {
    asset: 'Shareable Market Intelligence Infographics',
    description: 'Visually compelling data graphics designed for social sharing and media embedding. Auto-generated from platform AI analytics.',
    specs: ['Instagram/LinkedIn-optimized dimensions', 'Brand-consistent visual language', '"AI-Powered" data badge watermark', 'Monthly refresh cadence'],
    icon: Image,
  },
  {
    asset: 'Social Proof & Testimonial Highlights',
    description: 'Curated testimonial cards from early agents, developers, and investors. Video snippets and pull-quotes for media use.',
    specs: ['Video testimonials (30-60 sec)', 'Quote cards for social media', 'Case study one-pagers', 'Star rating + metric highlights'],
    icon: Quote,
  },
  {
    asset: 'Award & Recognition Portfolio',
    description: 'Tracking and showcasing platform awards, media mentions, and industry recognition badges across the site.',
    specs: ['"As featured in" media logo bar', 'Award submission tracker', 'Recognition badges on listing pages', 'Annual achievement summary'],
    icon: Award,
  },
];

// ── PR Performance Metrics ──────────────────────────────
const prMetrics = [
  { label: 'Media Mentions', target: '10+ articles/month', icon: Newspaper, kpis: ['Article count by tier', 'Share of voice vs competitors', 'Sentiment analysis score'] },
  { label: 'Social Amplification', target: '50K+ reach/week', icon: Share2, kpis: ['Total impressions per campaign', 'Engagement rate by platform', 'Influencer content performance'] },
  { label: 'Brand Search Volume', target: '+20% monthly growth', icon: TrendingUp, kpis: ['Branded search queries', 'Direct traffic growth', 'Brand mention velocity'] },
  { label: 'Lead Attribution', target: '15% PR-sourced leads', icon: Target, kpis: ['PR-attributed signups', 'Media referral traffic', 'Conversion rate by channel'] },
];

// ── 4-Phase Timeline ────────────────────────────────────
const phases = [
  { name: 'Pre-Launch Seeding', timeline: 'Weeks 1-4', icon: Target, color: '--panel-warning', tasks: ['Draft press release (EN + ID)', 'Build 50+ media contact list', 'Create 3-min product demo video', 'Write founder origin story', 'Secure 3-5 media embargoes', 'Prepare data/stat hooks'] },
  { name: 'Launch Week Blitz', timeline: 'Days 1-7', icon: Zap, color: '--panel-success', tasks: ['Wire distribution + direct pitches', '5-8 founder interviews', 'Coordinated social campaign', '10+ influencer activations', 'Community launches (Product Hunt)', 'Agent network announcement'] },
  { name: 'Post-Launch Momentum', timeline: 'Weeks 2-8', icon: TrendingUp, color: '--panel-info', tasks: ['Weekly milestone announcements', '2-3 agent/developer case studies', 'Monthly thought leadership op-eds', 'Apply to 5+ conferences', 'Traction update media pitches', 'Partner co-branded PR'] },
  { name: 'Visibility Engine', timeline: 'Month 3-6+', icon: Globe, color: '--panel-accent', tasks: ['Monthly growth storytelling', 'Awards & recognition submissions', 'Quarterly journalist engagement', 'Fundraising PR coordination', 'Quarterly market AI reports'] },
];

// ── Tabs & Component ────────────────────────────────────
type TabKey = 'brand-story' | 'media-targets' | 'campaigns' | 'digital-pr' | 'timeline' | 'metrics';

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'brand-story', label: 'Brand Story', icon: Crown },
  { key: 'media-targets', label: 'Media Targets', icon: Newspaper },
  { key: 'campaigns', label: 'Launch Campaigns', icon: Megaphone },
  { key: 'digital-pr', label: 'Digital PR', icon: Globe },
  { key: 'timeline', label: 'Timeline', icon: Calendar },
  { key: 'metrics', label: 'Metrics', icon: BarChart3 },
];

const PRLaunchStrategyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('brand-story');
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── Header ──────────────────────────────── */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Megaphone className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">
              PR & Media Launch Strategy
            </h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">
              Strategic storytelling and media exposure for brand awareness and investor credibility
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Story Angles', value: '4', color: '--panel-accent' },
            { label: 'Media Targets', value: '20+', color: '--panel-info' },
            { label: 'Campaign Ideas', value: '3', color: '--panel-success' },
            { label: 'PR Assets', value: '4', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────── */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                  : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
              )}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* ── Brand Story Tab ──────────────── */}
          {activeTab === 'brand-story' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Positioning statement */}
              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.04)] border border-[hsl(var(--panel-accent)/.15)] p-4">
                <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-accent))] font-semibold">Core Positioning</span>
                <p className="text-[13px] font-semibold text-[hsl(var(--panel-text))] mt-1 italic leading-relaxed">
                  "The first AI-powered property investment platform giving every Indonesian investor the intelligence tools previously reserved for institutional players."
                </p>
              </div>

              {/* Story angles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[hsl(var(--panel-border-subtle))] rounded-lg overflow-hidden">
                {brandStoryAngles.map((story) => (
                  <div key={story.angle} className="bg-[hsl(var(--panel-bg))] p-4 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-lg border shrink-0"
                        style={{ backgroundColor: `hsl(var(${story.color}) / 0.08)`, borderColor: `hsl(var(${story.color}) / 0.2)` }}
                      >
                        <story.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${story.color}))` }} />
                      </div>
                      <div>
                        <span
                          className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `hsl(var(${story.color}) / 0.1)`, color: `hsl(var(${story.color}))` }}
                        >
                          {story.angle}
                        </span>
                        <p className="text-[11px] font-bold text-[hsl(var(--panel-text))] mt-1.5 leading-snug">{story.headline}</p>
                        <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] mt-1 leading-relaxed">{story.hook}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3 Key Messages */}
              <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                <div className="px-3 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                  <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">3 Key Messages — Repeat in Every Interaction</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {[
                    { msg: 'AI Intelligence for Everyone', detail: 'Institutional-grade valuation, ROI forecasting, and risk analysis — accessible to every buyer and investor.' },
                    { msg: 'Verified & Transparent', detail: 'Every listing quality-checked, every agent verified, every price validated by AI against market data.' },
                    { msg: 'Indonesia-First, Built for Scale', detail: 'Programmatic coverage from province to kelurahan. Built for Indonesian market dynamics.' },
                  ].map((m, i) => (
                    <div key={i} className="bg-[hsl(var(--panel-bg))] p-3">
                      <span className="text-[10px] font-bold text-[hsl(var(--panel-accent))]">{i + 1}.</span>
                      <p className="text-[11px] font-semibold text-[hsl(var(--panel-text))] mt-0.5">{m.msg}</p>
                      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mt-1">{m.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Media Targets Tab ────────────── */}
          {activeTab === 'media-targets' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {mediaTargets.map((tier) => (
                <div key={tier.tier} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <tier.icon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                    <span className="text-[11px] font-bold text-[hsl(var(--panel-text))] flex-1">{tier.tier}</span>
                    <span
                      className={cn(
                        "text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                        tier.priority === 'High'
                          ? "bg-[hsl(var(--panel-error)/.1)] text-[hsl(var(--panel-error))]"
                          : "bg-[hsl(var(--panel-warning)/.1)] text-[hsl(var(--panel-warning))]"
                      )}
                    >
                      {tier.priority} Priority
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tier.outlets.map((outlet) => (
                        <span key={outlet} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--panel-hover))] text-[hsl(var(--panel-text-secondary))] border border-[hsl(var(--panel-border-subtle))]">
                          {outlet}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-2.5 w-2.5 text-[hsl(var(--panel-info))]" />
                      <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">Goal: {tier.goal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Launch Campaigns Tab ─────────── */}
          {activeTab === 'campaigns' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {launchCampaigns.map((campaign, i) => {
                const isExpanded = expandedCampaign === i;
                return (
                  <button
                    key={i}
                    onClick={() => setExpandedCampaign(isExpanded ? null : i)}
                    className="w-full text-left rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden hover:border-[hsl(var(--panel-accent)/.2)] transition-colors"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg border shrink-0"
                        style={{ backgroundColor: `hsl(var(${campaign.color}) / 0.08)`, borderColor: `hsl(var(${campaign.color}) / 0.2)` }}
                      >
                        <campaign.icon className="h-4 w-4" style={{ color: `hsl(var(${campaign.color}))` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-bold text-[hsl(var(--panel-text))]">{campaign.title}</h4>
                        <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mt-0.5">{campaign.description}</p>
                      </div>
                      <ChevronDown className={cn("h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))] transition-transform shrink-0", isExpanded && "rotate-180")} />
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="ml-11">
                          <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Deliverables</span>
                          <div className="mt-1 space-y-1">
                            {campaign.deliverables.map((d, di) => (
                              <div key={di} className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-2.5 w-2.5" style={{ color: `hsl(var(${campaign.color}))` }} />
                                <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{d}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="ml-11 rounded-md bg-[hsl(var(--panel-hover)/.5)] p-2">
                          <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-info))] font-semibold">Media Angle</span>
                          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mt-0.5">{campaign.mediaAngle}</p>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Digital PR Support Tab ────────── */}
          {activeTab === 'digital-pr' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[hsl(var(--panel-border-subtle))] rounded-lg overflow-hidden">
                {digitalPRAssets.map((asset) => (
                  <div key={asset.asset} className="bg-[hsl(var(--panel-bg))] p-4 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.15)] shrink-0">
                        <asset.icon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{asset.asset}</h4>
                        <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mt-1 leading-relaxed">{asset.description}</p>
                        <div className="mt-2 space-y-0.5">
                          {asset.specs.map((spec, si) => (
                            <div key={si} className="flex items-center gap-1.5">
                              <ArrowRight className="h-2 w-2 text-[hsl(var(--panel-accent)/.6)]" />
                              <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{spec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Press Kit Checklist */}
              <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                <div className="px-3 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                  <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Press Kit Contents Checklist</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3">
                  {[
                    'Press release (EN + ID)', 'Founder headshot (high-res)',
                    'Platform screenshots (5-8)', 'Product demo video (3 min)',
                    'Logo pack (SVG, PNG, dark/light)', 'Key stats one-pager',
                    'Founder bio (150 words)', 'Company fact sheet',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-[hsl(var(--panel-success))]" />
                      <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Timeline Tab ─────────────────── */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Phase pipeline visual */}
              <div className="flex items-center gap-1 mb-2">
                {phases.map((phase, i) => (
                  <React.Fragment key={phase.name}>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `hsl(var(${phase.color}) / 0.15)` }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: '100%', backgroundColor: `hsl(var(${phase.color}))`, boxShadow: `0 0 6px hsl(var(${phase.color}) / 0.3)` }}
                      />
                    </div>
                    {i < phases.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-[hsl(var(--panel-text-muted))] shrink-0" />}
                  </React.Fragment>
                ))}
              </div>

              {phases.map((phase) => (
                <div key={phase.name} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))]" style={{ backgroundColor: `hsl(var(${phase.color}) / 0.03)` }}>
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0"
                      style={{ backgroundColor: `hsl(var(${phase.color}) / 0.1)`, borderColor: `hsl(var(${phase.color}) / 0.2)` }}
                    >
                      <phase.icon className="h-3 w-3" style={{ color: `hsl(var(${phase.color}))` }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{phase.name}</h4>
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{phase.timeline}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: `hsl(var(${phase.color}))` }}>{phase.tasks.length} tasks</span>
                  </div>
                  <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
                    {phase.tasks.map((task, ti) => (
                      <div key={ti} className="flex items-center gap-2.5 px-4 py-2 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                        <span className="text-[9px] font-mono font-bold w-4 text-center" style={{ color: `hsl(var(${phase.color}) / 0.5)` }}>{ti + 1}</span>
                        <span className="text-[10px] text-[hsl(var(--panel-text-secondary))]">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Metrics Tab ──────────────────── */}
          {activeTab === 'metrics' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))] rounded-lg overflow-hidden">
                {prMetrics.map((metric) => (
                  <div key={metric.label} className="bg-[hsl(var(--panel-bg))] p-4 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.15)]">
                        <metric.icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
                      </div>
                      <h4 className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{metric.label}</h4>
                    </div>
                    <p className="text-[12px] font-bold font-mono text-[hsl(var(--panel-success))] mb-2">{metric.target}</p>
                    <div className="space-y-1">
                      {metric.kpis.map((kpi, ki) => (
                        <div key={ki} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--panel-warning)/.5)]" />
                          <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{kpi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust-building note */}
              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.03)] border border-[hsl(var(--panel-accent)/.12)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Award className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
                  <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                    Final goal: Build strong brand trust and attract investor curiosity toward ASTRA Villa platform capabilities through sustained, measurable PR execution.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────── */}
      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa PR & Media Launch Strategy v2.0 — Strategic storytelling for brand awareness and investor credibility
      </p>
    </div>
  );
};

export default PRLaunchStrategyDashboard;
