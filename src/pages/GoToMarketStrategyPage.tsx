import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, ChevronDown, Search, ArrowRight, Target, Zap,
  CheckCircle2, Clock, Users, TrendingUp, Building2, Globe,
  Megaphone, Mail, Share2, BarChart3, Calendar, MapPin,
  Smartphone, Video, PenTool, Shield, Star, Eye, Layers,
  GitBranch, Play, Flag, Award, Crown, Flame, Hash
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

type PhaseStatus = 'active' | 'upcoming' | 'completed';
type TaskPriority = 'critical' | 'high' | 'medium';
type TaskStatus = 'done' | 'in-progress' | 'planned';

interface Task {
  name: string;
  owner: string;
  priority: TaskPriority;
  status: TaskStatus;
  metric: string;
  implementation: string;
}

interface Milestone {
  title: string;
  target: string;
  icon: typeof Rocket;
}

interface Phase {
  id: string;
  phase: string;
  title: string;
  subtitle: string;
  timeline: string;
  status: PhaseStatus;
  icon: typeof Rocket;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  objective: string;
  tasks: Task[];
  milestones: Milestone[];
  kpis: { label: string; target: string }[];
}

const PRIORITY_MAP: Record<TaskPriority, string> = {
  critical: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  high: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  medium: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
};

const STATUS_MAP: Record<TaskStatus, { cls: string; icon: typeof CheckCircle2 }> = {
  done: { cls: 'text-emerald-400', icon: CheckCircle2 },
  'in-progress': { cls: 'text-amber-400', icon: Play },
  planned: { cls: 'text-muted-foreground', icon: Clock },
};

