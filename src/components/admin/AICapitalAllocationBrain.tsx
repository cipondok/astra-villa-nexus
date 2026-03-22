import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Brain, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Play,
  Target, BarChart3, ArrowUpRight, ArrowDownRight, Zap, Shield
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';

/* ─── Data ─── */
interface AllocationZone {
  id: string;
  city: string;
  currentPct: number;
  recommendedPct: number;
  expectedROI: number;
  riskScore: number;
  efficiency: 'optimal' | 'over' | 'under';
  demand: number;
}

const ZONES: AllocationZone[] = [
  { id: '1', city: 'Bali — Luxury', currentPct: 28, recommendedPct: 34, expectedROI: 340, riskScore: 18, efficiency: 'under', demand: 92 },
  { id: '2', city: 'Jakarta — Commercial', currentPct: 22, recommendedPct: 20, expectedROI: 180, riskScore: 25, efficiency: 'over', demand: 72 },
  { id: '3', city: 'Surabaya', currentPct: 15, recommendedPct: 14, expectedROI: 150, riskScore: 22, efficiency: 'optimal', demand: 58 },
  { id: '4', city: 'Bali — Mid-Range', currentPct: 12, recommendedPct: 16, expectedROI: 280, riskScore: 20, efficiency: 'under', demand: 85 },
  { id: '5', city: 'Lombok', currentPct: 10, recommendedPct: 8, expectedROI: 120, riskScore: 30, efficiency: 'over', demand: 45 },
  { id: '6', city: 'Bandung', currentPct: 8, recommendedPct: 5, expectedROI: 90, riskScore: 28, efficiency: 'over', demand: 38 },
  { id: '7', city: 'Tier-3 Markets', currentPct: 5, recommendedPct: 3, expectedROI: 60, riskScore: 42, efficiency: 'over', demand: 22 },
];

const RECOMMENDATIONS = [
  { id: 'r1', action: 'Reallocate 18% expansion budget from Tier-3 markets to Bali luxury cluster', impact: '+27% quarterly GMV', confidence: 91, urgency: 'high' },
  { id: 'r2', action: 'Increase vendor incentive budget in Bali mid-range by Rp 120M', impact: '+34 vendor activations', confidence: 86, urgency: 'medium' },
  { id: 'r3', action: 'Reduce Jakarta commercial marketing spend by 12%', impact: 'Save Rp 85M, minimal impact', confidence: 82, urgency: 'low' },
  { id: 'r4', action: 'Front-load Q2 Lombok budget to capture seasonal demand', impact: '+18% deal velocity', confidence: 78, urgency: 'medium' },
  { id: 'r5', action: 'Pause Bandung expansion spend until vendor pipeline matures', impact: 'Save Rp 210M capital', confidence: 88, urgency: 'high' },
];

const BUDGET_TIMELINE = [
  { month: 'Jan', marketing: 420, vendor: 180, expansion: 240, tech: 120 },
  { month: 'Feb', marketing: 380, vendor: 200, expansion: 280, tech: 130 },
  { month: 'Mar', marketing: 450, vendor: 220, expansion: 320, tech: 125 },
  { month: 'Apr', marketing: 410, vendor: 250, expansion: 350, tech: 140 },
  { month: 'May', marketing: 480, vendor: 270, expansion: 380, tech: 135 },
  { month: 'Jun', marketing: 520, vendor: 300, expansion: 420, tech: 150 },
];

const EFFICIENCY_STYLES: Record<string, { color: string; label: string }> = {
  optimal: { color: 'text-chart-1', label: 'Optimal' },
  over: { color: 'text-destructive', label: 'Over-allocated' },
  under: { color: 'text-chart-2', label: 'Under-allocated' },
};

