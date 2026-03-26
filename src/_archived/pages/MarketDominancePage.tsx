import React from 'react';
import { motion } from 'framer-motion';
import { useMarketDominance, CityPresence, LeverMetric, ExpansionPhase } from '@/hooks/useMarketDominance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Crown, MapPin, Building2, GraduationCap, Cpu, TrendingUp,
  Users, FileText, Zap, Globe, ChevronRight, Target
} from 'lucide-react';

const PHASE_CONFIG: Record<ExpansionPhase, { label: string; color: string; bg: string; order: number }> = {
  beachhead:     { label: 'Beachhead',      color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30',    order: 0 },
  consolidation: { label: 'Consolidation',  color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30',  order: 1 },
  expansion:     { label: 'Expansion',       color: 'text-purple-500',  bg: 'bg-purple-500/10 border-purple-500/30',order: 2 },
  dominance:     { label: 'Dominance',       color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', order: 3 },
};

const LEVER_ICONS: Record<string, React.ElementType> = {
  city_first: MapPin,
  developer_partnerships: Building2,
  investor_education: GraduationCap,
  tech_differentiation: Cpu,
};

function LeverCard({ lever }: { lever: LeverMetric }) {
  const Icon = LEVER_ICONS[lever.lever] || Zap;
  const scoreColor = lever.score >= 70 ? 'text-emerald-500' : lever.score >= 40 ? 'text-amber-500' : 'text-destructive';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" /> {lever.label}
          </CardTitle>
          <span className={`text-lg font-bold ${scoreColor}`}>{lever.score}</span>
        </div>
        <Progress value={lever.score} className="h-1.5 mt-1" />
      </CardHeader>
      <CardContent className="space-y-1.5">
        {lever.signals.map((s, i) => {
          const pct = s.target > 0 ? Math.min(100, Math.round((s.value / s.target) * 100)) : 0;
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-medium text-foreground w-12 text-right">{s.value}/{s.target}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CityRow({ city, rank }: { city: CityPresence; rank: number }) {
  const phase = PHASE_CONFIG[city.phase];
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs font-bold text-muted-foreground w-5 text-right">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{city.city}</span>
          <Badge variant="outline" className={`text-[10px] h-5 ${phase.color}`}>{phase.label}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span>{city.listings} listings</span>
          <span>{city.agents} agents</span>
          <span>{city.marketShare}% share</span>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </div>
  );
}

export default function MarketDominancePage() {
  const { data, isLoading } = useMarketDominance();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dominance framework...</div>
      </div>
    );
  }

  const phaseCfg = PHASE_CONFIG[data.currentPhase];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Crown className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Market Dominance Framework</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Strategic expansion framework for national property investment leadership.
          </p>
        </motion.div>

        {/* KPI Strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className={`p-3 text-center border ${phaseCfg.bg}`}>
            <div className={`text-lg font-bold ${phaseCfg.color}`}>{phaseCfg.label}</div>
            <div className="text-[11px] text-muted-foreground">Current Phase</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{data.overallDominanceScore}</div>
            <div className="text-[11px] text-muted-foreground">Dominance Score</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{data.cities.length}</div>
            <div className="text-[11px] text-muted-foreground">Cities Active</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{data.totalListings}</div>
            <div className="text-[11px] text-muted-foreground">Total Listings</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{data.aiCoverage}%</div>
            <div className="text-[11px] text-muted-foreground">AI Coverage</div>
          </Card>
        </motion.div>

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Dominance Score</span>
            <span>{data.overallDominanceScore}/100</span>
          </div>
          <Progress value={data.overallDominanceScore} className="h-2" />
        </div>

        <Separator />

        {/* Domination Levers */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Domination Levers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.levers.map((lever, i) => (
              <motion.div key={lever.lever} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <LeverCard lever={lever} />
              </motion.div>
            ))}
          </div>
        </div>

        <Separator />

        {/* City Expansion Map */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> City Expansion Tracker
          </h2>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              {data.cities.length > 0 ? data.cities.slice(0, 12).map((city, i) => (
                <CityRow key={city.city} city={city} rank={i + 1} />
              )) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No city data yet — add listings to populate.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase Roadmap */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Phase Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {(['beachhead', 'consolidation', 'expansion', 'dominance'] as ExpansionPhase[]).map((phase, i) => {
                const cfg = PHASE_CONFIG[phase];
                const isActive = PHASE_CONFIG[data.currentPhase].order >= cfg.order;
                return (
                  <React.Fragment key={phase}>
                    <div className={`flex-1 text-center p-2 rounded-md border text-xs font-medium transition-all ${isActive ? `${cfg.bg} ${cfg.color}` : 'bg-muted/30 text-muted-foreground border-border/30'}`}>
                      {cfg.label}
                    </div>
                    {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" /> Final Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Achieve recognizable leadership perception in the digital property investment space nationally —
              through city-first dominance, developer exclusivity, investor education authority, and AI technology differentiation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
