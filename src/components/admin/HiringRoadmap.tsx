import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Users, Code2, Brain, Palette, Smartphone, Building2, Handshake,
  Megaphone, HeadphonesIcon, Scale, BarChart3, Calendar, ChevronDown,
  ChevronUp, Zap, Target, Clock, DollarSign, Star, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — First 10 Key Hires Roadmap
   ═══════════════════════════════════════════════════════════ */

type Phase = 'foundation' | 'acceleration' | 'scale';

interface HireRole {
  id: number;
  title: string;
  icon: LucideIcon;
  phase: Phase;
  month: string;
  priority: 'critical' | 'high' | 'medium';
  team: 'Engineering' | 'Product' | 'Growth' | 'Operations' | 'Business';
  responsibilities: string[];
  keySkills: string[];
  impact: string;
  salaryRange: string;
  equityRange: string;
}

const PHASES: Record<Phase, { label: string; months: string; color: string; description: string }> = {
  foundation: { label: 'Foundation', months: 'M1–M3', color: '--panel-accent', description: 'Core product team — ship & iterate fast' },
  acceleration: { label: 'Acceleration', months: 'M4–M6', color: '--panel-info', description: 'Growth engine — acquire users & supply' },
  scale: { label: 'Scale', months: 'M7–M12', color: '--panel-success', description: 'Operational maturity — process & compliance' },
};

const roles: HireRole[] = [
  {
    id: 1, title: 'Senior Full-Stack Engineer', icon: Code2, phase: 'foundation', month: 'M1',
    priority: 'critical', team: 'Engineering',
    responsibilities: ['Own platform architecture decisions and tech debt management', 'Accelerate feature delivery across frontend and edge functions', 'Establish CI/CD pipelines, testing standards, and code review culture', 'Mentor future engineering hires'],
    keySkills: ['React/TypeScript expert', 'Supabase/PostgreSQL', 'Edge functions (Deno)', 'System design at scale'],
    impact: 'Doubles feature velocity and ensures architecture supports 100K+ users',
    salaryRange: 'IDR 25–40M/mo', equityRange: '1.5–3.0%',
  },
  {
    id: 2, title: 'AI / Data Engineer', icon: Brain, phase: 'foundation', month: 'M1–M2',
    priority: 'critical', team: 'Engineering',
    responsibilities: ['Improve opportunity scoring model accuracy from 87% to 93%+', 'Build and maintain predictive analytics pipelines', 'Develop learning engine feedback loops and automated retraining', 'Create data quality monitoring and anomaly detection'],
    keySkills: ['Python/ML pipelines', 'PostgreSQL analytics', 'Model optimization', 'Real estate domain knowledge (bonus)'],
    impact: 'AI accuracy directly drives investor trust and platform defensibility',
    salaryRange: 'IDR 28–45M/mo', equityRange: '1.5–3.0%',
  },
  {
    id: 3, title: 'UI/UX Product Designer', icon: Palette, phase: 'foundation', month: 'M2',
    priority: 'high', team: 'Product',
    responsibilities: ['Own design system consistency across 120+ pages', 'User research and usability testing with Indonesian investors', 'Design mobile-first responsive experiences', 'Create investor dashboard visualizations and data storytelling'],
    keySkills: ['Figma expert', 'Design systems', 'Data visualization', 'User research methods'],
    impact: 'Premium UX differentiates from basic portal competitors and drives retention',
    salaryRange: 'IDR 18–30M/mo', equityRange: '0.5–1.5%',
  },
  {
    id: 4, title: 'Property Marketplace Ops Manager', icon: Building2, phase: 'acceleration', month: 'M3–M4',
    priority: 'critical', team: 'Operations',
    responsibilities: ['Onboard property listings and verify data quality', 'Build and manage agent relationship network', 'Drive supply-side growth in target cities (Jakarta, Bali, Surabaya)', 'Develop SOPs for listing management and quality assurance'],
    keySkills: ['Real estate industry network', 'Operations management', 'Indonesian market expertise', 'Bilingual ID/EN'],
    impact: 'Marketplace liquidity is the #1 growth bottleneck — supply drives demand',
    salaryRange: 'IDR 20–35M/mo', equityRange: '0.5–1.5%',
  },
  {
    id: 5, title: 'Digital Growth Marketer', icon: Megaphone, phase: 'acceleration', month: 'M4',
    priority: 'high', team: 'Growth',
    responsibilities: ['Execute investor acquisition campaigns across digital channels', 'Manage social media content strategy and founder brand amplification', 'Drive SEO and content marketing for organic traffic growth', 'Build and optimize referral and affiliate programs'],
    keySkills: ['Performance marketing', 'SEO/content strategy', 'Social media (IG, TikTok, LinkedIn)', 'Analytics (GA4, attribution)'],
    impact: 'Converts platform value into measurable user growth and investor pipeline',
    salaryRange: 'IDR 15–28M/mo', equityRange: '0.3–1.0%',
  },
  {
    id: 6, title: 'Developer Partnership Manager', icon: Handshake, phase: 'acceleration', month: 'M4–M5',
    priority: 'high', team: 'Business',
    responsibilities: ['Secure property developer launch collaborations', 'Manage JV pipeline from outreach to contract signing', 'Coordinate developer promotion packages and content', 'Build long-term strategic partnership relationships'],
    keySkills: ['B2B sales & partnerships', 'Real estate developer network', 'Contract negotiation', 'Revenue-driven mindset'],
    impact: 'Developer partnerships create exclusive supply and IDR 15M+/mo recurring revenue per partner',
    salaryRange: 'IDR 18–32M/mo', equityRange: '0.3–1.0%',
  },
  {
    id: 7, title: 'Mobile App Developer', icon: Smartphone, phase: 'acceleration', month: 'M5–M6',
    priority: 'medium', team: 'Engineering',
    responsibilities: ['Build React Native investor mobile experience', 'Implement push notification intelligence system', 'Optimize mobile search, scoring, and portfolio tracking', 'Ensure parity with key web features on mobile'],
    keySkills: ['React Native', 'TypeScript', 'Push notification systems', 'Mobile UX patterns'],
    impact: 'Mobile app captures 70%+ of user engagement in SEA markets',
    salaryRange: 'IDR 22–38M/mo', equityRange: '0.5–1.5%',
  },
  {
    id: 8, title: 'Customer Success & Support Lead', icon: HeadphonesIcon, phase: 'scale', month: 'M6–M7',
    priority: 'high', team: 'Operations',
    responsibilities: ['Handle user inquiries and onboarding assistance', 'Build knowledge base and self-service support resources', 'Monitor NPS and implement retention improvement programs', 'Create trust-building interactions with premium subscribers'],
    keySkills: ['Customer success experience', 'Indonesian language native', 'CRM tools (Zendesk/Intercom)', 'Empathetic communication'],
    impact: 'Retention and NPS directly drive word-of-mouth and subscription renewals',
    salaryRange: 'IDR 12–22M/mo', equityRange: '0.2–0.5%',
  },
  {
    id: 9, title: 'Legal & Compliance Coordinator', icon: Scale, phase: 'scale', month: 'M8–M9',
    priority: 'medium', team: 'Business',
    responsibilities: ['Support property documentation workflows (SHM/AJB)', 'Draft and review partnership agreements and vendor contracts', 'Ensure compliance with Indonesian proptech regulations', 'Manage data privacy and user protection policies'],
    keySkills: ['Indonesian property law', 'Corporate legal', 'Regulatory compliance', 'Contract drafting'],
    impact: 'Legal clarity enables faster partnerships and protects against regulatory risk',
    salaryRange: 'IDR 15–28M/mo', equityRange: '0.2–0.5%',
  },
  {
    id: 10, title: 'Finance & Revenue Analyst', icon: BarChart3, phase: 'scale', month: 'M9–M10',
    priority: 'medium', team: 'Business',
    responsibilities: ['Track commission performance and subscription metrics', 'Build financial models and investor reporting dashboards', 'Manage cash flow forecasting and budget allocation', 'Support fundraising data room preparation'],
    keySkills: ['Financial modeling', 'SaaS metrics', 'Excel/Sheets mastery', 'Investor reporting'],
    impact: 'Financial discipline and reporting quality directly impact fundraising success',
    salaryRange: 'IDR 15–25M/mo', equityRange: '0.2–0.5%',
  },
];

