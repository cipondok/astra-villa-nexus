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
  Building2, Target, PiggyBank, AlertTriangle, CheckCircle, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Price from '@/components/ui/Price';
import { getCurrencyFormatter } from '@/stores/currencyStore';
import { useLocationData } from '@/hooks/useLocationData';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

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

const staggerChildren = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

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
    if (pct >= 0.7) return 'text-emerald-500';
    if (pct >= 0.4) return 'text-gold-primary';
    return 'text-destructive';
  };

  const getPositioningBadge = (pos: string) => {
    const styles: Record<string, string> = {
      luxury: 'bg-gold-primary/15 text-gold-primary border-gold-primary/30',
      premium: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      'mid-range': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      affordable: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      budget: 'bg-muted text-muted-foreground border-border',
    };
    return styles[pos] || styles['mid-range'];
  };

  const gaugeData = result ? [
    { name: 'score', value: result.investment_score * 10, fill: 'hsl(var(--gold-primary))' },
  ] : [];

  const roiChartData = result ? [
    { name: 'Rental Yield', value: result.rental_yield_percent, fill: 'hsl(var(--gold-primary))' },
    { name: 'Appreciation', value: result.annual_appreciation_percent, fill: 'hsl(var(--primary))' },
    { name: '5Y ROI', value: Math.min(result.roi_5year_percent, 100), fill: 'hsl(142 76% 36%)' },
  ] : [];

  return (
    <>
      <SEOHead
        title="AI Price Estimator | Cek Estimasi Harga Properti"
        description="Dapatkan estimasi harga pasar properti Anda dengan AI. Analisis ROI, potensi sewa, dan skor investasi berdasarkan data pasar terkini."
      />
      
      <div className="min-h-[100dvh] bg-background pt-16 sm:pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-primary text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Valuation
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3">
              Estimasi Harga{' '}
              <span className="bg-gradient-to-r from-gold-primary to-gold-primary/60 bg-clip-text text-transparent">
                Properti
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Dapatkan valuasi properti instan berbasis AI, didukung data pasar real-time dan analisis investasi komprehensif.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="border-gold-primary/15 shadow-lg shadow-gold-primary/5 lg:sticky lg:top-24 h-fit overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-primary via-gold-primary/80 to-gold-primary/40" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-gold-primary/10">
                      <Calculator className="h-4.5 w-4.5 text-gold-primary" />
                    </div>
                    Property Details
                  </CardTitle>
                  <CardDescription>Masukkan spesifikasi properti untuk analisis AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Type */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-muted-foreground" /> Tipe Properti
                    </Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="border-border/60 focus:border-gold-primary/40 focus:ring-gold-primary/20"><SelectValue /></SelectTrigger>
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
                      <Input type="number" placeholder="200" value={landArea} onChange={e => setLandArea(e.target.value)} min={1} className="border-border/60 focus:border-gold-primary/40 focus:ring-gold-primary/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> LB (m²) *
                      </Label>
                      <Input type="number" placeholder="150" value={buildingArea} onChange={e => setBuildingArea(e.target.value)} min={1} className="border-border/60 focus:border-gold-primary/40 focus:ring-gold-primary/20" />
                    </div>
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5 text-muted-foreground" /> KT
                      </Label>
                      <Input type="number" placeholder="3" value={bedrooms} onChange={e => setBedrooms(e.target.value)} min={0} className="border-border/60 focus:border-gold-primary/40 focus:ring-gold-primary/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Bath className="h-3.5 w-3.5 text-muted-foreground" /> KM
                      </Label>
                      <Input type="number" placeholder="2" value={bathrooms} onChange={e => setBathrooms(e.target.value)} min={0} className="border-border/60 focus:border-gold-primary/40 focus:ring-gold-primary/20" />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Provinsi *
                    </Label>
                    <Select value={province} onValueChange={handleProvinceChange}>
                      <SelectTrigger className="border-border/60 focus:border-gold-primary/40"><SelectValue placeholder="Pilih provinsi" /></SelectTrigger>
                      <SelectContent>
                        {provinces.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Kota *
                    </Label>
                    <Select value={city} onValueChange={setCity} disabled={!province}>
                      <SelectTrigger className="border-border/60 focus:border-gold-primary/40"><SelectValue placeholder={province ? "Pilih kota" : "Pilih provinsi dulu"} /></SelectTrigger>
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
                    className="w-full h-12 text-base font-bold gap-2 bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background shadow-lg shadow-gold-primary/20 hover:shadow-xl hover:shadow-gold-primary/30 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menganalisis Data Pasar...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Estimasi Sekarang
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center">
                    Didukung AI & data listing terkini
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
                    className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gold-primary/10 to-gold-primary/5 border border-gold-primary/15 flex items-center justify-center mb-5"
                    >
                      <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-gold-primary/50" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Siap Mengestimasi</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Isi detail properti dan klik "Estimasi Sekarang" untuk mendapatkan analisis pasar komprehensif.
                    </p>
                    <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-gold-primary" /> Data Akurat</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-gold-primary" /> Hasil Instan</span>
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-gold-primary" /> Analisis ROI</span>
                    </div>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center"
                  >
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-gold-primary/15" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-t-gold-primary border-r-transparent border-b-transparent border-l-transparent"
                      />
                      <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-gold-primary animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">AI Sedang Menganalisis</h3>
                    <p className="text-muted-foreground text-sm mb-4">Membandingkan dengan data pasar & listing serupa...</p>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-gold-primary"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    key="result"
                    variants={staggerChildren}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {/* Price Range Card */}
                    <motion.div variants={fadeUp}>
                      <Card className="border-gold-primary/20 shadow-xl shadow-gold-primary/5 overflow-hidden">
                        <div className="relative bg-gradient-to-br from-gold-primary/5 via-card to-gold-primary/[0.03] p-4 sm:p-6 lg:p-8">
                          {/* Decorative glow */}
                          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
                                  <DollarSign className="h-5 w-5 text-gold-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-foreground">Estimasi Nilai Pasar</h3>
                              </div>
                              <Badge variant="outline" className={`font-semibold ${getPositioningBadge(result.market_positioning)}`}>
                                {result.market_positioning?.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Main price */}
                            <div className="text-center mb-6">
                              <p className="text-sm text-muted-foreground mb-1">Harga Rekomendasi</p>
                              <motion.p
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="text-2xl sm:text-3xl lg:text-5xl font-black bg-gradient-to-r from-gold-primary via-gold-primary to-gold-primary/70 bg-clip-text text-transparent"
                              >
                                {getCurrencyFormatter()(result.price_mid)}
                              </motion.p>
                            </div>

                            {/* Price range bar */}
                            <div className="relative mb-2">
                              <div className="h-3 bg-muted/80 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                  className="h-full bg-gradient-to-r from-emerald-500/70 via-gold-primary to-destructive/60 rounded-full origin-left"
                                  style={{ width: '90%', marginLeft: '5%' }}
                                />
                              </div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gold-primary rounded-full border-3 border-background shadow-lg shadow-gold-primary/30"
                                style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                              <span>Low: {getCurrencyFormatter()(result.price_low)}</span>
                              <span>High: {getCurrencyFormatter()(result.price_high)}</span>
                            </div>

                            {/* Per sqm */}
                            <div className="grid grid-cols-2 gap-3 mt-5">
                              <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3.5 text-center border border-border/40">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Harga / m² (Tanah)</p>
                                <p className="text-sm font-bold text-foreground">{getCurrencyFormatter()(result.price_per_sqm_land)}</p>
                              </div>
                              <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3.5 text-center border border-border/40">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Harga / m² (Bangunan)</p>
                                <p className="text-sm font-bold text-foreground">{getCurrencyFormatter()(result.price_per_sqm_building)}</p>
                              </div>
                            </div>

                            {/* Confidence */}
                            <div className="mt-5 bg-background/60 rounded-xl p-4 border border-border/30">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                  <Shield className="h-4 w-4 text-gold-primary" /> Tingkat Kepercayaan
                                </span>
                                <span className={`font-bold text-lg ${getScoreColor(result.confidence, 100)}`}>
                                  {result.confidence}%
                                </span>
                              </div>
                              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.confidence}%` }}
                                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-primary to-gold-primary/70 rounded-full"
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                Berdasarkan {result.comparable_count} listing yang sebanding
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Investment Score & ROI */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.div variants={fadeUp}>
                        <Card className="border-gold-primary/10 hover:border-gold-primary/25 transition-colors h-full">
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-lg bg-gold-primary/10">
                                <Target className="h-4 w-4 text-gold-primary" />
                              </div>
                              <h4 className="font-bold text-foreground">Skor Investasi</h4>
                            </div>

                            {/* Gauge Chart */}
                            <div className="h-28 sm:h-36 -mt-2 -mb-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                  cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                                  startAngle={180} endAngle={0}
                                  data={gaugeData}
                                  barSize={12}
                                >
                                  <RadialBar
                                    dataKey="value"
                                    cornerRadius={6}
                                    background={{ fill: 'hsl(var(--muted))' }}
                                  />
                                </RadialBarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="text-center -mt-12 mb-4">
                              <span className={`text-4xl font-black ${getScoreColor(result.investment_score)}`}>
                                {result.investment_score}
                              </span>
                              <span className="text-lg text-muted-foreground font-medium">/10</span>
                            </div>

                            <div className="space-y-2 mt-2">
                              {result.investment_highlights?.slice(0, 3).map((h, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 + i * 0.1 }}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground leading-tight">{h}</span>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <Card className="border-gold-primary/10 hover:border-gold-primary/25 transition-colors h-full">
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-1.5 rounded-lg bg-gold-primary/10">
                                <PiggyBank className="h-4 w-4 text-gold-primary" />
                              </div>
                              <h4 className="font-bold text-foreground">Prediksi ROI</h4>
                            </div>

                            {/* ROI Bar Chart */}
                            <div className="h-28 sm:h-32 mb-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={roiChartData} barCategoryGap="25%">
                                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                                  <Tooltip
                                    formatter={(value: number) => [`${value}%`, '']}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                                  />
                                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {roiChartData.map((entry, idx) => (
                                      <Cell key={idx} fill={entry.fill} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>

                            <Separator className="mb-3" />

                            <div className="space-y-2.5">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Estimasi Sewa / Bulan</span>
                                <span className="font-bold text-foreground">{getCurrencyFormatter()(result.monthly_rental_estimate)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">ROI 5 Tahun</span>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.8 }}
                                  className={`font-black text-xl ${getScoreColor(result.roi_5year_percent, 100)}`}
                                >
                                  +{result.roi_5year_percent}%
                                </motion.span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Key Factors & Risks */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.div variants={fadeUp}>
                        <Card className="border-border/60 hover:border-gold-primary/20 transition-colors h-full">
                          <CardContent className="p-4 sm:p-5">
                            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-gold-primary" />
                              Faktor Valuasi
                            </h4>
                            <div className="space-y-2.5">
                              {result.key_factors?.map((f, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + i * 0.08 }}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <ChevronRight className="h-3.5 w-3.5 text-gold-primary mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground leading-tight">{f}</span>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <Card className="border-border/60 hover:border-destructive/20 transition-colors h-full">
                          <CardContent className="p-4 sm:p-5">
                            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Faktor Risiko
                            </h4>
                            <div className="space-y-2.5">
                              {result.risk_factors?.map((r, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.8 + i * 0.08 }}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground leading-tight">{r}</span>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Disclaimer */}
                    <motion.p variants={fadeUp} className="text-[10px] text-muted-foreground text-center italic px-4 pb-2">
                      Estimasi ini dihasilkan oleh AI berdasarkan data pasar dan listing sebanding. Nilai aktual properti dapat berbeda.
                      Konsultasikan dengan penilai bersertifikat untuk valuasi resmi.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default AIPriceEstimator;
