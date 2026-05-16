import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Mail, Zap, TrendingUp, Bell, Calendar, Users, BarChart3,
  Eye, MousePointerClick, ArrowRight, CheckCircle2, Sparkles,
  MapPin, DollarSign, Target, Clock, Send, Shield, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ---------------------------------------------------------------- */

const TRIGGERS = [
  { id: 'high_opp', label: 'New high opportunity listing detected', icon: Star, desc: 'Score ≥ 85 triggers instant alert' },
  { id: 'price_drop', label: 'Watchlist price drop', icon: TrendingUp, desc: 'Any saved property reduces asking price' },
  { id: 'rising_demand', label: 'Rising demand in selected location', icon: MapPin, desc: 'Demand score spikes >15% in 7 days' },
  { id: 'comparable', label: 'New comparable deal added', icon: Target, desc: 'Similar asset enters market near watchlist items' },
];

const SCHEDULES = [
  { id: 'instant', label: 'Instant Alerts', desc: 'Real-time notifications on trigger events', icon: Zap },
  { id: 'weekly', label: 'Weekly Intelligence Digest', desc: 'Consolidated insights every Monday 9 AM', icon: Calendar },
  { id: 'monthly', label: 'Monthly Strategic Report', desc: 'Deep market analysis on the 1st of each month', icon: BarChart3 },
];

const AUDIENCES = [
  { id: 'high_budget', label: 'High Budget Investors', count: 842, color: 'bg-primary/10 text-primary' },
  { id: 'yield_focus', label: 'Yield Focused', count: 1_203, color: 'bg-chart-1/10 text-chart-1' },
  { id: 'bali', label: 'Bali Interest Segment', count: 2_156, color: 'bg-chart-4/10 text-chart-4' },
  { id: 'urban', label: 'Urban Growth Segment', count: 967, color: 'bg-accent-foreground/10 text-accent-foreground' },
];

const METRICS = [
  { label: 'Email Open Rate', value: '68.4%', delta: '+4.2%', icon: Eye },
  { label: 'Click Engagement', value: '34.1%', delta: '+7.8%', icon: MousePointerClick },
  { label: 'Deals Initiated', value: '127', delta: '+23', icon: ArrowRight },
];

