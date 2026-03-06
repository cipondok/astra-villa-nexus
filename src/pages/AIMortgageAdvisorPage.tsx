import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, DollarSign, ShieldCheck, TrendingUp, Loader2, Sparkles, Building2, Clock, FileText, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Percent, User, Briefcase, Home, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useMortgageAdvisor, MortgageAdvisorResult, BankComparison } from "@/hooks/useMortgageAdvisor";
import { useToast } from "@/hooks/use-toast";

const PROPERTY_TYPES = ["Rumah", "Apartemen", "Ruko", "Villa", "Townhouse"];
const EMPLOYMENT_TYPES = [
  { value: "salaried" as const, label: "Karyawan" },
  { value: "self_employed" as const, label: "Wiraswasta" },
  { value: "freelancer" as const, label: "Freelancer" },
  { value: "business_owner" as const, label: "Pemilik Bisnis" },
];

function fmt(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function AffordabilityBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    comfortable: { label: "Nyaman", cls: "bg-green-500/10 text-green-600 border-green-500/20" },
    moderate: { label: "Moderat", cls: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    stretched: { label: "Ketat", cls: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    not_recommended: { label: "Tidak Disarankan", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const m = map[status] || map.not_recommended;
  return <Badge className={m.cls}>{m.label}</Badge>;
}

function RiskBadge({ level }: { level: string }) {
  if (level === "low") return <Badge variant="outline" className="text-green-600 border-green-500/30 text-xs">Rendah</Badge>;
  if (level === "medium") return <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 text-xs">Sedang</Badge>;
  return <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">Tinggi</Badge>;
}

function BankCard({ bank, index }: { bank: BankComparison; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <Card className="border-border/50 hover:border-primary/30 transition-colors h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {bank.bank_name}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Eligibility</span>
              <Badge variant={bank.eligibility_score >= 80 ? "default" : "secondary"} className="text-xs">{bank.eligibility_score}%</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Fixed Rate</p>
              <p className="text-lg font-bold text-foreground">{bank.interest_rate_fixed}%</p>
              <p className="text-xs text-muted-foreground">{bank.fixed_period_years} tahun</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Floating Rate</p>
              <p className="text-lg font-bold text-foreground">{bank.interest_rate_floating}%</p>
              <p className="text-xs text-muted-foreground">setelah fixed</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cicilan (Fixed)</span>
              <span className="font-semibold text-foreground">{fmt(bank.monthly_installment_fixed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cicilan (Floating)</span>
              <span className="font-semibold text-foreground">{fmt(bank.monthly_installment_floating)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya Provisi</span>
              <span className="text-foreground">{bank.processing_fee_percent}%</span>
            </div>
            <div className="flex justify-between border-t border-border/30 pt-2">
              <span className="text-muted-foreground">Total Biaya</span>
              <span className="font-bold text-foreground">{fmt(bank.total_cost_over_tenor)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              {bank.pros.map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" /> {p}
                </p>
              ))}
            </div>
            <div className="space-y-1">
              {bank.cons.map((c, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <XCircle className="h-3 w-3 mt-0.5 text-destructive/60 flex-shrink-0" /> {c}
                </p>
              ))}
            </div>
          </div>
          {bank.special_offers && (
            <div className="bg-primary/5 rounded-md p-2 border border-primary/10">
              <p className="text-xs text-primary font-medium">🎁 {bank.special_offers}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AIMortgageAdvisorPage() {
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("20");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [employment, setEmployment] = useState<"salaried" | "self_employed" | "freelancer" | "business_owner">("salaried");
  const [employmentYears, setEmploymentYears] = useState("");
  const [age, setAge] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [existingLoans, setExistingLoans] = useState("");
  const [tenor, setTenor] = useState("");
  const [isFirstHome, setIsFirstHome] = useState(true);
  const [result, setResult] = useState<MortgageAdvisorResult | null>(null);

  const mutation = useMortgageAdvisor();
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!propertyPrice || !monthlyIncome || !age || !propertyType || !location) {
      toast({ title: "Data belum lengkap", description: "Harga, pendapatan, usia, tipe & lokasi wajib diisi.", variant: "destructive" });
      return;
    }
    mutation.mutate({
      property_price: Number(propertyPrice),
      down_payment_percent: Number(downPayment) || undefined,
      monthly_income: Number(monthlyIncome),
      monthly_expenses: monthlyExpenses ? Number(monthlyExpenses) : undefined,
      employment_type: employment,
      employment_duration_years: employmentYears ? Number(employmentYears) : undefined,
      age: Number(age),
      property_type: propertyType,
      property_location: location,
      existing_loans: existingLoans ? Number(existingLoans) : undefined,
      preferred_tenor_years: tenor ? Number(tenor) : undefined,
      is_first_home: isFirstHome,
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
              <Landmark className="h-4 w-4" />
              AI Mortgage Advisor
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Konsultan KPR <span className="text-primary">Cerdas</span> Berbasis AI
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Bandingkan penawaran bank, cek kelayakan, dan dapatkan rekomendasi KPR terbaik sesuai profil keuangan Anda.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profil Keuangan & Properti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Harga Properti (IDR) *</label>
                  <Input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} placeholder="1500000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">DP (%)</label>
                  <Input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tenor Preferensi (tahun)</label>
                  <Input type="number" value={tenor} onChange={(e) => setTenor(e.target.value)} placeholder="20" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Pendapatan Bulanan (IDR) *</label>
                  <Input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="25000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Pengeluaran Bulanan (IDR)</label>
                  <Input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} placeholder="10000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Cicilan Lain (IDR/bln)</label>
                  <Input type="number" value={existingLoans} onChange={(e) => setExistingLoans(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Pekerjaan *</label>
                  <Select value={employment} onValueChange={(v) => setEmployment(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EMPLOYMENT_TYPES.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Lama Bekerja (tahun)</label>
                  <Input type="number" value={employmentYears} onChange={(e) => setEmploymentYears(e.target.value)} placeholder="5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Usia *</label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipe Properti *</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Lokasi Properti *</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="BSD City, Tangerang Selatan" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={isFirstHome} onCheckedChange={setIsFirstHome} />
                  <label className="text-sm text-foreground">Rumah Pertama (eligible subsidi)</label>
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={mutation.isPending} size="lg" className="w-full md:w-auto">
                {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menganalisis...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analisis KPR</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Eligibility Score", value: `${result.eligibility_score}%`, icon: ShieldCheck, extra: <AffordabilityBadge status={result.affordability_status} /> },
                  { label: "Maks Pinjaman", value: fmt(result.max_loan_amount), icon: DollarSign, extra: <span className="text-xs text-muted-foreground">DP: {result.recommended_down_payment_percent}%</span> },
                  { label: "DSR (Debt Service Ratio)", value: `${result.debt_service_ratio}%`, icon: BarChart3, extra: <span className="text-xs text-muted-foreground">{result.debt_service_ratio <= 30 ? "Ideal" : result.debt_service_ratio <= 40 ? "Acceptable" : "Tinggi"}</span> },
                  { label: "Tenor Rekomendasi", value: `${result.recommended_tenor_years} th`, icon: Clock, extra: <span className="text-xs text-muted-foreground">{result.timeline_estimate}</span> },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                      <Card className="border-border/50">
                        <CardContent className="pt-5 pb-4 space-y-1.5">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-xs">{kpi.label}</span>
                          </div>
                          <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                          {kpi.extra}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bank Comparisons */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Perbandingan Bank
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.bank_comparisons?.map((bank, i) => <BankCard key={i} bank={bank} index={i} />)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DP Analysis */}
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Analisis Down Payment</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {result.optimal_down_payment_analysis?.map((dp, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">DP {dp.down_payment_percent}%</span>
                          <Badge variant="outline" className="text-xs">{fmt(dp.monthly_installment)}/bln</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Total bunga: {fmt(dp.total_interest_paid)}</p>
                        <p className="text-xs text-primary">{dp.recommendation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" /> Penilaian Risiko</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {result.risk_assessment?.map((r, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <RiskBadge level={r.level} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.factor}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Subsidy */}
              {result.subsidy_eligibility?.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> Kelayakan Subsidi / Program</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.subsidy_eligibility.map((s, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${s.eligible ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-border/50"} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground">{s.program_name}</h4>
                            {s.eligible ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <p className="text-xs text-primary font-medium">{s.potential_benefit}</p>
                          <ul className="space-y-0.5">
                            {s.requirements.map((r, j) => (
                              <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" /> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips & Documents */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Tips KPR</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.tips?.map((t, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-primary/60 flex-shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Dokumen Diperlukan</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.documents_needed?.map((d, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-primary/60 flex-shrink-0" /> {d}
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
