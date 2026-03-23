import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpDown, TrendingUp, Activity, BarChart3, RefreshCw, Shield } from 'lucide-react';
import { useLiquidityExchangeDashboard, useTradeHistory, useMatchOrders } from '@/hooks/useLiquidityExchange';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LiquidityExchangeCommandCenter() {
  const { data: dashboard, isLoading } = useLiquidityExchangeDashboard();
  const { data: trades } = useTradeHistory();
  const matchOrders = useMatchOrders();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const metrics = dashboard?.metrics || [];
  const recentTrades = dashboard?.recentTrades || [];

  const totalVolume = metrics.reduce((s: number, m: any) => s + Number(m.volume_30d || 0), 0);
  const avgDepth = metrics.length ? metrics.reduce((s: number, m: any) => s + Number(m.liquidity_depth_score || 0), 0) / metrics.length : 0;

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-primary" />
            Liquidity Exchange Command Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Secondary market trading infrastructure & order book management</p>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={stagger} initial="hidden" animate="show">
        {[
          { label: 'Open Sell Orders', value: dashboard?.openSellOrders || 0, icon: TrendingUp, color: 'text-destructive' },
          { label: 'Open Buy Orders', value: dashboard?.openBuyOrders || 0, icon: Activity, color: 'text-chart-1' },
          { label: '30d Volume', value: `$${(totalVolume / 1000).toFixed(0)}K`, icon: BarChart3, color: 'text-primary' },
          { label: 'Avg Liquidity Depth', value: `${avgDepth.toFixed(0)}%`, icon: Shield, color: 'text-chart-2' },
        ].map((kpi, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <kpi.icon className="h-3.5 w-3.5" /> {kpi.label}
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="market" className="space-y-4">
        <TabsList>
          <TabsTrigger value="market">Market Metrics</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Property Liquidity Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : metrics.length === 0 ? (
                <p className="text-muted-foreground text-sm">No liquidity data yet. Orders will generate metrics.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left p-2">Property</th>
                        <th className="text-right p-2">Last Trade</th>
                        <th className="text-right p-2">Depth</th>
                        <th className="text-right p-2">Spread</th>
                        <th className="text-right p-2">30d Vol</th>
                        <th className="text-right p-2">Sells</th>
                        <th className="text-right p-2">Buys</th>
                        <th className="text-right p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m: any) => (
                        <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-2 font-mono text-[10px]">{m.property_id?.slice(0, 8)}...</td>
                          <td className="p-2 text-right">${Number(m.last_trade_price_per_percent || 0).toFixed(0)}/pct</td>
                          <td className="p-2 text-right">
                            <Badge variant="outline" className={`text-[10px] ${Number(m.liquidity_depth_score) > 50 ? 'text-chart-1' : 'text-chart-2'}`}>
                              {Number(m.liquidity_depth_score).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="p-2 text-right">${Number(m.bid_ask_spread || 0).toFixed(0)}</td>
                          <td className="p-2 text-right">${Number(m.volume_30d || 0).toFixed(0)}</td>
                          <td className="p-2 text-right text-destructive">{m.total_sell_orders_open}</td>
                          <td className="p-2 text-right text-chart-1">{m.total_buy_orders_open}</td>
                          <td className="p-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px]"
                              onClick={() => {
                                matchOrders.mutate({ property_id: m.property_id }, {
                                  onSuccess: (d) => toast.success(`${d.matches} orders matched`),
                                  onError: (e) => toast.error(e.message),
                                });
                              }}
                              disabled={matchOrders.isPending}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Match
                            </Button>
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

        <TabsContent value="trades">
          <Card>
            <CardHeader><CardTitle className="text-sm">Recent Trade Executions</CardTitle></CardHeader>
            <CardContent>
              {(trades || recentTrades).length === 0 ? (
                <p className="text-muted-foreground text-sm">No trades executed yet.</p>
              ) : (
                <div className="space-y-2">
                  {(trades || recentTrades).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-xs">
                      <div>
                        <p className="font-medium text-foreground">{Number(t.executed_percentage).toFixed(2)}% stake transferred</p>
                        <p className="text-muted-foreground">{t.property_id?.slice(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${Number(t.execution_price).toLocaleString()}</p>
                        <Badge variant="outline" className={`text-[10px] ${t.settlement_status === 'settled' ? 'text-chart-1' : 'text-chart-2'}`}>
                          {t.settlement_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle className="text-sm">Order Management</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Use the matching engine to automatically pair compatible buy and sell orders.
                Orders are matched by best price execution — cheapest ask meets highest bid first.
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="text-xs font-semibold text-foreground mb-2">Anti-Manipulation Controls</h4>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                  <li>• Wash trading detection: repeated buy/sell between same parties flagged</li>
                  <li>• Rapid flip cooldown: 48h minimum hold period enforced</li>
                  <li>• Price spike alerts: &gt;20% deviation from last trade triggers review</li>
                  <li>• High-risk user restriction: risk_score &gt; 60 blocks order placement</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
