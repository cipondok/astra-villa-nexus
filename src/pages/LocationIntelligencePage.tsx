import React, { useState, useMemo } from 'react';
import { useLocationIntelligence, AreaIntelligence } from '@/hooks/useLocationIntelligence';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, TrendingUp, BarChart3, Flame, Building2, Eye, Heart } from 'lucide-react';
import { formatCurrencyIDR, formatCurrencyIDRShort, formatNumberID } from '@/lib/indonesianFormat';
import { cn } from '@/lib/utils';

const heatColors: Record<string, string> = {
  very_hot: 'bg-destructive/15 text-destructive border-destructive/30',
  hot: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  warm: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  cool: 'bg-muted text-muted-foreground border-border',
};

const heatLabels: Record<string, string> = {
  very_hot: 'Sangat Populer',
  hot: 'Populer',
  warm: 'Hangat',
  cool: 'Stabil',
};

function InvestmentGrade({ score }: { score: number }) {
  let grade: string, color: string;
  if (score >= 80) { grade = 'A+'; color = 'text-chart-1'; }
  else if (score >= 65) { grade = 'A'; color = 'text-chart-1'; }
  else if (score >= 50) { grade = 'B'; color = 'text-chart-1'; }
  else if (score >= 35) { grade = 'C'; color = 'text-chart-4'; }
  else { grade = 'D'; color = 'text-destructive'; }
  return <span className={cn('font-black text-lg', color)}>{grade}</span>;
}

export default function LocationIntelligencePage() {
  const { data, isLoading, error } = useLocationIntelligence();
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof AreaIntelligence>('investment_score');

  const cities = useMemo(() => {
    if (!data?.areas) return [];
    return [...new Set(data.areas.map(a => a.city))].sort();
  }, [data]);

  const filteredAreas = useMemo(() => {
    if (!data?.areas) return [];
    let areas = cityFilter === 'all' ? data.areas : data.areas.filter(a => a.city === cityFilter);
    return [...areas].sort((a, b) => {
      const va = a[sortBy] as number;
      const vb = b[sortBy] as number;
      return vb - va;
    });
  }, [data, cityFilter, sortBy]);

  const summary = useMemo(() => {
    if (!filteredAreas.length) return null;
    return {
      very_hot: filteredAreas.filter(a => a.demand_heat_level === 'very_hot').length,
      hot: filteredAreas.filter(a => a.demand_heat_level === 'hot').length,
      warm: filteredAreas.filter(a => a.demand_heat_level === 'warm').length,
      cool: filteredAreas.filter(a => a.demand_heat_level === 'cool').length,
      avgYield: filteredAreas.reduce((s, a) => s + a.rental_yield, 0) / filteredAreas.length,
      avgGrowth: filteredAreas.reduce((s, a) => s + a.price_growth, 0) / filteredAreas.length,
      avgScore: filteredAreas.reduce((s, a) => s + a.investment_score, 0) / filteredAreas.length,
    };
  }, [filteredAreas]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card><CardContent className="py-12 text-center text-destructive">
          Gagal memuat data intelijen lokasi. Silakan coba lagi.
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Intelijen Lokasi Cerdas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analisis potensi investasi per area di setiap kota — didukung ASTRA AI
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Total Area</p>
              <p className="text-2xl font-bold text-foreground">{filteredAreas.length}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {summary.very_hot > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{summary.very_hot} 🔥</Badge>}
                {summary.hot > 0 && <Badge variant="secondary" className="text-[10px] px-1.5">{summary.hot} Populer</Badge>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Rata-rata Yield</p>
              <p className="text-2xl font-bold text-primary">{summary.avgYield.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">per tahun</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Pertumbuhan Harga</p>
              <p className={cn('text-2xl font-bold', summary.avgGrowth >= 0 ? 'text-chart-1' : 'text-destructive')}>
                {summary.avgGrowth >= 0 ? '+' : ''}{summary.avgGrowth.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">12 bulan terakhir</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Skor Investasi</p>
              <p className="text-2xl font-bold text-foreground">{Math.round(summary.avgScore)}</p>
              <p className="text-[10px] text-muted-foreground">rata-rata dari 100</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Kota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kota</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as keyof AreaIntelligence)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="investment_score">Skor Investasi</SelectItem>
            <SelectItem value="rental_yield">Rental Yield</SelectItem>
            <SelectItem value="price_growth">Pertumbuhan Harga</SelectItem>
            <SelectItem value="demand_heat_score">Permintaan Pasar</SelectItem>
            <SelectItem value="avg_price_per_m2">Harga per m²</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Area Cards Grid */}
      {filteredAreas.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Tidak ada data area tersedia.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map((area, idx) => (
            <Card key={`${area.city}-${area.area}`} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold truncate">{area.area}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {area.city} · {area.total_listings} listing
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <InvestmentGrade score={area.investment_score} />
                    <Badge variant="outline" className={cn('text-[10px] shrink-0', heatColors[area.demand_heat_level])}>
                      {heatLabels[area.demand_heat_level]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Investment Score Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Skor Investasi</span>
                    <span className="font-bold">{area.investment_score}/100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${area.investment_score}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Harga/m²</p>
                      <p className="font-semibold">{formatCurrencyIDRShort(area.avg_price_per_m2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Rental Yield</p>
                      <p className="font-semibold text-primary">{area.rental_yield.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Pertumbuhan</p>
                      <p className={cn('font-semibold', area.price_growth >= 0 ? 'text-chart-1' : 'text-destructive')}>
                        {area.price_growth >= 0 ? '+' : ''}{area.price_growth.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Views/Saves</p>
                      <p className="font-semibold">{formatNumberID(area.views_30d)}/{formatNumberID(area.saves_30d)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data timestamp */}
      {data?.generated_at && (
        <p className="text-[10px] text-muted-foreground text-center">
          Data diperbarui: {new Date(data.generated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
        </p>
      )}
    </div>
  );
}
