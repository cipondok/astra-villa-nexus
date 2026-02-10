import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Filter, Plus, Edit2, Trash2, Save, Home, ShoppingCart, X, GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, Copy, AlertCircle } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  { value: 'search', label: '🔍 Search', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' },
  { value: 'location', label: '📍 Location', color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30' },
  { value: 'price', label: '💰 Price', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  { value: 'specifications', label: '📐 Specifications', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30' },
  { value: 'investment', label: '📈 Investment', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  { value: 'rental_terms', label: '📋 Rental Terms', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' },
  { value: 'facilities', label: '🏊 Facilities', color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/30' },
];

const FILTER_TYPES = [
  { value: 'select', label: 'Dropdown', icon: '▾' },
  { value: 'range', label: 'Range Slider', icon: '↔' },
  { value: 'checkbox', label: 'Multi-Select', icon: '☑' },
  { value: 'radio', label: 'Single Choice', icon: '◉' },
  { value: 'slider', label: 'Slider', icon: '⬤' },
];

const emptyFilter = (listingType: 'sale' | 'rent'): FilterConfiguration => ({
  listing_type: listingType,
  filter_category: 'search',
  filter_name: '',
  filter_type: 'select',
  filter_options: [],
  display_order: 0,
  is_required: false,
  is_active: true,
  description: '',
});

const getCategoryMeta = (cat: string) => FILTER_CATEGORIES.find(c => c.value === cat) || FILTER_CATEGORIES[0];
const getTypeMeta = (type: string) => FILTER_TYPES.find(t => t.value === type) || FILTER_TYPES[0];

// ─── Filter Form Component ──────────────────────────────────────────────────
const FilterForm = ({ filter, onSave, onCancel }: {
  filter: FilterConfiguration;
  onSave: (f: FilterConfiguration) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<FilterConfiguration>(filter);
  const set = (field: keyof FilterConfiguration, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const isOptionsType = ['select', 'checkbox', 'radio'].includes(form.filter_type);

  return (
    <div className="space-y-4">
      {/* Row 1: Type & Category */}
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
              {FILTER_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Name & Type */}
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

      {/* Row 3: Options or Range */}
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
          <p className="text-[10px] text-muted-foreground">{form.filter_options?.length || 0} option(s) defined</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Min Value</Label>
            <Input type="number" value={form.min_value ?? ''} onChange={e => set('min_value', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Max Value</Label>
            <Input type="number" value={form.max_value ?? ''} onChange={e => set('max_value', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Step</Label>
            <Input type="number" value={form.step_value ?? ''} onChange={e => set('step_value', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
        </div>
      )}

      {/* Row 4: Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
        <Input value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Brief description of this filter" className="h-9 text-sm" />
      </div>

      {/* Row 5: Settings */}
      <div className="flex items-center gap-6 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground">Order</Label>
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

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.filter_name.trim()}>
          <Save className="h-3.5 w-3.5 mr-1" /> {filter.id ? 'Update' : 'Create'} Filter
        </Button>
      </div>
    </div>
  );
};

// ─── Filter Card Component ──────────────────────────────────────────────────
const FilterCard = ({ filter, onEdit, onDelete, onToggle, onDuplicate }: {
  filter: FilterConfiguration;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (active: boolean) => void;
  onDuplicate: () => void;
}) => {
  const catMeta = getCategoryMeta(filter.filter_category);
  const typeMeta = getTypeMeta(filter.filter_type);

  return (
    <div className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
      filter.is_active 
        ? 'bg-card border-border/60 hover:border-primary/30' 
        : 'bg-muted/20 border-border/30 opacity-60'
    }`}>
      {/* Drag Handle & Order */}
      <div className="flex flex-col items-center gap-0.5 text-muted-foreground/50">
        <GripVertical className="h-4 w-4" />
        <span className="text-[9px] font-mono">#{filter.display_order}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground truncate">{filter.filter_name}</span>
          {filter.is_required && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1.5 shrink-0">Required</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border ${catMeta.color}`}>
            {catMeta.label}
          </Badge>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {typeMeta.icon} {typeMeta.label}
          </Badge>
          {filter.filter_options?.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {filter.filter_options.length} options
            </span>
          )}
          {filter.min_value !== undefined && filter.max_value !== undefined && (
            <span className="text-[10px] text-muted-foreground">
              {filter.min_value.toLocaleString()} – {filter.max_value.toLocaleString()}
            </span>
          )}
        </div>
        {filter.description && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">{filter.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch 
                checked={filter.is_active} 
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary"
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {filter.is_active ? 'Deactivate' : 'Activate'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate} title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit} title="Edit">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive" onClick={onDelete} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
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
    setEditingFilter({
      ...filter,
      id: undefined,
      filter_name: `${filter.filter_name} (Copy)`,
      display_order: filter.display_order + 1,
    });
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

  const renderCategoryGroup = (listingType: 'sale' | 'rent') => {
    const typeFilters = filters.filter(f => f.listing_type === listingType);
    const grouped = FILTER_CATEGORIES.map(cat => ({
      ...cat,
      filters: typeFilters.filter(f => f.filter_category === cat.value),
    })).filter(g => g.filters.length > 0);

    const ungrouped = typeFilters.filter(f => !FILTER_CATEGORIES.some(c => c.value === f.filter_category));

    return (
      <div className="space-y-2">
        {/* Add Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{typeFilters.length} filters configured</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{typeFilters.filter(f => f.is_active).length} active</span>
          </div>
          <Button size="sm" onClick={() => openAdd(listingType)} className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Filter
          </Button>
        </div>

        {/* Category Groups */}
        {grouped.map(group => (
          <Collapsible
            key={group.value}
            open={expandedCategories.has(group.value)}
            onOpenChange={() => toggleCategory(group.value)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs px-2 py-0.5 border ${group.color}`}>
                  {group.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{group.filters.length} filter{group.filters.length !== 1 ? 's' : ''}</span>
              </div>
              {expandedCategories.has(group.value) ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 mt-1.5 ml-1">
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

        {/* Ungrouped */}
        {ungrouped.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground px-1">Other</p>
            {ungrouped.map(filter => (
              <FilterCard
                key={filter.id}
                filter={filter}
                onEdit={() => openEdit(filter)}
                onDelete={() => setDeleteConfirm(filter.id!)}
                onToggle={(active) => toggleFilter(filter.id!, active)}
                onDuplicate={() => duplicateFilter(filter)}
              />
            ))}
          </div>
        )}

        {typeFilters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border-2 border-dashed border-border/40">
            <Filter className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-1">No filters configured</p>
            <p className="text-xs text-muted-foreground/70 mb-3">Add filters to customize the search experience</p>
            <Button size="sm" variant="outline" onClick={() => openAdd(listingType)} className="h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add First Filter
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading filter configuration...</span>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            Filter Configuration
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage search filters for property listings</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Sale Filters', value: saleCount, icon: '🏷️', accent: 'border-l-primary' },
          { label: 'Rent Filters', value: rentCount, icon: '🏠', accent: 'border-l-accent' },
          { label: 'Active', value: activeCount, icon: '✅', accent: 'border-l-green-500' },
          { label: 'Inactive', value: inactiveCount, icon: '⏸️', accent: 'border-l-muted-foreground' },
        ].map(stat => (
          <Card key={stat.label} className={`border-l-4 ${stat.accent}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-xl">{stat.icon}</span>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="sale" className="w-full">
            <TabsList className="h-9 w-full bg-muted/30 mb-4">
              <TabsTrigger value="sale" className="flex-1 gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingCart className="h-4 w-4" /> Sale ({saleCount})
              </TabsTrigger>
              <TabsTrigger value="rent" className="flex-1 gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Home className="h-4 w-4" /> Rent ({rentCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sale">{renderCategoryGroup('sale')}</TabsContent>
            <TabsContent value="rent">{renderCategoryGroup('rent')}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingFilter(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingFilter?.id ? '✏️ Edit Filter' : '➕ New Filter'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingFilter?.id ? 'Update the filter configuration below' : 'Configure a new search filter for your properties'}
            </DialogDescription>
          </DialogHeader>
          {editingFilter && (
            <FilterForm
              filter={editingFilter}
              onSave={saveFilter}
              onCancel={() => { setDialogOpen(false); setEditingFilter(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> Delete Filter?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this filter from your configuration. Users will no longer see it in the search interface.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && deleteFilter(deleteConfirm)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyFilterSettings;
