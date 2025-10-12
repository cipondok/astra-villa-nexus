import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Filter, Plus, Edit, Trash2, GripVertical, Search, CheckCircle2, XCircle } from 'lucide-react';
import { usePropertyFilters, FilterOption, FilterCategory } from '@/hooks/usePropertyFilters';
import { useToast } from '@/hooks/use-toast';
import { FilterDialog } from './filters/FilterDialog';
import { cn } from '@/lib/utils';

interface PropertyFiltersManagementProps {
  filterType?: 'sale' | 'rent' | 'all';
  title?: string;
  description?: string;
}

const PropertyFiltersManagement = ({ 
  filterType = 'all',
  title = 'Property Filters Management',
  description = 'Configure rental property filters and facilities'
}: PropertyFiltersManagementProps) => {
  const { filters, loading, updateFilter, deleteFilter, addFilter } = usePropertyFilters();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<FilterOption | null>(null);

  const handleToggleFilter = async (filterId: string, currentState: boolean) => {
    try {
      await updateFilter(filterId, { is_active: !currentState });
    } catch (error) {
      console.error('Failed to toggle filter:', error);
    }
  };

  const handleDeleteFilter = async (filterId: string, filterName: string) => {
    if (confirm(`Are you sure you want to delete "${filterName}"?`)) {
      try {
        await deleteFilter(filterId);
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    }
  };

  const handleEditFilter = (filter: FilterOption) => {
    setEditingFilter(filter);
    setIsDialogOpen(true);
  };

  const handleSaveFilter = async (filterData: Omit<FilterOption, 'id'>) => {
    try {
      if (editingFilter) {
        await updateFilter(editingFilter.id, filterData);
      } else {
        await addFilter(filterData);
      }
      setIsDialogOpen(false);
      setEditingFilter(null);
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFilter(null);
  };

  const getFilterTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      checkbox: '☑️',
      select: '📋',
      input: '✏️',
      range: '📊'
    };
    return icons[type] || '📌';
  };

  const getFilterTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      checkbox: 'bg-blue-500/10 text-blue-700 border-blue-200',
      select: 'bg-purple-500/10 text-purple-700 border-purple-200',
      input: 'bg-green-500/10 text-green-700 border-green-200',
      range: 'bg-orange-500/10 text-orange-700 border-orange-200'
    };
    return colors[type] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const filteredCategories = filters.map(category => ({
    ...category,
    options: category.options.filter(option => {
      const matchesSearch = option.filter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          option.filter_category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || option.listing_type === filterType;
      return matchesSearch && matchesType;
    })
  })).filter(category => category.options.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Filter className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add New Filter
        </Button>
      </div>

      {/* Search and Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search filters by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Filters</p>
                <p className="text-2xl font-bold">{filters.reduce((acc, cat) => acc + cat.options.length, 0)}</p>
              </div>
              <Filter className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {filters.reduce((acc, cat) => acc + cat.options.filter(o => o.is_active).length, 0)}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Categories Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl capitalize">{category.name}</CardTitle>
                  <CardDescription>
                    {category.options.length} filter{category.options.length !== 1 ? 's' : ''} in this category
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {category.options.filter(o => o.is_active).length} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {category.options.map((filter, index) => (
                  <div
                    key={filter.id}
                    className={cn(
                      "group flex items-center gap-4 p-4 hover:bg-accent/50 transition-all duration-200",
                      !filter.is_active && "opacity-60"
                    )}
                  >
                    {/* Drag Handle */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Filter Type Badge */}
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium min-w-[100px]",
                      getFilterTypeColor(filter.filter_type)
                    )}>
                      <span>{getFilterTypeIcon(filter.filter_type)}</span>
                      <span className="capitalize">{filter.filter_type}</span>
                    </div>

                    {/* Filter Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-base truncate">{filter.filter_name}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {filter.listing_type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>Order: {filter.display_order || 0}</span>
                        {filter.filter_options && filter.filter_options.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span>•</span>
                            <span>{filter.filter_options.length} options</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sub-filters/Options Preview */}
                    {filter.filter_options && filter.filter_options.length > 0 && (
                      <div className="hidden lg:flex items-center gap-2 max-w-md">
                        {filter.filter_options.slice(0, 3).map((opt, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {opt}
                          </Badge>
                        ))}
                        {filter.filter_options.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{filter.filter_options.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={filter.is_active}
                        onCheckedChange={() => handleToggleFilter(filter.id, filter.is_active)}
                        className="data-[state=checked]:bg-green-600"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditFilter(filter)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFilter(filter.id, filter.filter_name)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No filters found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first filter'}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <FilterDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveFilter}
        filter={editingFilter}
      />
    </div>
  );
};

export default PropertyFiltersManagement;
