
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown, Users, TrendingUp, Cpu, Handshake,
  ChevronDown, ChevronRight, Star, Target, Clock,
  Building, Globe, Brain, BarChart3, UserCheck
} from 'lucide-react';

interface OrgRole {
  title: string;
  level: string;
  status: 'founder' | 'hire-now' | 'hire-q2' | 'hire-q3' | 'future';
  reports_to: string;
  responsibilities: string[];
  kpis: string[];
  salary_range?: string;
}

const orgStructure: Record<string, { icon: typeof Crown; color: string; description: string; roles: OrgRole[] }> = {
  executive: {
    icon: Crown,
    color: 'text-amber-500',
    description: 'Strategic vision, product direction, fundraising, and growth oversight',
    roles: [
      {
        title: 'Founder & CEO',
        level: 'C-Suite',
        status: 'founder',
        reports_to: 'Board / Investors',
        responsibilities: [
          'Company vision, product strategy, and market positioning',
          'Fundraising, investor relations, and financial oversight',
          'Hiring decisions and culture architecture',
          'Key partnership approvals and market expansion strategy',
          'AI product roadmap and competitive differentiation'
        ],
        kpis: [
          'GMV growth trajectory',
          'Runway and burn rate management',
          'Team velocity and execution speed',
          'Market share in target cities'
        ]
      }
    ]
  },
  marketplace: {
    icon: Building,
    color: 'text-blue-500',
    description: 'Listing supply growth, agent network, and marketplace health',
    roles: [
      {
        title: 'Property Supply Manager',
        level: 'Manager',
        status: 'hire-now',
        reports_to: 'Founder & CEO',
        salary_range: 'Rp 12-22M/month',
        responsibilities: [
          'Agent acquisition pipeline — outreach, onboarding, activation',
          'Developer project listing sourcing and relationship management',
          'Listing quality enforcement and compliance monitoring',
          'City-by-city supply expansion coordination',
          'Marketplace liquidity health tracking'
        ],
        kpis: [
          '50-75 new listings/week',
          '20-30 new agents/month',
          '85% listing quality compliance',
          'Agent activation rate > 70%'
        ]
      },
      {
        title: 'Customer Success / Agent Support Specialist',
        level: 'Specialist',
        status: 'hire-now',
        reports_to: 'Property Supply Manager',
        salary_range: 'Rp 8-15M/month',
        responsibilities: [
          'Guide agents through listing upload and profile setup',
          'Respond to support tickets within SLA targets',
          'Proactive re-engagement of inactive agents (7-45 day ladder)',
          'Marketplace usage education and onboarding walkthroughs',
          'Listing activity health monitoring and reporting'
        ],
        kpis: [
          'Agent activation rate > 85%',
          'First response time < 30 min',
          'Agent retention rate > 88%',
          'Support satisfaction score > 4.5/5'
        ]
      },
      {
        title: 'Listing Quality Analyst',
        level: 'Analyst',
        status: 'hire-q3',
        reports_to: 'Property Supply Manager',
        salary_range: 'Rp 7-12M/month',
        responsibilities: [
          'Photo quality and description standards auditing',
          'AI-generated content review and approval workflows',
          'Duplicate listing detection and resolution',
          'Pricing accuracy verification against market data'
        ],
        kpis: [
          '< 5% rejected listing rate',
          '100% audit coverage on new listings',
          'Average listing quality score > 80/100'
        ]
      }
    ]
  },
  growth: {
    icon: TrendingUp,
    color: 'text-green-500',
    description: 'SEO scaling, social traffic, performance marketing, and user acquisition',
    roles: [
      {
        title: 'Digital Growth Specialist',
        level: 'Specialist',
        status: 'hire-now',
        reports_to: 'Founder & CEO',
        salary_range: 'Rp 10-20M/month',
        responsibilities: [
          'SEO programmatic page rollout (province → kelurahan)',
          'Short-form video production (13+ videos/week across TikTok, IG, YouTube)',
          'Performance marketing experiments and CAC validation',
          'Traffic analytics and conversion funnel optimization',
          'Multi-segment lead tracking (buyers, sellers, agents, investors)'
        ],
        kpis: [
          '50K → 500K monthly organic visits (Month 3 → 12)',
          '2,000 → 10,000+ indexed SEO pages',
          '3M → 30M monthly video views',
          '500 → 8,000 monthly inbound leads'
        ]
      },
      {
        title: 'Content & Social Media Coordinator',
        level: 'Coordinator',
        status: 'hire-q2',
        reports_to: 'Digital Growth Specialist',
        salary_range: 'Rp 6-10M/month',
        responsibilities: [
          'Property video editing and publishing pipeline',
          'Social community management and engagement',
          'Content calendar execution across all channels',
          'UGC agent content coordination'
        ],
        kpis: [
          'Publishing cadence adherence > 95%',
          'Engagement rate > 3% across platforms',
          'Community response time < 2 hours'
        ]
      },
      {
        title: 'Performance Marketing Analyst',
        level: 'Analyst',
        status: 'hire-q3',
        reports_to: 'Digital Growth Specialist',
        salary_range: 'Rp 8-14M/month',
        responsibilities: [
          'Paid search and social ad campaign management',
          'A/B testing landing pages and ad creatives',
          'CAC optimization and ROAS tracking',
          'Retargeting audience segmentation'
        ],
        kpis: [
          'CAC < Rp 50K per qualified lead',
          'ROAS > 3x on paid channels',
          'Conversion rate improvement > 20% QoQ'
        ]
      }
    ]
  },
  product: {
    icon: Cpu,
    color: 'text-purple-500',
    description: 'AI feature development, UX improvements, and platform engineering',
    roles: [
      {
        title: 'Full-Stack Engineer',
        level: 'Senior',
        status: 'hire-now',
        reports_to: 'Founder & CEO',
        salary_range: 'Rp 20-35M/month',
        responsibilities: [
          'Core platform development (React, Supabase, Edge Functions)',
          'AI feature integration — recommendation engine, valuation models',
          'Search, map, and property discovery UX optimization',
          'Performance engineering and infrastructure scaling',
          'CI/CD, monitoring, and deployment automation'
        ],
        kpis: [
          'Feature velocity: 2-3 major features/sprint',
          'Platform uptime > 99.5%',
          'Page load time < 2s (P95)',
          'Zero critical bugs in production'
        ]
      },
      {
        title: 'AI/ML Engineer',
        level: 'Mid-Senior',
        status: 'hire-q3',
        reports_to: 'Full-Stack Engineer (Tech Lead)',
        salary_range: 'Rp 25-40M/month',
        responsibilities: [
          'Property valuation model training and accuracy improvement',
          'Recommendation engine personalization',
          'NLP search and AI chatbot enhancement',
          'Market prediction and investment scoring models'
        ],
        kpis: [
          'Valuation accuracy within 10% of market',
          'Recommendation CTR > 8%',
          'AI chat resolution rate > 70%'
        ]
      },
      {
        title: 'Product Designer (UI/UX)',
        level: 'Mid',
        status: 'future',
        reports_to: 'Founder & CEO',
        salary_range: 'Rp 15-25M/month',
        responsibilities: [
          'User research and journey mapping',
          'Design system maintenance and component library',
          'Conversion-focused page design',
          'Mobile-first responsive design'
        ],
        kpis: [
          'Task completion rate > 90%',
          'Design-to-dev handoff < 48h',
          'User satisfaction score > 4.3/5'
        ]
      }
    ]
  },
  partnerships: {
    icon: Handshake,
    color: 'text-orange-500',
    description: 'Developer partnerships, agency alliances, bank integrations, and ecosystem growth',
    roles: [
      {
        title: 'Partnership & Expansion Manager',
        level: 'Manager',
        status: 'hire-q2',
        reports_to: 'Founder & CEO',
        salary_range: 'Rp 15-28M/month',
        responsibilities: [
          'Developer partnership sourcing — new project exclusives',
          'Agency alliance program management',
          'Bank mortgage partnership integration and lead handoff',
          'University and corporate housing partnership development',
          'Revenue share and commission structure negotiation'
        ],
        kpis: [
          '5+ developer partnerships/quarter',
          '3+ bank integrations in Year 1',
          'Partnership-sourced revenue > 20% of total',
          'Deal pipeline value > Rp 50B/quarter'
        ]
      },
      {
        title: 'City Expansion Lead',
        level: 'Lead',
        status: 'hire-q3',
        reports_to: 'Partnership & Expansion Manager',
        salary_range: 'Rp 12-20M/month',
        responsibilities: [
          'New city market research and entry strategy',
          'Local agent network development',
          'Regional developer relationship building',
          'City-level KPI tracking and reporting'
        ],
        kpis: [
          '2 new cities activated/quarter',
          '100+ listings per new city within 60 days',
          'Local agent network > 20 per city'
        ]
      }
    ]
  }
};

