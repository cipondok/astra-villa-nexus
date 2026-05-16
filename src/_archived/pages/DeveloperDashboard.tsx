import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Plus, Building2, MapPin, Users, Eye, Loader2, Rocket, Lock,
  TrendingUp, DollarSign, Mail, Phone, Calendar, CheckCircle, XCircle,
  Clock, ChevronRight, BarChart3, Sparkles, Edit, Trash2, ToggleLeft, ToggleRight,
  Bed, Bath, Square, Home, Send,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import {
  useMyDeveloperProjects, useProjectLeads, useProjectUnits,
  useCreateDeveloperProject, useUpdateDeveloperProject,
  useCreateProjectUnit, useUpdateProjectUnit, useUpdateLeadStatus,
  PHASE_CONFIG, LEAD_STATUS_CONFIG, DeveloperProject,
} from '@/hooks/useDeveloperProjects';
import { SEOHead } from '@/components/SEOHead';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

// ─── Create Project Dialog ───
const CreateProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const createProject = useCreateDeveloperProject();
  const [form, setForm] = useState({
    project_name: '', developer_name: '', city: '', district: '', property_type: 'villa',
    description: '', total_units: '', price_range_min: '', price_range_max: '',
    expected_completion_date: '', launch_date: '', launch_phase: 'pre_launch',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name.trim() || !form.city.trim()) return;
    createProject.mutate({
      project_name: form.project_name,
      developer_name: form.developer_name || null,
      city: form.city,
      district: form.district || null,
      property_type: form.property_type,
      description: form.description || null,
      total_units: form.total_units ? parseInt(form.total_units) : 0,
      available_units: form.total_units ? parseInt(form.total_units) : 0,
      price_range_min: form.price_range_min ? parseFloat(form.price_range_min.replace(/\D/g, '')) : null,
      price_range_max: form.price_range_max ? parseFloat(form.price_range_max.replace(/\D/g, '')) : null,
      expected_completion_date: form.expected_completion_date || null,
      launch_date: form.launch_date || null,
      launch_phase: form.launch_phase,
    } as any, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-1.5 h-9"><Plus className="h-4 w-4" /> Buat Proyek</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-5 w-5 text-primary" /> Proyek Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Nama Proyek *</Label>
              <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required maxLength={100} className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Developer</Label>
              <Input value={form.developer_name} onChange={e => setForm(p => ({ ...p, developer_name: e.target.value }))} maxLength={100} className="h-9 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Kota *</Label>
              <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">District</Label>
              <Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipe</Label>
              <Select value={form.property_type} onValueChange={v => setForm(p => ({ ...p, property_type: v }))}>
                <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['villa', 'apartment', 'house', 'townhouse', 'commercial'].map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Total Unit</Label>
              <Input type="number" value={form.total_units} onChange={e => setForm(p => ({ ...p, total_units: e.target.value }))} className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Harga Min</Label>
              <Input value={form.price_range_min} onChange={e => setForm(p => ({ ...p, price_range_min: e.target.value.replace(/\D/g, '') }))} className="h-9 rounded-xl" placeholder="IDR" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Harga Max</Label>
              <Input value={form.price_range_max} onChange={e => setForm(p => ({ ...p, price_range_max: e.target.value.replace(/\D/g, '') }))} className="h-9 rounded-xl" placeholder="IDR" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Launch Date</Label>
              <Input type="date" value={form.launch_date} onChange={e => setForm(p => ({ ...p, launch_date: e.target.value }))} className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Completion</Label>
              <Input type="date" value={form.expected_completion_date} onChange={e => setForm(p => ({ ...p, expected_completion_date: e.target.value }))} className="h-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phase</Label>
              <Select value={form.launch_phase} onValueChange={v => setForm(p => ({ ...p, launch_phase: v }))}>
                <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PHASE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Deskripsi</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl resize-none" maxLength={2000} />
          </div>
          <Button type="submit" disabled={createProject.isPending} className="w-full rounded-xl h-10">
            {createProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4 mr-1.5" />}
            Buat Proyek
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Project Detail Panel ───
const ProjectDetailPanel = ({ project }: { project: DeveloperProject }) => {
  const navigate = useNavigate();
  const formatPrice = getCurrencyFormatterShort();
  const [tab, setTab] = useState('leads');
  const { data: leads = [], isLoading: leadsLoading } = useProjectLeads(project.id);
  const { data: units = [], isLoading: unitsLoading } = useProjectUnits(project.id);
  const updateProject = useUpdateDeveloperProject();
  const updateLead = useUpdateLeadStatus();
  const createUnit = useCreateProjectUnit();

  const [unitForm, setUnitForm] = useState({ unit_name: '', unit_type: 'Standard', price: '', bedrooms: '', bathrooms: '', building_area_sqm: '' });
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);

  const handleTogglePublish = () => {
    updateProject.mutate({ id: project.id, is_published: !project.is_published } as any);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.unit_name || !unitForm.price) return;
    createUnit.mutate({
      project_id: project.id,
      unit_name: unitForm.unit_name,
      unit_type: unitForm.unit_type,
      price: parseFloat(unitForm.price.replace(/\D/g, '')),
      bedrooms: unitForm.bedrooms ? parseInt(unitForm.bedrooms) : null,
      bathrooms: unitForm.bathrooms ? parseInt(unitForm.bathrooms) : null,
      building_area_sqm: unitForm.building_area_sqm ? parseFloat(unitForm.building_area_sqm) : null,
    } as any, { onSuccess: () => { setUnitDialogOpen(false); setUnitForm({ unit_name: '', unit_type: 'Standard', price: '', bedrooms: '', bathrooms: '', building_area_sqm: '' }); } });
  };

  const phase = PHASE_CONFIG[project.launch_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.pre_launch;
  const newLeads = leads.filter(l => l.status === 'new').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold">{project.project_name}</h2>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {project.city}
                {project.developer_name && ` • ${project.developer_name}`}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Badge variant="outline" className={cn('text-[9px]', phase.color)}>{phase.icon} {phase.label}</Badge>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={() => navigate(`/projects/${project.id}`)}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center"><p className="text-sm font-bold">{project.total_units}</p><p className="text-[8px] text-muted-foreground">Unit</p></div>
            <div className="text-center"><p className="text-sm font-bold text-chart-2">{project.available_units}</p><p className="text-[8px] text-muted-foreground">Tersedia</p></div>
            <div className="text-center"><p className="text-sm font-bold text-primary">{project.total_leads}</p><p className="text-[8px] text-muted-foreground">Leads</p></div>
            <div className="text-center"><p className="text-sm font-bold">{project.total_views}</p><p className="text-[8px] text-muted-foreground">Views</p></div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs rounded-xl gap-1" onClick={handleTogglePublish}>
              {project.is_published ? <><ToggleRight className="h-3.5 w-3.5 text-chart-2" /> Published</> : <><ToggleLeft className="h-3.5 w-3.5" /> Draft</>}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs rounded-xl gap-1"
              onClick={() => updateProject.mutate({ id: project.id, is_featured: !project.is_featured } as any)}>
              {project.is_featured ? '⭐ Featured' : '☆ Feature'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Leads / Units / Analytics */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-muted rounded-xl h-9">
          <TabsTrigger value="leads" className="flex-1 text-xs rounded-lg">
            Leads {newLeads > 0 && <Badge className="ml-1 h-4 text-[8px] bg-primary">{newLeads}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="units" className="flex-1 text-xs rounded-lg">Units ({units.length})</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 text-xs rounded-lg">Analytics</TabsTrigger>
        </TabsList>

        {/* Leads */}
        <TabsContent value="leads" className="mt-3">
          {leadsLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : leads.length === 0 ? (
            <Card className="rounded-2xl"><CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Belum ada leads</p>
            </CardContent></Card>
          ) : (
            <ScrollArea style={{ maxHeight: '400px' }}>
              <div className="space-y-2">
                {leads.map(lead => {
                  const st = LEAD_STATUS_CONFIG[lead.status as keyof typeof LEAD_STATUS_CONFIG] || LEAD_STATUS_CONFIG.new;
                  return (
                    <Card key={lead.id} className="rounded-xl">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-xs font-bold">{lead.full_name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" />{lead.email}</span>
                              {lead.phone && <span className="flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{lead.phone}</span>}
                            </div>
                          </div>
                          <Badge className={cn('text-[8px]', st.color)}>{st.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1.5">
                          <span>Intent: {lead.intent}</span>
                          {lead.budget_range && <span>Budget: {lead.budget_range}</span>}
                          <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: idLocale })}</span>
                        </div>
                        {lead.message && <p className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg p-2 mb-1.5">{lead.message}</p>}
                        <div className="flex gap-1">
                          {lead.status === 'new' && (
                            <Button size="sm" variant="outline" className="h-6 text-[9px] rounded-lg"
                              onClick={() => updateLead.mutate({ id: lead.id, status: 'contacted' })}>
                              Hubungi
                            </Button>
                          )}
                          {lead.status === 'contacted' && (
                            <Button size="sm" variant="outline" className="h-6 text-[9px] rounded-lg"
                              onClick={() => updateLead.mutate({ id: lead.id, status: 'qualified' })}>
                              Qualify
                            </Button>
                          )}
                          {lead.status === 'qualified' && (
                            <Button size="sm" className="h-6 text-[9px] rounded-lg"
                              onClick={() => updateLead.mutate({ id: lead.id, status: 'converted' })}>
                              Convert
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Units */}
        <TabsContent value="units" className="mt-3 space-y-2">
          <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full rounded-xl h-8 text-xs gap-1">
                <Plus className="h-3 w-3" /> Tambah Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle className="text-sm">Tambah Unit</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateUnit} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Nama Unit *</Label>
                    <Input value={unitForm.unit_name} onChange={e => setUnitForm(p => ({ ...p, unit_name: e.target.value }))} className="h-8 rounded-lg text-xs" required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tipe</Label>
                    <Input value={unitForm.unit_type} onChange={e => setUnitForm(p => ({ ...p, unit_type: e.target.value }))} className="h-8 rounded-lg text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Harga (IDR) *</Label>
                  <Input value={unitForm.price} onChange={e => setUnitForm(p => ({ ...p, price: e.target.value.replace(/\D/g, '') }))} className="h-8 rounded-lg text-xs" required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1"><Label className="text-xs">KT</Label><Input type="number" value={unitForm.bedrooms} onChange={e => setUnitForm(p => ({ ...p, bedrooms: e.target.value }))} className="h-8 rounded-lg text-xs" /></div>
                  <div className="space-y-1"><Label className="text-xs">KM</Label><Input type="number" value={unitForm.bathrooms} onChange={e => setUnitForm(p => ({ ...p, bathrooms: e.target.value }))} className="h-8 rounded-lg text-xs" /></div>
                  <div className="space-y-1"><Label className="text-xs">LB m²</Label><Input type="number" value={unitForm.building_area_sqm} onChange={e => setUnitForm(p => ({ ...p, building_area_sqm: e.target.value }))} className="h-8 rounded-lg text-xs" /></div>
                </div>
                <Button type="submit" disabled={createUnit.isPending} className="w-full h-9 rounded-xl">
                  {createUnit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tambah'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {unitsLoading ? (
            <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : units.length === 0 ? (
            <Card className="rounded-xl"><CardContent className="p-4 text-center text-xs text-muted-foreground">
              <Home className="h-6 w-6 mx-auto mb-1 text-muted-foreground/40" /> Belum ada unit
            </CardContent></Card>
          ) : (
            <div className="space-y-1.5">
              {units.map(u => (
                <Card key={u.id} className="rounded-xl">
                  <CardContent className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{u.unit_name} <span className="text-muted-foreground font-normal">({u.unit_type})</span></p>
                      <div className="flex gap-2 text-[9px] text-muted-foreground">
                        <span className="font-medium text-primary">{formatIDR(u.price)}</span>
                        {u.bedrooms && <span>{u.bedrooms}KT</span>}
                        {u.building_area_sqm && <span>{u.building_area_sqm}m²</span>}
                      </div>
                    </div>
                    <Select defaultValue={u.status} onValueChange={async (v) => {
                      await (supabase as any).from('project_units').update({ status: v }).eq('id', u.id);
                    }}>
                      <SelectTrigger className="h-7 w-24 text-[9px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-3">
          <Card className="rounded-2xl border-primary/15 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Market Demand
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Demand Score</span><p className="font-bold">{project.ai_demand_score || '—'}</p></div>
                <div><span className="text-muted-foreground">Demand Label</span><p className="font-bold">{project.ai_demand_label || '—'}</p></div>
                <div><span className="text-muted-foreground">Rental Yield</span><p className="font-bold text-chart-2">{project.ai_rental_yield ? `${project.ai_rental_yield}%` : '—'}</p></div>
                <div><span className="text-muted-foreground">ROI 5Y</span><p className="font-bold text-chart-2">{project.ai_roi_5y ? `${project.ai_roi_5y}%` : '—'}</p></div>
              </div>
              <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                <p>Total leads: {project.total_leads} • Total views: {project.total_views}</p>
                <p>Conversion rate: {project.total_leads > 0 ? ((project.sold_units / project.total_leads) * 100).toFixed(1) : '0'}%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Main Dashboard ───
const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useMyDeveloperProjects();
  const [selectedProject, setSelectedProject] = useState<DeveloperProject | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="rounded-2xl max-w-sm w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-lg font-bold">Login Diperlukan</h2>
            <Button onClick={() => navigate('/auth')} className="rounded-xl w-full">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Developer Dashboard" description="Kelola proyek pengembangan properti dan leads Anda." noIndex />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => selectedProject ? setSelectedProject(null) : navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedProject ? selectedProject.project_name : 'Developer Dashboard'}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {selectedProject ? 'Kelola proyek' : `${projects.length} proyek`}
            </p>
          </div>
          {!selectedProject && <CreateProjectDialog />}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {selectedProject ? (
          <ProjectDetailPanel project={selectedProject} />
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Proyek', value: projects.length, icon: Building2 },
                { label: 'Total Unit', value: projects.reduce((s, p) => s + p.total_units, 0), icon: Home },
                { label: 'Total Leads', value: projects.reduce((s, p) => s + p.total_leads, 0), icon: Users },
                { label: 'Published', value: projects.filter(p => p.is_published).length, icon: Eye },
              ].map(s => (
                <Card key={s.label} className="rounded-2xl">
                  <CardContent className="p-2.5 text-center">
                    <s.icon className="h-3.5 w-3.5 mx-auto text-primary mb-0.5" />
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[8px] text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Project List */}
            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
            ) : projects.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="p-10 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-sm font-bold mb-1">Belum Ada Proyek</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">Buat proyek pertama Anda untuk mulai menerima leads</p>
                  <CreateProjectDialog />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {projects.map((project, i) => {
                  const phase = PHASE_CONFIG[project.launch_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.pre_launch;
                  const img = project.hero_images?.[0];
                  return (
                    <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card
                        className="rounded-2xl border-border/30 hover:border-primary/20 transition-all cursor-pointer active:scale-[0.98]"
                        onClick={() => setSelectedProject(project)}
                      >
                        <CardContent className="p-3 flex gap-3">
                          <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {img ? <img src={img} alt="" className="h-full w-full object-cover" /> :
                              <div className="h-full w-full flex items-center justify-center"><Building2 className="h-6 w-6 text-muted-foreground/40" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Badge variant="outline" className={cn('text-[8px] px-1.5 py-0', phase.color)}>{phase.icon} {phase.label}</Badge>
                              {project.is_published && <Badge variant="outline" className="text-[8px] px-1.5 py-0 bg-chart-2/10 text-chart-2">Live</Badge>}
                              {!project.is_published && <Badge variant="outline" className="text-[8px] px-1.5 py-0">Draft</Badge>}
                            </div>
                            <p className="text-xs font-bold truncate">{project.project_name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" /> {project.city}
                              {project.developer_name && ` • ${project.developer_name}`}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                              <span><strong className="text-foreground">{project.total_units}</strong> unit</span>
                              <span><strong className="text-chart-2">{project.available_units}</strong> tersedia</span>
                              <span><strong className="text-primary">{project.total_leads}</strong> leads</span>
                              {project.price_range_min && <span className="font-medium text-foreground">{formatIDR(project.price_range_min)}</span>}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
