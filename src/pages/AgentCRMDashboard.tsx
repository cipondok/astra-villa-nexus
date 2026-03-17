import { useState, useMemo } from 'react';
import {
  useAgentLeads, useAgentCRMStats, useCreateLead, useUpdateLead, useDeleteLead, useMoveLead,
  LEAD_STATUS_CONFIG, LEAD_PRIORITY_CONFIG, type CRMLead, type LeadStatus, type LeadPriority,
} from '@/hooks/useAgentCRM';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Users, TrendingUp, DollarSign, Clock, AlertTriangle, Phone,
  Mail, Calendar, Trash2, GripVertical, ChevronRight, BarChart3, Target,
} from 'lucide-react';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
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
function LeadCard({ lead, onEdit, compact }: { lead: CRMLead; onEdit: (l: CRMLead) => void; compact?: boolean }) {
  const { moveToStatus } = useMoveLead();
  const deleteLead = useDeleteLead();
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

      {!compact && (
        <>
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
        </>
      )}

      {/* Quick move buttons */}
      {!compact && !['closed', 'lost'].includes(lead.status) && (
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {PIPELINE_STAGES.filter(s => s !== lead.status && s !== 'lost').map(s => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className="h-5 text-[9px] px-1.5"
              onClick={e => { e.stopPropagation(); moveToStatus(lead.id, s); }}
            >
              {LEAD_STATUS_CONFIG[s].icon} {LEAD_STATUS_CONFIG[s].label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pipeline Kanban ──
function PipelineKanban({ leads, onEdit }: { leads: CRMLead[]; onEdit: (l: CRMLead) => void }) {
  const stages: LeadStatus[] = ['new', 'contacted', 'negotiation', 'closed', 'lost'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {stages.map(stage => {
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
                <LeadCard key={lead.id} lead={lead} onEdit={onEdit} compact />
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Agent CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage leads, track deals, close faster</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Active Pipeline', value: stats.new + stats.contacted + stats.negotiation, icon: Target, color: 'text-amber-500' },
            { label: 'Closed Deals', value: stats.closed, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Conversion', value: `${stats.conversion_rate}%`, icon: BarChart3, color: 'text-chart-1' },
            { label: 'Deal Value', value: formatPrice(stats.total_deal_value), icon: DollarSign, color: 'text-chart-4' },
            { label: 'Overdue', value: stats.overdue_follow_ups, icon: AlertTriangle, color: 'text-destructive' },
          ].map(s => (
            <Card key={s.label} className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-3 flex items-center gap-2">
                <s.icon className={cn('h-4 w-4 shrink-0', s.color)} />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline" className="text-xs gap-1"><GripVertical className="h-3 w-3" /> Pipeline</TabsTrigger>
          <TabsTrigger value="list" className="text-xs gap-1"><Users className="h-3 w-3" /> All Leads</TabsTrigger>
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

            <TabsContent value="list" className="mt-4">
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="py-12 text-center">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No leads yet. Add your first lead to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filtered.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onEdit={setEditLead} />
                  ))
                )}
              </div>
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
