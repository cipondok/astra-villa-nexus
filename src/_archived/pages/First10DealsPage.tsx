import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFirst10Deals, DealSlot, DealStage } from '@/hooks/useFirst10Deals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Target, Crosshair, Users, Handshake, FileCheck, Trophy,
  TrendingUp, MapPin, DollarSign, BarChart3, ChevronDown, ChevronRight, Zap
} from 'lucide-react';

const STAGE_CONFIG: Record<DealStage, { label: string; icon: React.ElementType; color: string; bg: string; order: number }> = {
  target:      { label: 'Target Identified', icon: Crosshair,  color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30',    order: 0 },
  matched:     { label: 'Investor Matched',  icon: Users,      color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30',  order: 1 },
  negotiation: { label: 'In Negotiation',    icon: Handshake,  color: 'text-purple-500',  bg: 'bg-purple-500/10 border-purple-500/30',order: 2 },
  closing:     { label: 'Closing',           icon: FileCheck,  color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', order: 3 },
  completed:   { label: 'Completed',         icon: Trophy,     color: 'text-primary',     bg: 'bg-primary/10 border-primary/30',      order: 4 },
};

function formatIdr(val: number | null) {
  if (!val) return '—';
  if (val >= 1_000_000_000) return `IDR ${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `IDR ${(val / 1_000_000).toFixed(0)}M`;
  return `IDR ${val.toLocaleString()}`;
}

function DealCard({ deal }: { deal: DealSlot }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STAGE_CONFIG[deal.stage];
  const StageIcon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`border ${deal.stage === 'completed' ? 'border-primary/30 bg-primary/5' : 'border-border/50'}`}>
        <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold text-muted-foreground shrink-0">
              {deal.id}
            </div>
            <div className={`p-1.5 rounded-md ${cfg.bg} border`}>
              <StageIcon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground truncate">
                  {deal.propertyTitle || 'Slot Open — Identify Target'}
                </span>
                <Badge variant="outline" className={`text-[10px] h-5 ${cfg.color}`}>{cfg.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                {deal.city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{deal.city}</span>
                )}
                {deal.priceIdr && (
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatIdr(deal.priceIdr)}</span>
                )}
                {deal.opportunityScore !== null && (
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />Score: {deal.opportunityScore}</span>
                )}
              </div>
            </div>
            {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        </button>
        {expanded && (
          <CardContent className="pt-0 pb-4 px-4 space-y-2">
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Investor:</span> <span className="font-medium text-foreground">{deal.investorName || '—'}</span></div>
              <div><span className="text-muted-foreground">Days in stage:</span> <span className="font-medium text-foreground">{deal.daysInStage}</span></div>
            </div>
            <div className="space-y-1 mt-2">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Next Actions</span>
              {deal.actions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <Zap className="w-3 h-3 text-primary shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

function PipelineFunnel({ breakdown }: { breakdown: Record<DealStage, number> }) {
  const stages: DealStage[] = ['target', 'matched', 'negotiation', 'closing', 'completed'];
  const maxCount = Math.max(...stages.map((s) => breakdown[s]), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Deal Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stages.map((stage) => {
          const cfg = STAGE_CONFIG[stage];
          const Icon = cfg.icon;
          const pct = Math.round((breakdown[stage] / maxCount) * 100);
          return (
            <div key={stage} className="flex items-center gap-2">
              <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
              <span className="text-xs w-24 truncate text-muted-foreground">{cfg.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${stage === 'completed' ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold text-foreground w-5 text-right">{breakdown[stage]}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function First10DealsPage() {
  const { data: plan, isLoading } = useFirst10Deals();

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading deal playbook...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">First 10 Deals — Closing Playbook</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Tactical operational playbook for closing the first ten property transactions.
          </p>
        </motion.div>

        {/* KPI Strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{plan.metrics.completedDeals}/10</div>
            <div className="text-[11px] text-muted-foreground">Deals Closed</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{plan.metrics.realisticPricedListings}</div>
            <div className="text-[11px] text-muted-foreground">Qualified Listings</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{plan.metrics.activeOffers}</div>
            <div className="text-[11px] text-muted-foreground">Active Offers</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-500">{formatIdr(plan.revenueEstimate)}</div>
            <div className="text-[11px] text-muted-foreground">Est. Commission</div>
          </Card>
        </motion.div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Closing Progress</span>
            <span>{plan.overallProgress}%</span>
          </div>
          <Progress value={plan.overallProgress} className="h-2" />
        </div>

        {/* Pipeline + Hot Markets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PipelineFunnel breakdown={plan.stageBreakdown} />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Hot Micro-Markets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.metrics.hotMicroMarkets.length > 0 ? plan.metrics.hotMicroMarkets.map((m) => (
                <div key={m.city} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{m.city}</span>
                  <Badge variant="secondary" className="text-xs">{m.count} listings</Badge>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No market data yet — add listings to populate.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Deal Slots */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Deal Board</h2>
          <div className="space-y-3">
            {plan.deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Final Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Achieve first revenue milestones and demonstrate platform transaction effectiveness
              through 10 verified property closings with documented commission revenue.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
