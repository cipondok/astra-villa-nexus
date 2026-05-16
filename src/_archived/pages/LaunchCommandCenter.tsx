import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Building2, Users, Bookmark, MessageSquare, Calendar, TrendingUp,
  Sparkles, Download, Zap, MapPin, Eye, ArrowRight, BarChart3,
  Activity, Clock, Repeat, Flame, ChevronRight, Globe, Target,
  ArrowUpRight, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ================================================================
   LAUNCH COMMAND CENTER — Executive Analytics Dashboard
   ================================================================ */

// ---------- mock data ----------
const KPI_DATA = [
  { label: 'Active Listings', value: '127', delta: '+12', icon: Building2, trend: 'up' as const },
  { label: 'Investor Signups', value: '2,341', delta: '+89 today', icon: Users, trend: 'up' as const },
  { label: 'Watchlist Saves', value: '156', delta: '+23 today', icon: Bookmark, trend: 'up' as const },
  { label: 'Deal Conversations', value: '43', delta: '+7 today', icon: MessageSquare, trend: 'up' as const },
  { label: 'Viewings Scheduled', value: '18', delta: '+4 today', icon: Calendar, trend: 'up' as const },
];

const CITY_HEATMAP = [
  { city: 'Canggu', interest: 94, investors: 312, color: 'bg-primary' },
  { city: 'Seminyak', interest: 87, investors: 278, color: 'bg-primary/80' },
  { city: 'Ubud', interest: 76, investors: 198, color: 'bg-primary/70' },
  { city: 'Uluwatu', interest: 68, investors: 156, color: 'bg-primary/60' },
  { city: 'Jakarta Selatan', interest: 55, investors: 134, color: 'bg-primary/50' },
  { city: 'Bandung', interest: 42, investors: 89, color: 'bg-primary/40' },
  { city: 'Lombok', interest: 38, investors: 72, color: 'bg-primary/30' },
  { city: 'Surabaya', interest: 25, investors: 45, color: 'bg-muted-foreground/40' },
];

const FUNNEL_STAGES = [
  { stage: 'Visitors', value: 12480, pct: 100 },
  { stage: 'Listing Views', value: 4890, pct: 39.2 },
  { stage: 'Watchlist', value: 1240, pct: 9.9 },
  { stage: 'Inquiry', value: 486, pct: 3.9 },
  { stage: 'Deal Room', value: 127, pct: 1.02 },
];

const TOP_LISTINGS = [
  { rank: 1, title: 'Eco Retreat in Rice Terraces', location: 'Ubud', score: 95, views: 1240, inquiries: 34 },
  { rank: 2, title: 'Modern Villa with Infinity Pool', location: 'Canggu', score: 92, views: 1089, inquiries: 28 },
  { rank: 3, title: 'Beachfront Penthouse', location: 'Seminyak', score: 87, views: 945, inquiries: 22 },
  { rank: 4, title: 'Cliffside Luxury Villa', location: 'Uluwatu', score: 84, views: 812, inquiries: 19 },
  { rank: 5, title: 'Tropical Garden House', location: 'Pererenan', score: 81, views: 678, inquiries: 15 },
];

const BEHAVIOR_METRICS = [
  { label: 'Avg Session Time', value: '8m 42s', icon: Clock, delta: '+1m 12s' },
  { label: 'Listings per Session', value: '6.3', icon: Eye, delta: '+0.8' },
  { label: 'Repeat Visit Rate', value: '34%', icon: Repeat, delta: '+4.2%' },
];

const AI_INSIGHTS = [
  { text: 'Bandung villas gaining investor traction — +38% inquiries this week', type: 'opportunity' as const },
  { text: 'Urban houses seeing rising liquidity interest from Jakarta investors', type: 'trend' as const },
  { text: 'Canggu short-term rental yield outperforming market by 2.1%', type: 'insight' as const },
  { text: 'Consider expanding Lombok listings — 72 investors with zero matches', type: 'action' as const },
  { text: 'Repeat visit rate climbing — strong retention signal for Series A metrics', type: 'milestone' as const },
  { text: 'Tuesday-Thursday shows 3x higher deal room conversion rate', type: 'insight' as const },
];

