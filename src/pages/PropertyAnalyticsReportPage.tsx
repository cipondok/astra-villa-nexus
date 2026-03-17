import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInvestmentReport, type InvestmentReport } from '@/hooks/useInvestmentReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Building, MapPin,
  Target, Search, FileText, Percent, AreaChart, Minus,
} from 'lucide-react';

function formatIDR(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

const TREND_CONFIG = {
  undervalued: { label: 'Undervalued', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: TrendingDown },
  fair_value: { label: 'Fair Value', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', icon: Minus },
  premium: { label: 'Premium', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', icon: TrendingUp },
};

function ReportCard({ report }: { report: InvestmentReport }) {
  const trend = TREND_CONFIG[report.market_trend];
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{report.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[9px]"><MapPin className="h-3 w-3 mr-1" />{report.city}</Badge>
            <Badge variant="secondary" className="text-[9px]">{report.property_type}</Badge>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-xs', trend.bg, trend.color)}>
          <TrendIcon className="h-3 w-3 mr-1" />{trend.label}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Price', value: formatIDR(report.price), icon: DollarSign, color: 'text-primary' },
          { label: 'Avg Area Price', value: formatIDR(report.avg_area_price), icon: BarChart3, color: 'text-chart-2' },
          { label: 'Rental Yield', value: `${report.estimated_rental_yield}%`, icon: Percent, color: 'text-emerald-500' },
          { label: 'Cap Rate', value: `${report.estimated_cap_rate}%`, icon: AreaChart, color: 'text-chart-4' },
        ].map(m => (
          <Card key={m.label} className="bg-muted/10 border-border/30">
            <CardContent className="p-3">
              <m.icon className={cn('h-4 w-4 mb-1', m.color)} />
              <p className="text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Cards */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Investment Scores
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Investment Score</span>
                  <span className="font-medium text-foreground">{report.investment_score ?? 'N/A'}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, report.investment_score ?? 0)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">AI Opportunity</span>
                  <span className="font-medium text-foreground">{report.ai_opportunity_score ?? 'N/A'}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full bg-chart-4 transition-all" style={{ width: `${Math.min(100, report.ai_opportunity_score ?? 0)}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-2" /> Market Position
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">vs Market Avg</span>
                <span className={cn('font-medium', report.price_vs_market < 0 ? 'text-emerald-500' : report.price_vs_market > 10 ? 'text-amber-500' : 'text-foreground')}>
                  {report.price_vs_market > 0 ? '+' : ''}{report.price_vs_market}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Similar Properties</span>
                <span className="text-foreground">{report.similar_properties_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specs</span>
                <span className="text-foreground">{report.bedrooms}KT / {report.bathrooms}KM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="text-foreground">LT {report.land_size}m² · LB {report.building_size}m²</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PropertyAnalyticsReportPage() {
  const [searchId, setSearchId] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data: report, isLoading, error } = useInvestmentReport(selectedId);

  // Load recent properties to pick from
  const { data: recentProperties = [] } = useQuery({
    queryKey: ['recent-properties-for-report'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, city, price, property_type')
        .order('created_at', { ascending: false })
        .limit(12);
      return data || [];
    },
    staleTime: 60_000,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Property Investment Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered investment analysis and market comparison</p>
      </div>

      {/* Search */}
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste property ID or select below..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              className="text-sm"
            />
            <Button onClick={() => setSelectedId(searchId)} disabled={!searchId}>
              <Search className="h-4 w-4 mr-1" /> Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Select */}
      {!selectedId && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Select a property to analyze:</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {recentProperties.map((p: any) => (
              <Card
                key={p.id}
                onClick={() => { setSelectedId(p.id); setSearchId(p.id); }}
                className="bg-card/80 border-border/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[9px]">{p.city}</Badge>
                    <span className="text-xs font-semibold text-primary">{formatIDR(p.price)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>
          <div className="grid grid-cols-2 gap-3"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
        </div>
      )}

      {error && (
        <Card className="bg-destructive/5 border-destructive/30">
          <CardContent className="p-4 text-center text-sm text-destructive">
            Failed to generate report. Please check the property ID.
          </CardContent>
        </Card>
      )}

      {report && <ReportCard report={report} />}

      {report && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => { setSelectedId(undefined); setSearchId(''); }}>
            Analyze Another Property
          </Button>
        </div>
      )}
    </div>
  );
}
