import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useProjectLaunch, ProjectLaunchResult } from '@/hooks/useProjectLaunch';
import {
  Rocket, TrendingUp, Building2, MapPin, DollarSign, Loader2,
  Flame, Sparkles, BarChart3, Target, CalendarClock, Users,
  ArrowUpRight, FileText, BriefcaseBusiness,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const GRADE_STYLES: Record<string, string> = {
  'A+': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'A': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'B+': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'B': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'C': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'D': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const DEMAND_STYLES: Record<string, string> = {
  'Very Hot': 'bg-red-500/15 text-red-400',
  'Hot': 'bg-orange-500/15 text-orange-400',
  'Warm': 'bg-amber-500/15 text-amber-400',
  'Stable': 'bg-blue-500/15 text-blue-400',
  'Cool': 'bg-muted text-muted-foreground',
};

export default function ProjectLaunchPanel() {
  const [form, setForm] = useState({
    project_name: '',
    city: '',
    district: '',
    property_type: 'Villa',
    total_units: '',
    price_per_unit: '',
    building_area_avg: '',
    land_area_avg: '',
    amenities: '',
    completion_date: '',
    developer_name: '',
  });

  const mutation = useProjectLaunch();
  const result = mutation.data;

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleLaunch = () => {
    if (!form.project_name || !form.city || !form.price_per_unit) return;
    mutation.mutate({
      project_name: form.project_name,
      city: form.city,
      district: form.district || undefined,
      property_type: form.property_type || undefined,
      total_units: form.total_units ? Number(form.total_units) : undefined,
      price_per_unit: Number(form.price_per_unit.replace(/\D/g, '')),
      building_area_avg: form.building_area_avg ? Number(form.building_area_avg) : undefined,
      land_area_avg: form.land_area_avg ? Number(form.land_area_avg) : undefined,
      amenities: form.amenities || undefined,
      completion_date: form.completion_date || undefined,
      developer_name: form.developer_name || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-5 w-5 text-primary" />
            Developer Project Launch
          </CardTitle>
          <CardDescription>Analisis kelayakan proyek dan generate materi pemasaran dengan AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Project & Developer */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nama Proyek *</label>
              <Input placeholder="e.g. Grand Bali Residence" value={form.project_name} onChange={e => updateField('project_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nama Developer</label>
              <Input placeholder="e.g. PT Maju Properti" value={form.developer_name} onChange={e => updateField('developer_name', e.target.value)} />
            </div>
          </div>

          {/* Row 2: Location */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Kota *</label>
              <Input placeholder="e.g. Bali" value={form.city} onChange={e => updateField('city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Area / District</label>
              <Input placeholder="e.g. Canggu" value={form.district} onChange={e => updateField('district', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tipe Properti</label>
              <Input placeholder="e.g. Villa, Apartment" value={form.property_type} onChange={e => updateField('property_type', e.target.value)} />
            </div>
          </div>

          {/* Row 3: Pricing & Units */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Harga per Unit (IDR) *</label>
              <Input placeholder="e.g. 2500000000" value={form.price_per_unit} onChange={e => updateField('price_per_unit', e.target.value.replace(/\D/g, ''))} />
              {form.price_per_unit && <p className="text-[10px] text-muted-foreground">{formatIDR(Number(form.price_per_unit))}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Total Unit</label>
              <Input type="number" placeholder="e.g. 50" value={form.total_units} onChange={e => updateField('total_units', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tanggal Selesai</label>
              <Input type="date" value={form.completion_date} onChange={e => updateField('completion_date', e.target.value)} />
            </div>
          </div>

          {/* Row 4: Areas */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Luas Bangunan Avg (m²)</label>
              <Input type="number" placeholder="e.g. 150" value={form.building_area_avg} onChange={e => updateField('building_area_avg', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Luas Tanah Avg (m²)</label>
              <Input type="number" placeholder="e.g. 200" value={form.land_area_avg} onChange={e => updateField('land_area_avg', e.target.value)} />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fasilitas / Amenities</label>
            <Input placeholder="e.g. Pool, Gym, Rooftop Bar, Security 24h" value={form.amenities} onChange={e => updateField('amenities', e.target.value)} />
          </div>

          <Button
            onClick={handleLaunch}
            disabled={mutation.isPending || !form.project_name || !form.city || !form.price_per_unit}
            className="w-full"
            size="lg"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Menganalisis & Generating...</>
            ) : (
              <><Rocket className="h-4 w-4" /> Launch Project Analysis</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header Score Card */}
            <Card className="border-primary/30 bg-card/80 backdrop-blur overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{result.project_name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {result.city}{result.district ? `, ${result.district}` : ''}
                      {result.developer_name && <span className="ml-2">• {result.developer_name}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-2xl font-bold px-4 py-1.5 border ${GRADE_STYLES[result.grade] || GRADE_STYLES['C']}`}>
                      {result.grade}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Score: {result.project_score}/100</p>
                  </div>
                </div>
                <Progress value={result.project_score} className="h-2 mt-4" />
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard icon={DollarSign} label="Harga/Unit" value={formatIDR(result.price_per_unit)} />
              <MetricCard icon={TrendingUp} label={`ROI 5 Tahun`} value={`${result.roi_estimate}%`} />
              <MetricCard icon={BarChart3} label="Yield" value={`${result.rental_yield}%/yr`} />
              <MetricCard icon={Flame} label="Demand" value={result.demand_level} badgeClass={DEMAND_STYLES[result.demand_level]} />
            </div>

            {/* Financial Projections */}
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Proyeksi Finansial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <DetailRow label="Harga per m²" value={formatIDR(result.price_per_sqm)} />
                    <DetailRow label="Rata-rata Pasar per m²" value={formatIDR(result.market_avg_price_per_sqm)} />
                    <DetailRow label="Selisih vs Pasar" value={`${result.undervalue_percent > 0 ? '+' : ''}${result.undervalue_percent}%`}
                      highlight={result.undervalue_percent > 0} />
                    <DetailRow label="Est. Sewa Bulanan" value={formatIDR(result.est_monthly_rent)} />
                    <DetailRow label="Total Sewa 5 Tahun" value={formatIDR(result.total_rental_income_5y)} />
                  </div>
                  <div className="space-y-3">
                    <DetailRow label="Pertumbuhan Harga/yr" value={`${result.price_growth_rate}%`} />
                    <DetailRow label="Harga Prediksi 3Y" value={formatIDR(result.projected_price_3y)} />
                    <DetailRow label="Harga Prediksi 5Y" value={formatIDR(result.projected_price_5y)} />
                    <DetailRow label="Capital Gain 5Y" value={formatIDR(result.capital_gain_5y)} highlight />
                    <DetailRow label="ROI Annualized" value={`${result.annualized_roi}%`} />
                  </div>
                </div>
                {result.total_units > 1 && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Total Nilai Proyek ({result.total_units} unit)
                      </span>
                      <span className="text-base font-bold text-foreground">{formatIDR(result.total_project_value)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Generated Description */}
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Deskripsi Proyek (AI-Generated)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{result.project_description}</p>
              </CardContent>
            </Card>

            {/* AI Investment Summary */}
            <Card className="border-primary/30 bg-primary/5 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" /> Ringkasan Investasi (AI-Generated)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{result.investment_summary}</p>
              </CardContent>
            </Card>

            {/* Market Context */}
            <Card className="bg-card/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Analisis berdasarkan {result.comparables_count} properti comparable di {result.city} • Generated {new Date(result.generated_at).toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, badgeClass }: { icon: any; label: string; value: string; badgeClass?: string }) {
  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
        {badgeClass ? (
          <Badge className={`text-sm font-bold ${badgeClass}`}>{value}</Badge>
        ) : (
          <p className="text-sm font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-emerald-400' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}
