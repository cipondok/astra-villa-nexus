
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, Search, Plus, Edit, Trash2, MoreHorizontal, Eye, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import FilterEditModal from "./FilterEditModal";

const SearchFiltersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFilter, setEditingFilter] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmFilter, setDeleteConfirmFilter] = useState<any>(null);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: filters, isLoading } = useQuery({
    queryKey: ['admin-search-filters', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('search_filters')
        .select('*')
        .order('display_order', { ascending: true });

      if (searchTerm) {
        query = query.or(`filter_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const createFilterMutation = useMutation({
    mutationFn: async (filterData: any) => {
      const { error } = await supabase
        .from('search_filters')
        .insert(filterData);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Created", "Search filter has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-search-filters'] });
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      showError("Create Failed", error.message);
    },
  });

  const updateFilterMutation = useMutation({
    mutationFn: async ({ filterId, updates }: { filterId: string; updates: any }) => {
      const { error } = await supabase
        .from('search_filters')
        .update(updates)
        .eq('id', filterId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Updated", "Search filter has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-search-filters'] });
      setEditingFilter(null);
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deleteFilterMutation = useMutation({
    mutationFn: async (filterId: string) => {
      const { error } = await supabase
        .from('search_filters')
        .delete()
        .eq('id', filterId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Deleted", "Search filter has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-search-filters'] });
      setDeleteConfirmFilter(null);
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  const duplicateFilterMutation = useMutation({
    mutationFn: async (filter: any) => {
      const duplicateData = {
        filter_name: `${filter.filter_name} (Copy)`,
        filter_type: filter.filter_type,
        category: filter.category,
        filter_options: filter.filter_options,
        is_active: false,
        display_order: (filters?.length || 0) + 1,
      };
      
      const { error } = await supabase
        .from('search_filters')
        .insert(duplicateData);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Duplicated", "Filter has been duplicated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-search-filters'] });
    },
    onError: (error: any) => {
      showError("Duplicate Failed", error.message);
    },
  });

  const updateDisplayOrderMutation = useMutation({
    mutationFn: async ({ filterId, newOrder }: { filterId: string; newOrder: number }) => {
      const { error } = await supabase
        .from('search_filters')
        .update({ display_order: newOrder })
        .eq('id', filterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-filters'] });
    },
  });

  const moveFilter = (filter: any, direction: 'up' | 'down') => {
    if (!filters) return;
    
    const currentIndex = filters.findIndex(f => f.id === filter.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= filters.length) return;
    
    const targetFilter = filters[targetIndex];
    
    // Swap display orders
    updateDisplayOrderMutation.mutate({ filterId: filter.id, newOrder: targetFilter.display_order });
    updateDisplayOrderMutation.mutate({ filterId: targetFilter.id, newOrder: filter.display_order });
  };

  const getFilterTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      select: "Dropdown",
      checkbox: "Checkboxes",
      radio: "Radio Buttons",
      range: "Range Slider",
      input: "Text Input",
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      property: "Property Features",
      location: "Location & Environment",
      amenities: "Facilities & Amenities",
      lifestyle: "Lifestyle & Comfort",
      sustainability: "Sustainability",
      investment: "Investment Potential",
      neighborhood: "Neighborhood",
      developer: "Developer Info",
    };
    return categories[category] || category;
  };

  // Helper function to safely handle filter options
  const getFilterOptionsDisplay = (filterOptions: any) => {
    if (!filterOptions) return "No options";
    
    if (Array.isArray(filterOptions)) {
      return `${filterOptions.length} options`;
    }
    
    if (typeof filterOptions === 'string') {
      const options = filterOptions.split(',').filter(opt => opt.trim());
      return `${options.length} options`;
    }
    
    return "No options";
  };

  const filteredFilters = filters?.filter(filter =>
    filter.filter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filter.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Filters Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Create and manage property search filters with live preview and easy editing
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search filters by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredFilters.length} filter{filteredFilters.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filter Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading filters...
                    </TableCell>
                  </TableRow>
                ) : filteredFilters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="space-y-2">
                        <Filter className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p>No search filters found</p>
                        <p className="text-sm text-muted-foreground">
                          Create your first filter to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFilters.map((filter) => (
                    <TableRow key={filter.id}>
                      <TableCell>
                        <div className="font-medium">{filter.filter_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getFilterTypeLabel(filter.filter_type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCategoryLabel(filter.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getFilterOptionsDisplay(filter.filter_options)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={filter.is_active ? "default" : "secondary"}>
                          {filter.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{filter.display_order}</span>
                          <div className="flex flex-col">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => moveFilter(filter, 'up')}
                              disabled={filters?.findIndex(f => f.id === filter.id) === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => moveFilter(filter, 'down')}
                              disabled={filters?.findIndex(f => f.id === filter.id) === filters.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingFilter(filter)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => duplicateFilterMutation.mutate(filter)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmFilter(filter)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Filter Modal */}
      <FilterEditModal
        filter={null}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(filterData) => createFilterMutation.mutate(filterData)}
      />

      {/* Edit Filter Modal */}
      <FilterEditModal
        filter={editingFilter}
        isOpen={!!editingFilter}
        onClose={() => setEditingFilter(null)}
        onSave={(filterData) => updateFilterMutation.mutate({ filterId: editingFilter.id, updates: filterData })}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmFilter} onOpenChange={() => setDeleteConfirmFilter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Filter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmFilter?.filter_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmFilter(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteFilterMutation.mutate(deleteConfirmFilter.id)}
            >
              Delete Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchFiltersManagement;