const priorityConfig = {
  critical: { label: 'Critical', color: '--panel-error' },
  high: { label: 'High', color: '--panel-warning' },
  medium: { label: 'Medium', color: '--panel-info' },
};

const teamColors: Record<string, string> = {
  Engineering: '--panel-accent',
  Product: '--panel-info',
  Growth: '--panel-warning',
  Operations: '--panel-success',
  Business: '--panel-text-secondary',
};

const HiringRoadmap: React.FC = () => {
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'all'>('all');

  const filtered = filterPhase === 'all' ? roles : roles.filter(r => r.phase === filterPhase);
  const totalCostLow = roles.reduce((s, r) => s + parseInt(r.salaryRange.replace(/[^0-9]/g, '').slice(0, 2)), 0);
  const totalEquityHigh = roles.reduce((s, r) => s + parseFloat(r.equityRange.split('–')[1]), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Users className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">First 10 Hires — Team Building Roadmap</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Phased hiring plan to scale ASTRA Villa from founder-led startup to growth-phase proptech company</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Total Roles', value: '10', color: '--panel-accent' },
            { label: 'Critical Hires', value: String(roles.filter(r => r.priority === 'critical').length), color: '--panel-error' },
            { label: 'Timeline', value: '10 months', color: '--panel-info' },
            { label: 'Max Equity Pool', value: `${totalEquityHigh.toFixed(1)}%`, color: '--panel-success' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase timeline */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(PHASES) as [Phase, typeof PHASES['foundation']][]).map(([key, phase]) => {
          const count = roles.filter(r => r.phase === key).length;
          return (
            <button key={key} onClick={() => setFilterPhase(filterPhase === key ? 'all' : key)}
              className={cn(
                "rounded-lg border p-3 transition-all text-left",
                filterPhase === key
                  ? `bg-[hsl(var(${phase.color})/.08)] border-[hsl(var(${phase.color})/.25)]`
                  : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
              )} style={{ boxShadow: 'var(--panel-shadow)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${phase.color}))` }}>{phase.label}</span>
                <span className="text-[9px] font-mono text-[hsl(var(--panel-text-muted))]">{phase.months}</span>
              </div>
              <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mb-1.5">{phase.description}</p>
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${phase.color}))` }}>{count} hires</span>
            </button>
          );
        })}
      </div>

      {/* Roles list */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center justify-between px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">
            {filterPhase === 'all' ? 'All Roles' : `${PHASES[filterPhase].label} Phase`} — {filtered.length} positions
          </span>
          {filterPhase !== 'all' && (
            <button onClick={() => setFilterPhase('all')} className="text-[9px] text-[hsl(var(--panel-accent))] hover:underline">Show all</button>
          )}
        </div>

        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {filtered.map((role) => {
            const isOpen = expandedRole === role.id;
            const pri = priorityConfig[role.priority];
            const phaseColor = PHASES[role.phase].color;
            const tColor = teamColors[role.team] || '--panel-text-muted';
            return (
              <div key={role.id}>
                <button onClick={() => setExpandedRole(isOpen ? null : role.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.2)] transition-colors text-left">
                  <span className="text-[11px] font-bold font-mono w-5 shrink-0" style={{ color: `hsl(var(${phaseColor}))` }}>#{role.id}</span>
                  <div className="flex items-center justify-center w-7 h-7 rounded-md shrink-0" style={{
                    backgroundColor: `hsl(var(${tColor}) / 0.08)`,
                    border: `1px solid hsl(var(${tColor}) / 0.18)`,
                  }}>
                    <role.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${tColor}))` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block truncate">{role.title}</span>
                    <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">{role.team} · {role.month}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{
                      color: `hsl(var(${pri.color}))`,
                      backgroundColor: `hsl(var(${pri.color}) / 0.08)`,
                      border: `1px solid hsl(var(${pri.color}) / 0.2)`,
                    }}>{pri.label}</span>
                    {isOpen ? <ChevronUp className="h-3 w-3 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3 w-3 text-[hsl(var(--panel-text-muted))]" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Impact banner */}
                    <div className="flex items-start gap-2 px-3 py-2 rounded-md mb-3" style={{
                      backgroundColor: `hsl(var(${phaseColor}) / 0.05)`,
                      border: `1px solid hsl(var(${phaseColor}) / 0.15)`,
                    }}>
                      <Zap className="h-3 w-3 shrink-0 mt-0.5" style={{ color: `hsl(var(${phaseColor}))` }} />
                      <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed"><strong className="text-[hsl(var(--panel-text))]">Impact:</strong> {role.impact}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Responsibilities */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Target className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-accent))]">Responsibilities</span>
                        </div>
                        <div className="space-y-1">
                          {role.responsibilities.map((r, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full shrink-0 mt-1" style={{ backgroundColor: `hsl(var(${phaseColor}))` }} />
                              <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Skills */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Star className="h-3 w-3 text-[hsl(var(--panel-info))]" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-info))]">Key Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {role.keySkills.map((s, i) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-md bg-[hsl(var(--panel-hover))] text-[hsl(var(--panel-text-secondary))] border border-[hsl(var(--panel-border-subtle))]">{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Compensation */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <DollarSign className="h-3 w-3 text-[hsl(var(--panel-success))]" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-success))]">Compensation</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Salary</span>
                            <span className="text-[9px] font-bold font-mono text-[hsl(var(--panel-text))]">{role.salaryRange}</span>
                          </div>
                          <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Equity (ESOP)</span>
                            <span className="text-[9px] font-bold font-mono text-[hsl(var(--panel-text))]">{role.equityRange}</span>
                          </div>
                          <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Vesting</span>
                            <span className="text-[9px] font-bold font-mono text-[hsl(var(--panel-text))]">4yr / 1yr cliff</span>
                          </div>
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

      {/* Team composition summary */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <Calendar className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Team Composition at M12</span>
        </div>
        <div className="grid grid-cols-5 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {Object.entries(
            roles.reduce<Record<string, number>>((acc, r) => { acc[r.team] = (acc[r.team] || 0) + 1; return acc; }, {})
          ).map(([team, count]) => (
            <div key={team} className="bg-[hsl(var(--panel-bg))] p-3 text-center">
              <span className="text-[14px] font-bold font-mono block" style={{ color: `hsl(var(${teamColors[team] || '--panel-text'}))` }}>{count}</span>
              <span className="text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{team}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Hiring Roadmap v1.0 — Founder + 10 hires within 12 months, funded by seed capital
      </p>
    </div>
  );
};

export default HiringRoadmap;
