import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Filter, Plus, Edit2, Trash2, Save, Home, ShoppingCart, X, GripVertical, ChevronDown, ChevronUp, Copy, AlertCircle, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterConfiguration {
  id?: string;
  listing_type: 'sale' | 'rent';
  filter_category: string;
  filter_name: string;
  filter_type: 'select' | 'range' | 'checkbox' | 'radio' | 'slider';
  filter_options: any[];
  min_value?: number;
  max_value?: number;
  step_value?: number;
  default_value?: any;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  validation_rules?: any;
  description?: string;
}

const FILTER_CATEGORIES = [
  { value: 'search', label: 'Search', emoji: '🔍', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' },
  { value: 'location', label: 'Location', emoji: '📍', bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-500/30' },
  { value: 'price', label: 'Price', emoji: '💰', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30' },
  { value: 'specifications', label: 'Specs', emoji: '📐', bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
  { value: 'investment', label: 'Investment', emoji: '📈', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30' },
  { value: 'rental_terms', label: 'Rental', emoji: '📋', bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500/30' },
  { value: 'facilities', label: 'Facilities', emoji: '🏊', bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-500/30' },
];

const FILTER_TYPES = [
  { value: 'select', label: 'Dropdown', icon: '▾' },
  { value: 'range', label: 'Range', icon: '↔' },
  { value: 'checkbox', label: 'Multi-Select', icon: '☑' },
  { value: 'radio', label: 'Single', icon: '◉' },
  { value: 'slider', label: 'Slider', icon: '⬤' },
];

const emptyFilter = (listingType: 'sale' | 'rent'): FilterConfiguration => ({
  listing_type: listingType, filter_category: 'search', filter_name: '', filter_type: 'select',
  filter_options: [], display_order: 0, is_required: false, is_active: true, description: '',
});

const getCat = (cat: string) => FILTER_CATEGORIES.find(c => c.value === cat) || FILTER_CATEGORIES[0];
const getType = (type: string) => FILTER_TYPES.find(t => t.value === type) || FILTER_TYPES[0];

// ─── Filter Form ────────────────────────────────────────────────────────────
const FilterForm = ({ filter, onSave, onCancel }: {
  filter: FilterConfiguration; onSave: (f: FilterConfiguration) => void; onCancel: () => void;
}) => {
  const [form, setForm] = useState<FilterConfiguration>(filter);
  const set = (field: keyof FilterConfiguration, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const isOptionsType = ['select', 'checkbox', 'radio'].includes(form.filter_type);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Listing Type</Label>
          <Select value={form.listing_type} onValueChange={v => set('listing_type', v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">🏷️ For Sale</SelectItem>
              <SelectItem value="rent">🏠 For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Category</Label>
          <Select value={form.filter_category} onValueChange={v => set('filter_category', v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FILTER_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Filter Name</Label>
          <Input value={form.filter_name} onChange={e => set('filter_name', e.target.value)} placeholder="e.g. Property Type" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Input Type</Label>
          <Select value={form.filter_type} onValueChange={v => set('filter_type', v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FILTER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isOptionsType ? (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Options (one per line)</Label>
          <Textarea
            value={form.filter_options?.join('\n') || ''}
            onChange={e => set('filter_options', e.target.value.split('\n').filter(o => o.trim()))}
            placeholder={"Villa\nApartment\nTownhouse\nLand"}
            rows={4}
            className="text-sm resize-none font-mono"
          />
          <p className="text-[11px] text-muted-foreground">{form.filter_options?.length || 0} option(s)</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Min</Label>
            <Input type="number" value={form.min_value ?? ''} onChange={e => set('min_value', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Max</Label>
            <Input type="number" value={form.max_value ?? ''} onChange={e => set('max_value', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Step</Label>
            <Input type="number" value={form.step_value ?? ''} onChange={e => set('step_value', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
        <Input value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Brief description" className="h-9 text-sm" />
      </div>

      <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Order</Label>
          <Input type="number" value={form.display_order} onChange={e => set('display_order', parseInt(e.target.value) || 0)} className="h-8 w-16 text-sm text-center" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_required} onCheckedChange={v => set('is_required', v)} />
          <Label className="text-xs">Required</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
          <Label className="text-xs">Active</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.filter_name.trim()}>
          <Save className="h-3.5 w-3.5 mr-1.5" /> {filter.id ? 'Update' : 'Create'} Filter
        </Button>
      </div>
    </div>
  );
};

// ─── Filter Card ────────────────────────────────────────────────────────────
const FilterCard = ({ filter, onEdit, onDelete, onToggle, onDuplicate }: {
  filter: FilterConfiguration; onEdit: () => void; onDelete: () => void;
  onToggle: (active: boolean) => void; onDuplicate: () => void;
}) => {
  const cat = getCat(filter.filter_category);
  const typ = getType(filter.filter_type);

  return (
    <div className={`flex items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-lg border transition-all ${
      filter.is_active
        ? 'bg-card border-border hover:border-primary/40 hover:shadow-sm'
        : 'bg-muted/30 border-border/40 opacity-70'
    }`}>
      {/* Order indicator */}
      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-[10px] font-mono text-muted-foreground font-medium">#{filter.display_order}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title row */}
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground">{filter.filter_name}</h4>
          {filter.is_required && (
            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Required</Badge>
          )}
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
            {cat.emoji} {cat.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
            {typ.icon} {typ.label}
          </span>
          {filter.filter_options?.length > 0 && (
            <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {filter.filter_options.length} options
            </span>
          )}
          {typeof filter.min_value === 'number' && typeof filter.max_value === 'number' && (
            <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {filter.min_value.toLocaleString()} – {filter.max_value.toLocaleString()}
            </span>
          )}
        </div>

        {/* Description */}
        {filter.description && (
          <p className="text-xs text-muted-foreground truncate">{filter.description}</p>
        )}
      </div>

      {/* Actions — always visible */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <Switch
          checked={filter.is_active}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDuplicate} title="Duplicate">
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} title="Edit">
          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={onDelete} title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const PropertyFilterSettings = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<FilterConfiguration | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(FILTER_CATEGORIES.map(c => c.value)));

  useEffect(() => { loadFilters(); }, []);

  const loadFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('property_filter_configurations' as any)
        .select('*')
        .order('listing_type', { ascending: true })
        .order('display_order', { ascending: true });
      if (error) throw error;
      setFilters((data as unknown as FilterConfiguration[]) || []);
    } catch (error) {
      console.error('Error loading filters:', error);
      toast({ title: "Error", description: "Failed to load filters", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (filter: FilterConfiguration) => {
    try {
      const { error } = await supabase.from('property_filter_configurations' as any).upsert(filter);
      if (error) throw error;
      toast({ title: "✅ Saved", description: `Filter "${filter.filter_name}" ${filter.id ? 'updated' : 'created'} successfully` });
      await loadFilters();
      setDialogOpen(false);
      setEditingFilter(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save filter", variant: "destructive" });
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const { error } = await supabase.from('property_filter_configurations' as any).delete().eq('id', filterId);
      if (error) throw error;
      toast({ title: "🗑️ Deleted", description: "Filter removed successfully" });
      await loadFilters();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete", variant: "destructive" });
    }
    setDeleteConfirm(null);
  };

  const toggleFilter = async (filterId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('property_filter_configurations' as any).update({ is_active: isActive }).eq('id', filterId);
      if (error) throw error;
      await loadFilters();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update", variant: "destructive" });
    }
  };

  const duplicateFilter = (filter: FilterConfiguration) => {
    setEditingFilter({ ...filter, id: undefined, filter_name: `${filter.filter_name} (Copy)`, display_order: filter.display_order + 1 });
    setDialogOpen(true);
  };

  const openAdd = (listingType: 'sale' | 'rent') => {
    setEditingFilter(emptyFilter(listingType));
    setDialogOpen(true);
  };

  const openEdit = (filter: FilterConfiguration) => {
    setEditingFilter({ ...filter });
    setDialogOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const renderFiltersPanel = (listingType: 'sale' | 'rent') => {
    const typeFilters = filters.filter(f => f.listing_type === listingType);
    const grouped = FILTER_CATEGORIES.map(cat => ({
      ...cat,
      filters: typeFilters.filter(f => f.filter_category === cat.value),
    })).filter(g => g.filters.length > 0);
    const ungrouped = typeFilters.filter(f => !FILTER_CATEGORIES.some(c => c.value === f.filter_category));

    return (
      <div className="space-y-3">
        {/* Summary bar */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{typeFilters.length}</span>
              <span className="text-xs text-muted-foreground">filters</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">{typeFilters.filter(f => f.is_active).length} active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">{typeFilters.filter(f => !f.is_active).length} inactive</span>
            </div>
          </div>
          <Button size="sm" onClick={() => openAdd(listingType)} className="h-8 text-xs gap-1.5 shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Add Filter
          </Button>
        </div>

        {/* Category groups */}
        {grouped.map(group => (
          <Collapsible key={group.value} open={expandedCategories.has(group.value)} onOpenChange={() => toggleCategory(group.value)}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/15 hover:bg-muted/30 transition-colors border border-border/30">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${group.bg} ${group.text} ${group.border}`}>
                  {group.emoji} {group.label}
                </span>
                <Badge variant="secondary" className="text-[11px] h-5 px-2 font-medium">
                  {group.filters.length}
                </Badge>
              </div>
              {expandedCategories.has(group.value)
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2 pl-2 border-l-2 border-border/20 ml-3">
              {group.filters.map(filter => (
                <FilterCard
                  key={filter.id}
                  filter={filter}
                  onEdit={() => openEdit(filter)}
                  onDelete={() => setDeleteConfirm(filter.id!)}
                  onToggle={(active) => toggleFilter(filter.id!, active)}
                  onDuplicate={() => duplicateFilter(filter)}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {ungrouped.length > 0 && (
          <div className="space-y-2 pl-2 border-l-2 border-border/20 ml-3">
            <p className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">Other</p>
            {ungrouped.map(filter => (
              <FilterCard key={filter.id} filter={filter} onEdit={() => openEdit(filter)}
                onDelete={() => setDeleteConfirm(filter.id!)} onToggle={(active) => toggleFilter(filter.id!, active)}
                onDuplicate={() => duplicateFilter(filter)} />
            ))}
          </div>
        )}

        {typeFilters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border-2 border-dashed border-border/40 bg-muted/10">
            <Filter className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No filters configured yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4 max-w-xs">
              Add filters to let users narrow down {listingType === 'sale' ? 'sale' : 'rental'} property searches
            </p>
            <Button size="sm" variant="outline" onClick={() => openAdd(listingType)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Create First Filter
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading filters...</span>
      </div>
    );
  }

  const saleCount = filters.filter(f => f.listing_type === 'sale').length;
  const rentCount = filters.filter(f => f.listing_type === 'rent').length;
  const activeCount = filters.filter(f => f.is_active).length;
  const inactiveCount = filters.length - activeCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Filter className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Filter Configuration</h2>
          <p className="text-xs text-muted-foreground">Manage search filters for property listings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Sale Filters', value: saleCount, emoji: '🏷️', accent: 'border-l-primary' },
          { label: 'Rent Filters', value: rentCount, emoji: '🏠', accent: 'border-l-accent' },
          { label: 'Active', value: activeCount, emoji: '✅', accent: 'border-l-green-500' },
          { label: 'Inactive', value: inactiveCount, emoji: '⏸️', accent: 'border-l-muted-foreground' },
        ].map(s => (
          <Card key={s.label} className={`border-l-4 ${s.accent}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <Tabs defaultValue="sale" className="w-full">
            <TabsList className="h-10 w-full bg-muted/30 mb-4 p-1">
              <TabsTrigger value="sale" className="flex-1 gap-2 text-sm font-medium h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                <ShoppingCart className="h-4 w-4" /> Sale
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-1">{saleCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rent" className="flex-1 gap-2 text-sm font-medium h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                <Home className="h-4 w-4" /> Rent
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-1">{rentCount}</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sale">{renderFiltersPanel('sale')}</TabsContent>
            <TabsContent value="rent">{renderFiltersPanel('rent')}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingFilter(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingFilter?.id ? '✏️ Edit Filter' : '➕ New Filter'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingFilter?.id ? 'Update filter settings below' : 'Create a new search filter for your properties'}
            </DialogDescription>
          </DialogHeader>
          {editingFilter && (
            <FilterForm filter={editingFilter} onSave={saveFilter} onCancel={() => { setDialogOpen(false); setEditingFilter(null); }} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-destructive" /> Delete Filter?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This filter will be permanently removed. Users will no longer see it in search.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteConfirm && deleteFilter(deleteConfirm)}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyFilterSettings;
