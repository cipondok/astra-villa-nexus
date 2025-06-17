
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Filter, Search, Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SearchFilter {
  id: string;
  filter_name: string;
  filter_type: string;
  filter_options: any;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FilterFormData {
  filter_name: string;
  filter_type: string;
  filter_options: string;
  category: string;
}

const SearchFiltersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SearchFilter | null>(null);
  const [newFilter, setNewFilter] = useState<FilterFormData>({
    filter_name: "",
    filter_type: "select",
    filter_options: "",
    category: "property",
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: filters, isLoading, error, refetch } = useQuery({
    queryKey: ['search-filters', searchTerm, statusFilter],
    queryFn: async (): Promise<SearchFilter[]> => {
      console.log('Fetching search filters...');
      
      let query = supabase
        .from('search_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`filter_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query;
      
      console.log('Search filters query result:', { data, error });
      
      if (error) {
        console.error('Error fetching search filters:', error);
        throw error;
      }

      return data || [];
    },
  });

  const createFilterMutation = useMutation({
    mutationFn: async (filterData: FilterFormData) => {
      const { error } = await supabase
        .from('search_filters')
        .insert({
          ...filterData,
          is_active: true
        });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Added", "Search filter has been added successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      setIsAddDialogOpen(false);
      setNewFilter({
        filter_name: "",
        filter_type: "select",
        filter_options: "",
        category: "property",
      });
    },
    onError: (error: Error) => {
      showError("Add Failed", error.message);
    },
  });

  const updateFilterMutation = useMutation({
    mutationFn: async ({ filterId, updates }: { filterId: string; updates: Partial<SearchFilter> }) => {
      const { error } = await supabase
        .from('search_filters')
        .update(updates)
        .eq('id', filterId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Updated", "Search filter has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      setIsEditDialogOpen(false);
      setEditingFilter(null);
    },
    onError: (error: Error) => {
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
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
    onError: (error: Error) => {
      showError("Delete Failed", error.message);
    },
  });

  const handleStatusChange = (filterId: string, newStatus: string) => {
    const isActive = newStatus === 'active';
    updateFilterMutation.mutate({ filterId, updates: { is_active: isActive } });
  };

  const handleAddFilter = () => {
    createFilterMutation.mutate(newFilter);
  };

  const handleEditFilter = () => {
    if (!editingFilter) return;
    
    const updates = {
      filter_name: editingFilter.filter_name,
      filter_type: editingFilter.filter_type,
      filter_options: editingFilter.filter_options,
      category: editingFilter.category,
    };
    
    updateFilterMutation.mutate({ filterId: editingFilter.id, updates });
  };

  const handleDeleteFilter = (filterId: string) => {
    if (window.confirm('Are you sure you want to delete this filter?')) {
      deleteFilterMutation.mutate(filterId);
    }
  };

  const openEditDialog = (filter: SearchFilter) => {
    setEditingFilter(filter);
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
  };

  const FilterFormFields = ({ 
    formData, 
    setFormData 
  }: { 
    formData: FilterFormData; 
    setFormData: (data: FilterFormData) => void;
  }) => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="filter_name">Filter Name</Label>
        <Input
          id="filter_name"
          value={formData.filter_name}
          onChange={(e) => setFormData({ ...formData, filter_name: e.target.value })}
          placeholder="Filter name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filter_type">Filter Type</Label>
        <Select value={formData.filter_type} onValueChange={(value) => setFormData({ ...formData, filter_type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select">Select Dropdown</SelectItem>
            <SelectItem value="range">Range Slider</SelectItem>
            <SelectItem value="checkbox">Checkbox</SelectItem>
            <SelectItem value="input">Text Input</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="location">Location</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="amenities">Amenities</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="filter_options">Options (comma-separated)</Label>
        <Input
          id="filter_options"
          value={formData.filter_options}
          onChange={(e) => setFormData({ ...formData, filter_options: e.target.value })}
          placeholder="Option1, Option2, Option3"
        />
      </div>
    </div>
  );

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
              <CardDescription>
                Manage search filters for property listings
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Search Filter</DialogTitle>
                    <DialogDescription>
                      Create a new search filter for property listings
                    </DialogDescription>
                  </DialogHeader>
                  <FilterFormFields
                    formData={newFilter}
                    setFormData={setNewFilter}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddFilter}>
                      Add Filter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search filters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading filters...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error loading filters</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filter Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filters?.map((filter) => (
                  <TableRow key={filter.id}>
                    <TableCell className="font-medium">{filter.filter_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{filter.filter_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{filter.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {Array.isArray(filter.filter_options) 
                        ? filter.filter_options.join(', ')
                        : typeof filter.filter_options === 'string'
                        ? filter.filter_options
                        : JSON.stringify(filter.filter_options)
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(filter.is_active)}>
                        {filter.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(filter)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFilter(filter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Select
                          value={filter.is_active ? 'active' : 'inactive'}
                          onValueChange={(value) => handleStatusChange(filter.id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Search Filter</DialogTitle>
            <DialogDescription>
              Update the search filter configuration
            </DialogDescription>
          </DialogHeader>
          {editingFilter && (
            <FilterFormFields
              formData={{
                filter_name: editingFilter.filter_name,
                filter_type: editingFilter.filter_type,
                filter_options: Array.isArray(editingFilter.filter_options) 
                  ? editingFilter.filter_options.join(', ')
                  : editingFilter.filter_options || '',
                category: editingFilter.category,
              }}
              setFormData={(data) => setEditingFilter({
                ...editingFilter,
                filter_name: data.filter_name,
                filter_type: data.filter_type,
                filter_options: data.filter_options,
                category: data.category,
              })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFilter}>
              Update Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchFiltersManagement;
