import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { getCurrencyFormatter } from '@/stores/currencyStore';
import { useTranslation } from '@/i18n/useTranslation';

interface PropertyRecord {
  price: number;
  city: string | null;
  property_type: string | null;
  area_sqm: number | null;
}

const PRICE_BUCKETS = [
  { min: 0, max: 500_000_000, label: '<500M' },
  { min: 500_000_000, max: 1_000_000_000, label: '500M-1B' },
  { min: 1_000_000_000, max: 2_000_000_000, label: '1B-2B' },
  { min: 2_000_000_000, max: 5_000_000_000, label: '2B-5B' },
  { min: 5_000_000_000, max: Infinity, label: '5B+' },
];

const CHART_COLORS: Record<string, string> = {
  house: 'hsl(var(--primary))',
  apartment: 'hsl(var(--chart-1))',
  villa: 'hsl(var(--chart-3))',
  land: 'hsl(var(--chart-5))',
  commercial: 'hsl(var(--chart-2))',
  other: 'hsl(var(--chart-4))',
};

const PriceDistribution = () => {
  const { t } = useTranslation();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['price-distribution-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, city, property_type, area_sqm')
        .eq('status', 'active')
        .eq('approval_status', 'approved');
      if (error) throw error;
      return (data || []) as PropertyRecord[];
    },
  });

  const histogramData = useMemo(() => {
    if (!properties) return [];
    const types = [...new Set(properties.map(p => p.property_type || 'other'))];
    return PRICE_BUCKETS.map(bucket => {
      const row: Record<string, any> = { range: bucket.label };
      types.forEach(t => {
        row[t] = properties.filter(p =>
          (p.property_type || 'other') === t && p.price >= bucket.min && p.price < bucket.max
        ).length;
      });
      return row;
    });
  }, [properties]);

  const pricePerSqmData = useMemo(() => {
    if (!properties) return [];
    const cityMap: Record<string, { total: number; count: number }> = {};
    properties.forEach(p => {
      if (!p.city || !p.area_sqm || p.area_sqm <= 0) return;
      if (!cityMap[p.city]) cityMap[p.city] = { total: 0, count: 0 };
      cityMap[p.city].total += p.price / p.area_sqm;
      cityMap[p.city].count++;
    });
    return Object.entries(cityMap)
      .map(([city, { total, count }]) => ({ city, pricePerSqm: Math.round(total / count) }))
      .sort((a, b) => b.pricePerSqm - a.pricePerSqm)
      .slice(0, 10);
  }, [properties]);

  const propertyTypes = useMemo(() => {
    if (!properties) return [];
    return [...new Set(properties.map(p => p.property_type || 'other'))];
  }, [properties]);

  if (isLoading) {
    return <div className="space-y-3">{[1,2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-48 bg-muted rounded" /></CardContent></Card>)}</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t('analytics.priceDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          {histogramData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">{t('common.noData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {propertyTypes.map(type => (
                  <Bar key={type} dataKey={type} stackId="a" fill={CHART_COLORS[type] || 'hsl(var(--chart-4))'} name={type} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm">{t('analytics.pricePerSqm')}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          {pricePerSqmData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">{t('analytics.noAreaData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, pricePerSqmData.length * 40)}>
              <BarChart data={pricePerSqmData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(value: number) => getCurrencyFormatter()(value)} />
                <Bar dataKey="pricePerSqm" name="Price/m²" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceDistribution;
