import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, MapPin, Building2, Calendar, Clock, Bed, Bath, Square, Users,
  Sparkles, TrendingUp, Rocket, Eye, Star, CheckCircle, Lock, AlertTriangle,
  ChevronRight, Home, Loader2, Send, Phone, Mail, User, DollarSign,
  BarChart3, Percent, Layers, Shield, ArrowUpRight, CalendarClock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import {
  useProjectDetail, useProjectUnits, useRegisterProjectInterest,
  PHASE_CONFIG, DEMAND_CONFIG, DeveloperProject,
} from '@/hooks/useDeveloperProjects';
import { SEOHead } from '@/components/SEOHead';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = new Date(targetDate);
  if (isPast(target)) return null;

  const diff = target.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-2 justify-center">
      {[
        { v: days, l: 'Hari' },
        { v: hours, l: 'Jam' },
        { v: mins, l: 'Min' },
        { v: secs, l: 'Det' },
      ].map(({ v, l }) => (
        <div key={l} className="text-center">
          <div className="bg-foreground/10 rounded-xl px-3 py-2 min-w-[52px]">
            <span className="text-xl font-bold text-foreground">{String(v).padStart(2, '0')}</span>
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">{l}</p>
        </div>
      ))}
    </div>
  );
};

const RegisterInterestForm = ({ project }: { project: DeveloperProject }) => {
  const { user } = useAuth();
  const registerInterest = useRegisterProjectInterest();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', budget_range: '', preferred_unit_type: '', message: '', intent: 'interest',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) return;
    registerInterest.mutate({
      project_id: project.id,
      ...form,
      user_id: user?.id,
    }, { onSuccess: () => { setOpen(false); setForm({ full_name: '', email: '', phone: '', budget_range: '', preferred_unit_type: '', message: '', intent: 'interest' }); } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl h-11 text-sm gap-2">
          <Send className="h-4 w-4" /> Register Interest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" /> Daftar Minat — {project.project_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs"><User className="h-3 w-3 inline mr-1" />Nama Lengkap *</Label>
            <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required maxLength={100} className="h-9 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs"><Mail className="h-3 w-3 inline mr-1" />Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required maxLength={100} className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs"><Phone className="h-3 w-3 inline mr-1" />Telepon</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} maxLength={15} className="h-9 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Budget Range</Label>
              <Select value={form.budget_range} onValueChange={v => setForm(p => ({ ...p, budget_range: v }))}>
                <SelectTrigger className="h-9 rounded-xl"><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="<1B">&lt; 1 Miliar</SelectItem>
                  <SelectItem value="1-3B">1 - 3 Miliar</SelectItem>
                  <SelectItem value="3-5B">3 - 5 Miliar</SelectItem>
                  <SelectItem value="5-10B">5 - 10 Miliar</SelectItem>
                  <SelectItem value=">10B">&gt; 10 Miliar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tujuan</Label>
              <Select value={form.intent} onValueChange={v => setForm(p => ({ ...p, intent: v }))}>
                <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interest">Tertarik</SelectItem>
                  <SelectItem value="reservation">Reservasi</SelectItem>
                  <SelectItem value="viewing">Viewing</SelectItem>
                  <SelectItem value="investment">Investasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pesan (Opsional)</Label>
            <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={2} className="rounded-xl resize-none" maxLength={500} />
          </div>
          <Button type="submit" disabled={registerInterest.isPending} className="w-full h-10 rounded-xl">
            {registerInterest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
            Kirim Pendaftaran
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProjectShowcase = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const formatPrice = getCurrencyFormatterShort();
  const { data: project, isLoading } = useProjectDetail(projectId);
  const { data: units = [] } = useProjectUnits(projectId);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="rounded-2xl max-w-sm">
          <CardContent className="p-8 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h2 className="font-bold">Proyek tidak ditemukan</h2>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/new-projects')}>Lihat Semua Proyek</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const phase = PHASE_CONFIG[project.launch_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.pre_launch;
  const allImages = [...(project.hero_images || []), ...(project.gallery_images || [])];
  const availableUnits = units.filter(u => u.status === 'available');
  const reservedUnits = units.filter(u => u.status === 'reserved');
  const soldUnits = units.filter(u => u.status === 'sold');
  const hasCountdown = project.launch_date && isFuture(new Date(project.launch_date));
  const demandInfo = project.ai_demand_label ? DEMAND_CONFIG[project.ai_demand_label as keyof typeof DEMAND_CONFIG] : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${project.project_name} — New Development`}
        description={project.description || `${project.project_name} by ${project.developer_name || 'Developer'} di ${project.city}`}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{project.project_name}</p>
            <p className="text-[10px] text-muted-foreground">{project.developer_name || 'Developer'}</p>
          </div>
          <Badge variant="outline" className={cn('text-[9px] px-2 py-0.5', phase.color)}>
            {phase.icon} {phase.label}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl space-y-5">
        {/* Hero Gallery */}
        {allImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <img src={allImages[activeImg] || allImages[0]} alt={project.project_name} className="w-full h-full object-cover" />
              {project.early_investor_access && (
                <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Early Investor Access
                </div>
              )}
              {project.is_featured && (
                <div className="absolute top-3 right-3 bg-chart-4/90 text-background text-[10px] font-bold px-3 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn('h-14 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                      i === activeImg ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    )}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Countdown */}
        {hasCountdown && (
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center space-y-2">
              <p className="text-xs font-semibold text-primary flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Launch Countdown
              </p>
              <CountdownTimer targetDate={project.launch_date!} />
              <p className="text-[10px] text-muted-foreground">
                Tanggal launch: {format(new Date(project.launch_date!), 'dd MMMM yyyy', { locale: idLocale })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Title + AI Labels */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{project.project_name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5" /> {project.district ? `${project.district}, ` : ''}{project.city}
            {project.developer_name && <span className="ml-2">• {project.developer_name}</span>}
          </p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <Badge variant="outline" className={cn('text-[9px] px-2', phase.color)}>{phase.icon} {phase.label}</Badge>
            {demandInfo && (
              <Badge variant="outline" className={cn('text-[9px] px-2', demandInfo.color)}>
                {demandInfo.emoji} {demandInfo.label}
              </Badge>
            )}
            {project.ai_investment_grade && (
              <Badge variant="outline" className="text-[9px] px-2 bg-chart-2/10 text-chart-2 border-chart-2/20">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Grade {project.ai_investment_grade}
              </Badge>
            )}
            {availableUnits.length <= 3 && availableUnits.length > 0 && (
              <Badge variant="outline" className="text-[9px] px-2 bg-destructive/10 text-destructive border-destructive/20">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Sisa {availableUnits.length} unit!
              </Badge>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Harga Mulai', value: project.price_range_min ? formatPrice(project.price_range_min) : '—', icon: DollarSign },
            { label: 'Total Unit', value: `${project.total_units}`, icon: Building2 },
            { label: 'Tersedia', value: `${project.available_units}`, icon: CheckCircle },
            { label: 'ROI 5Y', value: project.ai_roi_5y ? `${project.ai_roi_5y}%` : '—', icon: TrendingUp },
          ].map(s => (
            <Card key={s.label} className="rounded-2xl border-border/30">
              <CardContent className="p-2.5 text-center">
                <s.icon className="h-3.5 w-3.5 mx-auto text-primary mb-0.5" />
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[8px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted rounded-xl h-9">
            <TabsTrigger value="overview" className="flex-1 text-xs rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="units" className="flex-1 text-xs rounded-lg">Unit ({units.length})</TabsTrigger>
            <TabsTrigger value="location" className="flex-1 text-xs rounded-lg">Lokasi</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-3 space-y-4">
            {project.description && (
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-2">Tentang Proyek</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                </CardContent>
              </Card>
            )}
            {project.concept && (
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Konsep</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{project.concept}</p>
                </CardContent>
              </Card>
            )}
            {project.amenities && project.amenities.length > 0 && (
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-2">Fasilitas</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {project.amenities.map((a, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {project.expected_completion_date && (
              <Card className="rounded-2xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">Target Selesai</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(project.expected_completion_date), 'MMMM yyyy', { locale: idLocale })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Masterplan */}
            {project.masterplan_images && project.masterplan_images.length > 0 && (
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-2">Masterplan</h3>
                  <div className="space-y-2">
                    {project.masterplan_images.map((img, i) => (
                      <img key={i} src={img} alt="Masterplan" className="w-full rounded-xl" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Units */}
          <TabsContent value="units" className="mt-3 space-y-3">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="rounded-xl"><CardContent className="p-2 text-center">
                <p className="text-sm font-bold text-chart-2">{availableUnits.length}</p>
                <p className="text-[8px] text-muted-foreground">Tersedia</p>
              </CardContent></Card>
              <Card className="rounded-xl"><CardContent className="p-2 text-center">
                <p className="text-sm font-bold text-chart-4">{reservedUnits.length}</p>
                <p className="text-[8px] text-muted-foreground">Reserved</p>
              </CardContent></Card>
              <Card className="rounded-xl"><CardContent className="p-2 text-center">
                <p className="text-sm font-bold text-destructive">{soldUnits.length}</p>
                <p className="text-[8px] text-muted-foreground">Sold</p>
              </CardContent></Card>
            </div>

            {units.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Home className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Unit belum tersedia</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {units.map(unit => {
                  const isAvailable = unit.status === 'available';
                  const isReserved = unit.status === 'reserved';
                  return (
                    <Card key={unit.id} className={cn(
                      'rounded-2xl transition-all',
                      isAvailable ? 'border-border/30 hover:border-primary/20' :
                      isReserved ? 'border-chart-4/30 opacity-75' : 'border-destructive/20 opacity-50'
                    )}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="text-xs font-bold text-foreground">{unit.unit_name}</p>
                            <p className="text-[10px] text-muted-foreground">{unit.unit_type}</p>
                          </div>
                          <Badge variant="outline" className={cn('text-[8px]',
                            isAvailable ? 'bg-chart-2/10 text-chart-2 border-chart-2/20' :
                            isReserved ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                          )}>
                            {isAvailable ? 'Available' : isReserved ? 'Reserved' : 'Sold'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1.5">
                          {unit.bedrooms && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{unit.bedrooms} KT</span>}
                          {unit.bathrooms && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{unit.bathrooms} KM</span>}
                          {unit.building_area_sqm && <span className="flex items-center gap-0.5"><Square className="h-3 w-3" />LB {unit.building_area_sqm}m²</span>}
                          {unit.land_area_sqm && <span>LT {unit.land_area_sqm}m²</span>}
                          {unit.view_direction && <span>🧭 {unit.view_direction}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-primary">{formatIDR(unit.price)}</p>
                          {isAvailable && (
                            <RegisterInterestForm project={project} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Location */}
          <TabsContent value="location" className="mt-3 space-y-3">
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Lokasi
                </h3>
                <p className="text-xs text-muted-foreground">{project.full_address || `${project.district ? project.district + ', ' : ''}${project.city}`}</p>
                {project.nearby_landmarks && project.nearby_landmarks.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground">Nearby</p>
                    {project.nearby_landmarks.map((l: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>📍</span>
                        <span>{typeof l === 'string' ? l : l.name || l.label}</span>
                        {l.distance && <span className="text-[10px]">({l.distance})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {project.ai_demand_score && (
              <Card className="rounded-2xl border-primary/15 bg-primary/5">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Market Intelligence
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Demand Score</span><p className="font-bold">{project.ai_demand_score}/100</p></div>
                    {project.ai_rental_yield && <div><span className="text-muted-foreground">Rental Yield</span><p className="font-bold text-chart-2">{project.ai_rental_yield}%</p></div>}
                    {project.ai_roi_5y && <div><span className="text-muted-foreground">ROI 5Y</span><p className="font-bold text-chart-2">{project.ai_roi_5y}%</p></div>}
                    {project.project_score && <div><span className="text-muted-foreground">Project Score</span><p className="font-bold">{project.project_score}/100</p></div>}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Sticky Dual CTA */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/40 p-4 -mx-4">
          <div className="flex gap-2 max-w-4xl mx-auto items-center">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Mulai dari</p>
              <p className="text-base font-bold text-primary">
                {project.price_range_min ? formatIDR(project.price_range_min) : '—'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-10 text-[11px] gap-1.5 border-primary/30 text-primary hover:bg-primary/5 shrink-0"
              onClick={() => navigate(`/schedule-viewing?project=${project.id}`)}
            >
              <CalendarClock className="h-3.5 w-3.5" /> Consultation
            </Button>
            <div className="w-40 shrink-0">
              <RegisterInterestForm project={project} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectShowcase;
