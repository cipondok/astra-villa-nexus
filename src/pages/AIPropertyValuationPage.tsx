import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Home, MapPin, BarChart3, Download, Building2, AlertCircle, ChevronRight, DollarSign, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePropertyValuationReport, ValuationReportResult } from "@/hooks/usePropertyValuationReport";
import { toast } from "sonner";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const PROPERTY_TYPES = ["Rumah", "Apartemen", "Villa", "Ruko", "Tanah", "Townhouse", "Penthouse"];
const CERTIFICATE_TYPES = ["SHM", "HGB", "Strata Title", "SHGB", "AJB", "Girik"];
const CONDITIONS = ["Baru", "Sangat Baik", "Baik", "Cukup", "Perlu Renovasi"];

export default function AIPropertyValuationPage() {
  const mutation = usePropertyValuationReport();
  const resultRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    property_type: "Rumah",
    city: "",
    district: "",
    land_area_sqm: "",
    building_area_sqm: "",
    bedrooms: "",
    bathrooms: "",
    certificate_type: "SHM",
    year_built: "",
    condition: "Baik",
    current_asking_price: "",
    purpose: "sale" as "sale" | "rental" | "investment",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city || !form.land_area_sqm) {
      toast.error("Kota dan luas tanah wajib diisi");
      return;
    }
    try {
      await mutation.mutateAsync({
        property_type: form.property_type,
        city: form.city,
        district: form.district || undefined,
        land_area_sqm: Number(form.land_area_sqm),
        building_area_sqm: form.building_area_sqm ? Number(form.building_area_sqm) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        certificate_type: form.certificate_type,
        year_built: form.year_built ? Number(form.year_built) : undefined,
        condition: form.condition,
        current_asking_price: form.current_asking_price ? Number(form.current_asking_price) : undefined,
        purpose: form.purpose,
      });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch {
      toast.error("Gagal menghasilkan laporan. Silakan coba lagi.");
    }
  };

  const r = mutation.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary tracking-wide uppercase">AI Valuation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Laporan Valuasi Properti AI</h1>
            <p className="text-muted-foreground text-lg">
              Dapatkan estimasi nilai pasar, analisis komparatif, dan proyeksi investasi berdasarkan data pasar Indonesia terkini.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="sticky top-24 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" /> Detail Properti
                </CardTitle>
                <CardDescription>Isi informasi properti untuk mendapatkan valuasi akurat</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Tipe Properti</Label>
                    <select value={form.property_type} onChange={(e) => set("property_type", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Kota *</Label>
                      <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Jakarta Selatan" required />
                    </div>
                    <div>
                      <Label>Kecamatan</Label>
                      <Input value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="Kebayoran Baru" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>LT (m²) *</Label>
                      <Input type="number" value={form.land_area_sqm} onChange={(e) => set("land_area_sqm", e.target.value)} placeholder="200" required />
                    </div>
                    <div>
                      <Label>LB (m²)</Label>
                      <Input type="number" value={form.building_area_sqm} onChange={(e) => set("building_area_sqm", e.target.value)} placeholder="150" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>KT</Label>
                      <Input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="3" />
                    </div>
                    <div>
                      <Label>KM</Label>
                      <Input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Sertifikat</Label>
                      <select value={form.certificate_type} onChange={(e) => set("certificate_type", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {CERTIFICATE_TYPES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Tahun Bangun</Label>
                      <Input type="number" value={form.year_built} onChange={(e) => set("year_built", e.target.value)} placeholder="2020" />
                    </div>
                  </div>
                  <div>
                    <Label>Kondisi</Label>
                    <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Harga Permintaan (opsional)</Label>
                    <Input type="number" value={form.current_asking_price} onChange={(e) => set("current_asking_price", e.target.value)} placeholder="2000000000" />
                  </div>
                  <div>
                    <Label>Tujuan</Label>
                    <select value={form.purpose} onChange={(e) => set("purpose", e.target.value as any)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="sale">Jual</option>
                      <option value="rental">Sewa</option>
                      <option value="investment">Investasi</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Menganalisis..." : "Generate Laporan Valuasi"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <div ref={resultRef} className="lg:col-span-3 space-y-6">
            {!r && !mutation.isPending && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Siap Menganalisis</h3>
                <p className="text-muted-foreground max-w-sm">Isi detail properti di sebelah kiri dan klik Generate untuk mendapatkan laporan valuasi komprehensif.</p>
              </div>
            )}

            {mutation.isPending && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">AI sedang menganalisis data pasar...</p>
              </div>
            )}

            {r && <ValuationReport data={r} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValuationReport({ data: r }: { data: ValuationReportResult }) {
  const trendColor = r.market_analysis.area_trend === "appreciating" ? "text-green-600" : r.market_analysis.area_trend === "declining" ? "text-destructive" : "text-yellow-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Main Valuation Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Estimasi Nilai Pasar</p>
            <p className="text-4xl font-bold text-primary">{formatIDR(r.estimated_market_value)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {formatIDR(r.value_range_low)} — {formatIDR(r.value_range_high)}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-lg font-bold text-foreground">{r.confidence_level}%</p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Harga/m² Tanah</p>
              <p className="text-lg font-bold text-foreground">{formatIDR(r.price_per_sqm_land)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/60 border border-border/30">
              <p className="text-xs text-muted-foreground">Harga/m² Bangunan</p>
              <p className="text-lg font-bold text-foreground">{formatIDR(r.price_per_sqm_building)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparable Sales */}
      {r.comparable_sales?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Penjualan Komparatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {r.comparable_sales.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{c.address}</p>
                    <p className="text-xs text-muted-foreground">{c.property_type} · {c.land_area_sqm}m² LT · {c.building_area_sqm}m² LB · {c.sale_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground text-sm">{formatIDR(c.sale_price)}</p>
                    <p className="text-xs text-muted-foreground">{formatIDR(c.price_per_sqm)} /m²</p>
                  </div>
                  <div className="ml-3 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold">{c.similarity_score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Analisis Pasar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Tren Area</p>
              <p className={`text-sm font-bold capitalize ${trendColor}`}>{r.market_analysis.area_trend}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Apresiasi/Tahun</p>
              <p className="text-sm font-bold text-foreground">{r.market_analysis.annual_appreciation_rate}%</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Avg DOM</p>
              <p className="text-sm font-bold text-foreground">{r.market_analysis.avg_days_on_market} hari</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Supply/Demand</p>
              <p className="text-sm font-bold text-foreground">{r.market_analysis.supply_demand_ratio}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{r.market_analysis.market_summary}</p>
        </CardContent>
      </Card>

      {/* Investment Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Metrik Investasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Rental Yield", value: `${r.investment_metrics.estimated_rental_yield}%` },
              { label: "Sewa Bulanan Est.", value: formatIDR(r.investment_metrics.estimated_monthly_rent) },
              { label: "Cap Rate", value: `${r.investment_metrics.cap_rate}%` },
              { label: "Payback Period", value: `${r.investment_metrics.payback_period_years} tahun` },
              { label: "Proyeksi 5 Tahun", value: formatIDR(r.investment_metrics.five_year_projection) },
              { label: "Proyeksi 10 Tahun", value: formatIDR(r.investment_metrics.ten_year_projection) },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-sm font-bold text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg text-green-600">✓ Kelebihan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {r.property_strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <ChevronRight className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg text-destructive">✗ Kekurangan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {r.property_weaknesses?.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Value Adjustments */}
      {r.value_adjustments?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Penyesuaian Nilai</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {r.value_adjustments.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.factor}</p>
                    <p className="text-xs text-muted-foreground">{a.reason}</p>
                  </div>
                  <span className={`text-sm font-bold ${a.adjustment_percent >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {a.adjustment_percent > 0 ? "+" : ""}{a.adjustment_percent}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {r.recommendations?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">💡 Rekomendasi</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {r.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {r.disclaimer || "Laporan ini bersifat estimasi berdasarkan data pasar dan AI. Untuk valuasi resmi, konsultasikan dengan penilai properti bersertifikat (KJPP)."}
        </p>
      </div>
    </motion.div>
  );
}
