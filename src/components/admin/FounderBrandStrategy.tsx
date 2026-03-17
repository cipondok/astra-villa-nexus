import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  User, Mic, Pen, Video, Globe, Linkedin, Calendar,
  Target, ArrowRight, CheckCircle2, Lightbulb, TrendingUp,
  Megaphone, BookOpen, Sparkles, BarChart3, Eye, Users,
  MessageSquare, Award, Zap, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Founder Brand Positioning Strategy
   Personal authority building for trust, partnerships & funding
   ═══════════════════════════════════════════════════════════ */

type TabKey = 'positioning' | 'content' | 'channels' | 'calendar' | 'kpis';
const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'positioning', label: 'Brand Positioning', icon: User },
  { key: 'content', label: 'Content Strategy', icon: Pen },
  { key: 'channels', label: 'Visibility Channels', icon: Globe },
  { key: 'calendar', label: 'Execution Calendar', icon: Calendar },
  { key: 'kpis', label: 'Brand KPIs', icon: BarChart3 },
];

const SectionBlock: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
      <Icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
      <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{title}</span>
    </div>
    {children}
  </div>
);

const positioningThemes = [
  { theme: 'AI-Powered Investment Intelligence', icon: Sparkles, color: '--panel-accent', tagline: '"Making property investment decisions smarter with AI"', narrative: 'Position as the founder who saw the gap between emotional property decisions and data-driven investing, and built the AI bridge.', talkingPoints: ['Why 80% of property investors make emotional decisions', 'How AI scoring removes bias from investment analysis', 'The future of algorithmic real estate advisory', 'Building trustworthy AI that investors can rely on'] },
  { theme: 'Next-Gen Real Estate Ecosystem Builder', icon: Globe, color: '--panel-info', tagline: '"Building the infrastructure layer for intelligent real estate"', narrative: 'Visionary who sees real estate not as a traditional industry but as a technology platform opportunity — the Bloomberg Terminal of property.', talkingPoints: ['Why real estate needs its own intelligence platform', 'Connecting investors, developers, and services in one ecosystem', 'The proptech revolution in Southeast Asia', 'From marketplace to intelligence infrastructure'] },
  { theme: 'Data-Driven Investment Educator', icon: BookOpen, color: '--panel-success', tagline: '"Teaching a smarter way to invest in property"', narrative: 'Democratizing institutional-grade property analysis for everyday investors through accessible education and tools.', talkingPoints: ['Understanding ROI beyond gut feeling', 'Reading market cycles for optimal timing', 'How data reveals hidden investment gems', 'The metrics that matter in property evaluation'] },
  { theme: 'Regional Market Insights Leader', icon: TrendingUp, color: '--panel-warning', tagline: '"Mapping the future of Southeast Asian real estate"', narrative: 'The go-to voice on emerging property markets, growth corridors, and untapped investment zones across Indonesia and SEA.', talkingPoints: ['Emerging growth zones before they mainstream', 'Infrastructure-driven value predictions', 'Cross-city investment comparison frameworks', 'Capital flow patterns and what they signal'] },
];

