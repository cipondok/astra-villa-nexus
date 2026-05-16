import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, TrendingUp, AlertTriangle, CheckCircle, Play,
  Users, Target, DollarSign, Clock, ChevronRight, Activity,
  Mail, Megaphone, BarChart3, Brain
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Pipeline Data ─── */
interface PipelineStage {
  id: string;
  label: string;
  deals: number;
  convRate: number;
  predictedRevenue: number;
  aiSuggestion: string;
  color: string;
}

const STAGES: PipelineStage[] = [
  { id: 'discovery', label: 'Lead Discovery', deals: 847, convRate: 42, predictedRevenue: 12_400_000_000, aiSuggestion: 'Increase search visibility in high-demand zones', color: 'chart-1' },
  { id: 'qualification', label: 'Qualification', deals: 356, convRate: 68, predictedRevenue: 8_900_000_000, aiSuggestion: 'Auto-qualify leads with engagement score > 70', color: 'chart-2' },
  { id: 'activation', label: 'Listing Activation', deals: 242, convRate: 74, predictedRevenue: 7_200_000_000, aiSuggestion: 'Priority: 18 listings need photo optimization', color: 'chart-3' },
  { id: 'negotiation', label: 'Negotiation', deals: 179, convRate: 55, predictedRevenue: 5_800_000_000, aiSuggestion: '⚠ 12 deals stalled >48h — suggest price adjustments', color: 'chart-4' },
  { id: 'booking', label: 'Booking Confirmation', deals: 98, convRate: 82, predictedRevenue: 3_900_000_000, aiSuggestion: 'Expedite document verification for 8 pending', color: 'chart-5' },
  { id: 'settlement', label: 'Transaction Settlement', deals: 80, convRate: 95, predictedRevenue: 3_600_000_000, aiSuggestion: 'All settlements on track — 3 closing this week', color: 'primary' },
];

const formatRp = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

/* ─── Smart Recommendations ─── */
interface SmartRec {
  id: string;
  type: 'pricing' | 'followup' | 'promotion' | 'allocation';
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

const RECOMMENDATIONS: SmartRec[] = [
  { id: '1', type: 'pricing', title: 'Price Adjustment — Bali Villas', description: '12 listings 8% above market. Reducing by 5% could accelerate 6 deals.', impact: '+Rp 2.4B potential', confidence: 87 },
  { id: '2', type: 'allocation', title: 'Priority Vendor Allocation', description: 'High-value lead cluster in Seminyak — assign top 3 agents', impact: '+14 qualified leads', confidence: 82 },
  { id: '3', type: 'followup', title: 'Automated Follow-up Campaign', description: '34 leads inactive 7+ days. Trigger re-engagement sequence.', impact: '+8 reactivations est.', confidence: 74 },
  { id: '4', type: 'promotion', title: 'Listing Boost Bundle', description: 'Premium placement for 15 underperforming listings in Jakarta', impact: '+42% visibility', confidence: 79 },
];

const REC_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  pricing: { icon: DollarSign, color: 'text-chart-1' },
  followup: { icon: Mail, color: 'text-chart-2' },
  promotion: { icon: Megaphone, color: 'text-chart-3' },
  allocation: { icon: Users, color: 'text-primary' },
};

