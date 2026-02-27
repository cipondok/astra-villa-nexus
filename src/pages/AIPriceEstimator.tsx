import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/SEOHead';
import {
  Calculator, TrendingUp, DollarSign, Home, MapPin, Ruler, BedDouble,
  Bath, Sparkles, ArrowRight, BarChart3, Shield, ChevronRight, Loader2,
  Building2, Target, PiggyBank, AlertTriangle, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatIDR } from '@/utils/currency';
import { useLocationData } from '@/hooks/useLocationData';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';

interface EstimationResult {
  price_low: number;
  price_mid: number;
  price_high: number;
  price_per_sqm_land: number;
  price_per_sqm_building: number;
  confidence: number;
  investment_score: number;
  rental_yield_percent: number;
  monthly_rental_estimate: number;
  annual_appreciation_percent: number;
  roi_5year_percent: number;
  market_positioning: string;
  comparable_count: number;
  key_factors: string[];
  investment_highlights: string[];
  risk_factors: string[];
}

const PROPERTY_TYPES = [
  { value: 'house', label: 'Rumah / House' },
  { value: 'apartment', label: 'Apartemen / Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Tanah / Land' },
  { value: 'commercial', label: 'Komersial / Commercial' },
];

const AIPriceEstimator = () => {
  const [landArea, setLandArea] = useState('');
  const [buildingArea, setBuildingArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('house');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EstimationResult | null>(null);
  const { toast } = useToast();

  const { provinces, cities, loadCities } = useLocationData();

  const handleProvinceChange = useCallback((val: string) => {
    setProvince(val);
    setCity('');
    loadCities(val);
  }, [loadCities]);

  const handleEstimate = async () => {
    if (!landArea || !buildingArea || !province || !city) {
      toast({ title: "Missing Information", description: "Please fill in land area, building area, and location.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('price-estimator', {
        body: {
          land_area: Number(landArea),
          building_area: Number(buildingArea),
          bedrooms: bedrooms ? Number(bedrooms) : undefined,
          bathrooms: bathrooms ? Number(bathrooms) : undefined,
          province,
          city,
          property_type: propertyType,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.estimation) {
        setResult(data.estimation);
      }
    } catch (e: any) {
      toast({ title: "Estimation Failed", description: e.message || "Could not generate estimation. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number, max: number = 10) => {
    const pct = score / max;
    if (pct >= 0.7) return 'text-green-500';
    if (pct >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPositioningColor = (pos: string) => {
    const colors: Record<string, string> = {
      luxury: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      premium: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      'mid-range': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      affordable: 'bg-green-500/10 text-green-600 border-green-500/30',
      budget: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
    };
    return colors[pos] || colors['mid-range'];
  };

  return (
    <>
      <SEOHead
        title="AI Price Estimator | Cek Estimasi Harga Properti"
        description="Dapatkan estimasi harga pasar properti Anda dengan AI. Analisis ROI, potensi sewa, dan skor investasi berdasarkan data pasar terkini."
      />
      <EnhancedNavigation language="en" onLanguageToggle={() => {}} />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Valuation
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Check Estimated{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Market Value
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Get instant AI-powered property valuations backed by real market data, comparable listings, and investment analytics.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="border-border/60 shadow-lg sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                    Property Details
                  </CardTitle>
                  <CardDescription>Enter your property specs for AI analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Type */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-muted-foreground" /> Property Type
                    </Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Land & Building Area */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5 text-muted-foreground" /> LT (m²) *
                      </Label>
                      <Input type="number" placeholder="200" value={landArea} onChange={e => setLandArea(e.target.value)} min={1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> LB (m²) *
                      </Label>
                      <Input type="number" placeholder="150" value={buildingArea} onChange={e => setBuildingArea(e.target.value)} min={1} />
                    </div>
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5 text-muted-foreground" /> KT
                      </Label>
                      <Input type="number" placeholder="3" value={bedrooms} onChange={e => setBedrooms(e.target.value)} min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Bath className="h-3.5 w-3.5 text-muted-foreground" /> KM
                      </Label>
                      <Input type="number" placeholder="2" value={bathrooms} onChange={e => setBathrooms(e.target.value)} min={0} />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Province *
                    </Label>
                    <Select value={province} onValueChange={handleProvinceChange}>
                      <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                      <SelectContent>
                        {provinces.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> City *
                    </Label>
                    <Select value={city} onValueChange={setCity} disabled={!province}>
                      <SelectTrigger><SelectValue placeholder={province ? "Select city" : "Select province first"} /></SelectTrigger>
                      <SelectContent>
                        {cities.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleEstimate}
                    disabled={isLoading || !landArea || !buildingArea || !province || !city}
                    className="w-full h-12 text-base font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing Market Data...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Get AI Estimation
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Powered by AI analysis of real market data & comparable listings
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {!result && !isLoading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[400px] text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <BarChart3 className="h-10 w-10 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Estimate</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Fill in your property details and click "Get AI Estimation" to receive a comprehensive market analysis.
                    </p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[400px] text-center"
                  >
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Analyzing Your Property</h3>
                    <p className="text-muted-foreground text-sm">Comparing with market data & comparable listings...</p>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Price Range Card */}
                    <Card className="border-primary/20 shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg text-foreground">Estimated Market Value</h3>
                          </div>
                          <Badge variant="outline" className={getPositioningColor(result.market_positioning)}>
                            {result.market_positioning?.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Main price */}
                        <div className="text-center mb-6">
                          <p className="text-sm text-muted-foreground mb-1">Recommended Price</p>
                          <p className="text-3xl sm:text-4xl font-bold text-primary">
                            {formatIDR(result.price_mid)}
                          </p>
                        </div>

                        {/* Price range bar */}
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
                          <div
                            className="absolute inset-y-0 bg-gradient-to-r from-emerald-500/60 via-primary to-destructive/60 rounded-full"
                            style={{ left: '5%', right: '5%' }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg"
                            style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatIDR(result.price_low)}</span>
                          <span>{formatIDR(result.price_high)}</span>
                        </div>

                        {/* Per sqm */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-background/60 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">Price / m² (Land)</p>
                            <p className="text-sm font-bold text-foreground">{formatIDR(result.price_per_sqm_land)}</p>
                          </div>
                          <div className="bg-background/60 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">Price / m² (Building)</p>
                            <p className="text-sm font-bold text-foreground">{formatIDR(result.price_per_sqm_building)}</p>
                          </div>
                        </div>

                        {/* Confidence */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3.5 w-3.5" /> Confidence Level
                            </span>
                            <span className={`font-bold ${getScoreColor(result.confidence, 100)}`}>
                              {result.confidence}%
                            </span>
                          </div>
                          <Progress value={result.confidence} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Based on {result.comparable_count} comparable listing{result.comparable_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Investment Score & ROI */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border-border/60">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-foreground">Investment Score</h4>
                          </div>
                          <div className="flex items-end gap-1 mb-3">
                            <span className={`text-4xl font-bold ${getScoreColor(result.investment_score)}`}>
                              {result.investment_score}
                            </span>
                            <span className="text-lg text-muted-foreground mb-1">/10</span>
                          </div>
                          <Progress value={result.investment_score * 10} className="h-2 mb-3" />
                          <div className="space-y-2">
                            {result.investment_highlights?.slice(0, 3).map((h, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{h}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/60">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <PiggyBank className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-foreground">ROI Prediction</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Rental Yield</span>
                              <span className="font-bold text-foreground">{result.rental_yield_percent}% / yr</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Monthly Rental Est.</span>
                              <span className="font-bold text-foreground">{formatIDR(result.monthly_rental_estimate)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Annual Appreciation</span>
                              <span className="font-bold text-green-500">+{result.annual_appreciation_percent}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">5-Year ROI</span>
                              <span className={`font-bold text-lg ${getScoreColor(result.roi_5year_percent, 100)}`}>
                                +{result.roi_5year_percent}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Key Factors & Risks */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border-border/60">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Key Valuation Factors
                          </h4>
                          <div className="space-y-2">
                            {result.key_factors?.map((f, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{f}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/60">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Risk Factors
                          </h4>
                          <div className="space-y-2">
                            {result.risk_factors?.map((r, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{r}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-muted-foreground text-center italic px-4">
                      This estimation is generated by AI based on market data and comparable listings. Actual property values may vary.
                      Consult a certified appraiser for official valuations.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <ProfessionalFooter language="en" />
    </>
  );
};

export default AIPriceEstimator;
