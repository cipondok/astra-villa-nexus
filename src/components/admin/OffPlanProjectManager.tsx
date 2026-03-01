import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Building2, HardHat, TrendingUp, Pencil, Save, Plus, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Price from '@/components/ui/Price';
import ConstructionTimeline, { ConstructionPhase } from '@/components/investment/ConstructionTimeline';

const PHASE_OPTIONS = ['planning', 'groundbreaking', 'structure', 'mep', 'finishing', 'handover'];

interface OffPlanProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  construction_phase: string | null;
  completion_percentage: number | null;
  estimated_completion_date: string | null;
  construction_phases: ConstructionPhase[] | null;
  developer_id: string | null;
  launch_date: string | null;
  estimated_completion_value: number | null;
  is_early_bird: boolean;
  is_pre_launch: boolean;
  total_units: number | null;
  units_sold: number | null;
  development_status: string | null;
}

export default function OffPlanProjectManager() {
  const [properties, setProperties] = useState<OffPlanProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<OffPlanProperty>>({});
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price, construction_phase, completion_percentage, estimated_completion_date, construction_phases, developer_id, launch_date, estimated_completion_value, is_early_bird, is_pre_launch, total_units, units_sold, development_status')
        .in('development_status', ['new_project', 'pre_launching', 'off-plan', 'under_construction'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProperties((data as any[]) || []);
    } catch (err: any) {
      toast.error('Failed to load off-plan properties: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const openEditDialog = (property: OffPlanProperty) => {
    setEditingId(property.id);
    setEditForm({
      construction_phase: property.construction_phase || 'planning',
      completion_percentage: property.completion_percentage || 0,
      estimated_completion_date: property.estimated_completion_date || '',
      estimated_completion_value: property.estimated_completion_value || 0,
      is_early_bird: property.is_early_bird || false,
      is_pre_launch: property.is_pre_launch || false,
      total_units: property.total_units || 0,
      units_sold: property.units_sold || 0,
      developer_id: property.developer_id || '',
      launch_date: property.launch_date || '',
    });
    setDialogOpen(true);
  };

  const buildPhasesJson = (currentPhase: string): ConstructionPhase[] => {
    const currentIdx = PHASE_OPTIONS.indexOf(currentPhase);
    return PHASE_OPTIONS.map((name, i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      completed: i < currentIdx,
      current: i === currentIdx,
    }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const phases = buildPhasesJson(editForm.construction_phase || 'planning');
      const { error } = await supabase
        .from('properties')
        .update({
          construction_phase: editForm.construction_phase,
          completion_percentage: editForm.completion_percentage,
          estimated_completion_date: editForm.estimated_completion_date || null,
          construction_phases: phases as any,
          estimated_completion_value: editForm.estimated_completion_value || null,
          is_early_bird: editForm.is_early_bird,
          is_pre_launch: editForm.is_pre_launch,
          total_units: editForm.total_units || null,
          units_sold: editForm.units_sold || null,
          developer_id: editForm.developer_id || null,
          launch_date: editForm.launch_date || null,
        })
        .eq('id', editingId);

      if (error) throw error;
      toast.success('Construction progress updated successfully');
      setDialogOpen(false);
      setEditingId(null);
      fetchProperties();
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getPhaseColor = (phase: string | null) => {
    switch (phase) {
      case 'planning': return 'bg-muted text-muted-foreground';
      case 'groundbreaking': return 'bg-chart-3/20 text-chart-3';
      case 'structure': return 'bg-primary/20 text-primary';
      case 'mep': return 'bg-chart-1/20 text-chart-1';
      case 'finishing': return 'bg-gold-primary/20 text-gold-primary';
      case 'handover': return 'bg-emerald-500/20 text-emerald-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    total: properties.length,
    avgCompletion: properties.length ? Math.round(properties.reduce((s, p) => s + (p.completion_percentage || 0), 0) / properties.length) : 0,
    nearHandover: properties.filter(p => (p.completion_percentage || 0) >= 80).length,
    earlyBird: properties.filter(p => p.is_early_bird).length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            Off-Plan Project Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage construction milestones and progress for off-plan properties
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProperties} disabled={loading} className="gap-1.5">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-black text-foreground">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Off-Plan Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-black text-foreground">{stats.avgCompletion}%</p>
                <p className="text-[10px] text-muted-foreground">Avg. Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-lg font-black text-foreground">{stats.nearHandover}</p>
                <p className="text-[10px] text-muted-foreground">Near Handover (80%+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold-primary" />
              <div>
                <p className="text-lg font-black text-foreground">{stats.earlyBird}</p>
                <p className="text-[10px] text-muted-foreground">Early Bird Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Loading off-plan properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">No off-plan properties found</p>
              <p className="text-xs text-muted-foreground">
                Properties with development_status of 'new_project', 'pre_launching', 'off-plan', or 'under_construction' will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Property</TableHead>
                    <TableHead className="text-xs">Phase</TableHead>
                    <TableHead className="text-xs text-center">Completion</TableHead>
                    <TableHead className="text-xs">Est. Handover</TableHead>
                    <TableHead className="text-xs text-center">Units</TableHead>
                    <TableHead className="text-xs text-center">Flags</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map(property => (
                    <TableRow key={property.id} className="group">
                      <TableCell>
                        <div className="min-w-[180px]">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{property.title}</p>
                          <p className="text-[10px] text-muted-foreground">{property.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-[9px] capitalize', getPhaseColor(property.construction_phase))}>
                          {property.construction_phase || 'Not set'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${property.completion_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground w-8 text-right">
                            {property.completion_percentage || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {property.estimated_completion_date || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs text-foreground">
                          {property.units_sold ?? '—'}/{property.total_units ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {property.is_early_bird && <Badge className="text-[8px] bg-gold-primary/20 text-gold-primary border-0">EB</Badge>}
                          {property.is_pre_launch && <Badge className="text-[8px] bg-primary/20 text-primary border-0">PL</Badge>}
                          {!property.is_early_bird && !property.is_pre_launch && <span className="text-[10px] text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openEditDialog(property)}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <HardHat className="h-4 w-4 text-primary" />
              Update Construction Progress
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Phase & Completion */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Construction Phase</Label>
                <Select
                  value={editForm.construction_phase || 'planning'}
                  onValueChange={v => setEditForm(f => ({ ...f, construction_phase: v }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASE_OPTIONS.map(p => (
                      <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Completion %</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[editForm.completion_percentage || 0]}
                    onValueChange={([v]) => setEditForm(f => ({ ...f, completion_percentage: v }))}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs font-bold w-8 text-right">{editForm.completion_percentage}%</span>
                </div>
              </div>
            </div>

            {/* Timeline Preview */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-[9px] text-muted-foreground mb-2 font-medium">Timeline Preview</p>
              <ConstructionTimeline phases={buildPhasesJson(editForm.construction_phase || 'planning')} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Launch Date</Label>
                <Input
                  type="date"
                  value={editForm.launch_date || ''}
                  onChange={e => setEditForm(f => ({ ...f, launch_date: e.target.value }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Est. Completion Date</Label>
                <Input
                  type="date"
                  value={editForm.estimated_completion_date || ''}
                  onChange={e => setEditForm(f => ({ ...f, estimated_completion_date: e.target.value }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            {/* Financial */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Est. Completion Value (IDR)</Label>
                <Input
                  type="number"
                  value={editForm.estimated_completion_value || ''}
                  onChange={e => setEditForm(f => ({ ...f, estimated_completion_value: Number(e.target.value) }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Developer ID</Label>
                <Input
                  value={editForm.developer_id || ''}
                  onChange={e => setEditForm(f => ({ ...f, developer_id: e.target.value }))}
                  className="h-9 text-xs mt-1"
                  placeholder="e.g. ciputra-group"
                />
              </div>
            </div>

            {/* Units */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Total Units</Label>
                <Input
                  type="number"
                  value={editForm.total_units || ''}
                  onChange={e => setEditForm(f => ({ ...f, total_units: Number(e.target.value) }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Units Sold</Label>
                <Input
                  type="number"
                  value={editForm.units_sold || ''}
                  onChange={e => setEditForm(f => ({ ...f, units_sold: Number(e.target.value) }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_early_bird || false}
                  onCheckedChange={v => setEditForm(f => ({ ...f, is_early_bird: v }))}
                />
                <Label className="text-xs">Early Bird Pricing</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_pre_launch || false}
                  onCheckedChange={v => setEditForm(f => ({ ...f, is_pre_launch: v }))}
                />
                <Label className="text-xs">Pre-Launch</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
