
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/contexts/AlertContext";
import { Filter, Plus, Edit, Trash2, Settings } from "lucide-react";

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

interface FilterFormData {
  filter_name: string;
  filter_type: string;
  category: string;
  filter_options: string;
  is_active: boolean;
  display_order: string;
}

const SearchFiltersManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SearchFilter | null>(null);
  const [formData, setFormData] = useState<FilterFormData>({
    filter_name: "",
    filter_type: "select",
    category: "",
    filter_options: "",
    is_active: true,
    display_order: "0"
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch search filters
  const { data: filters, isLoading, refetch } = useQuery({
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
    mutationFn: async (data: FilterFormData) => {
      let filterOptions;
      try {
        filterOptions = data.filter_options ? JSON.parse(data.filter_options) : {};
      } catch {
        filterOptions = { options: data.filter_options.split(',').map(s => s.trim()) };
      }

      const { error } = await supabase
        .from('search_filters')
        .insert({
          filter_name: data.filter_name,
          filter_type: data.filter_type,
          category: data.category,
          filter_options: filterOptions,
          is_active: data.is_active,
          display_order: parseInt(data.display_order)
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Filter Created", "Search filter has been created successfully.");
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  // Update filter mutation
  const updateFilterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FilterFormData }) => {
      let filterOptions;
      try {
        filterOptions = data.filter_options ? JSON.parse(data.filter_options) : {};
      } catch {
        filterOptions = { options: data.filter_options.split(',').map(s => s.trim()) };
      }

      const { error } = await supabase
        .from('search_filters')
        .update({
          filter_name: data.filter_name,
          filter_type: data.filter_type,
          category: data.category,
          filter_options: filterOptions,
          is_active: data.is_active,
          display_order: parseInt(data.display_order),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onSuccess: () => {
      showSuccess("Filter Updated", "Search filter has been updated successfully.");
      setIsEditModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Delete filter mutation
  const deleteFilterMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('search_filters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      showSuccess("Filter Deleted", "Search filter has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  // Toggle filter status mutation
  const toggleFilterMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('search_filters')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      return { id, is_active };
    },
    onSuccess: (data) => {
      showSuccess("Status Updated", `Filter ${data.is_active ? 'activated' : 'deactivated'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      filter_name: "",
      filter_type: "select",
      category: "",
      filter_options: "",
      is_active: true,
      display_order: "0"
    });
    setSelectedFilter(null);
  };

  const handleInputChange = (key: keyof FilterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openEditModal = (filter: SearchFilter) => {
    setSelectedFilter(filter);
    setFormData({
      filter_name: filter.filter_name,
      filter_type: filter.filter_type,
      category: filter.category || "",
      filter_options: JSON.stringify(filter.filter_options, null, 2),
      is_active: filter.is_active,
      display_order: filter.display_order.toString()
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent, isEdit: boolean = false) => {
    e.preventDefault();
    
    if (!formData.filter_name || !formData.filter_type) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }
    
    if (isEdit && selectedFilter) {
      updateFilterMutation.mutate({ id: selectedFilter.id, data: formData });
    } else {
      createFilterMutation.mutate(formData);
    }
  };

  const getFilterTypeBadge = (type: string) => {
    const colors = {
      select: "bg-blue-100 text-blue-800",
      range: "bg-green-100 text-green-800",
      checkbox: "bg-purple-100 text-purple-800",
      input: "bg-orange-100 text-orange-800"
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Search Filters Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure and manage property search filters
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Search Filter</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filter Name *</Label>
                  <Input
                    value={formData.filter_name}
                    onChange={(e) => handleInputChange('filter_name', e.target.value)}
                    placeholder="e.g., Property Type"
                    required
                  />
                </div>
                <div>
                  <Label>Filter Type *</Label>
                  <Select 
                    value={formData.filter_type} 
                    onValueChange={(value) => handleInputChange('filter_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select Dropdown</SelectItem>
                      <SelectItem value="range">Range Slider</SelectItem>
                      <SelectItem value="checkbox">Checkbox List</SelectItem>
                      <SelectItem value="input">Text Input</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Basic, Advanced"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleInputChange('display_order', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label>Filter Options *</Label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  value={formData.filter_options}
                  onChange={(e) => handleInputChange('filter_options', e.target.value)}
                  placeholder='{"options": ["Villa", "Apartment", "House"]} or for range: {"min": 0, "max": 10000000, "step": 100000}'
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter JSON format for options or comma-separated values
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label>Active Filter</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createFilterMutation.isPending}
                  className="flex-1"
                >
                  {createFilterMutation.isPending ? 'Creating...' : 'Create Filter'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters ({filters?.length || 0})</CardTitle>
          <CardDescription>
            Manage all property search filters and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading filters...</div>
          ) : filters?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No search filters found. Create your first filter to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filter Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filters?.map((filter) => (
                  <TableRow key={filter.id}>
                    <TableCell className="font-medium">{filter.filter_name}</TableCell>
                    <TableCell>{getFilterTypeBadge(filter.filter_type)}</TableCell>
                    <TableCell>{filter.category || '-'}</TableCell>
                    <TableCell>{filter.display_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={filter.is_active}
                          onCheckedChange={(checked) => 
                            toggleFilterMutation.mutate({ id: filter.id, is_active: checked })
                          }
                          disabled={toggleFilterMutation.isPending}
                        />
                        <span className="text-sm">
                          {filter.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(filter.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(filter)}
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

      {/* Edit Filter Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Search Filter</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
            {/* Same form content as create modal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Filter Name *</Label>
                <Input
                  value={formData.filter_name}
                  onChange={(e) => handleInputChange('filter_name', e.target.value)}
                  placeholder="e.g., Property Type"
                  required
                />
              </div>
              <div>
                <Label>Filter Type *</Label>
                <Select 
                  value={formData.filter_type} 
                  onValueChange={(value) => handleInputChange('filter_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select Dropdown</SelectItem>
                    <SelectItem value="range">Range Slider</SelectItem>
                    <SelectItem value="checkbox">Checkbox List</SelectItem>
                    <SelectItem value="input">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Basic, Advanced"
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Filter Options *</Label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={formData.filter_options}
                onChange={(e) => handleInputChange('filter_options', e.target.value)}
                placeholder='{"options": ["Villa", "Apartment", "House"]} or for range: {"min": 0, "max": 10000000, "step": 100000}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter JSON format for options or comma-separated values
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label>Active Filter</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={updateFilterMutation.isPending}
                className="flex-1"
              >
                {updateFilterMutation.isPending ? 'Updating...' : 'Update Filter'}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchFiltersManagement;
