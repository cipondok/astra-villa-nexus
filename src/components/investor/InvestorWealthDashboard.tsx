import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, TrendingDown, Wallet, BarChart3, Shield, Brain,
  RefreshCw, Loader2, AlertTriangle, Target, DollarSign, PieChart,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import {
  useInvestorPortfolio, usePortfolioAssets, usePortfolioValueHistory,
  useWealthForecasts, usePortfolioRiskMetrics, usePortfolioRecommendations,
  useEnsurePortfolio, useValuatePortfolio, useForecastWealth,
  useAnalyzePortfolioRisk, useGeneratePortfolioRecommendations,
} from '@/hooks/usePortfolioIntelligence';

const formatCurrency = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

const actionColors: Record<string, string> = {
  buy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  hold: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rebalance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  exit: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function InvestorWealthDashboard() {
  const { data: ensured } = useEnsurePortfolio();
  const portfolioId = ensured?.id;
  const { data: portfolio, isLoading } = useInvestorPortfolio();
  const { data: assets } = usePortfolioAssets(portfolioId);
  const { data: history } = usePortfolioValueHistory(portfolioId);
  const { data: forecasts } = useWealthForecasts(portfolioId);
  const { data: risk } = usePortfolioRiskMetrics(portfolioId);
  const { data: recommendations } = usePortfolioRecommendations(portfolioId);

  const valuate = useValuatePortfolio();
  const forecast = useForecastWealth();
  const analyzeRisk = useAnalyzePortfolioRisk();
  const genRecs = useGeneratePortfolioRecommendations();

  const runAll = () => {
    if (!portfolioId) return;
    valuate.mutate(portfolioId);
    setTimeout(() => forecast.mutate(portfolioId), 1000);
    setTimeout(() => analyzeRisk.mutate(portfolioId), 2000);
    setTimeout(() => genRecs.mutate(portfolioId), 3000);
  };

  const isRunning = valuate.isPending || forecast.isPending || analyzeRisk.isPending || genRecs.isPending;

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const gain = portfolio?.unrealized_gain_loss || 0;
  const totalValue = portfolio?.current_estimated_value || 0;
  const invested = portfolio?.total_invested_amount || 0;
  const roi = invested > 0 ? ((totalValue - invested) / invested * 100) : 0;

  const radarData = [
    { metric: 'Diversification', value: portfolio?.diversification_score || 0 },
    { metric: 'Liquidity', value: portfolio?.portfolio_liquidity_score || 0 },
    { metric: 'Growth', value: Math.min(100, Math.max(0, roi)) },
    { metric: 'Risk Control', value: 100 - (portfolio?.risk_exposure_score || 0) },
    { metric: 'Yield', value: Math.min(100, (assets?.length || 0) * 15) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Wealth Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered portfolio monitoring & growth optimization</p>
        </div>
        <Button onClick={runAll} disabled={isRunning || !portfolioId} size="sm" className="gap-2">
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Run Full Analysis
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className={gain >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Unrealized Gain/Loss</p>
            <p className={`text-xl font-bold flex items-center gap-1 ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {gain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(Math.abs(gain))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Weighted ROI</p>
            <p className={`text-xl font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Risk Exposure</p>
            <div className="flex items-center gap-2">
              <Progress value={portfolio?.risk_exposure_score || 0} className="flex-1 h-2" />
              <span className="text-sm font-medium text-foreground">{portfolio?.risk_exposure_score || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="ai">AI Advisor</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Portfolio Value Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={history}>
                      <XAxis dataKey="snapshot_date" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Line type="monotone" dataKey="total_value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    Run analysis to generate portfolio history
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" /> Portfolio Health Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trust message */}
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="py-3 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                ASTRA Wealth Intelligence continuously monitors and optimizes your property investment growth.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Asset Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              {assets && assets.length > 0 ? (
                <div className="space-y-3">
                  {assets.map((a: any, i: number) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.property_id?.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(a.current_estimated_value || 0)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${(a.asset_roi || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(a.asset_roi || 0) >= 0 ? '+' : ''}{(a.asset_roi || 0).toFixed(1)}%
                        </p>
                        <Badge variant="outline" className="text-[10px]">{a.asset_status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No assets tracked yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {forecasts && forecasts.length > 0 ? forecasts.map((f: any) => (
              <Card key={f.id} className="border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{f.forecast_horizon_months}-Month Forecast</span>
                    <Badge variant="outline" className="text-[10px]">{f.confidence_score}% confidence</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Value</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(f.projected_portfolio_value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Cashflow</p>
                    <p className="text-sm font-medium text-emerald-400">{formatCurrency(f.projected_cashflow)}</p>
                  </div>
                  <Progress value={f.confidence_score} className="h-1" />
                </CardContent>
              </Card>
            )) : (
              <Card className="col-span-3">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  Run wealth forecast to see projections
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {risk ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">City Concentration</span>
                      <div className="flex items-center gap-2">
                        <Progress value={risk.city_concentration_ratio} className="w-24 h-2" />
                        <span className="text-sm font-medium">{risk.city_concentration_ratio}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Liquidity Exposure</span>
                      <div className="flex items-center gap-2">
                        <Progress value={risk.liquidity_exposure} className="w-24 h-2" />
                        <span className="text-sm font-medium">{risk.liquidity_exposure}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">High-Risk Assets</span>
                      <span className="text-sm font-medium">{risk.high_risk_asset_pct}%</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Run risk analysis to see metrics</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {risk?.alerts && (risk.alerts as string[]).length > 0 ? (
                  <div className="space-y-2">
                    {(risk.alerts as string[]).map((alert: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{alert}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No risk alerts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Advisor Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> AI Portfolio Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations && recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${actionColors[r.suggested_action]} border`}>
                          {r.suggested_action.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Impact: {r.expected_impact_score}/100</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.reasoning_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Run AI analysis to receive personalized recommendations
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
