import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Users, TrendingUp, Shield, BarChart3, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminPortfolioStats } from '@/hooks/usePortfolioIntelligence';

const formatCurrency = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

export default function AdminInvestorEconomics() {
  const { data: stats, isLoading } = useAdminPortfolioStats();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const s = stats || { total_aum: 0, investor_count: 0, avg_roi: 0, avg_risk_score: 0, avg_diversification: 0, top_cities: [] };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Investor Economics Command Center
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide investor portfolio intelligence</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total AUM (Proxy)', value: formatCurrency(s.total_aum), icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Active Investors', value: s.investor_count, icon: Users, color: 'text-blue-400' },
          { label: 'Avg ROI', value: `${s.avg_roi}%`, icon: TrendingUp, color: s.avg_roi >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Avg Risk Score', value: s.avg_risk_score, icon: Shield, color: 'text-amber-400' },
          { label: 'Avg Diversification', value: `${s.avg_diversification}%`, icon: Globe, color: 'text-primary' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Cities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Top Investment Cities by AUM
          </CardTitle>
        </CardHeader>
        <CardContent>
          {s.top_cities && s.top_cities.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={s.top_cities}>
                <XAxis dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(v: number) => `${(v / 1e9).toFixed(0)}B`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No investor portfolio data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