export default function InvestorIntelligenceReports() {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['high_opp', 'price_drop']);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>(['instant', 'weekly']);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['high_budget', 'bali']);

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const activate = () => toast.success('Intelligence automation activated — reports will be generated and delivered automatically.');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-chart-1/[0.02] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-4 px-3 py-1 text-[10px] border-primary/20 text-primary bg-primary/5">
              <Mail className="w-3 h-3 mr-1.5" />Communication Automation
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Automated Investor
              <span className="block text-primary">Reports</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg text-base">
              AI-generated property intelligence delivered to investors automatically.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left — Campaign Builder */}
          <div className="space-y-6">
            {/* Trigger Logic */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
                <Bell className="w-4 h-4 text-primary" />Trigger Logic
              </h2>
              <div className="space-y-3">
                {TRIGGERS.map(t => {
                  const active = selectedTriggers.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggle(selectedTriggers, t.id, setSelectedTriggers)}
                      className={cn(
                        'w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left',
                        active ? 'border-primary/30 bg-primary/5' : 'border-border bg-accent/20 hover:border-border'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        active ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                      )}>
                        <t.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground">{t.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
                      </div>
                      {active && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Email Content Preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-primary" />Email Content Preview
              </h2>
              {/* Simulated email */}
              <div className="border border-border rounded-xl overflow-hidden bg-background">
                {/* Email header */}
                <div className="bg-primary/5 border-b border-border px-5 py-4">
                  <div className="text-[10px] text-muted-foreground mb-1">From: ASTRA Intelligence &lt;insights@astravilla.com&gt;</div>
                  <div className="text-sm font-semibold text-foreground">🔥 New Elite Opportunity — Canggu Beachfront Villa</div>
                </div>
                {/* Email body */}
                <div className="p-5 space-y-4">
                  {/* Property snapshot */}
                  <div className="flex gap-4">
                    <div className="w-24 h-20 rounded-lg bg-accent/60 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Oceanfront Villa Berawa</div>
                      <div className="text-[11px] text-muted-foreground">Canggu, Bali · Rp 8.2B</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0.5">
                          <Zap className="w-2.5 h-2.5 text-primary" />Score 91
                        </Badge>
                        <Badge className="text-[9px] bg-chart-1/15 text-chart-1 hover:bg-chart-1/15 px-1.5 py-0.5">8.4% Yield</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Opportunity Score summary */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Opportunity Score Breakdown</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Price Position', value: '93' },
                        { label: 'Demand Heat', value: '88' },
                        { label: 'Growth Signal', value: '85' },
                      ].map(s => (
                        <div key={s.label} className="bg-accent/40 rounded-lg p-2 text-center">
                          <div className="text-[9px] text-muted-foreground">{s.label}</div>
                          <div className="text-sm font-bold text-foreground">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Yield forecast */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Yield Forecast</div>
                    <p className="text-[11px] text-foreground/80 leading-relaxed">
                      Projected annual rental yield of 8.4% based on Canggu short-stay market data.
                      Weekend occupancy trending at 89% with 12% YoY rate increase.
                    </p>
                  </div>

                  {/* Market trend */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Market Commentary</div>
                    <p className="text-[11px] text-foreground/80 leading-relaxed">
                      Canggu corridor shows sustained investor inflow with 23% transaction volume increase.
                      Infrastructure upgrades expected to drive further 15-20% appreciation over 3 years.
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <div className="bg-primary/10 rounded-lg p-3 text-center">
                      <span className="text-xs font-semibold text-primary">View Full Analysis →</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scheduling Controls */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-primary" />Scheduling Controls
              </h2>
              <div className="space-y-3">
                {SCHEDULES.map(s => {
                  const active = selectedSchedules.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border transition-all',
                        active ? 'border-primary/30 bg-primary/5' : 'border-border bg-accent/20'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          active ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                        )}>
                          <s.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground">{s.label}</div>
                          <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                        </div>
                      </div>
                      <Switch
                        checked={active}
                        onCheckedChange={() => toggle(selectedSchedules, s.id, setSelectedSchedules)}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Audience Targeting */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
                <Users className="w-4 h-4 text-primary" />Audience Targeting
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {AUDIENCES.map(a => {
                  const active = selectedAudiences.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggle(selectedAudiences, a.id, setSelectedAudiences)}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border transition-all text-left',
                        active ? 'border-primary/30 bg-primary/5' : 'border-border bg-accent/20 hover:border-border'
                      )}
                    >
                      <div>
                        <div className="text-xs font-medium text-foreground">{a.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{a.count.toLocaleString()} investors</div>
                      </div>
                      {active && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total reach</span>
                <span className="text-sm font-semibold text-foreground">
                  {selectedAudiences.reduce((sum, id) => sum + (AUDIENCES.find(a => a.id === id)?.count ?? 0), 0).toLocaleString()} investors
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right — Performance Panel */}
          <div className="space-y-5">
            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />Report Performance
              </h3>
              {METRICS.map((m, i) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <m.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-chart-1">{m.delta}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{m.value}</div>
                  {i < METRICS.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </motion.div>

            {/* Automation status */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />Automation Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Triggers active</span>
                  <span className="font-semibold text-foreground">{selectedTriggers.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Schedules active</span>
                  <span className="font-semibold text-foreground">{selectedSchedules.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Audience segments</span>
                  <span className="font-semibold text-foreground">{selectedAudiences.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last report sent</span>
                  <span className="font-mono text-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Reports this month</span>
                  <span className="font-mono text-foreground">3,241</span>
                </div>
              </div>
            </motion.div>

            {/* Activate CTA */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                className="w-full h-12 text-sm font-semibold gap-2"
                onClick={activate}
              >
                <Send className="w-4 h-4" />Activate Intelligence Automation
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Reports are generated by AI and reviewed before delivery
              </p>
            </motion.div>

            {/* Recent sends */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Recent Deliveries</h3>
              <div className="space-y-2.5">
                {[
                  { title: 'Elite Opportunity Alert', time: '2h ago', recipients: 842 },
                  { title: 'Weekly Bali Digest', time: '1d ago', recipients: 2_156 },
                  { title: 'Price Drop Notification', time: '2d ago', recipients: 1_203 },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-accent/30">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-foreground truncate">{d.title}</div>
                      <div className="text-[9px] text-muted-foreground">{d.recipients.toLocaleString()} recipients · {d.time}</div>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-chart-1 shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