const AutonomousDealFlowEngine = () => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [approvedRecs, setApprovedRecs] = useState<Set<string>>(new Set());

  const totalPipeline = useMemo(() => STAGES.reduce((s, st) => s + st.predictedRevenue, 0), []);
  const totalDeals = useMemo(() => STAGES.reduce((s, st) => s + st.deals, 0), []);

  const handleApprove = (id: string) => {
    setApprovedRecs(prev => new Set(prev).add(id));
    toast.success('AI recommendation approved and queued for execution');
  };

  const handleBatchApprove = () => {
    const newSet = new Set(approvedRecs);
    RECOMMENDATIONS.forEach(r => newSet.add(r.id));
    setApprovedRecs(newSet);
    toast.success(`${RECOMMENDATIONS.length} recommendations approved`);
  };

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Autonomous Deal Flow Engine</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span>Pipeline: <strong className="text-foreground">{formatRp(totalPipeline)}</strong></span>
          <span>Deals: <strong className="text-foreground">{totalDeals}</strong></span>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <Card className="border-border/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-1">
            {STAGES.map((stage, i) => {
              const widthPct = Math.max(12, (stage.deals / STAGES[0].deals) * 100);
              const isSelected = selectedStage === stage.id;
              return (
                <React.Fragment key={stage.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                    className={cn(
                      "flex-1 rounded-lg border transition-all p-2.5 text-left",
                      isSelected
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/20 bg-card/50 hover:border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className={cn("h-2 w-2 rounded-full", `bg-${stage.color}`)} />
                      <span className="text-[8px] font-medium text-foreground truncate">{stage.label}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground tabular-nums leading-none">{stage.deals}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[7px] text-muted-foreground">{stage.convRate}% conv</span>
                      <span className="text-[7px] text-chart-1 tabular-nums">{formatRp(stage.predictedRevenue)}</span>
                    </div>
                    {/* Mini conversion bar */}
                    <div className="h-0.5 rounded-full bg-muted/20 mt-1.5 overflow-hidden">
                      <div className={cn("h-full rounded-full", `bg-${stage.color}`)} style={{ width: `${stage.convRate}%` }} />
                    </div>
                  </motion.button>
                  {i < STAGES.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Stage detail overlay */}
          {selectedStage && (() => {
            const stage = STAGES.find(s => s.id === selectedStage)!;
            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-2.5 rounded-lg border border-primary/20 bg-primary/5"
              >
                <div className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-foreground">{stage.label} — AI Insight</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{stage.aiSuggestion}</p>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </CardContent>
      </Card>

      {/* AI Recommendations + Batch Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-primary" />Smart Recommendations
              </CardTitle>
              <Button size="sm" className="h-5 text-[8px] px-2" onClick={handleBatchApprove}>
                Approve All ({RECOMMENDATIONS.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-1.5">
            {RECOMMENDATIONS.map(rec => {
              const config = REC_ICONS[rec.type];
              const Icon = config.icon;
              const isApproved = approvedRecs.has(rec.id);
              return (
                <div key={rec.id} className={cn(
                  "flex items-start gap-2 px-2.5 py-2 rounded-lg border transition-colors",
                  isApproved ? "border-chart-1/20 bg-chart-1/5" : "border-border/20 bg-card/50"
                )}>
                  <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", config.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground">{rec.title}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[7px] h-3.5 text-chart-1 border-chart-1/20">{rec.impact}</Badge>
                      <span className="text-[7px] text-muted-foreground">{rec.confidence}% confidence</span>
                    </div>
                  </div>
                  {isApproved ? (
                    <CheckCircle className="h-4 w-4 text-chart-1 shrink-0" />
                  ) : (
                    <Button variant="ghost" size="sm" className="h-6 text-[8px] px-2 shrink-0" onClick={() => handleApprove(rec.id)}>
                      <Play className="h-2.5 w-2.5 mr-0.5" />Approve
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Batch Action Panel */}
        <div className="space-y-2">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold">Batch Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { label: 'Auto Follow-up Campaign', desc: '34 inactive leads', icon: Mail, color: 'text-chart-2' },
                { label: 'Pricing Optimization Bundle', desc: '12 overpriced listings', icon: DollarSign, color: 'text-chart-1' },
                { label: 'Listing Promotion Boost', desc: '15 underperforming', icon: Megaphone, color: 'text-chart-3' },
                { label: 'Dynamic Commission Adjust', desc: 'Top 5 agents incentive', icon: TrendingUp, color: 'text-primary' },
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <action.icon className={cn("h-3 w-3 mt-0.5 shrink-0", action.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground">{action.label}</p>
                    <p className="text-[8px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-5 text-[8px] px-1.5 shrink-0" onClick={() => toast.success(`${action.label} triggered`)}>
                    <Play className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3 text-chart-3" />Stall Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { stage: 'Negotiation', count: 12, hours: 72, severity: 'high' },
                { stage: 'Qualification', count: 5, hours: 48, severity: 'medium' },
                { stage: 'Booking', count: 3, hours: 36, severity: 'low' },
              ].map((stall, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full",
                    stall.severity === 'high' ? 'bg-destructive' : stall.severity === 'medium' ? 'bg-chart-3' : 'bg-chart-1'
                  )} />
                  <span className="text-[9px] text-foreground flex-1">{stall.stage}</span>
                  <span className="text-[8px] text-muted-foreground">{stall.count} deals</span>
                  <span className="text-[8px] tabular-nums text-destructive">{stall.hours}h</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutonomousDealFlowEngine;