const PHASES: Phase[] = [
  {
    id: 'phase-1', phase: 'Phase 1', title: 'Pre-Launch Preparation', subtitle: 'Foundation, supply seeding, and demo readiness',
    timeline: 'Weeks 1–4', status: 'active', icon: Shield, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    objective: 'Build a demo-ready platform with enough supply inventory to demonstrate real AI deal discovery value to early investors.',
    tasks: [
      { name: 'Demo-Ready Platform Environment', owner: 'Product / Engineering', priority: 'critical', status: 'in-progress', metric: 'All core flows functional (search → detail → inquiry → watchlist)', implementation: 'Deploy staging environment with seed data. QA property cards, AI opportunity scores, map intelligence. Enable /landing, /properti, and /invest/:city routes with live data.' },
      { name: 'Onboard 50+ Listings in Jakarta, Bali, Surabaya', owner: 'Operations / BD', priority: 'critical', status: 'in-progress', metric: '50 verified listings across 3 cities within 4 weeks', implementation: 'Agent outreach via WhatsApp groups. Bulk import via CSV. Each listing must have ≥5 photos, complete specs, and GPS coordinates for map intelligence layer.' },
      { name: 'Secure 1 Developer Project Partnership', owner: 'Business Development', priority: 'high', status: 'planned', metric: '1 signed LOI with off-plan project (≥20 units)', implementation: 'Target mid-tier developers in BSD/Tangerang corridor. Offer free featured placement for 90 days. Onboard via /developer-dashboard with unit inventory management.' },
      { name: 'Social Media Teaser Content', owner: 'Marketing', priority: 'high', status: 'planned', metric: '12 teaser posts across Instagram/TikTok/LinkedIn over 3 weeks', implementation: 'Content themes: "AI finds deals humans miss", "Your AI investment analyst", "Hot zones detected". Use screen recordings of AI opportunity scores and map heat zones.' },
      { name: 'Waitlist Landing Page Live', owner: 'Product / Marketing', priority: 'critical', status: 'done', metric: 'Landing page at /landing with email capture form', implementation: 'Hero section with value prop + email input → foreign_investment_inquiries table. UTM tracking for source attribution. Target 500 waitlist signups pre-launch.' },
      { name: 'SEO Foundation Setup', owner: 'Engineering / Content', priority: 'medium', status: 'in-progress', metric: 'City landing pages indexed for Jakarta, Bali, Surabaya', implementation: 'Deploy /invest/:citySlug pages with JSON-LD schema, meta tags, and market intelligence blocks from investment_hotspots data.' },
    ],
    milestones: [
      { title: '50 live listings', target: 'Week 3', icon: Building2 },
      { title: '500 waitlist signups', target: 'Week 4', icon: Users },
      { title: '1 developer LOI signed', target: 'Week 4', icon: PenTool },
    ],
    kpis: [
      { label: 'Listings Onboarded', target: '50+' },
      { label: 'Waitlist Signups', target: '500' },
      { label: 'Cities Covered', target: '3' },
      { label: 'Developer Partners', target: '1' },
    ],
  },
  {
    id: 'phase-2', phase: 'Phase 2', title: 'Soft Launch', subtitle: 'Controlled release, early adopter activation, and feedback loops',
    timeline: 'Weeks 5–8', status: 'upcoming', icon: Rocket, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    objective: 'Convert waitlist into active users. Validate AI recommendation accuracy through real investor behavior. Generate first organic referrals.',
    tasks: [
      { name: 'Invite Waitlist via Phased Access', owner: 'Marketing / Product', priority: 'critical', status: 'planned', metric: 'Convert ≥40% of waitlist to registered users', implementation: 'Send invite emails in 3 batches (200/200/100). Each batch gets 48h exclusive access. Track signup → first_search → first_watchlist funnel via ai_behavior_tracking.' },
      { name: 'Targeted Digital Ads — "AI Deal Discovery"', owner: 'Marketing', priority: 'high', status: 'planned', metric: 'CPA < IDR 50,000 per registered investor', implementation: 'Meta Ads + Google Search targeting: "investasi properti AI", "AI real estate Indonesia". Landing → /landing with UTM params. A/B test ad creatives (opportunity score visual vs. ROI number).' },
      { name: 'Publish SEO Pages for Top 10 Cities', owner: 'Content / Engineering', priority: 'high', status: 'planned', metric: '10 city pages indexed + ranking for "[city] investasi properti"', implementation: 'Expand /invest/:citySlug to 10 cities. Each page: H1 with city name, market stats from investment_hotspots, top properties carousel, lead capture form. AI-generated content via ai-engine.' },
      { name: 'Activate Referral Program', owner: 'Product / Growth', priority: 'high', status: 'planned', metric: '100 referral links generated, ≥20 converted referrals', implementation: 'Enable /referral dashboard. Tier 1 reward: IDR 100K credit per qualified signup. Promote via in-app banner + email to active users. Track via acquisition_referrals table.' },
      { name: 'Collect User Feedback Systematically', owner: 'Product', priority: 'medium', status: 'planned', metric: '50 feedback submissions within first 2 weeks', implementation: 'In-app feedback widget on property detail pages. Post-inquiry micro-survey. Weekly user interview slots (3 per week). Feed insights into ai_feedback_signals for model calibration.' },
      { name: 'AI Model Accuracy Baseline', owner: 'Data / AI', priority: 'critical', status: 'planned', metric: 'Establish baseline accuracy metrics for opportunity scores', implementation: 'Track predicted vs actual engagement (ai_model_performance). Compare AI-recommended properties vs user-selected. Target: >60% of top-scored properties get watchlisted.' },
    ],
    milestones: [
      { title: '200 active investors', target: 'Week 6', icon: Users },
      { title: 'First organic referral conversion', target: 'Week 7', icon: Share2 },
      { title: 'AI accuracy baseline established', target: 'Week 8', icon: Target },
    ],
    kpis: [
      { label: 'Active Investors', target: '200+' },
      { label: 'Waitlist Conversion', target: '≥40%' },
      { label: 'CPA (Paid)', target: '<IDR 50K' },
      { label: 'Referral Conversions', target: '20+' },
    ],
  },
  {
    id: 'phase-3', phase: 'Phase 3', title: 'Growth Activation', subtitle: 'Aggressive scaling, content marketing, and community building',
    timeline: 'Weeks 9–16', status: 'upcoming', icon: Flame, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    objective: 'Scale to 1,000+ investors and 200+ listings. Establish ASTRA Villa as the go-to AI property intelligence brand in Indonesia.',
    tasks: [
      { name: 'Elite Deal Alert Campaigns', owner: 'Marketing / AI', priority: 'critical', status: 'planned', metric: 'Alert → inquiry conversion rate >15%', implementation: 'Weekly "AI Hot Deals" email blast to all users. Personalized alerts via smart_alerts system. Push notifications for price drops >10%. Content: "AI detected 3 undervalued properties in your watchlist area."' },
      { name: 'Weekly Online Investor Demo Sessions', owner: 'BD / Product', priority: 'high', status: 'planned', metric: '8 sessions, avg 25 attendees, ≥30% conversion to signup', implementation: 'Zoom/Google Meet webinars every Thursday 7pm WIB. Format: 15min platform demo + 10min AI intelligence walkthrough + 5min Q&A. Registration via /landing with webinar UTM. Record and repurpose as YouTube content.' },
      { name: 'Real Estate Influencer Collaborations', owner: 'Marketing / BD', priority: 'high', status: 'planned', metric: '5 influencer partnerships, combined reach >500K', implementation: 'Target property investment YouTubers and Instagram creators. Offer: free premium access + commission per referral via acquisition_influencers system. Content: "I let AI find my next property investment" format.' },
      { name: 'Market Intelligence Content Publishing', owner: 'Content / AI', priority: 'high', status: 'planned', metric: '2 articles/week, 10K organic monthly visits by Week 16', implementation: 'AI-assisted market reports via acquisition_seo_content. Topics: monthly city price trends, "AI predicts top 5 areas for 2026", investment guides. Distribute via blog, LinkedIn, and email newsletter.' },
      { name: 'Agent Network Expansion', owner: 'Operations / BD', priority: 'critical', status: 'planned', metric: '50 active agents, 200+ total listings', implementation: 'Agent recruitment via agent_acquisition_pipeline. Offer free premium listing placement for first 10 listings. Weekly agent leaderboard rewards via agent_leaderboard_rewards. Target: 30 agents in Jakarta, 10 in Bali, 10 in Surabaya.' },
      { name: 'Developer Project Pipeline Growth', owner: 'Business Development', priority: 'medium', status: 'planned', metric: '3 additional developer partnerships', implementation: 'Leverage Phase 1 LOI as case study. Target developers launching in Q3 2026. Offer demand forecast reports from developer-demand-forecast as sales tool.' },
    ],
    milestones: [
      { title: '1,000 registered investors', target: 'Week 12', icon: Crown },
      { title: '200 active listings', target: 'Week 14', icon: Building2 },
      { title: 'First revenue event', target: 'Week 16', icon: Award },
    ],
    kpis: [
      { label: 'Registered Investors', target: '1,000+' },
      { label: 'Active Listings', target: '200+' },
      { label: 'Weekly Organic Traffic', target: '2,500+' },
      { label: 'Alert → Inquiry Rate', target: '>15%' },
    ],
  },
];

