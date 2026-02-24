import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, TrendingDown, Home, Ruler, BedDouble } from 'lucide-react';
import { formatIDR } from '@/utils/currency';
import { useTranslation } from '@/i18n/useTranslation';

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

interface PropertyRecord {
  price: number;
  city: string | null;
  area_sqm: number | null;
  bedrooms: number | null;
  created_at: string;
}

interface CityInsight {
  city: string;
  avgPrice: number;
  listings: number;
  avgSize: number;
  avgBedrooms: number;
  newThisMonth: number;
  newLastMonth: number;
}

const NeighborhoodInsights = () => {
  const { t } = useTranslation();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['neighborhood-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, city, area_sqm, bedrooms, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved');
      if (error) throw error;
      return (data || []) as PropertyRecord[];
    },
  });

  const insights = useMemo((): CityInsight[] => {
    if (!properties) return [];
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const cityMap: Record<string, PropertyRecord[]> = {};
    properties.forEach(p => {
      const city = p.city || 'Unknown';
      if (!cityMap[city]) cityMap[city] = [];
      cityMap[city].push(p);
    });

    return Object.entries(cityMap)
      .map(([city, props]) => {
        const prices = props.map(p => p.price);
        const sizes = props.filter(p => p.area_sqm).map(p => p.area_sqm!);
        const beds = props.filter(p => p.bedrooms).map(p => p.bedrooms!);
        return {
          city,
          avgPrice: Math.round(prices.reduce((s, v) => s + v, 0) / prices.length),
          listings: props.length,
          avgSize: sizes.length ? Math.round(sizes.reduce((s, v) => s + v, 0) / sizes.length) : 0,
          avgBedrooms: beds.length ? Math.round((beds.reduce((s, v) => s + v, 0) / beds.length) * 10) / 10 : 0,
          newThisMonth: props.filter(p => new Date(p.created_at) >= thisMonthStart).length,
          newLastMonth: props.filter(p => {
            const d = new Date(p.created_at);
            return d >= lastMonthStart && d < thisMonthStart;
          }).length,
        };
      })
      .sort((a, b) => b.listings - a.listings);
  }, [properties]);

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>)}</div>;
  }

  if (insights.length === 0) {
    return (
      <Card className="bg-transparent dark:bg-muted/10 border-border/30">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.slice(0, 9).map(city => {
          const supplyChange = city.newLastMonth > 0
            ? ((city.newThisMonth - city.newLastMonth) / city.newLastMonth) * 100
            : city.newThisMonth > 0 ? 100 : 0;

          return (
            <Card key={city.city} className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs md:text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {city.city}
                  </span>
                  <Badge variant="secondary" className="text-[9px]">{city.listings} {t('analytics.listings').toLowerCase()}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('analytics.avgPrice')}:</span>
                  </div>
                  <span className="font-semibold text-right">{formatIDR(city.avgPrice)}</span>

                  {city.avgSize > 0 && (
                    <>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('analytics.avgSize')}:</span>
                      </div>
                      <span className="font-semibold text-right">{formatNumber(city.avgSize)} m²</span>
                    </>
                  )}

                  {city.avgBedrooms > 0 && (
                    <>
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('analytics.avgBeds')}:</span>
                      </div>
                      <span className="font-semibold text-right">{city.avgBedrooms}</span>
                    </>
                  )}

                  <div className="col-span-2 pt-1 border-t border-border/30 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('analytics.supplyThisMonth')}:</span>
                      <span className="flex items-center gap-0.5 font-medium">
                        {supplyChange >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-chart-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        {city.newThisMonth} ({supplyChange >= 0 ? '+' : ''}{supplyChange.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm">{t('analytics.cityRankings')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {insights.slice(0, 10).map((city, i) => (
              <div key={city.city} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-xs font-medium">{city.city}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{city.listings} {t('analytics.listings').toLowerCase()}</span>
                  <span className="font-semibold text-foreground">{formatIDR(city.avgPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeighborhoodInsights;
