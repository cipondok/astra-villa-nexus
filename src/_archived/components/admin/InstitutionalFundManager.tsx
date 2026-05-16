import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Building2, DollarSign, TrendingUp, Users, Briefcase,
  Calculator, ArrowDownCircle, ArrowUpCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useInvestmentFunds, useFundPositions, useFundAssets,
  useFundNAVHistory, useFundCapitalCalls, useFundDistributions,
  useCalculateNAV, useProcessDistribution, useFundDashboardStats
} from '@/hooks/useInstitutionalFundManager';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#f59e0b', '#10b981', '#8b5cf6'];

const statusColor: Record<string, string> = {
  raising: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-muted text-muted-foreground border-border',
  liquidating: 'bg-destructive/10 text-destructive border-destructive/30',
};

const InstitutionalFundManager = () => {
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const { data: dashStats, isLoading: statsLoading } = useFundDashboardStats();
  const { data: funds } = useInvestmentFunds();
  const { data: positions } = useFundPositions(selectedFundId || undefined);
  const { data: assets } = useFundAssets(selectedFundId || undefined);
  const { data: navHistory } = useFundNAVHistory(selectedFundId || undefined);
  const { data: capitalCalls } = useFundCapitalCalls(selectedFundId || undefined);
  const { data: distributions } = useFundDistributions(selectedFundId || undefined);
  const calculateNAV = useCalculateNAV();
  const processDistribution = useProcessDistribution();

  const stats = dashStats || { total_aum: 0, total_deployed: 0, active_funds: 0, funds: [] };
  const deploymentRatio = stats.total_aum > 0 ? (stats.total_deployed / stats.total_aum) * 100 : 0;

  const navChartData = (navHistory || []).slice().reverse().map((n: any) => ({
    date: new Date(n.valuation_timestamp).toLocaleDateString(),
    nav: n.nav_per_unit,
    value: n.total_fund_value,
  }));

  const assetAllocation = (assets || []).map((a: any) => ({
    name: `Property ${(a.property_id || '').slice(0, 6)}`,
    value: a.current_estimated_value || a.acquisition_cost || 0,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total AUM', value: `$${((stats.total_aum || 0) / 1e6).toFixed(1)}M`, icon: DollarSign, color: 'text-primary' },
          { label: 'Deployed Capital', value: `$${((stats.total_deployed || 0) / 1e6).toFixed(1)}M`, icon: Briefcase, color: 'text-emerald-400' },
          { label: 'Active Funds', value: stats.active_funds || 0, icon: Building2, color: 'text-blue-400' },
          { label: 'Deployment Ratio', value: `${deploymentRatio.toFixed(1)}%`, icon: TrendingUp, color: 'text-amber-400' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-40`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="funds" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50 mb-4">
          <TabsTrigger value="funds">Funds</TabsTrigger>
          <TabsTrigger value="portfolio" disabled={!selectedFundId}>Portfolio</TabsTrigger>
          <TabsTrigger value="nav" disabled={!selectedFundId}>NAV & Valuation</TabsTrigger>
          <TabsTrigger value="cashflows" disabled={!selectedFundId}>Capital Calls & Distributions</TabsTrigger>
          <TabsTrigger value="investors" disabled={!selectedFundId}>Investors</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* FUNDS LIST */}
        <TabsContent value="funds">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Investment Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(funds || []).length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No funds created yet. Fund entities will appear here.</p>
              ) : (
                <div className="space-y-3">
                  {(funds || []).map((fund: any) => (
                    <div
                      key={fund.id}
                      onClick={() => setSelectedFundId(fund.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/30 ${selectedFundId === fund.id ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{fund.fund_name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {fund.fund_type?.replace('_', ' ')} · {fund.jurisdiction_code} · {fund.base_currency}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">${((fund.committed_capital || 0) / 1e6).toFixed(1)}M</p>
                            <p className="text-xs text-muted-foreground">committed</p>
                          </div>
                          <Badge className={statusColor[fund.fund_status] || 'bg-muted'}>
                            {fund.fund_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Deployed: ${((fund.deployed_capital || 0) / 1e6).toFixed(1)}M</span>
                          <span>Target: ${((fund.target_raise_amount || 0) / 1e6).toFixed(1)}M</span>
                        </div>
                        <Progress value={fund.target_raise_amount > 0 ? ((fund.committed_capital || 0) / fund.target_raise_amount) * 100 : 0} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PORTFOLIO */}
        <TabsContent value="portfolio">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Fund Assets</CardTitle>
              </CardHeader>
              <CardContent>
                {(assets || []).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No assets in this fund</p>
                ) : (
                  <div className="space-y-2">
                    {(assets || []).map((a: any) => (
                      <div key={a.id} className="flex justify-between items-center p-3 rounded border border-border/30 bg-muted/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">Property {(a.property_id || '').slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{a.ownership_percentage}% ownership · {a.asset_status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">${(a.current_estimated_value || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Cost: ${(a.acquisition_cost || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {assetAllocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={assetAllocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {assetAllocation.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center text-sm py-6">No allocation data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NAV */}
        <TabsContent value="nav">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" /> NAV History
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedFundId && calculateNAV.mutate({ fund_id: selectedFundId })}
                disabled={calculateNAV.isPending}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${calculateNAV.isPending ? 'animate-spin' : ''}`} />
                Recalculate NAV
              </Button>
            </CardHeader>
            <CardContent>
              {navChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={navChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="nav" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center text-sm py-8">No NAV history. Click Recalculate NAV to generate.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CASHFLOWS */}
        <TabsContent value="cashflows">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-blue-400" /> Capital Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(capitalCalls || []).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No capital calls</p>
                ) : (
                  <div className="space-y-2">
                    {(capitalCalls || []).map((c: any) => (
                      <div key={c.id} className="flex justify-between items-center p-3 rounded border border-border/30">
                        <div>
                          <p className="text-sm font-medium text-foreground">${(c.call_amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Due: {new Date(c.due_date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline" className={c.call_status === 'funded' ? 'text-emerald-400' : 'text-amber-400'}>
                          {c.call_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-emerald-400" /> Distributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(distributions || []).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No distributions</p>
                ) : (
                  <div className="space-y-2">
                    {(distributions || []).map((d: any) => (
                      <div key={d.id} className="flex justify-between items-center p-3 rounded border border-border/30">
                        <div>
                          <p className="text-sm font-medium text-foreground">${(d.distribution_amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.distribution_date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline">{d.distribution_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INVESTORS */}
        <TabsContent value="investors">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Fund Investors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(positions || []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No investor positions</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 text-muted-foreground text-xs">
                        <th className="text-left py-2">Investor</th>
                        <th className="text-right py-2">Committed</th>
                        <th className="text-right py-2">Contributed</th>
                        <th className="text-right py-2">Units</th>
                        <th className="text-right py-2">NAV/Unit</th>
                        <th className="text-right py-2">Unrealized</th>
                        <th className="text-right py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(positions || []).map((p: any) => (
                        <tr key={p.id} className="border-b border-border/20">
                          <td className="py-2 text-foreground">{(p.investor_user_id || '').slice(0, 8)}…</td>
                          <td className="text-right text-foreground">${(p.committed_amount || 0).toLocaleString()}</td>
                          <td className="text-right text-foreground">${(p.contributed_amount || 0).toLocaleString()}</td>
                          <td className="text-right text-foreground">{(p.ownership_units || 0).toFixed(2)}</td>
                          <td className="text-right text-foreground">${(p.nav_per_unit || 100).toFixed(2)}</td>
                          <td className="text-right text-emerald-400">${(p.unrealized_value || 0).toLocaleString()}</td>
                          <td className="text-right">
                            <Badge variant="outline" className="text-xs">{p.position_status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Jurisdiction Compliance', items: ['Indonesia (ID) — Active', 'Singapore (SG) — Prepared', 'Luxembourg (LU) — Planned'] },
              { title: 'KYC Tier Requirements', items: ['Tier 1: Accredited Investor ($1M+)', 'Tier 2: Qualified Investor ($250K+)', 'Tier 3: Retail Investor ($10K+)'] },
              { title: 'Capital Concentration', items: ['Max single investor: 25%', 'Max single asset: 40%', 'Geographic diversification: enforced'] },
              { title: 'Liquidity Stress', items: ['Redemption queue: Normal', 'Payout buffer: 30 days', 'Secondary market: Active'] },
            ].map((section, i) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-sm">{section.title}</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionalFundManager;
