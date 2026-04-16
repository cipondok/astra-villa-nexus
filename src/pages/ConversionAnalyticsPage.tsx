import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingDown, MousePointerClick, Funnel } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const ConversionAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);

  // Drop-off rates
  const { data: dropoffs } = useQuery({
    queryKey: ['dropoff-rates', days],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_dropoff_rates', { p_days: days });
      return (data || []) as { flow_name: string; started: number; completed: number; abandoned: number; completion_rate: number }[];
    },
  });

  // CTA performance
  const { data: ctaData } = useQuery({
    queryKey: ['cta-performance', days],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_cta_performance', { p_days: days });
      return (data || []) as { element_id: string; page_path: string; click_count: number; unique_clickers: number }[];
    },
  });

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('conversionAnalytics.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t('conversionAnalytics.subtitle')}</p>
          </div>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('conversionAnalytics.last7Days')}</SelectItem>
              <SelectItem value="30">{t('conversionAnalytics.last30Days')}</SelectItem>
              <SelectItem value="90">{t('conversionAnalytics.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Drop-Off Rates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              {t('conversionAnalytics.dropOffRates')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dropoffs && dropoffs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-muted-foreground font-medium">{t('conversionAnalytics.flow')}</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">{t('conversionAnalytics.started')}</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">{t('conversionAnalytics.completed')}</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">{t('conversionAnalytics.abandoned')}</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">{t('conversionAnalytics.completionRate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropoffs.map((row) => (
                      <tr key={row.flow_name} className="border-b border-border/20">
                        <td className="py-2 font-medium text-foreground capitalize">{row.flow_name?.replace(/_/g, ' ')}</td>
                        <td className="text-right py-2 text-muted-foreground">{row.started}</td>
                        <td className="text-right py-2 text-chart-1">{row.completed}</td>
                        <td className="text-right py-2 text-destructive">{row.abandoned}</td>
                        <td className="text-right py-2">
                          <Badge variant={Number(row.completion_rate) > 50 ? 'default' : 'destructive'} className="text-[10px]">
                            {row.completion_rate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">{t('conversionAnalytics.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* CTA Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              {t('conversionAnalytics.ctaPerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ctaData && ctaData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-muted-foreground font-medium">{t('conversionAnalytics.element')}</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">{t('conversionAnalytics.page')}</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">{t('conversionAnalytics.clicks')}</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">{t('conversionAnalytics.uniqueUsers')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctaData.map((row, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="py-2 font-medium text-foreground font-mono text-[10px]">{row.element_id}</td>
                        <td className="py-2 text-muted-foreground">{row.page_path}</td>
                        <td className="text-right py-2 text-foreground">{row.click_count}</td>
                        <td className="text-right py-2 text-muted-foreground">{row.unique_clickers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">{t('conversionAnalytics.noData')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionAnalyticsPage;
