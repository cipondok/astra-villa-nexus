
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
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/deal-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          },
          body: JSON.stringify({
            mode: 'price_suggestion_inline',
            price: priceNum,
            city,
            property_type,
            land_area_sqm: landSqm,
            building_area_sqm: buildSqm,
          }),
        }
      );

      if (!response.ok) {
        console.error('Core engine error:', response.status);
        setResult(null);
        setLoading(false);
        return;
      }

      const json = await response.json();
      const data = json.data;

      if (!data || data.error || data.comparable_count === 0) {
        setResult(null);
        setLoading(false);
        return;
      }

      setResult({
        recommended_price: data.recommended_price,
        price_position: data.price_position as AdvisorResult['price_position'],
        expected_days_on_market: data.expected_days_on_market,
        reasoning: data.reasoning || [],
        confidence: data.confidence_score,
        comparable_count: data.comparable_count,
        fmv: data.fair_market_value,
        demand_multiplier: data.demand_multiplier,
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
            <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider">Server-side</span>
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