const contentPillars = [
  {
    pillar: 'Short-Form Educational Videos', icon: Video, color: '--panel-accent', frequency: '3–4x/week',
    formats: [
      { format: '60-sec Market Insight', desc: 'Quick data-driven insight on a specific market trend or zone', platform: 'Instagram Reels, TikTok, LinkedIn' },
      { format: 'AI Demo Walkthrough', desc: 'Show ASTRA Villa AI scoring a real property in real-time', platform: 'LinkedIn, YouTube Shorts' },
      { format: '"Did You Know?" Property Facts', desc: 'Surprising statistics about property investment in Indonesia', platform: 'All platforms' },
      { format: 'Founder Journey Update', desc: 'Behind-the-scenes of building a proptech startup', platform: 'Instagram Stories, LinkedIn' },
    ],
  },
  {
    pillar: 'Thought Leadership Articles', icon: Pen, color: '--panel-info', frequency: '1–2x/week',
    formats: [
      { format: 'Monthly Market Report', desc: 'Data-backed analysis of Indonesian property market trends', platform: 'LinkedIn Article, Medium, Blog' },
      { format: 'Investment Framework Guides', desc: 'Educational deep-dives on ROI analysis, exit timing, market cycles', platform: 'LinkedIn, Newsletter' },
      { format: '"Builder\'s Log" Series', desc: 'Transparent updates on product development, metrics, learnings', platform: 'LinkedIn, Twitter/X' },
      { format: 'Opinion Pieces', desc: 'Hot takes on proptech trends, regulations, and industry shifts', platform: 'LinkedIn, Guest posts' },
    ],
  },
  {
    pillar: 'Live Engagement & Speaking', icon: Mic, color: '--panel-success', frequency: '2–4x/month',
    formats: [
      { format: 'LinkedIn Live Q&A', desc: 'Monthly "Ask Me Anything" on property investment', platform: 'LinkedIn Live' },
      { format: 'Webinar Hosting', desc: 'Themed sessions: "AI in Real Estate", "Finding Growth Zones"', platform: 'Zoom, YouTube Live' },
      { format: 'Podcast Guest Appearances', desc: 'Target proptech, startup, and investment podcasts', platform: 'Various podcasts' },
      { format: 'Conference Speaking', desc: 'Proptech, startup, and real estate investment events', platform: 'In-person & virtual' },
    ],
  },
];

const channels = [
  {
    channel: 'LinkedIn', icon: Linkedin, color: '--panel-info', priority: 'Primary',
    strategy: 'Core platform for B2B credibility, investor relations, and developer partnerships.',
    tactics: ['3–5 posts/week mixing insights, product updates, and personal stories', 'Comment strategy on industry leaders\' posts', 'Monthly LinkedIn Article deep-dives', 'LinkedIn Live monthly Q&A sessions', 'Connection strategy: 20 targeted outreach/week'],
    targets: ['5K followers by Month 6', '15K followers by Month 12', '50K followers by Month 24'],
  },
  {
    channel: 'Webinars & Events', icon: Mic, color: '--panel-accent', priority: 'High',
    strategy: 'Position as thought leader through educational events and speaking engagements.',
    tactics: ['Host monthly "Smart Property Investing" webinar series', 'Apply to speak at 3+ proptech/startup events per quarter', 'Co-host events with developer partners', 'Record and repurpose all speaking content'],
    targets: ['2 speaking slots by Month 6', '100+ webinar attendees avg by Month 12', 'Keynote invitation by Month 18'],
  },
  {
    channel: 'YouTube & Short Video', icon: Video, color: '--panel-error', priority: 'High',
    strategy: 'Build organic reach through educational and demo content that showcases AI capabilities.',
    tactics: ['Weekly "Market Minute" short video series', 'Monthly long-form property analysis videos', 'Product demo and AI walkthrough content', 'Collaboration with property influencers'],
    targets: ['1K subscribers by Month 6', '10K subscribers by Month 12', '100K total views by Month 18'],
  },
  {
    channel: 'Newsletter & Blog', icon: BookOpen, color: '--panel-success', priority: 'Medium',
    strategy: 'Own the audience with direct communication channel for deeper engagement.',
    tactics: ['Weekly newsletter with curated market insights', 'Monthly "State of the Market" report', 'Exclusive early access to AI features for subscribers', 'Guest contributor invitations'],
    targets: ['1K subscribers by Month 6', '5K subscribers by Month 12', '25%+ open rate maintained'],
  },
];

const weeklyCalendar = [
  { day: 'Monday', items: [{ type: 'LinkedIn Post', topic: 'Weekly market insight or data point', color: '--panel-info' }, { type: 'Content Planning', topic: 'Plan week\'s content batch', color: '--panel-text-muted' }] },
  { day: 'Tuesday', items: [{ type: 'Short Video', topic: 'Record 2–3 educational reels', color: '--panel-accent' }, { type: 'LinkedIn Comment', topic: 'Engage on 10+ industry posts', color: '--panel-info' }] },
  { day: 'Wednesday', items: [{ type: 'LinkedIn Post', topic: 'Product update or founder journey', color: '--panel-info' }, { type: 'Article Draft', topic: 'Write thought leadership piece', color: '--panel-success' }] },
  { day: 'Thursday', items: [{ type: 'Short Video', topic: 'AI demo or property analysis', color: '--panel-accent' }, { type: 'Outreach', topic: 'Podcast/event/media outreach', color: '--panel-warning' }] },
  { day: 'Friday', items: [{ type: 'LinkedIn Post', topic: 'Weekend read or reflection', color: '--panel-info' }, { type: 'Newsletter', topic: 'Draft and schedule weekly send', color: '--panel-success' }] },
  { day: 'Weekend', items: [{ type: 'Scheduled Posts', topic: 'Auto-publish pre-made content', color: '--panel-text-muted' }, { type: 'Research', topic: 'Gather insights for next week', color: '--panel-text-muted' }] },
];

