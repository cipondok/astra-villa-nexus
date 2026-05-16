import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Target, Plus, Clock, Users, MessageSquare, DollarSign,
  ChevronRight, Flame, AlertTriangle, CheckCircle2, Phone,
  Mail, Building2, Calendar, ArrowRight, Eye, Zap,
  BarChart3, RefreshCw, Trash2, Edit, Star, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isPast, isTomorrow, differenceInDays } from 'date-fns';

/* ─── Types ─── */

interface Deal {
  id: string;
  investor_name: string;
  investor_email: string | null;
  investor_phone: string | null;
  property_id: string | null;
  property_reference: string;
  deal_stage: string;
  estimated_budget: number | null;
  deal_value: number | null;
  urgency_level: string;
  last_follow_up_date: string | null;
  next_follow_up_date: string | null;
  next_action_note: string | null;
  notes: string | null;
  source: string | null;
  commission_estimate: number | null;
  lost_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const STAGES = [
  { key: 'inquiry', label: 'New Inquiries', icon: MessageSquare, color: 'text-primary', bgColor: 'bg-primary/10' },
  { key: 'viewing', label: 'Active Discussions', icon: Eye, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  { key: 'negotiation', label: 'Offers Submitted', icon: Target, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  { key: 'closing', label: 'Closing in Progress', icon: Shield, color: 'text-chart-1', bgColor: 'bg-chart-1/10' },
  { key: 'completed', label: 'Deal Completed', icon: CheckCircle2, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
];

const URGENCY_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  high: { color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'High' },
  medium: { color: 'text-chart-2', bgColor: 'bg-chart-2/10', label: 'Medium' },
  low: { color: 'text-muted-foreground', bgColor: 'bg-muted/20', label: 'Low' },
};

const formatCurrency = (v: number | null) => {
  if (!v) return '-';
  if (v >= 1_000_000_000) return `IDR ${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `IDR ${(v / 1_000_000).toFixed(0)}M`;
  return `IDR ${v.toLocaleString()}`;
};

const followUpStatus = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  if (isToday(d)) return { label: 'Today', color: 'text-chart-1', bgColor: 'bg-chart-1/10' };
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-chart-2', bgColor: 'bg-chart-2/10' };
  return { label: `${differenceInDays(d, new Date())}d`, color: 'text-muted-foreground', bgColor: 'bg-muted/20' };
};

/* ─── Hooks ─── */

function useDeals() {
  return useQuery({
    queryKey: ['founder-deals'],
    queryFn: async (): Promise<Deal[]> => {
      const { data, error } = await (supabase as any)
        .from('founder_deal_pipeline')
        .select('*')
        .order('urgency_level', { ascending: true })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in');
      const { error } = await (supabase as any)
        .from('founder_deal_pipeline')
        .insert({ ...deal, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['founder-deals'] }); toast.success('Deal added'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
      const { error } = await (supabase as any)
        .from('founder_deal_pipeline')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['founder-deals'] }); toast.success('Deal updated'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('founder_deal_pipeline')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['founder-deals'] }); toast.success('Deal removed'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Add Deal Dialog ─── */

function AddDealDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const create = useCreateDeal();
  const [form, setForm] = useState({
    investor_name: '', investor_email: '', investor_phone: '',
    property_reference: '', deal_stage: 'inquiry', estimated_budget: '',
    urgency_level: 'medium', next_action_note: '', next_follow_up_date: '', source: 'direct',
  });

  const handleSubmit = () => {
    if (!form.investor_name || !form.property_reference) {
      toast.error('Investor name and property reference required');
      return;
    }
    create.mutate({
      investor_name: form.investor_name,
      investor_email: form.investor_email || null,
      investor_phone: form.investor_phone || null,
      property_reference: form.property_reference,
      deal_stage: form.deal_stage,
      estimated_budget: form.estimated_budget ? Number(form.estimated_budget) : null,
      urgency_level: form.urgency_level,
      next_action_note: form.next_action_note || null,
      next_follow_up_date: form.next_follow_up_date || null,
      source: form.source,
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ investor_name: '', investor_email: '', investor_phone: '', property_reference: '', deal_stage: 'inquiry', estimated_budget: '', urgency_level: 'medium', next_action_note: '', next_follow_up_date: '', source: 'direct' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Add New Deal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px]">Investor Name *</Label>
              <Input value={form.investor_name} onChange={e => setForm(f => ({ ...f, investor_name: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Property Reference *</Label>
              <Input value={form.property_reference} onChange={e => setForm(f => ({ ...f, property_reference: e.target.value }))} placeholder="e.g. Canggu Villa 3BR" className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px]">Email</Label>
              <Input value={form.investor_email} onChange={e => setForm(f => ({ ...f, investor_email: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Phone</Label>
              <Input value={form.investor_phone} onChange={e => setForm(f => ({ ...f, investor_phone: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[10px]">Stage</Label>
              <Select value={form.deal_stage} onValueChange={v => setForm(f => ({ ...f, deal_stage: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s.key} value={s.key} className="text-xs">{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Urgency</Label>
              <Select value={form.urgency_level} onValueChange={v => setForm(f => ({ ...f, urgency_level: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="text-xs">High</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="low" className="text-xs">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Budget (IDR)</Label>
              <Input type="number" value={form.estimated_budget} onChange={e => setForm(f => ({ ...f, estimated_budget: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px]">Next Follow-Up</Label>
              <Input type="date" value={form.next_follow_up_date} onChange={e => setForm(f => ({ ...f, next_follow_up_date: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Source</Label>
              <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct" className="text-xs">Direct</SelectItem>
                  <SelectItem value="referral" className="text-xs">Referral</SelectItem>
                  <SelectItem value="social" className="text-xs">Social Media</SelectItem>
                  <SelectItem value="demo" className="text-xs">Demo Session</SelectItem>
                  <SelectItem value="platform" className="text-xs">Platform Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[10px]">Next Action</Label>
            <Textarea value={form.next_action_note} onChange={e => setForm(f => ({ ...f, next_action_note: e.target.value }))} rows={2} className="text-xs" placeholder="What needs to happen next?" />
          </div>
          <Button onClick={handleSubmit} disabled={create.isPending} className="w-full h-8 text-xs">
            {create.isPending ? 'Adding...' : 'Add Deal to Pipeline'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Deal Card ─── */

function DealCard({ deal }: { deal: Deal }) {
  const update = useUpdateDeal();
  const remove = useDeleteDeal();
  const urgency = URGENCY_CONFIG[deal.urgency_level] || URGENCY_CONFIG.medium;
  const fup = followUpStatus(deal.next_follow_up_date);
  const currentStageIdx = STAGES.findIndex(s => s.key === deal.deal_stage);
  const nextStage = STAGES[currentStageIdx + 1];

  return (
    <Card className="border border-border bg-card hover:border-border/80 transition-all">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-bold text-foreground truncate">{deal.investor_name}</p>
              <Badge className={cn('text-[7px] px-1 py-0 h-3.5 border-0', urgency.bgColor, urgency.color)}>{urgency.label}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
              <Building2 className="h-2.5 w-2.5" /> {deal.property_reference}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {deal.investor_phone && (
              <a href={`tel:${deal.investor_phone}`} className="p-1 rounded hover:bg-muted/20">
                <Phone className="h-3 w-3 text-muted-foreground" />
              </a>
            )}
            {deal.investor_email && (
              <a href={`mailto:${deal.investor_email}`} className="p-1 rounded hover:bg-muted/20">
                <Mail className="h-3 w-3 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* Budget & follow-up */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {deal.estimated_budget && (
            <Badge variant="outline" className="text-[7px]">
              <DollarSign className="h-2 w-2 mr-0.5" />{formatCurrency(deal.estimated_budget)}
            </Badge>
          )}
          {fup && (
            <Badge className={cn('text-[7px] border-0', fup.bgColor, fup.color)}>
              <Calendar className="h-2 w-2 mr-0.5" />{fup.label}
            </Badge>
          )}
          {deal.source && deal.source !== 'direct' && (
            <Badge variant="outline" className="text-[7px] text-muted-foreground">{deal.source}</Badge>
          )}
        </div>

        {/* Next action */}
        {deal.next_action_note && (
          <div className="p-2 rounded-md bg-muted/10 border border-border/20 mb-2">
            <p className="text-[9px] text-muted-foreground">
              <span className="font-bold text-foreground">Next: </span>{deal.next_action_note}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {nextStage && deal.deal_stage !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[9px] px-2 flex-1"
              onClick={() => update.mutate({
                id: deal.id,
                deal_stage: nextStage.key,
                last_follow_up_date: new Date().toISOString().split('T')[0],
              })}
            >
              <ArrowRight className="h-2.5 w-2.5 mr-1" /> Move to {nextStage.label}
            </Button>
          )}
          {deal.deal_stage !== 'lost' && deal.deal_stage !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] px-1.5 text-destructive hover:text-destructive"
              onClick={() => update.mutate({ id: deal.id, deal_stage: 'lost', lost_reason: 'Manually marked lost' })}
            >
              Lost
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[9px] px-1.5 text-muted-foreground"
            onClick={() => { if (confirm('Delete this deal?')) remove.mutate(deal.id); }}
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */

export default function DealCRMPage() {
  const { data: deals = [], isLoading } = useDeals();
  const [activeTab, setActiveTab] = useState('pipeline');

  const dealsByStage = (stage: string) => deals.filter(d => d.deal_stage === stage);
  const overdueDeals = deals.filter(d => {
    if (!d.next_follow_up_date || d.deal_stage === 'completed' || d.deal_stage === 'lost') return false;
    return isPast(new Date(d.next_follow_up_date)) && !isToday(new Date(d.next_follow_up_date));
  });
  const todayDeals = deals.filter(d => d.next_follow_up_date && isToday(new Date(d.next_follow_up_date)));
  const highUrgency = deals.filter(d => d.urgency_level === 'high' && d.deal_stage !== 'completed' && d.deal_stage !== 'lost');
  const activeDeals = deals.filter(d => d.deal_stage !== 'completed' && d.deal_stage !== 'lost');
  const completedDeals = dealsByStage('completed');
  const lostDeals = deals.filter(d => d.deal_stage === 'lost');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-chart-1" />
                </div>
                Deal CRM
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Track every investor conversation and deal opportunity</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-border">
                {activeDeals.length} active · {completedDeals.length} closed
              </Badge>
              <AddDealDialog>
                <Button size="sm" className="h-8 text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Deal
                </Button>
              </AddDealDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Daily alerts */}
        {(overdueDeals.length > 0 || todayDeals.length > 0) && (
          <div className="flex gap-3 mb-5 flex-wrap">
            {overdueDeals.length > 0 && (
              <Card className="border border-destructive/20 bg-destructive/5 flex-1 min-w-[200px]">
                <CardContent className="p-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-destructive">{overdueDeals.length} Overdue Follow-Up{overdueDeals.length > 1 ? 's' : ''}</p>
                    <p className="text-[9px] text-muted-foreground">{overdueDeals.map(d => d.investor_name).join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {todayDeals.length > 0 && (
              <Card className="border border-chart-1/20 bg-chart-1/5 flex-1 min-w-[200px]">
                <CardContent className="p-3 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-chart-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-chart-1">{todayDeals.length} Follow-Up{todayDeals.length > 1 ? 's' : ''} Today</p>
                    <p className="text-[9px] text-muted-foreground">{todayDeals.map(d => d.investor_name).join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 bg-muted/30 border border-border">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="routine">Daily Routine</TabsTrigger>
          </TabsList>

          {/* ═══ PIPELINE ═══ */}
          <TabsContent value="pipeline">
            {isLoading ? (
              <div className="text-center py-12 text-sm text-muted-foreground">Loading deals...</div>
            ) : activeDeals.length === 0 && completedDeals.length === 0 ? (
              <Card className="border border-dashed border-border">
                <CardContent className="p-8 text-center">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">No deals yet</p>
                  <p className="text-[10px] text-muted-foreground mb-3">Add your first investor conversation to start tracking</p>
                  <AddDealDialog>
                    <Button size="sm" className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" /> Add First Deal</Button>
                  </AddDealDialog>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-5">
                {STAGES.map((stage) => {
                  const SIcon = stage.icon;
                  const stageDeals = dealsByStage(stage.key);
                  if (stageDeals.length === 0 && stage.key === 'completed') return null;
                  return (
                    <div key={stage.key}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', stage.bgColor)}>
                          <SIcon className={cn('h-3.5 w-3.5', stage.color)} />
                        </div>
                        <p className="text-xs font-bold text-foreground">{stage.label}</p>
                        <Badge variant="outline" className="text-[7px] h-4">{stageDeals.length}</Badge>
                      </div>
                      {stageDeals.length === 0 ? (
                        <div className="p-3 rounded-lg border border-dashed border-border/40 text-center">
                          <p className="text-[10px] text-muted-foreground">No deals in this stage</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {stageDeals.map((deal) => (
                            <motion.div key={deal.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                              <DealCard deal={deal} />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Lost deals */}
                {lostDeals.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-destructive/10">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">Lost</p>
                      <Badge variant="outline" className="text-[7px] h-4">{lostDeals.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 opacity-60">
                      {lostDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ═══ DAILY ROUTINE ═══ */}
          <TabsContent value="routine" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Every morning. 15 minutes. This is how deals don't fall through the cracks.</p>

            {[
              { step: '1. Check Overdue Follow-Ups', detail: 'Open CRM → look at red "Overdue" badges. These are leads going cold. Contact them FIRST before anything else.', icon: AlertTriangle, color: 'text-destructive', current: overdueDeals.length },
              { step: '2. Process Today\'s Follow-Ups', detail: 'Handle all deals with "Today" follow-up tags. Make the call, send the message, share the analysis — then update the next action.', icon: Zap, color: 'text-chart-1', current: todayDeals.length },
              { step: '3. Review High-Urgency Deals', detail: 'Check all "High" urgency deals regardless of follow-up date. Are they progressing? Is there a blocker? Can you move them forward today?', icon: Flame, color: 'text-chart-2', current: highUrgency.length },
              { step: '4. Update Deal Stages', detail: 'After every conversation, update the deal stage and set the next action note. A CRM only works if it reflects reality.', icon: RefreshCw, color: 'text-primary', current: null },
              { step: '5. Add New Leads', detail: 'Any new inquiry from yesterday? New demo attendee? Add them to the pipeline immediately — every lead starts as "inquiry" stage.', icon: Plus, color: 'text-chart-4', current: null },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0">
                        <r.icon className={cn('h-4 w-4', r.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-bold text-foreground">{r.step}</p>
                          {r.current !== null && (
                            <Badge variant="outline" className={cn('text-[7px]', r.current > 0 ? r.color : 'text-muted-foreground')}>
                              {r.current} {r.current === 1 ? 'deal' : 'deals'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{r.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">CRM Discipline Rule</p>
                    <p className="text-[11px] text-muted-foreground">
                      If it's not in the CRM, it didn't happen. Every conversation, every follow-up, every stage change — log it immediately. The 30 seconds it takes to update saves the hours you'd spend trying to remember "where was I with that investor?"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