const AICapitalAllocationBrain = () => {
  const [approvedRecs, setApprovedRecs] = useState<Set<string>>(new Set());

  const handleApprove = (id: string) => {
    setApprovedRecs(prev => new Set(prev).add(id));
    toast.success('Capital reallocation approved');
  };

  const scatterData = ZONES.map(z => ({
    x: z.expectedROI,
    y: z.riskScore,
    z: z.currentPct,
    city: z.city,
    efficiency: z.efficiency,
  }));

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Capital Allocation Brain</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">ACTIVE</Badge>
        </div>
        <div className="text-[9px] text-muted-foreground">
          Total Budget: <strong className="text-foreground">Rp 4.8B</strong> this quarter
        </div>
      </div>

      {/* Capital Heat Grid */}
      <Card className="border-border/20">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="text-[10px] font-semibold">Capital Allocation Heat Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0 space-y-1.5">
          {ZONES.map(zone => {
            const delta = zone.recommendedPct - zone.currentPct;
            const style = EFFICIENCY_STYLES[zone.efficiency];
            return (
              <div key={zone.id} className="flex items-center gap-2">
                <span className="text-[9px] font-medium text-foreground w-28 truncate">{zone.city}</span>
                <div className="flex-1 h-3 rounded bg-muted/10 overflow-hidden relative">
                  <div className="h-full rounded bg-muted-foreground/15" style={{ width: `${zone.currentPct}%` }} />
                  <div className={cn(
                    "absolute top-0 h-full rounded border-2 border-dashed",
                    delta > 0 ? "border-chart-1/40" : delta < 0 ? "border-destructive/40" : "border-transparent"
                  )} style={{ width: `${zone.recommendedPct}%`, left: 0 }} />
                </div>
                <span className="text-[8px] tabular-nums text-foreground w-6 text-right">{zone.currentPct}%</span>
                <span className={cn("text-[8px] tabular-nums w-8 text-right", delta > 0 ? "text-chart-1" : delta < 0 ? "text-destructive" : "text-muted-foreground")}>
                  {delta > 0 ? '+' : ''}{delta}%
                </span>
                <Badge variant="outline" className={cn("text-[6px] h-3 px-1 w-20 justify-center", style.color, `border-current/20`)}>
                  {style.label}
                </Badge>
                <span className="text-[7px] text-muted-foreground w-14 text-right">ROI {zone.expectedROI}%</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-3">
        {/* ROI vs Risk Scatter */}
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <CardTitle className="text-[10px] font-semibold">Expected Return vs Risk</CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="x" type="number" name="ROI" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} label={{ value: 'Expected ROI %', position: 'insideBottom', offset: -2, style: { fontSize: 7, fill: 'hsl(var(--muted-foreground))' } }} />
                <YAxis dataKey="y" type="number" name="Risk" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} label={{ value: 'Risk', angle: -90, position: 'insideLeft', style: { fontSize: 7, fill: 'hsl(var(--muted-foreground))' } }} width={30} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} formatter={(v: number, name: string) => [v, name]} labelFormatter={() => ''} />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.efficiency === 'optimal' ? 'hsl(var(--chart-1))' : entry.efficiency === 'under' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
                      r={4 + entry.z / 5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-1">
              {Object.entries(EFFICIENCY_STYLES).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <span className={cn("h-2 w-2 rounded-full", v.color === 'text-chart-1' ? 'bg-chart-1' : v.color === 'text-chart-2' ? 'bg-chart-2' : 'bg-destructive')} />
                  <span className="text-[7px] text-muted-foreground">{v.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />Reallocation Recommendations
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-1.5">
            {RECOMMENDATIONS.map(rec => {
              const isApproved = approvedRecs.has(rec.id);
              return (
                <div key={rec.id} className={cn(
                  "px-2 py-1.5 rounded-lg border transition-colors",
                  isApproved ? "border-chart-1/20 bg-chart-1/5" : "border-border/20 bg-card/50"
                )}>
                  <p className="text-[9px] text-foreground leading-tight">{rec.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[6px] h-3 text-chart-1 border-chart-1/20">{rec.impact}</Badge>
                    <span className="text-[7px] text-muted-foreground">{rec.confidence}%</span>
                    <span className={cn("text-[6px] px-1 py-0.5 rounded",
                      rec.urgency === 'high' ? 'bg-destructive/10 text-destructive' : rec.urgency === 'medium' ? 'bg-chart-3/10 text-chart-3' : 'bg-muted/10 text-muted-foreground'
                    )}>{rec.urgency}</span>
                    <div className="flex-1" />
                    {isApproved ? (
                      <CheckCircle className="h-3 w-3 text-chart-1" />
                    ) : (
                      <Button variant="ghost" size="sm" className="h-4 text-[7px] px-1.5" onClick={() => handleApprove(rec.id)}>
                        <Play className="h-2 w-2 mr-0.5" />Approve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Budget Timeline */}
      <Card className="border-border/20">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="text-[10px] font-semibold">Budget Deployment Timeline (Rp M)</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={BUDGET_TIMELINE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
              <Bar dataKey="marketing" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="vendor" stackId="a" fill="hsl(var(--chart-2))" />
              <Bar dataKey="expansion" stackId="a" fill="hsl(var(--chart-3))" />
              <Bar dataKey="tech" stackId="a" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-1">
            {[
              { label: 'Marketing', color: 'bg-chart-1' },
              { label: 'Vendor', color: 'bg-chart-2' },
              { label: 'Expansion', color: 'bg-chart-3' },
              { label: 'Tech', color: 'bg-primary' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-sm", l.color)} />
                <span className="text-[7px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICapitalAllocationBrain;
