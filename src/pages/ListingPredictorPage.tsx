import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Search, Loader2, Sparkles, TrendingUp, Eye, Clock,
  Users, Shield, Lightbulb, ChevronRight, Target, Flame, Award,
} from 'lucide-react';
import { useListingPerformancePredictor, ListingPerformancePrediction } from '@/hooks/useListingPerformancePredictor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';

const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  A: { color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20', label: 'Excellent' },
  B: { color: 'text-primary', bg: 'bg-primary/10 border-primary/20', label: 'Good' },
  C: { color: 'text-gold-primary', bg: 'bg-gold-primary/10 border-gold-primary/20', label: 'Average' },
  D: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', label: 'Needs Work' },
};

const INTEREST_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  very_high: { color: 'text-green-600', icon: Flame },
  high: { color: 'text-primary', icon: TrendingUp },
  moderate: { color: 'text-gold-primary', icon: Users },
  low: { color: 'text-muted-foreground', icon: Users },
};

export default function ListingPredictorPage() {
  const [inputId, setInputId] = useState('');
  const [activeId, setActiveId] = useState<string | undefined>();
  const { data, isLoading, error } = useListingPerformancePredictor(activeId);

  const handleAnalyze = () => {
    const trimmed = inputId.trim();
    if (trimmed) setActiveId(trimmed);
  };

  const grade = data ? GRADE_CONFIG[data.performance_grade] || GRADE_CONFIG.D : null;
  const interest = data ? INTEREST_CONFIG[data.buyer_interest] || INTEREST_CONFIG.low : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-primary/5" />
        <div className="container mx-auto max-w-4xl px-4 py-8 md:py-10 relative">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
                <BarChart3 className="h-5 w-5 text-gold-primary" />
              </div>
              <Badge variant="outline" className="border-gold-primary/30 text-gold-primary text-xs">AI Predictor</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Listing Performance Predictor
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Predict how your listing will perform before publishing. Get estimated views, time to sell, and actionable tips.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card p-5"
        >
          <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Enter Property ID
          </label>
          <div className="flex gap-2">
            <Input
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              placeholder="Paste property ID (UUID)..."
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              className="flex-1 rounded-xl bg-muted/30 border-border/50"
            />
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !inputId.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-5"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              Predict
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Find the property ID from the property detail URL: /properties/<span className="text-primary">uuid-here</span>
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
            <p className="text-sm text-destructive font-medium">Analysis failed</p>
            <p className="text-xs text-destructive/70 mt-1">{(error as Error).message || 'Property not found or invalid ID'}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {data && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Performance Score + Grade Hero */}
              <div className="grid sm:grid-cols-[1fr_200px] gap-4">
                <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" /> Performance Score
                    </h3>
                    {grade && (
                      <div className={cn('px-3 py-1 rounded-lg border text-sm font-bold', grade.bg, grade.color)}>
                        Grade {data.performance_grade} — {grade.label}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-foreground">{data.performance_score}</span>
                      <span className="text-sm text-muted-foreground mb-1">/100</span>
                    </div>
                    <Progress value={data.performance_score} className="h-2.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    Confidence: {data.confidence_score}%  •  Speed: {data.speed_category}
                  </div>
                </div>

                {/* Radar */}
                <div className="rounded-2xl border border-border/50 bg-card p-3 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <RadarChart data={[
                      { m: 'Price', v: data.factors.price_competitiveness },
                      { m: 'Demand', v: data.factors.location_demand },
                      { m: 'Invest.', v: data.factors.investment_score },
                    ]}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="m" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  icon={Eye}
                  label="Predicted Monthly Views"
                  value={data.predicted_monthly_views.toLocaleString()}
                  sub="estimated"
                />
                <MetricCard
                  icon={Clock}
                  label="Days to Sell"
                  value={`~${data.predicted_days_to_sell}`}
                  sub={data.speed_category}
                />
                <MetricCard
                  icon={interest?.icon || Users}
                  label="Buyer Interest"
                  value={data.buyer_interest.replace('_', ' ')}
                  sub="demand level"
                  valueClass={interest?.color}
                />
                <MetricCard
                  icon={BarChart3}
                  label="Competition"
                  value={data.factors.competition_level}
                  sub={`${data.factors.competition_count} competitors`}
                />
              </div>

              {/* Factors Breakdown */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold-primary" /> Factor Analysis
                </h3>
                <div className="space-y-3">
                  <FactorBar label="Price Competitiveness" value={data.factors.price_competitiveness} detail={data.factors.price_position} />
                  <FactorBar label="Location Demand" value={data.factors.location_demand} />
                  <FactorBar label="Investment Score" value={data.factors.investment_score} />
                </div>
              </div>

              {/* Tips */}
              {data.tips.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-gold-primary" /> Improvement Tips
                  </h3>
                  <div className="space-y-2">
                    {data.tips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06 } }}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/30"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground leading-relaxed">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!data && !isLoading && !error && !activeId && (
          <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-dashed border-border/50 bg-muted/10">
            <div className="p-4 rounded-2xl bg-muted/30 mb-4">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Enter a property ID to predict performance</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Get views, days to sell, and optimization tips</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, valueClass }: {
  icon: React.ElementType; label: string; value: string; sub: string; valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-lg font-bold capitalize', valueClass || 'text-foreground')}>{value}</p>
      <p className="text-[10px] text-muted-foreground capitalize">{sub}</p>
    </div>
  );
}

function FactorBar({ label, value, detail }: { label: string; value: number; detail?: string }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-gold-primary' : 'bg-destructive';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {detail && <span className="text-[10px] text-muted-foreground capitalize">{detail}</span>}
          <span className="text-xs font-bold text-foreground">{value}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
