import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, BarChart3, Home, Sparkles, Loader2, Calendar, Shield, ArrowUpRight, ArrowDownRight, Minus, Lightbulb, PieChart, Target, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRentalYieldOptimizer, RentalYieldResult } from "@/hooks/useRentalYieldOptimizer";
import { useToast } from "@/hooks/use-toast";

const PROPERTY_TYPES = ["Rumah", "Apartemen", "Villa", "Ruko", "Kos-kosan", "Kontrakan"];
const FURNISHING = [
  { value: "unfurnished" as const, label: "Kosong (Unfurnished)" },
  { value: "semi_furnished" as const, label: "Semi Furnished" },
  { value: "fully_furnished" as const, label: "Fully Furnished" },
];
const STRATEGIES = [
  { value: "long_term" as const, label: "Sewa Tahunan" },
  { value: "short_term" as const, label: "Sewa Harian/Bulanan" },
  { value: "mixed" as const, label: "Campuran" },
];

function fmt(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function StatusArrow({ status }: { status: "above" | "below" | "average" }) {
  if (status === "above") return <ArrowUpRight className="h-4 w-4 text-green-500" />;
  if (status === "below") return <ArrowDownRight className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function YieldGauge({ label, value, max, suffix }: { label: string; value: number; max: number; suffix: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= max * 0.6 ? "text-green-500" : value >= max * 0.3 ? "text-yellow-500" : "text-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold ${color}`}>{value.toFixed(1)}{suffix}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

export default function AIRentalYieldPage() {
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentRent, setCurrentRent] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState<"unfurnished" | "semi_furnished" | "fully_furnished">("semi_furnished");
  const [buildingAge, setBuildingAge] = useState("");
  const [strategy, setStrategy] = useState<"long_term" | "short_term" | "mixed">("long_term");
  const [result, setResult] = useState<RentalYieldResult | null>(null);

  const mutation = useRentalYieldOptimizer();
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!propertyType || !location || !purchasePrice || !area || !bedrooms) {
      toast({ title: "Data belum lengkap", description: "Tipe, lokasi, harga, luas, dan kamar tidur wajib diisi.", variant: "destructive" });
      return;
    }
    mutation.mutate({
      property_type: propertyType, location,
      purchase_price: Number(purchasePrice),
      current_monthly_rent: currentRent ? Number(currentRent) : undefined,
      property_area: Number(area),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms || 1),
      furnishing, rental_strategy: strategy,
      building_age_years: buildingAge ? Number(buildingAge) : undefined,
    }, {
      onSuccess: (data) => setResult(data),
      onError: (err) => toast({ title: "AI Error", description: (err as Error).message, variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              AI Rental Yield Optimizer
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Optimasi <span className="text-primary">Rental Yield</span> Properti Anda
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Analisis harga sewa optimal, proyeksi yield, dan strategi peningkatan pendapatan rental berbasis AI.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Data Properti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipe Properti *</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
                    <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Lokasi *</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Menteng, Jakarta Pusat" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Strategi Sewa</label>
                  <Select value={strategy} onValueChange={(v) => setStrategy(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STRATEGIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Harga Beli (IDR) *</label>
                  <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="2000000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Sewa Saat Ini /bulan</label>
                  <Input type="number" value={currentRent} onChange={(e) => setCurrentRent(e.target.value)} placeholder="15000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Luas (m²) *</label>
                  <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="120" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Usia Bangunan (tahun)</label>
                  <Input type="number" value={buildingAge} onChange={(e) => setBuildingAge(e.target.value)} placeholder="5" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kamar Tidur *</label>
                  <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kamar Mandi</label>
                  <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Furnishing</label>
                  <Select value={furnishing} onValueChange={(v) => setFurnishing(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FURNISHING.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={mutation.isPending} size="lg" className="w-full md:w-auto">
                {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menganalisis...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analisis Rental Yield</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Sewa Optimal/bln", value: fmt(result.optimal_monthly_rent), icon: DollarSign, sub: `Range: ${fmt(result.rent_range.min)} - ${fmt(result.rent_range.max)}` },
                  { label: "Gross Yield", value: `${result.gross_yield_percent.toFixed(1)}%`, icon: TrendingUp, sub: `Net: ${result.net_yield_percent.toFixed(1)}%` },
                  { label: "Occupancy Rate", value: `${result.occupancy_rate_estimate}%`, icon: PieChart, sub: `Pendapatan Bersih: ${fmt(result.annual_net_income)}/th` },
                  { label: "Payback Period", value: `${result.payback_period_years.toFixed(1)} th`, icon: Clock, sub: `Investasi: ${fmt(Number(purchasePrice))}` },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                      <Card className="border-border/50">
                        <CardContent className="pt-5 pb-4 space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-xs">{kpi.label}</span>
                          </div>
                          <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                          <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Yield Gauges */}
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Yield Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <YieldGauge label="Gross Yield" value={result.gross_yield_percent} max={12} suffix="%" />
                  <YieldGauge label="Net Yield" value={result.net_yield_percent} max={10} suffix="%" />
                  <YieldGauge label="Occupancy Rate" value={result.occupancy_rate_estimate} max={100} suffix="%" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pricing Strategies */}
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Strategi Pricing</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {result.pricing_strategy?.map((s, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-foreground">{s.strategy_name}</h4>
                          <Badge variant="outline" className="text-xs">{fmt(s.recommended_price)}/bln</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Occupancy: <strong className="text-foreground">{s.expected_occupancy}%</strong></span>
                          <span>Income: <strong className="text-foreground">{fmt(s.expected_annual_income)}/th</strong></span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Expenses Breakdown */}
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" /> Rincian Biaya Tahunan</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.annual_expenses_breakdown?.map((exp, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{exp.category}</p>
                            <p className="text-xs text-muted-foreground">{exp.description}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{fmt(exp.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t border-border/50 pt-2 flex justify-between">
                        <span className="text-sm font-bold text-foreground">Total Biaya</span>
                        <span className="text-sm font-bold text-foreground">{fmt(result.annual_expenses_breakdown?.reduce((s, e) => s + e.amount, 0) || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Improvement Suggestions */}
              {result.improvement_suggestions?.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Saran Peningkatan Yield</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.improvement_suggestions.map((imp, i) => (
                        <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                          <h4 className="font-medium text-sm text-foreground">{imp.improvement}</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div>
                              <p className="text-muted-foreground">Biaya</p>
                              <p className="font-semibold text-foreground">{fmt(imp.estimated_cost)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Kenaikan Sewa</p>
                              <p className="font-semibold text-green-500">+{fmt(imp.rent_increase_potential)}/bln</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">ROI</p>
                              <p className="font-semibold text-foreground">{imp.roi_months} bulan</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Market Comparison */}
              {result.market_comparison?.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Perbandingan Pasar</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="text-left py-2 text-muted-foreground font-medium">Metrik</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Properti Anda</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Rata-rata Area</th>
                            <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.market_comparison.map((m, i) => (
                            <tr key={i} className="border-b border-border/30">
                              <td className="py-2.5 text-foreground">{m.metric}</td>
                              <td className="py-2.5 text-right font-medium text-foreground">{m.your_property}</td>
                              <td className="py-2.5 text-right text-muted-foreground">{m.area_average}</td>
                              <td className="py-2.5 text-center"><StatusArrow status={m.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Tren Musiman</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.seasonal_trends?.map((t, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-primary/60 flex-shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-destructive/20">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Faktor Risiko</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.risk_factors?.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Shield className="h-3.5 w-3.5 mt-0.5 text-destructive/60 flex-shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Rekomendasi</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations?.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary/60 flex-shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
