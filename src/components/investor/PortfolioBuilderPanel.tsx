import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { usePortfolioBuilder, PortfolioItem, PortfolioBuilderResult } from '@/hooks/usePortfolioBuilder';
import {
  Briefcase, TrendingUp, Shield, Sparkles, Building2, MapPin,
  DollarSign, Loader2, PieChart, BarChart3, Target, Zap,
} from 'lucide-react';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import ScenarioComparison from './ScenarioComparison';
import FinancingSimulation from './FinancingSimulation';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const RISK_OPTIONS = [
  { value: 'low' as const, label: 'Konservatif', icon: Shield, desc: 'Risiko rendah, diversifikasi tinggi' },
  { value: 'medium' as const, label: 'Moderat', icon: Target, desc: 'Keseimbangan risiko & return' },
  { value: 'high' as const, label: 'Agresif', icon: Zap, desc: 'Risiko tinggi, potensi return besar' },
];

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const RISK_COLOR: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function PortfolioBuilderPanel() {
  const [budget, setBudget] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [horizon, setHorizon] = useState('5');
  const mutation = usePortfolioBuilder();
  const result = mutation.data;

  const handleGenerate = () => {
    const budgetNum = Number(budget.replace(/\D/g, ''));
    if (!budgetNum || budgetNum < 100_000_000) return;
    mutation.mutate({ budget: budgetNum, risk_level: riskLevel, investment_horizon: Number(horizon) || 5 });
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5 text-primary" />
            AI Portfolio Builder
          </CardTitle>
          <CardDescription>Buat portfolio investasi properti yang terdiversifikasi secara otomatis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Budget Investasi</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g. 10000000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))}
                className="pl-9"
              />
            </div>
            {budget && <p className="text-xs text-muted-foreground">{formatIDR(Number(budget))}</p>}
          </div>

          {/* Risk Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Toleransi Risiko</label>
            <div className="grid grid-cols-3 gap-3">
              {RISK_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRiskLevel(opt.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    riskLevel === opt.value
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <opt.icon className={`h-4 w-4 mb-1 ${riskLevel === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Horizon */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Horizon Investasi (tahun)</label>
            <div className="flex gap-2">
              {['3', '5', '7', '10'].map(y => (
                <Button
                  key={y}
                  variant={horizon === y ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHorizon(y)}
                >
                  {y} Tahun
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={mutation.isPending || !budget || Number(budget) < 100_000_000}
            className="w-full"
            size="lg"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Menganalisis...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Portfolio</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Dialokasikan" value={formatIDR(result.total_allocated)} icon={DollarSign} />
              <StatCard label={`Proyeksi ROI ${result.investment_horizon}Y`} value={`${result.projected_roi}%`} icon={TrendingUp} />
              <StatCard label="Yield Rata-rata" value={`${result.weighted_yield}%`} icon={BarChart3} />
              <StatCard label="Tingkat Risiko" value={result.risk_level.toUpperCase()} icon={Shield} badge={RISK_COLOR[result.risk_level]} />
            </div>

            {/* Diversification + Allocation Chart */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" /> Alokasi Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={result.portfolio.map(p => ({ name: p.city, value: p.allocation_percent }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          stroke="none"
                        >
                          {result.portfolio.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v}%`} />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.portfolio.map((p, i) => (
                      <div key={p.property_id} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {p.city} ({p.allocation_percent}%)
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Diversifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Skor Diversifikasi</span>
                      <span className="text-foreground font-medium">{result.diversification.score}/100</span>
                    </div>
                    <Progress value={result.diversification.score} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Kota:</span>
                      <div className="flex gap-1 flex-wrap">
                        {result.diversification.cities.map(c => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Tipe:</span>
                      <div className="flex gap-1 flex-wrap">
                        {result.diversification.types.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    {result.candidates_scanned} properti discan • {result.diversification.count} terpilih
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property List */}
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-sm">Properti dalam Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.portfolio.map((item, idx) => (
                  <PropertyCard key={item.property_id} item={item} index={idx} horizon={result.investment_horizon} />
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="border-primary/30 bg-primary/5 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">AI Recommendation</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, badge }: { label: string; value: string; icon: any; badge?: string }) {
  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        {badge ? (
          <Badge className={`text-base font-bold ${badge}`}>{value}</Badge>
        ) : (
          <p className="text-lg font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PropertyCard({ item, index, horizon }: { item: PortfolioItem; index: number; horizon: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex gap-3 p-3 rounded-lg border border-border bg-background/50 hover:border-primary/30 transition-colors"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {item.city}
              {item.property_type && <span>• {item.property_type}</span>}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{item.allocation_percent}%</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <MiniStat label="Harga" value={formatIDR(item.price)} />
          <MiniStat label={`ROI ${horizon}Y`} value={`${item.total_roi}%`} />
          <MiniStat label="Yield" value={`${item.estimated_yield}%`} />
          <MiniStat label="Score" value={`${item.investment_score}`} />
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
