import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, TrendingUp, BarChart3, Activity, Zap, Eye,
  DollarSign, Handshake, Target, ArrowUpRight, ArrowDownRight,
  Minus, Clock, Building2, RefreshCw, ChevronRight
} from 'lucide-react';
import { useLiquidityMetrics, useLiquidityHotspots, usePropertyLiquidity } from '@/hooks/useLiquidityMetrics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SIGNAL_WEIGHTS = [
  { signal: 'Viewing', weight: '10%', icon: Eye, color: 'hsl(210, 80%, 55%)' },
  { signal: 'Offer', weight: '25%', icon: DollarSign, color: 'hsl(45, 90%, 50%)' },
  { signal: 'Escrow', weight: '35%', icon: Handshake, color: 'hsl(260, 70%, 55%)' },
  { signal: 'Closed', weight: '30%', icon: Target, color: 'hsl(145, 65%, 42%)' },
];

const GRADE_COLORS: Record<string, string> = {
  'A+': 'hsl(145, 65%, 42%)',
  'A': 'hsl(145, 55%, 50%)',
  'B': 'hsl(45, 90%, 50%)',
  'C': 'hsl(30, 85%, 55%)',
  'D': 'hsl(15, 80%, 55%)',
  'F': 'hsl(0, 70%, 55%)',
};

