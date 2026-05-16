
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAlert } from "@/contexts/AlertContext";
import { Plus, Edit, Trash2, Settings } from "lucide-react";

interface SearchFilter {
  id: string;
  filter_name: string;
  filter_type: string;
  category: string;
  filter_options: any;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const SearchFiltersManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SearchFilter | null>(null);
  const [newFilter, setNewFilter] = useState({
    filter_name: "",
    filter_type: "select",
    category: "property",
    filter_options: { options: [] },
    is_active: true,
    display_order: 0
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch search filters
  const { data: filters, isLoading } = useQuery({
    queryKey: ['search-filters'],
    queryFn: async (): Promise<SearchFilter[]> => {
      const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create filter mutation
  const createFilterMutation = useMutation({
    mutationFn: async (filterData: typeof newFilter) => {
      const { error } = await supabase
        .from('search_filters')
        .insert({
          filter_name: filterData.filter_name,
          filter_type: filterData.filter_type,
          category: filterData.category,
          filter_options: filterData.filter_options,
          is_active: filterData.is_active,
          display_order: filterData.display_order
        });
      
      if (error) throw error;
      return filterData;
    },
    onSuccess: () => {
      showSuccess("Filter Created", "Search filter has been created successfully.");
      setIsCreateModalOpen(false);
      setNewFilter({
        filter_name: "",
        filter_type: "select",
        category: "property",
        filter_options: { options: [] },
        is_active: true,
        display_order: 0
      });
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  // Update filter mutation
  const updateFilterMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SearchFilter> }) => {
      const { error } = await supabase
        .from('search_filters')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => {
      showSuccess("Filter Updated", "Search filter has been updated successfully.");
      setEditingFilter(null);
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Delete filter mutation
  const deleteFilterMutation = useMutation({
    mutationFn: async (filterId: string) => {
      const { error } = await supabase
        .from('search_filters')
        .delete()
        .eq('id', filterId);
      
      if (error) throw error;
      return filterId;
    },
    onSuccess: () => {
      showSuccess("Filter Deleted", "Search filter has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  const handleCreateFilter = () => {
    if (!newFilter.filter_name || !newFilter.filter_type) {
      showError("Validation Error", "Filter name and type are required.");
      return;
    }
    createFilterMutation.mutate(newFilter);
  };

  const handleEditFilter = (filter: SearchFilter) => {
    setEditingFilter(filter);
  };

  const handleUpdateFilter = () => {
    if (!editingFilter) return;
    
    updateFilterMutation.mutate({
      id: editingFilter.id,
      updates: {
        filter_name: editingFilter.filter_name,
        filter_type: editingFilter.filter_type,
        category: editingFilter.category,
        filter_options: editingFilter.filter_options,
        is_active: editingFilter.is_active,
        display_order: editingFilter.display_order
      }
    });
  };

  const toggleFilterStatus = (filterId: string, isActive: boolean) => {
    updateFilterMutation.mutate({
      id: filterId,
      updates: { is_active: isActive }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Search Filters Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage search filters for property listings
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Search Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Filter Name</Label>
                <Input
                  value={newFilter.filter_name}
                  onChange={(e) => setNewFilter(prev => ({ ...prev, filter_name: e.target.value }))}
                  placeholder="Enter filter name"
                />
              </div>
              <div>
                <Label>Filter Type</Label>
                <Select 
                  value={newFilter.filter_type} 
                  onValueChange={(value) => setNewFilter(prev => ({ ...prev, filter_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select Dropdown</SelectItem>
                    <SelectItem value="range">Range Input</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={newFilter.category} 
                  onValueChange={(value) => setNewFilter(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={newFilter.display_order}
                  onChange={(e) => setNewFilter(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter display order"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newFilter.is_active}
                  onCheckedChange={(checked) => setNewFilter(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateFilter}
                  disabled={createFilterMutation.isPending}
                  className="flex-1"
                >
                  {createFilterMutation.isPending ? 'Creating...' : 'Create Filter'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters ({filters?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading filters...</div>
          ) : !filters || filters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No search filters found. Create your first filter to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filters.map((filter) => (
                  <TableRow key={filter.id}>
                    <TableCell className="font-medium">{filter.filter_name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{filter.filter_type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{filter.category}</span>
                    </TableCell>
                    <TableCell>{filter.display_order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={filter.is_active}
                        onCheckedChange={(checked) => toggleFilterStatus(filter.id, checked)}
                        disabled={updateFilterMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(filter.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditFilter(filter)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFilterMutation.mutate(filter.id)}
                          disabled={deleteFilterMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Filter Dialog */}
      <Dialog open={!!editingFilter} onOpenChange={() => setEditingFilter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Search Filter</DialogTitle>
          </DialogHeader>
          {editingFilter && (
            <div className="space-y-4">
              <div>
                <Label>Filter Name</Label>
                <Input
                  value={editingFilter.filter_name}
                  onChange={(e) => setEditingFilter(prev => prev ? ({ ...prev, filter_name: e.target.value }) : null)}
                  placeholder="Enter filter name"
                />
              </div>
              <div>
                <Label>Filter Type</Label>
                <Select 
                  value={editingFilter.filter_type} 
                  onValueChange={(value) => setEditingFilter(prev => prev ? ({ ...prev, filter_type: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select Dropdown</SelectItem>
                    <SelectItem value="range">Range Input</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={editingFilter.category} 
                  onValueChange={(value) => setEditingFilter(prev => prev ? ({ ...prev, category: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingFilter.display_order}
                  onChange={(e) => setEditingFilter(prev => prev ? ({ ...prev, display_order: parseInt(e.target.value) || 0 }) : null)}
                  placeholder="Enter display order"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingFilter.is_active}
                  onCheckedChange={(checked) => setEditingFilter(prev => prev ? ({ ...prev, is_active: checked }) : null)}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateFilter}
                  disabled={updateFilterMutation.isPending}
                  className="flex-1"
                >
                  {updateFilterMutation.isPending ? 'Updating...' : 'Update Filter'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingFilter(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchFiltersManagement;
