import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, ChevronDown, CheckCircle2, Circle, Clock,
  Users, Building2, TrendingUp, Target, Phone, Mail,
  MessageSquare, Share2, Zap, ArrowRight, BarChart3,
  Flame, Star, Briefcase, Handshake, PenTool, Eye,
  Megaphone, Video, FileText, RefreshCw, Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

type TrackCategory = 'supply' | 'demand' | 'pipeline';
type TimeBlock = 'morning' | 'midday' | 'afternoon' | 'evening';

interface DailyTask {
  id: string;
  task: string;
  target: string;
  channel: string;
  channelIcon: typeof Phone;
  timeBlock: TimeBlock;
  category: TrackCategory;
  weeklyTotal: number;
  crmField: string;
  scriptRef?: string;
  tip: string;
}

interface WeeklyMilestone {
  label: string;
  target: string;
  icon: typeof Target;
}

const TIME_LABELS: Record<TimeBlock, { label: string; time: string; cls: string }> = {
  morning: { label: 'Morning Block', time: '09:00–11:00', cls: 'text-amber-400 border-amber-400/30 bg-amber-400' },
  midday: { label: 'Midday Block', time: '11:00–13:00', cls: 'text-sky-400 border-sky-400/30 bg-sky-400' },
  afternoon: { label: 'Afternoon Block', time: '14:00–16:00', cls: 'text-violet-400 border-violet-400/30 bg-violet-400' },
  evening: { label: 'Evening Block', time: '19:00–21:00', cls: 'text-rose-400 border-rose-400/30 bg-rose-400' },
};