const statusConfig: Record<string, { label: string; color: string }> = {
  founder: { label: 'Founder', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'hire-now': { label: 'Hire Now', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'hire-q2': { label: 'Q2 2026', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'hire-q3': { label: 'Q3 2026', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  future: { label: 'Future', color: 'bg-muted text-muted-foreground border-border' }
};

const RoleCard = ({ role }: { role: OrgRole }) => {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[role.status];

  return (
    <div
      className="border border-border/50 rounded-xl bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground text-sm">{role.title}</h4>
              {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{role.level}</Badge>
              <Badge className={`text-[10px] px-1.5 py-0 border ${status.color}`}>{status.label}</Badge>
              {role.salary_range && (
                <span className="text-[10px] text-muted-foreground">{role.salary_range}</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">Reports to: {role.reports_to}</p>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
          <div>
            <p className="text-[11px] font-medium text-foreground mb-1.5 flex items-center gap-1">
              <Target className="h-3 w-3" /> Responsibilities
            </p>
            <ul className="space-y-1">
              {role.responsibilities.map((r, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>{r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium text-foreground mb-1.5 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> KPIs
            </p>
            <ul className="space-y-1">
              {role.kpis.map((k, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <Star className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />{k}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const OrgChartDashboard = () => {
  const totalRoles = Object.values(orgStructure).reduce((sum, dept) => sum + dept.roles.length, 0);
  const hireNow = Object.values(orgStructure).reduce((sum, dept) => sum + dept.roles.filter(r => r.status === 'hire-now').length, 0);
  const q2Hires = Object.values(orgStructure).reduce((sum, dept) => sum + dept.roles.filter(r => r.status === 'hire-q2').length, 0);
  const q3Hires = Object.values(orgStructure).reduce((sum, dept) => sum + dept.roles.filter(r => r.status === 'hire-q3').length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organizational Structure</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lean startup org chart — {totalRoles} roles across 5 departments, phased hiring roadmap
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Roles', value: totalRoles, icon: Users },
          { label: 'Hire Now', value: hireNow, icon: UserCheck },
          { label: 'Q2 Hires', value: q2Hires, icon: Clock },
          { label: 'Q3 Hires', value: q3Hires, icon: Clock },
          { label: 'Departments', value: 5, icon: Building }
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hiring Timeline */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Hiring Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { phase: 'Phase 1 — Immediate (Now)', count: hireNow, pct: 100, desc: 'Supply Manager, Agent Support, Growth Specialist, Full-Stack Engineer' },
            { phase: 'Phase 2 — Q2 2026', count: q2Hires, pct: 66, desc: 'Content Coordinator, Partnership Manager' },
            { phase: 'Phase 3 — Q3 2026', count: q3Hires, pct: 33, desc: 'Listing Analyst, Performance Marketer, AI/ML Engineer, City Lead' },
          ].map((p) => (
            <div key={p.phase}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{p.phase}</span>
                <Badge variant="outline" className="text-[10px]">{p.count} roles</Badge>
              </div>
              <Progress value={p.pct} className="h-1.5 mb-1" />
              <p className="text-[10px] text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Org Chart by Department */}
      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {Object.entries(orgStructure).map(([key, dept]) => (
            <TabsTrigger key={key} value={key} className="text-xs gap-1.5 data-[state=active]:bg-background">
              <dept.icon className={`h-3.5 w-3.5 ${dept.color}`} />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(orgStructure).map(([key, dept]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <dept.icon className={`h-5 w-5 ${dept.color}`} />
              <div>
                <h3 className="text-sm font-semibold text-foreground capitalize">{key} Team</h3>
                <p className="text-[11px] text-muted-foreground">{dept.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dept.roles.map((role) => (
                <RoleCard key={role.title} role={role} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Reporting Structure Visual */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Reporting Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* CEO */}
            <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center mb-2">
              <p className="text-xs font-bold text-foreground">Founder & CEO</p>
              <p className="text-[10px] text-muted-foreground">Strategy · Product · Growth</p>
            </div>
            <div className="w-px h-4 bg-border" />
            {/* Direct Reports */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              {[
                { title: 'Property Supply Manager', team: 'Marketplace Ops', color: 'border-blue-500/30 bg-blue-500/5', subs: ['Agent Support Specialist', 'Listing Quality Analyst'] },
                { title: 'Digital Growth Specialist', team: 'Growth & Marketing', color: 'border-green-500/30 bg-green-500/5', subs: ['Content Coordinator', 'Performance Analyst'] },
                { title: 'Full-Stack Engineer', team: 'Product & Intelligence', color: 'border-purple-500/30 bg-purple-500/5', subs: ['AI/ML Engineer'] },
                { title: 'Partnership Manager', team: 'Partnerships', color: 'border-orange-500/30 bg-orange-500/5', subs: ['City Expansion Lead'] },
              ].map((report) => (
                <div key={report.title} className={`rounded-lg border ${report.color} p-3`}>
                  <p className="text-[11px] font-semibold text-foreground">{report.title}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{report.team}</p>
                  {report.subs.map((sub) => (
                    <div key={sub} className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground">{sub}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Domains */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Founder Decision Domains vs. Delegated Ownership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-amber-500" /> Founder Retains
              </p>
              <ul className="space-y-1.5">
                {[
                  'Product roadmap and feature prioritization',
                  'Fundraising and investor communications',
                  'Key hire final decisions (offer approval)',
                  'Major partnership approvals (> Rp 500M)',
                  'Market expansion sequencing',
                  'Brand positioning and messaging strategy'
                ].map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-amber-500">▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" /> Delegated to Team
              </p>
              <ul className="space-y-1.5">
                {[
                  'Daily agent onboarding and support workflows',
                  'Content publishing cadence and social execution',
                  'Listing quality audits and compliance enforcement',
                  'Performance marketing budget < Rp 50M/month',
                  'Bug fixes and non-critical feature iterations',
                  'Operational partnership coordination'
                ].map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary">▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgChartDashboard;