const brandKPIs = [
  { category: 'Reach & Awareness', color: '--panel-accent', metrics: [
    { metric: 'LinkedIn Followers', m3: '1,500', m6: '5,000', m12: '15,000', m24: '50,000' },
    { metric: 'Total Content Impressions/mo', m3: '20K', m6: '100K', m12: '500K', m24: '2M' },
    { metric: 'YouTube/Video Subscribers', m3: '200', m6: '1,000', m12: '10,000', m24: '50,000' },
    { metric: 'Newsletter Subscribers', m3: '300', m6: '1,000', m12: '5,000', m24: '20,000' },
  ]},
  { category: 'Engagement & Authority', color: '--panel-info', metrics: [
    { metric: 'Avg LinkedIn Post Engagement', m3: '2%', m6: '3.5%', m12: '5%', m24: '6%' },
    { metric: 'Speaking Invitations/quarter', m3: '1', m6: '3', m12: '6', m24: '10+' },
    { metric: 'Podcast Appearances', m3: '1', m6: '4', m12: '12', m24: '24+' },
    { metric: 'Media Mentions', m3: '2', m6: '8', m12: '25', m24: '60+' },
  ]},
  { category: 'Business Impact', color: '--panel-success', metrics: [
    { metric: 'Inbound Partnership Inquiries/mo', m3: '2', m6: '5', m12: '15', m24: '30+' },
    { metric: 'Investor Warm Intros via Brand', m3: '1', m6: '3', m12: '8', m24: '15+' },
    { metric: 'Platform Signups from Founder Content', m3: '50', m6: '200', m12: '1,000', m24: '5,000' },
    { metric: 'Brand-attributed Revenue %', m3: '5%', m6: '10%', m12: '15%', m24: '20%' },
  ]},
];

