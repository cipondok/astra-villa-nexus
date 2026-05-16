import { Droplets, ArrowUpDown, Clock, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvestmentPositions, useExitListings } from '@/hooks/useSecondaryMarket';

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function PortfolioLiquidityPanel() {
  const { data: positions = [], isLoading } = useInvestmentPositions();
  const { data: exitListings = [] } = useExitListings(false);

  const activePositions = positions.filter((p: any) => p.position_status === 'active');
  const listedPositions = positions.filter((p: any) => p.position_status === 'listed_for_exit');
  const totalValue = positions.reduce((sum: number, p: any) => sum + (p.current_estimated_value_idr || 0), 0);
  const totalAcquisition = positions.reduce((sum: number, p: any) => sum + (p.acquisition_price_idr || 0), 0);
  const unrealizedPL = totalValue - totalAcquisition;
  const liquidityRatio = positions.length > 0 ? (listedPositions.length / positions.length * 100).toFixed(0) : '0';

  if (isLoading) return <Card className="animate-pulse h-48" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          Portfolio Liquidity
        </h3>
        <Badge variant="outline" className="text-[10px]">
          {positions.length} positions
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Wallet className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{formatIDR(totalValue)}</p>
            <p className="text-[9px] text-muted-foreground">Portfolio Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-1" />
            <p className={`text-sm font-bold ${unrealizedPL >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
              {unrealizedPL >= 0 ? '+' : ''}{formatIDR(unrealizedPL)}
            </p>
            <p className="text-[9px] text-muted-foreground">Unrealized P&L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <ArrowUpDown className="h-4 w-4 mx-auto mb-1 text-chart-4" />
            <p className="text-sm font-bold">{liquidityRatio}%</p>
            <p className="text-[9px] text-muted-foreground">Liquidity Ratio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-chart-3" />
            <p className="text-sm font-bold">{activePositions.length}</p>
            <p className="text-[9px] text-muted-foreground">Exit Eligible</p>
          </CardContent>
        </Card>
      </div>

      {/* Position List */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-xs">Investment Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {positions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No investment positions yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {positions.map((pos: any) => (
                <div key={pos.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{pos.ownership_percentage}% ownership</p>
                    <p className="text-[10px] text-muted-foreground">{formatIDR(pos.current_estimated_value_idr || 0)}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      pos.position_status === 'active' ? 'text-chart-1 border-chart-1/30' :
                      pos.position_status === 'listed_for_exit' ? 'text-chart-4 border-chart-4/30' :
                      'text-muted-foreground'
                    }`}
                  >
                    {pos.position_status === 'listed_for_exit' ? 'Listed' : pos.position_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capital Recycling Suggestion */}
      {listedPositions.length === 0 && activePositions.length > 0 && (
        <Card className="border-chart-4/20 bg-chart-4/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Clock className="h-4 w-4 text-chart-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Capital Recycling Opportunity</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                You have {activePositions.length} positions eligible for exit. Listing underperforming assets can free capital for higher-yield opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
