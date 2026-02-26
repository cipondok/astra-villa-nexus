import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, Loader2, Building,
  BarChart3, Target, ArrowUpRight, ArrowDownRight, Info, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyOwnerData } from '@/hooks/usePropertyOwnerData';
import { supabase } from '@/integrations/supabase/client';
import { formatIDR } from '@/utils/currency';
import { toast } from 'sonner';

interface PricingAnalysis {
  recommended_price: number;
  price_range_low: number;
  price_range_high: number;
  confidence_score: number;
  price_per_sqm?: number;
  market_position: 'below_market' | 'at_market' | 'above_market' | 'premium';
  adjustment_factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    percentage: number;
  }>;
  summary: string;
  comparable_avg_price: number;
  comparable_count: number;
}

const MARKET_POSITION_CONFIG = {
  below_market: { label: 'Di Bawah Pasar', color: 'text-chart-1', bg: 'bg-chart-1/10', icon: TrendingDown },
  at_market: { label: 'Sesuai Pasar', color: 'text-primary', bg: 'bg-primary/10', icon: Minus },
  above_market: { label: 'Di Atas Pasar', color: 'text-chart-3', bg: 'bg-chart-3/10', icon: TrendingUp },
  premium: { label: 'Premium', color: 'text-chart-5', bg: 'bg-chart-5/10', icon: Sparkles },
};

const OwnerSmartPricing: React.FC = () => {
  const { properties } = usePropertyOwnerData();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const handleAnalyze = async () => {
    if (!selectedPropertyId) {
      toast.error('Pilih properti terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('smart-pricing', {
        body: { property_id: selectedPropertyId },
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        setCurrentPrice(data.property?.current_price || 0);
        toast.success('Analisis harga selesai!');
      } else {
        toast.error('Gagal mendapatkan analisis');
      }
    } catch (err: any) {
      console.error('Pricing error:', err);
      if (err?.message?.includes('429')) {
        toast.error('Terlalu banyak permintaan, coba lagi nanti');
      } else {
        toast.error('Gagal menganalisis harga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const priceDiff = analysis ? ((analysis.recommended_price - currentPrice) / currentPrice * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3" />
            Smart Pricing AI
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">
            Rekomendasi harga optimal berdasarkan data pasar & AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Pilih properti untuk dianalisis..." />
            </SelectTrigger>
            <SelectContent>
              {properties.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{p.title || 'Untitled'}</span>
                    <span className="text-muted-foreground ml-1">— {formatIDR(p.price)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedPropertyId || isLoading}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisis Harga
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI sedang menganalisis data pasar & properti comparable...
            </p>
          </div>
        </Card>
      )}

      {/* Results */}
      {analysis && !isLoading && (
        <>
          {/* Price Recommendation */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Harga Rekomendasi</span>
                <Badge className="text-[9px] sm:text-[10px] h-5" variant={priceDiff > 0 ? 'default' : 'secondary'}>
                  {priceDiff > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {Math.abs(priceDiff).toFixed(1)}% vs saat ini
                </Badge>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {formatIDR(analysis.recommended_price)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Range: {formatIDR(analysis.price_range_low)} — {formatIDR(analysis.price_range_high)}
              </p>
            </div>

            <CardContent className="pt-3 space-y-3">
              {/* Current vs Recommended */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <span className="text-[10px] sm:text-xs text-muted-foreground block">Harga Saat Ini</span>
                  <span className="text-xs sm:text-sm font-bold">{formatIDR(currentPrice)}</span>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <span className="text-[10px] sm:text-xs text-muted-foreground block">Rata-rata Pasar</span>
                  <span className="text-xs sm:text-sm font-bold">{formatIDR(analysis.comparable_avg_price)}</span>
                </div>
              </div>

              {/* Market Position & Confidence */}
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const pos = MARKET_POSITION_CONFIG[analysis.market_position] || MARKET_POSITION_CONFIG.at_market;
                  const PosIcon = pos.icon;
                  return (
                    <div className={`rounded-lg p-2.5 ${pos.bg}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <PosIcon className={`h-3.5 w-3.5 ${pos.color}`} />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">Posisi Pasar</span>
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${pos.color}`}>{pos.label}</span>
                    </div>
                  );
                })()}
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold">{analysis.confidence_score}%</span>
                    <Progress value={analysis.confidence_score} className="h-1.5 flex-1" />
                  </div>
                </div>
              </div>

              {analysis.price_per_sqm && (
                <div className="bg-muted/40 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Harga per m²</span>
                  <span className="text-xs sm:text-sm font-bold">{formatIDR(analysis.price_per_sqm)}/m²</span>
                </div>
              )}

              <div className="bg-muted/40 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Data Pembanding</span>
                <span className="text-xs sm:text-sm font-bold">{analysis.comparable_count} properti</span>
              </div>
            </CardContent>
          </Card>

          {/* Adjustment Factors */}
          {analysis.adjustment_factors && analysis.adjustment_factors.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Faktor Penyesuaian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.adjustment_factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/30">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      factor.impact === 'positive' ? 'bg-chart-1/15 text-chart-1' :
                      factor.impact === 'negative' ? 'bg-destructive/15 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {factor.impact === 'positive' ? <TrendingUp className="h-3 w-3" /> :
                       factor.impact === 'negative' ? <TrendingDown className="h-3 w-3" /> :
                       <Minus className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] sm:text-xs font-medium">{factor.factor}</span>
                        <Badge
                          variant={factor.impact === 'positive' ? 'default' : factor.impact === 'negative' ? 'destructive' : 'secondary'}
                          className="text-[8px] sm:text-[9px] h-4 px-1.5"
                        >
                          {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '' : ''}{factor.percentage}%
                        </Badge>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-chart-5" />
                Ringkasan AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>

          {/* Re-analyze */}
          <Button variant="outline" className="w-full text-xs" onClick={handleAnalyze} disabled={isLoading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Analisis Ulang
          </Button>
        </>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && (
        <Card className="p-4 sm:p-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-chart-3" />
            </div>
            <p className="text-xs sm:text-sm font-medium">Analisis Harga Cerdas</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-xs mx-auto">
              Pilih properti dan klik "Analisis Harga" untuk mendapatkan rekomendasi harga optimal dari AI
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OwnerSmartPricing;
