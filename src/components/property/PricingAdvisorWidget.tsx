
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, TrendingUp, TrendingDown, Clock, Minus, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface PricingAdvisorInput {
  price: string;
  city: string;
  property_type: string;
  land_area_sqm: string;
  building_area_sqm: string;
}

interface AdvisorResult {
  recommended_price: number;
  price_position: 'underpriced' | 'fair' | 'overpriced';
  expected_days_on_market: number;
  reasoning: string[];
  confidence: number;
  comparable_count: number;
  fmv: number;
  demand_multiplier: number;
}

const DEBOUNCE_MS = 800;

const formatIDR = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

const PricingAdvisorWidget = ({ price, city, property_type, land_area_sqm, building_area_sqm }: PricingAdvisorInput) => {
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const hasMinInput = !!(price && city && property_type && (land_area_sqm || building_area_sqm));

  const compute = useCallback(async () => {
    const priceNum = Number(price);
    const landSqm = Number(land_area_sqm) || 0;
    const buildSqm = Number(building_area_sqm) || 0;

    if (!priceNum || !city || !property_type || (!landSqm && !buildSqm)) {
      setResult(null);
      return;
    }

    setLoading(true);
    try {
      // Fetch comparables from same city & type
      const { data: comps } = await supabase
        .from('properties')
        .select('price, land_area_sqm, building_area_sqm, property_type')
        .eq('city', city)
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0)
        .limit(50);

      const validComps = (comps || []).filter(c => {
        const cLand = Number(c.land_area_sqm) || 0;
        const cBuild = Number(c.building_area_sqm) || 0;
        return (cLand > 0 || cBuild > 0) && Number(c.price) > 0;
      });

      // Same-type comps get priority
      const sameType = validComps.filter(c => c.property_type === property_type);
      const pool = sameType.length >= 3 ? sameType : validComps;

      if (pool.length === 0) {
        setResult(null);
        setLoading(false);
        return;
      }

      // Calculate avg price per sqm (prefer building, fallback to land)
      const pricesPerSqm = pool.map(c => {
        const cBuild = Number(c.building_area_sqm) || 0;
        const cLand = Number(c.land_area_sqm) || 0;
        const area = cBuild > 0 ? cBuild : cLand;
        return Number(c.price) / area;
      });
      const avgPricePerSqm = pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length;

      // Demand multiplier from comparable density
      const demandMultiplier = pool.length >= 20 ? 1.08 : pool.length >= 10 ? 1.03 : pool.length >= 5 ? 1.0 : 0.95;

      // FMV calc
      const primaryArea = buildSqm > 0 ? buildSqm : landSqm;
      const fmv = Math.round(avgPricePerSqm * primaryArea * demandMultiplier);

      // Position
      const ratio = priceNum / fmv;
      const price_position: AdvisorResult['price_position'] =
        ratio < 0.85 ? 'underpriced' : ratio > 1.15 ? 'overpriced' : 'fair';

      // Time to sell prediction
      const baseDays = 60;
      const expected_days_on_market = Math.round(
        price_position === 'underpriced' ? baseDays * 0.5 :
        price_position === 'overpriced' ? baseDays * (1 + (ratio - 1.15) * 3) :
        baseDays
      );

      // Recommended price (target sweet spot at 95% FMV for quick sale)
      const recommended_price = Math.round(fmv * 0.98);

      // Confidence
      const confidence = Math.min(95, Math.round(40 + pool.length * 1.5 + (sameType.length >= 3 ? 15 : 0)));

      // Reasoning
      const reasoning: string[] = [];
      if (price_position === 'overpriced') {
        reasoning.push(`Listed ${Math.round((ratio - 1) * 100)}% above FMV — may deter serious buyers.`);
      } else if (price_position === 'underpriced') {
        reasoning.push(`Listed ${Math.round((1 - ratio) * 100)}% below FMV — expect fast inquiries.`);
      } else {
        reasoning.push(`Price aligns with market avg of ${formatIDR(Math.round(avgPricePerSqm))}/sqm.`);
      }
      reasoning.push(`${pool.length} comparable listings in ${city} (${sameType.length} same type).`);
      reasoning.push(`Demand multiplier: ${demandMultiplier}x based on market density.`);

      setResult({
        recommended_price,
        price_position,
        expected_days_on_market,
        reasoning,
        confidence,
        comparable_count: pool.length,
        fmv,
        demand_multiplier: demandMultiplier,
      });
    } catch (err) {
      console.error('Pricing advisor error:', err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [price, city, property_type, land_area_sqm, building_area_sqm]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!hasMinInput) { setResult(null); return; }
    timerRef.current = setTimeout(compute, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [compute, hasMinInput]);

  if (!hasMinInput) return null;

  const positionConfig = {
    underpriced: { icon: TrendingDown, label: 'Underpriced', color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20', emoji: '🟢' },
    fair: { icon: Minus, label: 'Fair Value', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', emoji: '🟡' },
    overpriced: { icon: TrendingUp, label: 'Overpriced', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', emoji: '🔴' },
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-chart-1/20 via-primary/10 to-chart-3/20 p-[1px]" />
      <div className="relative rounded-xl backdrop-blur-md bg-background/80 border border-chart-1/10 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-chart-1/20 to-primary/20">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-sm">AI Pricing Advisor</span>
            <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider">Real-time</span>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />}
        </div>

        {loading && !result && (
          <div className="flex items-center gap-2 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Calculating fair market value...</p>
          </div>
        )}

        {result && (
          <div className="space-y-3 animate-[ai-reveal_0.4s_ease-out_both]">
            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* FMV */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Fair Market Value</p>
                <p className="text-sm font-bold">{formatIDR(result.fmv)}</p>
              </div>
              {/* Recommended Price */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Optimal Listing Price</p>
                <p className="text-sm font-bold text-primary">{formatIDR(result.recommended_price)}</p>
              </div>
              {/* Position */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Price Position</p>
                {(() => {
                  const cfg = positionConfig[result.price_position];
                  return (
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  );
                })()}
              </div>
              {/* Time to Sell */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Est. Time to Sell</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold">{result.expected_days_on_market} days</p>
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Confidence</p>
                <p className="text-[10px] font-medium">{result.confidence}% • {result.comparable_count} comps</p>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.confidence >= 70 ? 'bg-green-500' : result.confidence >= 50 ? 'bg-amber-500' : 'bg-destructive'
                  }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Reasoning */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Reasoning</p>
              {result.reasoning.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {/* Action hints */}
            {result.price_position === 'overpriced' && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg p-3">
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Consider reducing price to ~{formatIDR(result.recommended_price)} for faster engagement.</span>
              </div>
            )}
            {result.price_position === 'underpriced' && (
              <div className="flex items-start gap-2 text-xs text-green-600 bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Strong demand signal — you could list up to {formatIDR(result.fmv)} and still attract buyers.</span>
              </div>
            )}
            {result.price_position === 'fair' && (
              <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Well-priced — competitive in the current {city} market.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingAdvisorWidget;