const CHANNELS = [
  { icon: Megaphone, name: 'Paid Ads', phase: 'P2–P3', budget: '40%', desc: 'Meta + Google Search targeting property investors' },
  { icon: Globe, name: 'SEO / Content', phase: 'P1–P3', budget: '20%', desc: 'City landing pages + market intelligence articles' },
  { icon: Share2, name: 'Referral Program', phase: 'P2–P3', budget: '15%', desc: 'User referrals with IDR credit incentives' },
  { icon: Video, name: 'Influencer', phase: 'P3', budget: '15%', desc: 'Property investment creators on YouTube/Instagram' },
  { icon: Mail, name: 'Email / Alerts', phase: 'P2–P3', budget: '5%', desc: 'Waitlist nurture + AI deal alert campaigns' },
  { icon: Smartphone, name: 'Community', phase: 'P3', budget: '5%', desc: 'WhatsApp groups + webinar attendee community' },
];

function TaskRow({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const St = STATUS_MAP[task.status];

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <St.icon className={`h-3 w-3 shrink-0 ${St.cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{task.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${PRIORITY_MAP[task.priority]}`}>{task.priority}</Badge>
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">{task.owner} · {task.metric}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5">
              <Separator className="opacity-10 mb-2" />
              <div className="grid grid-cols-2 gap-2 text-[9px] mb-2">
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Success Metric</span>
                  <span className="block text-foreground font-bold mt-0.5">{task.metric}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Owner</span>
                  <span className="block text-foreground mt-0.5">{task.owner}</span>
                </div>
              </div>
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider">Implementation Detail</span>
                <p className="text-muted-foreground leading-relaxed mt-0.5">{task.implementation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(phase.status === 'active');
  const Icon = phase.icon;
  const doneCount = phase.tasks.filter(t => t.status === 'done').length;
  const progress = (doneCount / phase.tasks.length) * 100;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${phase.borderClass} ${phase.bgClass}/10 shrink-0`}>
          <Icon className={`h-5 w-5 ${phase.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[9px] h-5 border ${phase.borderClass} ${phase.accentClass}`}>{phase.phase}</Badge>
            <h3 className="text-sm font-bold text-foreground">{phase.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{phase.timeline}</Badge>
            {phase.status === 'active' && <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-400/30 animate-pulse">Active</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{phase.subtitle}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progress} className="h-1 flex-1 max-w-[120px]" />
            <span className="text-[9px] text-muted-foreground">{doneCount}/{phase.tasks.length} tasks</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              <Separator className="opacity-15" />

              <div className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Phase Objective</span>
                <p className="text-[10px] text-foreground mt-0.5 leading-relaxed">{phase.objective}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {phase.kpis.map(k => (
                  <div key={k.label} className="rounded-lg border border-border/10 bg-muted/5 p-2 text-center">
                    <span className="text-lg font-bold text-foreground">{k.target}</span>
                    <span className="block text-[8px] text-muted-foreground uppercase mt-0.5">{k.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-[10px] font-bold text-foreground mb-1.5 block">Execution Tasks</span>
                <div className="space-y-1.5">
                  {phase.tasks.map(t => <TaskRow key={t.name} task={t} />)}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-foreground mb-1.5 block">Milestones</span>
                <div className="flex flex-wrap gap-2">
                  {phase.milestones.map(m => (
                    <div key={m.title} className="flex items-center gap-1.5 rounded-lg border border-border/15 bg-muted/5 px-2.5 py-1.5">
                      <m.icon className={`h-3 w-3 ${phase.accentClass}`} />
                      <span className="text-[10px] text-foreground font-medium">{m.title}</span>
                      <Badge variant="outline" className="text-[8px] h-4">{m.target}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GoToMarketStrategyPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const allTasks = PHASES.flatMap(p => p.tasks);
  const stats = {
    phases: PHASES.length,
    tasks: allTasks.length,
    done: allTasks.filter(t => t.status === 'done').length,
    critical: allTasks.filter(t => t.priority === 'critical').length,
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return PHASES;
    const q = searchQuery.toLowerCase();
    return PHASES.map(p => ({
      ...p,
      tasks: p.tasks.filter(t =>
        t.name.toLowerCase().includes(q) || t.implementation.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) || t.metric.toLowerCase().includes(q)
      ),
    })).filter(p => p.tasks.length > 0 || p.title.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Go-to-Market Launch Strategy</h1>
              <p className="text-xs text-muted-foreground">16-week phased execution plan — supply onboarding, demand generation, and brand positioning</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Phases', value: stats.phases, icon: Layers },
              { label: 'Total Tasks', value: stats.tasks, icon: Target },
              { label: 'Completed', value: stats.done, icon: CheckCircle2 },
              { label: 'Critical Path', value: stats.critical, icon: Flame },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Timeline flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">16-Week Execution Timeline</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {PHASES.map((p, i) => (
                <div key={p.id} className="flex items-center gap-1">
                  <div className={`px-3 py-2 rounded-lg border ${p.borderClass} ${p.bgClass}/5 text-center min-w-[100px]`}>
                    <span className={`font-bold block ${p.accentClass}`}>{p.phase}</span>
                    <span className="text-foreground block text-[10px]">{p.title}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{p.timeline}</span>
                  </div>
                  {i < PHASES.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Channel mix */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Growth Channel Mix</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {CHANNELS.map(c => (
                <div key={c.name} className="rounded-lg border border-border/10 bg-muted/5 p-2.5 flex items-start gap-2">
                  <c.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-foreground">{c.name}</span>
                      <Badge variant="outline" className="text-[8px] h-4">{c.budget}</Badge>
                      <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground">{c.phase}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* North star targets */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">North Star Targets (Week 16)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Registered Investors', value: '1,000+' },
                { label: 'Active Listings', value: '200+' },
                { label: 'Developer Partners', value: '4+' },
                { label: 'Monthly Organic Traffic', value: '10K+' },
                { label: 'First Revenue', value: '✓' },
              ].map(n => (
                <div key={n.label} className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-2.5 text-center">
                  <span className="text-lg font-bold text-foreground">{n.value}</span>
                  <span className="block text-[8px] text-muted-foreground uppercase mt-0.5">{n.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search tasks, owners, metrics..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(p => <PhaseCard key={p.id} phase={p} />)}
      </div>
    </div>
  );
}