const FounderBrandStrategy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('positioning');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <User className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Founder Brand Positioning Strategy</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Personal authority building for investor credibility, developer trust, and user acquisition</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Brand Themes', value: '4', color: '--panel-accent' },
            { label: 'Content Pillars', value: '3', color: '--panel-info' },
            { label: 'Active Channels', value: '4', color: '--panel-success' },
            { label: 'Weekly Touchpoints', value: '10+', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
            )}>
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">

          {/* ── Brand Positioning Tab ──────── */}
          {activeTab === 'positioning' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Core Identity */}
              <SectionBlock title="Founder Brand Identity Blueprint" icon={User}>
                <div className="grid grid-cols-2 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {[
                    { label: 'Brand Archetype', value: 'The Visionary Innovator', desc: 'A builder who sees the future of real estate through the lens of technology and data' },
                    { label: 'Core Promise', value: '"Smarter property decisions through AI"', desc: 'Every piece of content ties back to this central value proposition' },
                    { label: 'Audience Segments', value: 'Investors → Developers → Media', desc: 'Primary: aspiring investors. Secondary: developer partners. Tertiary: press & VCs' },
                    { label: 'Tone of Voice', value: 'Authoritative yet Accessible', desc: 'Data-rich but human. Technical depth with simple explanations. Confident not arrogant.' },
                  ].map((id) => (
                    <div key={id.label} className="bg-[hsl(var(--panel-bg))] p-4">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">{id.label}</span>
                      <p className="text-[12px] font-bold text-[hsl(var(--panel-accent))] mt-1">{id.value}</p>
                      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mt-0.5">{id.desc}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              {/* Positioning Themes */}
              {positioningThemes.map((pt) => (
                <div key={pt.theme} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0" style={{ backgroundColor: `hsl(var(${pt.color}) / 0.1)`, borderColor: `hsl(var(${pt.color}) / 0.2)` }}>
                      <pt.icon className="h-3 w-3" style={{ color: `hsl(var(${pt.color}))` }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{pt.theme}</h4>
                      <span className="text-[9px] italic" style={{ color: `hsl(var(${pt.color}))` }}>{pt.tagline}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mb-2.5">{pt.narrative}</p>
                    <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Key Talking Points</span>
                    <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
                      {pt.talkingPoints.map((tp, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <MessageSquare className="h-2 w-2 shrink-0" style={{ color: `hsl(var(${pt.color}) / 0.5)` }} />
                          <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{tp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Content Strategy Tab ──────── */}
          {activeTab === 'content' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {contentPillars.map((cp) => (
                <div key={cp.pillar} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0" style={{ backgroundColor: `hsl(var(${cp.color}) / 0.1)`, borderColor: `hsl(var(${cp.color}) / 0.2)` }}>
                        <cp.icon className="h-3 w-3" style={{ color: `hsl(var(${cp.color}))` }} />
                      </div>
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{cp.pillar}</h4>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ color: `hsl(var(${cp.color}))`, backgroundColor: `hsl(var(${cp.color}) / 0.08)`, border: `1px solid hsl(var(${cp.color}) / 0.15)` }}>
                      {cp.frequency}
                    </span>
                  </div>
                  <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
                    {cp.formats.map((f, i) => (
                      <div key={i} className="flex items-start justify-between px-4 py-2.5">
                        <div className="flex-1">
                          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{f.format}</span>
                          <p className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-0.5">{f.desc}</p>
                        </div>
                        <span className="text-[7px] text-[hsl(var(--panel-text-muted))] bg-[hsl(var(--panel-hover))] px-1.5 py-0.5 rounded shrink-0 ml-3">{f.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Content repurposing flow */}
              <SectionBlock title="Content Repurposing Flywheel" icon={Zap}>
                <div className="p-4">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {[
                      { step: '1 Long Video', color: '--panel-accent' },
                      { step: '3–4 Short Clips', color: '--panel-info' },
                      { step: 'LinkedIn Article', color: '--panel-success' },
                      { step: 'Newsletter Edition', color: '--panel-warning' },
                      { step: '5+ Social Posts', color: '--panel-error' },
                    ].map((s, i) => (
                      <React.Fragment key={s.step}>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border" style={{ borderColor: `hsl(var(${s.color}) / 0.2)`, backgroundColor: `hsl(var(${s.color}) / 0.06)` }}>
                          <span className="text-[9px] font-bold" style={{ color: `hsl(var(${s.color}))` }}>{s.step}</span>
                        </div>
                        {i < 4 && <ArrowRight className="h-3 w-3 text-[hsl(var(--panel-text-muted)/.3)]" />}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-[8px] text-[hsl(var(--panel-text-muted))] text-center mt-2">One piece of deep content → 10+ distribution touchpoints across all channels</p>
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ── Visibility Channels Tab ──────── */}
          {activeTab === 'channels' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {channels.map((ch) => (
                <div key={ch.channel} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0" style={{ backgroundColor: `hsl(var(${ch.color}) / 0.1)`, borderColor: `hsl(var(${ch.color}) / 0.2)` }}>
                        <ch.icon className="h-3 w-3" style={{ color: `hsl(var(${ch.color}))` }} />
                      </div>
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{ch.channel}</h4>
                    </div>
                    <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ color: `hsl(var(${ch.color}))`, backgroundColor: `hsl(var(${ch.color}) / 0.08)`, border: `1px solid hsl(var(${ch.color}) / 0.15)` }}>
                      {ch.priority} Priority
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mb-3">{ch.strategy}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Tactics</span>
                        {ch.tactics.map((t, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <ArrowRight className="h-2 w-2 shrink-0 mt-0.5 text-[hsl(var(--panel-accent)/.5)]" />
                            <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{t}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Growth Targets</span>
                        {ch.targets.map((t, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Target className="h-2 w-2 shrink-0" style={{ color: `hsl(var(${ch.color}) / 0.5)` }} />
                            <span className="text-[8px] font-medium" style={{ color: `hsl(var(${ch.color}))` }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Execution Calendar Tab ──────── */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <SectionBlock title="Weekly Content Execution Rhythm" icon={Calendar}>
                <div className="grid grid-cols-6 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {weeklyCalendar.map((day) => (
                    <div key={day.day} className="bg-[hsl(var(--panel-bg))] p-3">
                      <span className="text-[9px] font-bold text-[hsl(var(--panel-text))]">{day.day}</span>
                      <div className="mt-2 space-y-2">
                        {day.items.map((item, i) => (
                          <div key={i} className="rounded-md p-1.5 border" style={{ borderColor: `hsl(var(${item.color}) / 0.15)`, backgroundColor: `hsl(var(${item.color}) / 0.04)` }}>
                            <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${item.color}))` }}>{item.type}</span>
                            <p className="text-[7px] text-[hsl(var(--panel-text-muted))] mt-0.5 leading-tight">{item.topic}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              {/* Monthly milestones */}
              <SectionBlock title="Monthly Brand Building Milestones" icon={Award}>
                <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
                  {[
                    { month: 'Month 1–3', phase: 'Foundation', color: '--panel-info', tasks: ['Establish LinkedIn posting rhythm', 'Record first 20 short videos', 'Launch newsletter', 'Attend 1 industry event', 'Build initial content library'] },
                    { month: 'Month 4–6', phase: 'Momentum', color: '--panel-accent', tasks: ['Reach 5K LinkedIn followers', 'Publish first market report', 'Secure 2 podcast appearances', 'Host first webinar', 'Get first media mention'] },
                    { month: 'Month 7–12', phase: 'Authority', color: '--panel-success', tasks: ['15K LinkedIn followers', 'Regular speaking invitations', 'Recognized voice in proptech', 'Content drives measurable signups', 'Investor inbound from content'] },
                    { month: 'Month 13–24', phase: 'Influence', color: '--panel-warning', tasks: ['50K+ LinkedIn followers', 'Keynote speaking slots', 'Media go-to source for proptech', 'Brand drives 20%+ of platform growth', 'Strategic partnership inbound'] },
                  ].map((ms) => (
                    <div key={ms.month} className="flex items-start gap-4 px-4 py-3">
                      <div className="w-24 shrink-0">
                        <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{ms.month}</span>
                        <span className="block text-[8px] font-semibold mt-0.5" style={{ color: `hsl(var(${ms.color}))` }}>{ms.phase}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ms.tasks.map((t, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] border" style={{ color: `hsl(var(${ms.color}))`, borderColor: `hsl(var(${ms.color}) / 0.15)`, backgroundColor: `hsl(var(${ms.color}) / 0.04)` }}>
                            <CheckCircle2 className="h-2 w-2" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ── Brand KPIs Tab ──────────────── */}
          {activeTab === 'kpis' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {brandKPIs.map((cat) => (
                <SectionBlock key={cat.category} title={cat.category} icon={BarChart3}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[9px]">
                      <thead>
                        <tr className="border-b border-[hsl(var(--panel-border))]">
                          {['Metric', 'Month 3', 'Month 6', 'Month 12', 'Month 24'].map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.metrics.map((m) => (
                          <tr key={m.metric} className="border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors">
                            <td className="px-3 py-1.5 font-medium text-[hsl(var(--panel-text))]">{m.metric}</td>
                            <td className="px-3 py-1.5 font-mono" style={{ color: `hsl(var(${cat.color}))` }}>{m.m3}</td>
                            <td className="px-3 py-1.5 font-mono" style={{ color: `hsl(var(${cat.color}))` }}>{m.m6}</td>
                            <td className="px-3 py-1.5 font-mono font-bold" style={{ color: `hsl(var(${cat.color}))` }}>{m.m12}</td>
                            <td className="px-3 py-1.5 font-mono font-bold" style={{ color: `hsl(var(${cat.color}))` }}>{m.m24}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionBlock>
              ))}

              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.03)] border border-[hsl(var(--panel-accent)/.12)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
                  <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                    Founder brand is a compounding asset — consistency matters more than perfection. Show up daily, share real insights, and let the platform story unfold authentically.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Founder Brand Strategy v1.0 — Building personal authority to accelerate platform trust and growth
      </p>
    </div>
  );
};

export default FounderBrandStrategy;
