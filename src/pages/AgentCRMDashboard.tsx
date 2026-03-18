import { useState, useMemo } from 'react';
import {
  useAgentLeads, useAgentCRMStats, useCreateLead, useUpdateLead, useDeleteLead, useMoveLead,
  LEAD_STATUS_CONFIG, LEAD_PRIORITY_CONFIG, type CRMLead, type LeadStatus, type LeadPriority,
} from '@/hooks/useAgentCRM';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Plus, Search, Users, TrendingUp, DollarSign, Clock, AlertTriangle, Phone,
  Mail, Calendar, Trash2, GripVertical, ChevronRight, BarChart3, Target,
  MessageSquare, CalendarPlus, Eye, Heart, ArrowUpRight, Zap, Activity,
  Send, ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function timeAgo(date: string) {
  const d = daysSince(date);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

const PIPELINE_STAGES: LeadStatus[] = ['new', 'contacted', 'negotiation', 'closed', 'lost'];

// ── Create/Edit Lead Dialog ──
function LeadFormDialog({
  lead, open, onOpenChange,
}: { lead?: CRMLead | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateLead();
  const update = useUpdateLead();
  const isEdit = !!lead;

  const [form, setForm] = useState({
    lead_name: lead?.lead_name || '',
    lead_email: lead?.lead_email || '',
    lead_phone: lead?.lead_phone || '',
    lead_source: lead?.lead_source || 'manual',
    property_title: lead?.property_title || '',
    status: (lead?.status || 'new') as LeadStatus,
    priority: (lead?.priority || 'medium') as LeadPriority,
    deal_probability: lead?.deal_probability || 0,
    deal_value: lead?.deal_value || 0,
    notes: lead?.notes || '',
    follow_up_date: lead?.follow_up_date?.split('T')[0] || '',
  });

  const handleSubmit = () => {
    if (!form.lead_name.trim()) return;
    const payload = {
      ...form,
      lead_email: form.lead_email || null,
      lead_phone: form.lead_phone || null,
      follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null,
      deal_value: form.deal_value || null,
    };
    if (isEdit && lead) {
      update.mutate({ id: lead.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Lead name *" value={form.lead_name} onChange={e => setForm(f => ({ ...f, lead_name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Email" value={form.lead_email} onChange={e => setForm(f => ({ ...f, lead_email: e.target.value }))} />
            <Input placeholder="Phone" value={form.lead_phone} onChange={e => setForm(f => ({ ...f, lead_phone: e.target.value }))} />
          </div>
          <Input placeholder="Interested property" value={form.property_title} onChange={e => setForm(f => ({ ...f, property_title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.lead_source} onValueChange={v => setForm(f => ({ ...f, lead_source: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="property_inquiry">Property Inquiry</SelectItem>
                <SelectItem value="rental_booking">Rental Booking</SelectItem>
                <SelectItem value="developer_interest">Developer Interest</SelectItem>
                <SelectItem value="watchlist_alert">Watchlist Alert</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as LeadPriority }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_PRIORITY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as LeadStatus }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-[10px] text-muted-foreground">Deal Probability %</label>
              <Input type="number" min={0} max={100} value={form.deal_probability} onChange={e => setForm(f => ({ ...f, deal_probability: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Deal Value (Rp)</label>
              <Input type="number" min={0} value={form.deal_value} onChange={e => setForm(f => ({ ...f, deal_value: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Follow-up Date</label>
              <Input type="date" value={form.follow_up_date} onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} />
            </div>
          </div>
          <Textarea placeholder="Notes..." rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Lead Card ──
function LeadCard({ lead, onEdit }: { lead: CRMLead; onEdit: (l: CRMLead) => void }) {
  const { moveToStatus } = useMoveLead();
  const status = LEAD_STATUS_CONFIG[lead.status];
  const priority = LEAD_PRIORITY_CONFIG[lead.priority];
  const isOverdue = lead.follow_up_date && new Date(lead.follow_up_date) < new Date() && !['closed', 'lost'].includes(lead.status);

  return (
    <div
      onClick={() => onEdit(lead)}
      className={cn(
        'rounded-lg border px-3 py-2.5 cursor-pointer transition-all hover:shadow-md group',
        status.bg,
        isOverdue && 'ring-1 ring-destructive/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{lead.lead_name}</p>
          {lead.property_title && (
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">🏠 {lead.property_title}</p>
          )}
        </div>
        <Badge variant="outline" className={cn('text-[9px] h-4 shrink-0', priority.color)}>
          {priority.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {lead.lead_phone && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{lead.lead_phone}</span>}
        {lead.lead_email && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" />{lead.lead_email}</span>}
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[9px] h-4">{lead.lead_source}</Badge>
          {lead.deal_probability > 0 && (
            <span className="text-[9px] text-muted-foreground">{lead.deal_probability}% prob</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOverdue && <AlertTriangle className="h-3 w-3 text-destructive" />}
          {lead.follow_up_date && (
            <span className={cn('text-[9px]', isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
              <Calendar className="h-2.5 w-2.5 inline mr-0.5" />
              {new Date(lead.follow_up_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Quick actions on hover */}
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {lead.lead_phone && (
          <Button
            variant="ghost" size="sm" className="h-6 text-[9px] px-2 gap-1"
            onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${lead.lead_phone?.replace(/\D/g, '')}`, '_blank'); }}
          >
            <Send className="h-2.5 w-2.5" /> WhatsApp
          </Button>
        )}
        {!['closed', 'lost'].includes(lead.status) && PIPELINE_STAGES.filter(s => s !== lead.status && s !== 'lost').slice(0, 2).map(s => (
          <Button
            key={s} variant="ghost" size="sm" className="h-6 text-[9px] px-2"
            onClick={e => { e.stopPropagation(); moveToStatus(lead.id, s); }}
          >
            {LEAD_STATUS_CONFIG[s].icon} {LEAD_STATUS_CONFIG[s].label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ── Pipeline Kanban ──
function PipelineKanban({ leads, onEdit }: { leads: CRMLead[]; onEdit: (l: CRMLead) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {PIPELINE_STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.status === stage);
        const config = LEAD_STATUS_CONFIG[stage];
        return (
          <div key={stage} className="space-y-2">
            <div className={cn('flex items-center justify-between px-2 py-1.5 rounded-lg border', config.bg)}>
              <span className="text-xs font-semibold">{config.icon} {config.label}</span>
              <Badge variant="secondary" className="text-[9px] h-4">{stageLeads.length}</Badge>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {stageLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onEdit={onEdit} />
              ))}
              {stageLeads.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4">No leads</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Lead Detail Table ──
function LeadDetailTable({ leads, onEdit }: { leads: CRMLead[]; onEdit: (l: CRMLead) => void }) {
  const { moveToStatus } = useMoveLead();

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-[10px] font-semibold w-[180px]">Investor</TableHead>
            <TableHead className="text-[10px] font-semibold">Property Interest</TableHead>
            <TableHead className="text-[10px] font-semibold w-[100px]">Inquiry</TableHead>
            <TableHead className="text-[10px] font-semibold w-[100px]">Stage</TableHead>
            <TableHead className="text-[10px] font-semibold w-[80px]">Priority</TableHead>
            <TableHead className="text-[10px] font-semibold w-[100px]">Deal Value</TableHead>
            <TableHead className="text-[10px] font-semibold w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map(lead => {
              const status = LEAD_STATUS_CONFIG[lead.status];
              const priority = LEAD_PRIORITY_CONFIG[lead.priority];
              const isOverdue = lead.follow_up_date && new Date(lead.follow_up_date) < new Date() && !['closed', 'lost'].includes(lead.status);

              return (
                <TableRow
                  key={lead.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/20 transition-colors',
                    isOverdue && 'bg-destructive/5'
                  )}
                  onClick={() => onEdit(lead)}
                >
                  {/* Investor */}
                  <TableCell className="py-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{lead.lead_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lead.lead_phone && (
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Phone className="h-2.5 w-2.5" /> {lead.lead_phone}
                          </span>
                        )}
                        {lead.lead_email && (
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Mail className="h-2.5 w-2.5" /> {lead.lead_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Property Interest */}
                  <TableCell className="py-2">
                    <p className="text-xs text-foreground line-clamp-1">
                      {lead.property_title || '—'}
                    </p>
                    <Badge variant="secondary" className="text-[8px] px-1 py-0 mt-0.5">
                      {lead.lead_source}
                    </Badge>
                  </TableCell>

                  {/* Inquiry time */}
                  <TableCell className="py-2">
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(lead.created_at)}
                    </span>
                    {isOverdue && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                        <span className="text-[9px] text-destructive font-medium">Overdue</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Stage */}
                  <TableCell className="py-2">
                    <Badge variant="outline" className={cn('text-[9px]', status.bg)}>
                      {status.icon} {status.label}
                    </Badge>
                  </TableCell>

                  {/* Priority */}
                  <TableCell className="py-2">
                    <Badge variant="outline" className={cn('text-[9px]', priority.color)}>
                      {priority.label}
                    </Badge>
                  </TableCell>

                  {/* Deal Value */}
                  <TableCell className="py-2">
                    <div>
                      {lead.deal_value ? (
                        <span className="text-xs font-semibold text-foreground">{formatPrice(lead.deal_value)}</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                      {lead.deal_probability > 0 && (
                        <p className="text-[9px] text-muted-foreground">{lead.deal_probability}% prob</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-2" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {lead.lead_phone && (
                        <Button
                          variant="ghost" size="sm" className="h-6 w-6 p-0"
                          onClick={() => window.open(`https://wa.me/${lead.lead_phone?.replace(/\D/g, '')}`, '_blank')}
                          title="WhatsApp"
                        >
                          <MessageSquare className="h-3 w-3 text-chart-2" />
                        </Button>
                      )}
                      <Link to="/schedule-viewing">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Schedule Viewing">
                          <CalendarPlus className="h-3 w-3 text-chart-4" />
                        </Button>
                      </Link>
                      {lead.property_id && (
                        <Link to={`/property/${lead.property_id}`}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="View Property">
                            <ExternalLink className="h-3 w-3 text-primary" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Listing Performance Panel ──
function ListingPerformancePanel() {
  const { user } = useAuth();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['agent-listing-performance', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, price, views_count, saves_count, inquiries_count, created_at, thumbnail_url, opportunity_score')
        .eq('agent_id', user.id)
        .order('views_count', { ascending: false })
        .limit(10);
      if (error) { console.warn('Listing perf error:', error); return []; }
      return (data || []) as any[];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card className="bg-card/60 border-border/40">
        <CardContent className="py-8 text-center">
          <Eye className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">No listings found. Add properties to see performance data.</p>
        </CardContent>
      </Card>
    );
  }

  // Aggregate stats
  const totalViews = listings.reduce((s, l) => s + (l.views_count || 0), 0);
  const totalSaves = listings.reduce((s, l) => s + (l.saves_count || 0), 0);
  const totalInquiries = listings.reduce((s, l) => s + (l.inquiries_count || 0), 0);
  const avgScore = Math.round(listings.reduce((s, l) => s + (l.opportunity_score || 0), 0) / listings.length);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-primary' },
          { label: 'Watchlist Saves', value: totalSaves.toLocaleString(), icon: Heart, color: 'text-chart-1' },
          { label: 'Inquiries', value: totalInquiries.toLocaleString(), icon: MessageSquare, color: 'text-chart-4' },
          { label: 'Avg AI Score', value: avgScore.toString(), icon: Activity, color: 'text-chart-2' },
        ].map(s => (
          <Card key={s.label} className="bg-card/60 border-border/40">
            <CardContent className="p-2.5 flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50')}>
                <s.icon className={cn('h-4 w-4', s.color)} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listing rows */}
      <div className="space-y-2">
        {listings.map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link to={`/property/${listing.id}`}>
              <Card className="bg-card/60 border-border/40 hover:border-primary/20 hover:shadow-sm transition-all group">
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                    #{i + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{listing.title}</p>
                    <p className="text-[10px] text-muted-foreground">{listing.city} · {formatPrice(listing.price)}</p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-0.5 justify-center">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">{listing.views_count || 0}</span>
                      </div>
                      <p className="text-[8px] text-muted-foreground">views</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-0.5 justify-center">
                        <Heart className="h-3 w-3 text-chart-1" />
                        <span className="text-xs font-semibold text-foreground">{listing.saves_count || 0}</span>
                      </div>
                      <p className="text-[8px] text-muted-foreground">saves</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-0.5 justify-center">
                        <MessageSquare className="h-3 w-3 text-chart-4" />
                        <span className="text-xs font-semibold text-foreground">{listing.inquiries_count || 0}</span>
                      </div>
                      <p className="text-[8px] text-muted-foreground">leads</p>
                    </div>

                    {listing.opportunity_score > 0 && (
                      <Badge
                        className={cn(
                          'text-[9px] px-1.5 py-0 border-0',
                          listing.opportunity_score >= 85
                            ? 'bg-chart-2/10 text-chart-2'
                            : listing.opportunity_score >= 60
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {listing.opportunity_score}
                      </Badge>
                    )}

                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──
export default function AgentCRMDashboard() {
  const { data: leads = [], isLoading } = useAgentLeads();
  const { data: stats } = useAgentCRMStats();
  const [search, setSearch] = useState('');
  const [editLead, setEditLead] = useState<CRMLead | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState('pipeline');

  const filtered = useMemo(() => {
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(l =>
      l.lead_name.toLowerCase().includes(q) ||
      l.property_title?.toLowerCase().includes(q) ||
      l.lead_email?.toLowerCase().includes(q) ||
      l.lead_phone?.includes(q)
    );
  }, [leads, search]);

  // Segment leads for overview
  const newLeads = leads.filter(l => l.status === 'new');
  const negotiationLeads = leads.filter(l => l.status === 'negotiation');
  const overdueLeads = leads.filter(l =>
    l.follow_up_date && new Date(l.follow_up_date) < new Date() && !['closed', 'lost'].includes(l.status)
  );
  const todayFollowUps = leads.filter(l => {
    if (!l.follow_up_date) return false;
    const d = new Date(l.follow_up_date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Agent CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage leads, track deals, close faster</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/schedule-viewing">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarPlus className="h-3.5 w-3.5" /> Schedule Viewing
            </Button>
          </Link>
          <Button onClick={() => setShowCreate(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* ── Lead Overview Panel ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'New Inquiries', value: stats?.new ?? newLeads.length, icon: Zap, color: 'text-blue-500', accent: 'bg-blue-500/10' },
          { label: 'Active Negotiations', value: stats?.negotiation ?? negotiationLeads.length, icon: Target, color: 'text-purple-500', accent: 'bg-purple-500/10' },
          { label: 'Closed Deals', value: stats?.closed ?? 0, icon: TrendingUp, color: 'text-chart-2', accent: 'bg-chart-2/10' },
          { label: 'Conversion Rate', value: `${stats?.conversion_rate ?? 0}%`, icon: BarChart3, color: 'text-chart-1', accent: 'bg-chart-1/10' },
          { label: 'Pipeline Value', value: formatPrice(stats?.total_deal_value ?? 0), icon: DollarSign, color: 'text-chart-4', accent: 'bg-chart-4/10' },
          { label: 'Overdue Follow-ups', value: stats?.overdue_follow_ups ?? overdueLeads.length, icon: AlertTriangle, color: 'text-destructive', accent: 'bg-destructive/10' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="bg-card/80 backdrop-blur border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', s.accent)}>
                  <s.icon className={cn('h-4 w-4', s.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Urgent Actions Strip ── */}
      {(overdueLeads.length > 0 || todayFollowUps.length > 0) && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Action Required</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {overdueLeads.slice(0, 3).map(lead => (
                <Button
                  key={lead.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] border-destructive/30 hover:bg-destructive/10 gap-1"
                  onClick={() => setEditLead(lead)}
                >
                  <Clock className="h-3 w-3 text-destructive" />
                  {lead.lead_name} — overdue {daysSince(lead.follow_up_date!)}d
                </Button>
              ))}
              {todayFollowUps.slice(0, 3).map(lead => (
                <Button
                  key={lead.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] border-chart-4/30 hover:bg-chart-4/10 gap-1"
                  onClick={() => setEditLead(lead)}
                >
                  <Calendar className="h-3 w-3 text-chart-4" />
                  {lead.lead_name} — follow up today
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
      </div>

      {/* ── Tabs: Pipeline / Table / Listings ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline" className="text-xs gap-1"><GripVertical className="h-3 w-3" /> Pipeline</TabsTrigger>
          <TabsTrigger value="table" className="text-xs gap-1"><Users className="h-3 w-3" /> Lead Table</TabsTrigger>
          <TabsTrigger value="listings" className="text-xs gap-1"><Eye className="h-3 w-3" /> Listing Performance</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : (
          <>
            <TabsContent value="pipeline" className="mt-4">
              <PipelineKanban leads={filtered} onEdit={setEditLead} />
            </TabsContent>

            <TabsContent value="table" className="mt-4">
              <LeadDetailTable leads={filtered} onEdit={setEditLead} />
            </TabsContent>

            <TabsContent value="listings" className="mt-4">
              <ListingPerformancePanel />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Dialogs */}
      <LeadFormDialog open={showCreate} onOpenChange={setShowCreate} />
      {editLead && (
        <LeadFormDialog lead={editLead} open={!!editLead} onOpenChange={o => { if (!o) setEditLead(null); }} />
      )}
    </div>
  );
}
