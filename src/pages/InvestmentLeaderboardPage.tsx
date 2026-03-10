import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, Shield, ShieldAlert, ShieldCheck,
  MapPin, Bed, Bath, Maximize2, Search, ArrowUpDown,
  BarChart3, Target, Flame, Loader2, Star, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useInvestmentLeaderboard, useInvestmentScoreStats, LeaderboardProperty } from '@/hooks/useInvestmentScores';
import { cn } from '@/lib/utils';

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)} M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)} jt`;
  return `Rp ${price.toLocaleString()}`;
};

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  'A': 'bg-green-500/15 text-green-500 border-green-500/30',
  'B+': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  'B': 'bg-sky-500/15 text-sky-500 border-sky-500/30',
  'C': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'D': 'bg-destructive/15 text-destructive border-destructive/30',
};

const RISK_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  low: { icon: ShieldCheck, label: 'Low Risk', color: 'text-emerald-500' },
  medium: { icon: Shield, label: 'Medium Risk', color: 'text-amber-500' },
  high: { icon: ShieldAlert, label: 'High Risk', color: 'text-destructive' },
};

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-primary' : score >= 35 ? 'stroke-amber-500' : 'stroke-destructive';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" className="stroke-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" className={color} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold', size > 50 ? 'text-lg' : 'text-sm',
          score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-primary' : score >= 35 ? 'text-amber-500' : 'text-destructive'
        )}>{score}</span>
      </div>
    </div>
  );
}

function LeaderboardCard({ property, rank, onClick }: { property: LeaderboardProperty; rank: number; onClick: () => void }) {
  const img = property.thumbnail_url || property.images?.[0] || '/placeholder.svg';
  const risk = RISK_CONFIG[property.risk_level] || RISK_CONFIG.medium;
  const RiskIcon = risk.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.03 }}
    >
      <Card
        className="overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-card border-border/50"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Rank & Score */}
            <div className="flex flex-col items-center justify-center w-20 py-4 bg-muted/20 border-r border-border/30 shrink-0">
              <span className={cn(
                'text-2xl font-black',
                rank <= 3 ? 'text-primary' : 'text-muted-foreground'
              )}>
                {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
              </span>
              <ScoreRing score={property.investment_score} size={48} />
              <Badge variant="outline" className={cn('text-[9px] mt-1', GRADE_COLORS[property.grade] || GRADE_COLORS['C'])}>
                {property.grade}
              </Badge>
            </div>

            {/* Image */}
            <div className="relative w-32 sm:w-40 shrink-0">
              <img src={img} alt={property.title || ''} className="w-full h-full object-cover"
                loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              {property.price && (
                <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold shadow-md">
                  {formatPrice(property.price)}
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-3 min-w-0">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{property.title || 'Untitled Property'}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">{property.city}{property.state ? `, ${property.state}` : ''}</span>
              </p>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-medium text-foreground">{property.roi_forecast}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Yield</span>
                  <span className="font-medium text-foreground">{property.rental_yield}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Growth</span>
                  <span className={cn('font-medium', property.growth_prediction > 0 ? 'text-emerald-500' : 'text-destructive')}>
                    {property.growth_prediction > 0 ? '+' : ''}{property.growth_prediction}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <RiskIcon className={cn('h-3 w-3', risk.color)} />
                  <span className={cn('text-xs font-medium', risk.color)}>{risk.label}</span>
                </div>
              </div>

              {/* Property specs */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {(property.bedrooms ?? 0) > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
                {(property.bathrooms ?? 0) > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
                {property.area_sqm && <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" />{property.area_sqm}m²</span>}
                <Badge variant="outline" className="text-[9px] ml-auto">{property.property_type}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function InvestmentLeaderboardPage() {
  const [cityFilter, setCityFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const navigate = useNavigate();

  const { data: properties = [], isLoading } = useInvestmentLeaderboard({
    limit: 100,
    riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
    minScore,
    city: cityFilter || undefined,
  });
  const { data: stats } = useInvestmentScoreStats();

  const filteredProperties = useMemo(() => {
    if (!cityFilter) return properties;
    return properties.filter(p =>
      p.city?.toLowerCase().includes(cityFilter.toLowerCase()) ||
      p.state?.toLowerCase().includes(cityFilter.toLowerCase())
    );
  }, [properties, cityFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Investment Leaderboard</h1>
              <p className="text-xs text-muted-foreground">Properti dengan skor investasi tertinggi — powered by ASTRA AI</p>
            </div>
          </div>

          {/* Stats bar */}
          {stats && stats.total > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total Scored</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-primary">{stats.avgScore}</p>
                  <p className="text-[10px] text-muted-foreground">Avg Score</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-emerald-500">{stats.gradeDistribution['A+'] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">A+ Properties</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-emerald-500">{stats.riskDistribution['low'] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Low Risk</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto max-w-5xl px-4 py-4">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city..."
              className="pl-10 h-9 text-sm bg-card border-border/60"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(minScore)} onValueChange={(v) => setMinScore(Number(v))}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Target className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Min Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Scores</SelectItem>
              <SelectItem value="50">Score ≥ 50</SelectItem>
              <SelectItem value="60">Score ≥ 60</SelectItem>
              <SelectItem value="75">Score ≥ 75</SelectItem>
              <SelectItem value="85">Score ≥ 85</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Trophy className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada data skor investasi</p>
            <p className="text-xs mt-1">Jalankan job "calculate_investment_scores" dari Admin Command Center</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((p, i) => (
              <LeaderboardCard
                key={p.property_id}
                property={p}
                rank={i + 1}
                onClick={() => navigate(`/property/${p.property_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