const CAT_MAP: Record<TrackCategory, { label: string; cls: string; icon: typeof Building2 }> = {
  supply: { label: 'Supply', cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400', icon: Building2 },
  demand: { label: 'Demand', cls: 'text-sky-400 border-sky-400/30 bg-sky-400', icon: Users },
  pipeline: { label: 'Pipeline', cls: 'text-amber-400 border-amber-400/30 bg-amber-400', icon: Handshake },
};

const TASKS: DailyTask[] = [
  // Morning — Supply focus
  {
    id: 't1', task: 'Contact 5 Property Agents', target: '5 agents / day', channel: 'WhatsApp + Call',
    channelIcon: Phone, timeBlock: 'morning', category: 'supply', weeklyTotal: 25,
    crmField: 'agent_acquisition_pipeline → stage: contacted',
    tip: 'Open with: "Saya lihat listing Bapak/Ibu di [portal]. Kami punya investor aktif yang mencari tipe properti itu." Use agent script from /sales-scripts.',
  },
  {
    id: 't2', task: 'Add 3 New Listings to Platform', target: '3 listings / day', channel: 'Dashboard Upload',
    channelIcon: PenTool, timeBlock: 'morning', category: 'supply', weeklyTotal: 15,
    crmField: 'properties → status: active',
    tip: 'Each listing needs ≥5 photos, complete specs, GPS coordinates. Use /my-properties upload flow. Prioritize listings in high-demand zones from /investment-map-explorer.',
  },
  {
    id: 't3', task: 'Scout New Listings from Competitor Portals', target: '15 min research', channel: 'Web Research',
    channelIcon: Eye, timeBlock: 'morning', category: 'supply', weeklyTotal: 5,
    crmField: 'Internal spreadsheet → sourcing tracker',
    tip: 'Check Rumah123, OLX Property, 99.co for new listings in Jakarta, Bali, Surabaya. Note agent contacts for outreach. Cross-reference with platform gaps.',
  },

  // Midday — Demand generation
  {
    id: 't4', task: 'Message 10 Potential Investors on Social', target: '10 DMs / day', channel: 'Instagram + LinkedIn',
    channelIcon: MessageSquare, timeBlock: 'midday', category: 'demand', weeklyTotal: 50,
    crmField: 'acquisition_referrals → source_channel: social_dm',
    tip: 'Target: users who engage with property investment content. Open with insight, not pitch: "Saya notice area [X] naik 18% tahun ini — kami punya AI yang track ini real-time."',
  },
  {
    id: 't5', task: 'Share 1 Elite Deal Insight Post', target: '1 post / day', channel: 'Instagram + LinkedIn + TikTok',
    channelIcon: Share2, timeBlock: 'midday', category: 'demand', weeklyTotal: 5,
    crmField: 'acquisition_seo_content → content_type: social_post',
    tip: 'Formats that work: "AI menemukan properti undervalued 15% di BSD" + screenshot of opportunity score. Use Canva template. Include CTA to /landing.',
  },
  {
    id: 't6', task: 'Invite 5 Users to Weekly Demo Session', target: '5 invites / day', channel: 'WhatsApp + Email',
    channelIcon: Video, timeBlock: 'midday', category: 'demand', weeklyTotal: 25,
    crmField: 'foreign_investment_inquiries → source: demo_invite',
    tip: 'Message: "Kami ada demo gratis platform AI investasi properti Kamis jam 7 malam. Mau saya kirim link?" Track RSVPs for Thursday webinar.',
  },

  // Afternoon — Pipeline management
  {
    id: 't7', task: 'Follow Up 5 Previous Leads', target: '5 follow-ups / day', channel: 'WhatsApp + Call',
    channelIcon: RefreshCw, timeBlock: 'afternoon', category: 'pipeline', weeklyTotal: 25,
    crmField: 'agent_crm_leads → status update + follow_up_date',
    tip: 'Check /agent-crm for leads in "Contacted" and "Negotiation" stages. Move to next stage or log "no response". Follow-up cadence: Day 0, 2, 5, 10, 15.',
  },
  {
    id: 't8', task: 'Update CRM Status for All Conversations', target: '10 min / day', channel: 'Platform CRM',
    channelIcon: FileText, timeBlock: 'afternoon', category: 'pipeline', weeklyTotal: 5,
    crmField: 'agent_crm_leads + agent_acquisition_pipeline → notes + status',
    tip: 'Every conversation MUST be logged. No mental tracking. Update: last_contacted_at, status, notes, follow_up_date. This data feeds weekly performance review.',
  },
  {
    id: 't9', task: 'Approach 1 Developer (Weekly Target)', target: '1 developer / week', channel: 'Email + Call',
    channelIcon: Briefcase, timeBlock: 'afternoon', category: 'pipeline', weeklyTotal: 1,
    scriptRef: '/sales-scripts',
    crmField: 'agent_acquisition_pipeline → stage: developer_outreach',
    tip: 'Research developer projects launching in next 6 months. Send AI demand report for their area as opening value. Use developer script from /sales-scripts. Monday = best day for developer outreach.',
  },

  // Evening — Content & nurture
  {
    id: 't10', task: 'Publish 1 Market Intelligence Article (Weekly)', target: '1 article / week', channel: 'Blog + LinkedIn',
    channelIcon: Megaphone, timeBlock: 'evening', category: 'demand', weeklyTotal: 1,
    crmField: 'acquisition_seo_content → status: published',
    tip: 'Topics: monthly city price trends, "AI predicts top areas", investment guides. Use AI content tools for draft, then edit for authenticity. Distribute via /market-intelligence-feed.',
  },
  {
    id: 't11', task: 'Nurture Top 3 Warm Leads with Value Content', target: '3 messages / day', channel: 'WhatsApp',
    channelIcon: Star, timeBlock: 'evening', category: 'pipeline', weeklyTotal: 15,
    crmField: 'agent_crm_leads → priority: high → notes',
    tip: 'Send specific value: "Pak, area yang Bapak tanya kemarin naik 2% minggu ini" or share a new listing match. Personal touch > generic blast.',
  },
];

const WEEKLY_MILESTONES: WeeklyMilestone[] = [
  { label: 'Agents Contacted', target: '25 / week', icon: Phone },
  { label: 'New Listings Added', target: '15 / week', icon: Building2 },
  { label: 'Investor DMs Sent', target: '50 / week', icon: MessageSquare },
  { label: 'Social Posts Published', target: '5 / week', icon: Share2 },
  { label: 'Demo Invites Sent', target: '25 / week', icon: Video },
  { label: 'Follow-Ups Completed', target: '25 / week', icon: RefreshCw },
  { label: 'Developer Approaches', target: '1 / week', icon: Briefcase },
  { label: 'Articles Published', target: '1 / week', icon: FileText },
];

function TaskCard({ task, index }: { task: DailyTask; index: number }) {
  const [open, setOpen] = useState(false);
  const cat = CAT_MAP[task.category];
  const Icon = task.channelIcon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Circle className="h-3 w-3 text-muted-foreground/30 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{task.task}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${cat.cls}/30 ${cat.cls.split(' ')[0]}`}>{cat.label}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Icon className="h-2.5 w-2.5" />{task.channel}</span>
            <span>·</span>
            <span className="font-medium text-foreground">{task.target}</span>
          </div>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-2">
              <Separator className="opacity-10" />
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Weekly Total</span>
                  <span className="block text-foreground font-bold mt-0.5">{task.weeklyTotal}×</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">CRM Tracking</span>
                  <code className="block text-violet-400 font-mono mt-0.5 text-[8px]">{task.crmField}</code>
                </div>
              </div>
              {task.scriptRef && (
                <div className="text-[9px]">
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Script Reference</span>
                  <code className="block text-sky-400 font-mono mt-0.5 text-[8px]">{task.scriptRef}</code>
                </div>
              )}
              <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Execution Tip</span>
                <p className="text-[10px] text-foreground leading-relaxed mt-0.5">{task.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeBlockSection({ block }: { block: TimeBlock }) {
  const [expanded, setExpanded] = useState(true);
  const meta = TIME_LABELS[block];
  const blockTasks = TASKS.filter(t => t.timeBlock === block);

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${meta.cls.split(' ').slice(1).join(' ')} ${meta.cls.split(' ')[2]}/10 shrink-0`}>
          <Clock className={`h-4 w-4 ${meta.cls.split(' ')[0]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{meta.label}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{meta.time}</Badge>
            <Badge variant="outline" className="text-[9px] h-5">{blockTasks.length} tasks</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {blockTasks.map(t => t.task).join(' · ')}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-1.5">
              <Separator className="opacity-15" />
              {blockTasks.map((t, i) => <TaskCard key={t.id} task={t} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DailyLeadGenPlanPage() {
  const supplyCt = TASKS.filter(t => t.category === 'supply').length;
  const demandCt = TASKS.filter(t => t.category === 'demand').length;
  const pipelineCt = TASKS.filter(t => t.category === 'pipeline').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Daily Lead Generation Plan</h1>
              <p className="text-xs text-muted-foreground">Disciplined daily outreach — supply onboarding, investor acquisition, and pipeline nurturing</p>
            </div>
          </div>

          {/* Daily summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Daily Tasks', value: TASKS.length, icon: Target },
              { label: 'Supply Actions', value: supplyCt, icon: Building2 },
              { label: 'Demand Actions', value: demandCt, icon: Users },
              { label: 'Pipeline Actions', value: pipelineCt, icon: Handshake },
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

          {/* Daily schedule flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Daily Schedule Overview</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {(['morning', 'midday', 'afternoon', 'evening'] as TimeBlock[]).map((b, i) => {
                const m = TIME_LABELS[b];
                const count = TASKS.filter(t => t.timeBlock === b).length;
                return (
                  <div key={b} className="flex items-center gap-1">
                    <div className={`px-3 py-2 rounded-lg border ${m.cls.split(' ').slice(1).join(' ')} ${m.cls.split(' ')[2]}/5 text-center min-w-[100px]`}>
                      <span className={`font-bold block ${m.cls.split(' ')[0]}`}>{m.label}</span>
                      <span className="text-foreground text-[10px] block">{m.time}</span>
                      <span className="text-muted-foreground/50 text-[8px]">{count} tasks</span>
                    </div>
                    {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly milestone targets */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Weekly Milestone Targets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WEEKLY_MILESTONES.map(m => (
                <div key={m.label} className="rounded-lg border border-border/10 bg-muted/5 p-2.5 text-center">
                  <m.icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
                  <span className="text-base font-bold text-foreground block">{m.target}</span>
                  <span className="text-[8px] text-muted-foreground uppercase">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flywheel */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Marketplace Liquidity Flywheel</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'Agent Outreach', sub: '5/day contacts' },
                { label: 'Listings Grow', sub: '+3/day supply' },
                { label: 'AI Scores Improve', sub: 'More data → better signals' },
                { label: 'Investor Interest', sub: 'Better deals → more users' },
                { label: 'More Inquiries', sub: 'Agents see value' },
                { label: 'Agents Refer Others', sub: 'Organic supply growth' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-2 rounded-lg border border-primary/15 bg-primary/5 text-center min-w-[90px]">
                    <span className="text-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < 5 && <ArrowRight className="h-3 w-3 text-primary/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time blocks */}
      <div className="container mx-auto px-4 py-6 space-y-3">
        {(['morning', 'midday', 'afternoon', 'evening'] as TimeBlock[]).map(b => (
          <TimeBlockSection key={b} block={b} />
        ))}

        {/* End-of-day checklist */}
        <div className="rounded-xl border border-border/20 bg-card/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-foreground">End-of-Day Checklist</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {[
              'All conversations logged in CRM with status + notes',
              'Follow-up dates set for tomorrow\'s pipeline tasks',
              'New listings verified: ≥5 photos, complete specs, GPS',
              'Social content posted with CTA link to /landing',
              'Demo invite count tracked for Thursday webinar',
              'Weekly developer outreach progress checked (Mon target)',
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
  );
}