const SUPPLY_COLORS: Record<string, { bg: string; text: string }> = {
  critical_shortage: { bg: 'bg-red-500/10', text: 'text-red-600' },
  undersupplied: { bg: 'bg-orange-500/10', text: 'text-orange-600' },
  balanced: { bg: 'bg-green-500/10', text: 'text-green-600' },
  oversupplied: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'accelerating' || trend === 'rising') return <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />;
  if (trend === 'declining' || trend === 'cooling') return <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const LiquidityIntelligenceEngine = () => {
  const { data: metrics = [], isLoading: metricsLoading } = useLiquidityMetrics();
  const { data: hotspots = [] } = useLiquidityHotspots();
  const { data: propScores = [] } = usePropertyLiquidity();
  const [isRecomputing, setIsRecomputing] = useState(false);

  const handleRecompute = async () => {
    setIsRecomputing(true);
    try {
      const { data, error } = await supabase.functions.invoke('recompute-liquidity', {
        body: { mode: 'full' },
      });
      if (error) throw error;
      toast.success(`Liquidity recomputed: ${data.district_metrics_updated} districts, ${data.property_scores_updated} properties`);
    } catch (err: any) {
      toast.error(err.message || 'Recompute failed');
    } finally {
      setIsRecomputing(false);
    }
  };

  const totalViewings = metrics.reduce((s, m) => s + (m.viewing_count_30d || 0), 0);
  const totalOffers = metrics.reduce((s, m) => s + (m.offer_count_30d || 0), 0);
  const totalClosed = metrics.reduce((s, m) => s + (m.closed_count_30d || 0), 0);
  const avgLiquidity = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + m.liquidity_strength_index, 0) / metrics.length) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Liquidity Intelligence Engine</h1>
                <p className="text-sm text-muted-foreground">Real-time marketplace liquidity metrics from behavioral signals</p>
              </div>
            </div>
            <button
              onClick={handleRecompute}
              disabled={isRecomputing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRecomputing ? 'animate-spin' : ''}`} />
              {isRecomputing ? 'Computing...' : 'Recompute Now'}
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* KPI Strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Liquidity Index', value: avgLiquidity, suffix: '/100', icon: Droplets },
            { label: '30d Viewings', value: totalViewings, icon: Eye },
            { label: '30d Offers', value: totalOffers, icon: DollarSign },
            { label: '30d Closed', value: totalClosed, icon: Handshake },
          ].map((kpi, i) => (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <kpi.icon className="w-3.5 h-3.5" />
                {kpi.label}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {kpi.value}{kpi.suffix || ''}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Signal Weight Formula */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Signal → Liquidity Scoring Formula
          </h2>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="text-sm font-mono text-muted-foreground">LSI =</span>
              {SIGNAL_WEIGHTS.map((sw, i) => (
                <React.Fragment key={sw.signal}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${sw.color}20` }}>
                      <sw.icon className="w-3.5 h-3.5" style={{ color: sw.color }} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold" style={{ color: sw.color }}>{sw.weight}</div>
                      <div className="text-[10px] text-muted-foreground">{sw.signal}</div>
                    </div>
                  </div>
                  {i < SIGNAL_WEIGHTS.length - 1 && <span className="text-muted-foreground text-sm">+</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <div><span className="font-semibold text-foreground">Grade A+:</span> ≥85</div>
              <div><span className="font-semibold text-foreground">Grade A:</span> ≥70</div>
              <div><span className="font-semibold text-foreground">Grade B:</span> ≥55</div>
              <div><span className="font-semibold text-foreground">Grade C:</span> ≥40</div>
            </div>
          </div>
        </motion.section>

        {/* District Liquidity Table */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            District Liquidity Metrics
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {metricsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading metrics...</div>
            ) : metrics.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No metrics computed yet. Click <strong>Recompute Now</strong> to generate.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="px-4 py-2.5 text-left">District</th>
                      <th className="px-3 py-2.5 text-left">Segment</th>
                      <th className="px-3 py-2.5 text-center">LSI</th>
                      <th className="px-3 py-2.5 text-center">Trend</th>
                      <th className="px-3 py-2.5 text-center">Viewings</th>
                      <th className="px-3 py-2.5 text-center">Offers</th>
                      <th className="px-3 py-2.5 text-center">Closed</th>
                      <th className="px-3 py-2.5 text-center">Close Prob</th>
                      <th className="px-3 py-2.5 text-center">Avg Days</th>
                      <th className="px-3 py-2.5 text-center">Supply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => {
                      const supplyRatio = m.supply_demand_ratio;
                      const supplyKey = supplyRatio < 0.5 ? 'critical_shortage' : supplyRatio < 1 ? 'undersupplied' : supplyRatio < 2 ? 'balanced' : 'oversupplied';
                      const supplyStyle = SUPPLY_COLORS[supplyKey];
                      return (
                        <tr key={m.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{m.district}</td>
                          <td className="px-3 py-3 text-muted-foreground capitalize">{m.segment_type}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-bold text-primary">{m.liquidity_strength_index}</span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <TrendIcon trend={m.momentum_trend} />
                              <span className="text-xs capitalize">{m.momentum_trend}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">{m.viewing_count_30d}</td>
                          <td className="px-3 py-3 text-center">{m.offer_count_30d}</td>
                          <td className="px-3 py-3 text-center font-medium">{m.closed_count_30d}</td>
                          <td className="px-3 py-3 text-center">{m.deal_close_probability}%</td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {m.avg_days_to_close || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${supplyStyle.bg} ${supplyStyle.text}`}>
                              {supplyKey.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.section>

        {/* Top Property Liquidity Scores */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Top Property Liquidity Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(propScores.length > 0 ? propScores.slice(0, 6) : Array.from({ length: 3 }, (_, i) => ({
              id: `placeholder-${i}`,
              property_id: `—`,
              liquidity_score: 0,
              liquidity_grade: 'C',
              viewing_velocity: 0,
              offer_momentum: 0,
              inquiry_intensity: 0,
              price_competitiveness: 0,
              days_on_market: 0,
              last_signal_at: null,
            }))).map((ps: any) => (
              <div key={ps.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[160px]">{ps.property_id}</span>
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded"
                    style={{
                      color: GRADE_COLORS[ps.liquidity_grade] || GRADE_COLORS.C,
                      backgroundColor: `${GRADE_COLORS[ps.liquidity_grade] || GRADE_COLORS.C}15`,
                    }}
                  >
                    {ps.liquidity_grade}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-3">{ps.liquidity_score}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">View Velocity</span>
                    <span className="font-medium">{ps.viewing_velocity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offer Mom.</span>
                    <span className="font-medium">{ps.offer_momentum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inquiry Int.</span>
                    <span className="font-medium">{ps.inquiry_intensity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days Listed</span>
                    <span className="font-medium">{ps.days_on_market}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Intelligence Architecture Summary */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Signal → Metric Transformation Pipeline
          </h2>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Signal Capture', items: ['property_viewings', 'property_offers', 'escrow_transactions', 'ai_event_signals'], icon: Zap },
                { title: 'Weight Application', items: ['Viewing: 10%', 'Offer: 25%', 'Escrow: 35%', 'Closed: 30%'], icon: BarChart3 },
                { title: 'Metric Computation', items: ['Viewing velocity', 'Offer conversion rate', 'Close probability', 'Supply-demand ratio'], icon: Activity },
                { title: 'Output Intelligence', items: ['LSI per district', 'Property grade (A+–F)', 'Hotspot zones view', 'Opportunity score boost'], icon: TrendingUp },
              ].map((step, i) => (
                <div key={step.title} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                    <h4 className="text-sm font-semibold">{step.title}</h4>
                  </div>
                  <ul className="space-y-1">
                    {step.items.map(item => (
                      <li key={item} className="text-xs text-muted-foreground flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-8 -right-2 text-muted-foreground">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default LiquidityIntelligenceEngine;
