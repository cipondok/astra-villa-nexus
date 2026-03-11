import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Clock, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLiquidityAbsorption, useLiquidityCrisis, useLiquidityExit } from '@/hooks/useLiquidityEngine';

interface Props {
  city?: string;
  propertyType?: string;
}

export default function PropertyLiquidityWidget({ city, propertyType }: Props) {
  const { data: absorption } = useLiquidityAbsorption();
  const { data: crisis } = useLiquidityCrisis();
  const { data: exitData } = useLiquidityExit();

  const normalizedCity = city?.trim() || '';
  const normalizedType = (propertyType || 'house').toLowerCase();

  const match = useMemo(() => {
    if (!absorption?.length) return null;
    return absorption.find(
      r => r.city.toLowerCase() === normalizedCity.toLowerCase() && r.property_type === normalizedType
    ) || absorption.find(r => r.property_type === normalizedType) || absorption[0];
  }, [absorption, normalizedCity, normalizedType]);

  const exitMatch = useMemo(() => {
    if (!exitData?.length) return null;
    return exitData.find(
      r => r.city.toLowerCase() === normalizedCity.toLowerCase() && r.property_type === normalizedType
    ) || exitData.find(r => r.property_type === normalizedType);
  }, [exitData, normalizedCity, normalizedType]);

  const worstCrisis = useMemo(() => {
    if (!crisis?.length) return null;
    const filtered = crisis.filter(
      r => r.city.toLowerCase() === normalizedCity.toLowerCase() && r.property_type === normalizedType
    );
    if (!filtered.length) return null;
    return filtered.reduce((worst, r) =>
      Number(r.forced_sale_risk) > Number(worst.forced_sale_risk) ? r : worst
    , filtered[0]);
  }, [crisis, normalizedCity, normalizedType]);

  if (!match) return null;

  const liquidityIndex = Number(match.liquidity_speed_index);
  const exitDiff = Number(match.exit_difficulty);
  const avgDom = Number(match.avg_dom);

  const liquidityColor = liquidityIndex >= 70 ? 'text-chart-1' : liquidityIndex >= 40 ? 'text-chart-2' : 'text-destructive';
  const liquidityBg = liquidityIndex >= 70 ? 'bg-chart-1/10' : liquidityIndex >= 40 ? 'bg-chart-2/10' : 'bg-destructive/10';
  const liquidityLabel = liquidityIndex >= 70 ? 'High' : liquidityIndex >= 40 ? 'Moderate' : 'Low';

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          Liquidity Score
          <Badge variant="outline" className={`text-[10px] ml-auto ${liquidityBg} ${liquidityColor} border-0`}>
            {liquidityLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main score */}
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${liquidityColor}`}>{liquidityIndex}</div>
          <div className="flex-1">
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`h-2 rounded-full ${liquidityIndex >= 70 ? 'bg-chart-1' : liquidityIndex >= 40 ? 'bg-chart-2' : 'bg-destructive'}`} style={{ width: `${liquidityIndex}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Liquidity Speed Index</p>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/50 rounded-[6px] p-2">
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
              <Clock className="h-3 w-3" /> Est. DOM
            </div>
            <p className="font-semibold text-foreground">{avgDom} days</p>
          </div>
          <div className="bg-muted/50 rounded-[6px] p-2">
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
              <AlertTriangle className="h-3 w-3" /> Exit Difficulty
            </div>
            <p className={`font-semibold ${exitDiff > 0.5 ? 'text-destructive' : 'text-foreground'}`}>
              {(exitDiff * 100).toFixed(0)}%
            </p>
          </div>
          {exitMatch && (
            <>
              <div className="bg-muted/50 rounded-[6px] p-2">
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <TrendingUp className="h-3 w-3" /> Best Window
                </div>
                <p className="font-semibold text-foreground">{exitMatch.best_sell_window}</p>
              </div>
              <div className="bg-muted/50 rounded-[6px] p-2">
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <TrendingUp className="h-3 w-3" /> Adj. ROI
                </div>
                <p className="font-semibold text-primary">{Number(exitMatch.liquidity_adjusted_roi).toFixed(1)}%</p>
              </div>
            </>
          )}
        </div>

        {/* Crisis resilience */}
        {worstCrisis && (
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> Worst-case stress
              </span>
              <span className="capitalize text-muted-foreground">{worstCrisis.scenario.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Forced sale risk</span>
              <span className={`font-semibold ${Number(worstCrisis.forced_sale_risk) > 0.5 ? 'text-destructive' : 'text-chart-1'}`}>
                {(Number(worstCrisis.forced_sale_risk) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