export default function LaunchCommandCenter() {
  const momentumScore = 78;

  const handleExport = () => {
    toast.success('Generating Investor Activity Report...');
    setTimeout(() => toast.success('Report ready for download'), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-playfair text-xl font-bold text-foreground tracking-tight">Launch Command Center</h1>
                <p className="text-xs text-muted-foreground">Real-time platform intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/20 bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live
              </Badge>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* ========== KPI STRIP ========== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {KPI_DATA.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-medium text-primary">{kpi.delta}</span>
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ========== MAIN GRID + SIDEBAR ========== */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main analytics grid */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Row 1: Heatmap + Funnel */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Card 1 — City Heatmap */}
              <AnalyticsCard title="Opportunity Activity Heatmap" icon={<Globe className="w-4 h-4" />} delay={0.1}>
                <div className="space-y-2.5">
                  {CITY_HEATMAP.map((city, i) => (
                    <div key={city.city} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 truncate">{city.city}</span>
                      <div className="flex-1 h-6 bg-secondary/50 rounded-md overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${city.interest}%` }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                          className={cn('h-full rounded-md', city.color)}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{city.investors}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                    <span>Interest Index</span>
                    <span>Active Investors</span>
                  </div>
                </div>
              </AnalyticsCard>

              {/* Card 2 — Funnel */}
              <AnalyticsCard title="Conversion Funnel" icon={<Layers className="w-4 h-4" />} delay={0.15}>
                <div className="space-y-3">
                  {FUNNEL_STAGES.map((stage, i) => {
                    const nextPct = FUNNEL_STAGES[i + 1]?.pct;
                    const convRate = nextPct ? ((FUNNEL_STAGES[i + 1].value / stage.value) * 100).toFixed(1) : null;
                    return (
                      <div key={stage.stage}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{stage.stage}</span>
                          <span className="text-xs tabular-nums text-muted-foreground">{stage.value.toLocaleString()}</span>
                        </div>
                        <div className="h-7 bg-secondary/30 rounded-lg overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stage.pct}%` }}
                            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                            className="h-full bg-primary/20 rounded-lg flex items-center justify-end pr-2"
                            style={{ minWidth: stage.pct > 5 ? undefined : '2rem' }}
                          >
                            <span className="text-[10px] font-semibold text-primary">{stage.pct}%</span>
                          </motion.div>
                        </div>
                        {convRate && (
                          <div className="flex items-center justify-center mt-1">
                            <span className="text-[9px] text-muted-foreground">↓ {convRate}% conversion</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AnalyticsCard>
            </div>

            {/* Row 2: Top Listings + Behavior */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Card 3 — Top Performing Listings */}
              <AnalyticsCard title="Top Performing Listings" icon={<TrendingUp className="w-4 h-4" />} delay={0.2}>
                <div className="space-y-2">
                  {TOP_LISTINGS.map(listing => (
                    <div key={listing.rank} className="flex items-center gap-3 p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                      <div className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0',
                        listing.rank <= 2 ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                      )}>
                        {listing.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{listing.title}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{listing.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">{listing.views} views</div>
                          <div className="text-[10px] text-primary">{listing.inquiries} inquiries</div>
                        </div>
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                          <Zap className="w-2.5 h-2.5" />{listing.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>

              {/* Card 4 — Investor Behavior */}
              <div className="space-y-6">
                <AnalyticsCard title="Investor Behavior Signals" icon={<Activity className="w-4 h-4" />} delay={0.25}>
                  <div className="space-y-3">
                    {BEHAVIOR_METRICS.map(m => (
                      <div key={m.label} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <m.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">{m.label}</div>
                          <div className="text-lg font-bold text-foreground tabular-nums">{m.value}</div>
                        </div>
                        <span className="text-[10px] font-medium text-primary">{m.delta}</span>
                      </div>
                    ))}
                  </div>
                </AnalyticsCard>

                {/* Card 5 — Growth Momentum Gauge */}
                <AnalyticsCard title="Growth Momentum" icon={<Flame className="w-4 h-4" />} delay={0.3}>
                  <div className="flex flex-col items-center py-4">
                    <div className="relative w-36 h-36">
                      {/* Gauge background */}
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10" className="stroke-secondary" />
                        <motion.circle
                          cx="60" cy="60" r="50" fill="none" strokeWidth="10"
                          strokeLinecap="round"
                          className="stroke-primary"
                          strokeDasharray={`${momentumScore * 3.14} 314`}
                          initial={{ strokeDasharray: '0 314' }}
                          animate={{ strokeDasharray: `${momentumScore * 3.14} 314` }}
                          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground tabular-nums">{momentumScore}</span>
                        <span className="text-[10px] text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <span className="text-sm font-semibold text-primary">Strong Traction</span>
                      <p className="text-[10px] text-muted-foreground mt-1">+12 pts from last week</p>
                    </div>
                  </div>
                </AnalyticsCard>
              </div>
            </div>
          </div>

          {/* ========== RIGHT SIDEBAR — AI Founder Insights ========== */}
          <div className="xl:w-80 shrink-0">
            <div className="xl:sticky xl:top-24">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">AI Founder Insights</h3>
                  <Badge variant="outline" className="ml-auto text-[9px]">Auto</Badge>
                </div>
                <ScrollArea className="h-[520px]">
                  <div className="p-4 space-y-3">
                    {AI_INSIGHTS.map((insight, i) => {
                      const iconMap = {
                        opportunity: <Target className="w-3.5 h-3.5 text-primary" />,
                        trend: <TrendingUp className="w-3.5 h-3.5 text-primary" />,
                        insight: <BarChart3 className="w-3.5 h-3.5 text-primary" />,
                        action: <ArrowUpRight className="w-3.5 h-3.5 text-primary" />,
                        milestone: <Flame className="w-3.5 h-3.5 text-primary" />,
                      };
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.08 }}
                          className="flex gap-3 p-3 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors cursor-default"
                        >
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            {iconMap[insight.type]}
                          </div>
                          <div>
                            <p className="text-xs text-foreground/90 leading-relaxed">{insight.text}</p>
                            <span className="text-[9px] text-muted-foreground capitalize mt-1 inline-block">{insight.type}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Export CTA */}
              <Button
                className="w-full mt-4 gap-2"
                onClick={() => { toast.success('Generating Investor Activity Report...'); }}
              >
                <Download className="w-4 h-4" />
                Export Investor Activity Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== ANALYTICS CARD WRAPPER ===================== */
function AnalyticsCard({ title, icon, children, delay = 0 }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
