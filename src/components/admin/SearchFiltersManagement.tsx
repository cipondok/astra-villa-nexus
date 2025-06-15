
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

const SearchFiltersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<any>(null);
  const [newFilter, setNewFilter] = useState({
    name: "",
    type: "select",
    options: "",
    category: "property",
    description: "",
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: filters, isLoading, error, refetch } = useQuery({
    queryKey: ['search-filters', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching search filters...');
      
      let query = supabase
        .from('search_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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
    mutationFn: async (filterData: any) => {
      const { error } = await supabase
        .from('search_filters')
        .insert({
          ...filterData,
          status: 'active'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Added", "Search filter has been added successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      setIsAddDialogOpen(false);
      setNewFilter({
        name: "",
        type: "select",
        options: "",
        category: "property",
        description: "",
      });
    },
    onError: (error: any) => {
      showError("Add Failed", error.message);
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
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
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
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  const handleStatusChange = (filterId: string, newStatus: string) => {
    updateFilterMutation.mutate({ filterId, updates: { status: newStatus } });
  };

  const handleAddFilter = () => {
    createFilterMutation.mutate(newFilter);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Search Filter</DialogTitle>
                    <DialogDescription>
                      Create a new search filter for property listings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Filter Name</Label>
                      <Input
                        id="name"
                        value={newFilter.name}
                        onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                        placeholder="Filter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Filter Type</Label>
                      <Select value={newFilter.type} onValueChange={(value) => setNewFilter({ ...newFilter, type: value })}>
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
                      <Select value={newFilter.category} onValueChange={(value) => setNewFilter({ ...newFilter, category: value })}>
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
                      <Label htmlFor="options">Options (comma-separated)</Label>
                      <Input
                        id="options"
                        value={newFilter.options}
                        onChange={(e) => setNewFilter({ ...newFilter, options: e.target.value })}
                        placeholder="Option1, Option2, Option3"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newFilter.description}
                        onChange={(e) => setNewFilter({ ...newFilter, description: e.target.value })}
                        placeholder="Filter description"
                        rows={3}
                      />
                    </div>
                  </div>
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
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search filters by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive">
                Error loading search filters: {error.message}
              </p>
            </div>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filter Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading search filters...
                    </TableCell>
                  </TableRow>
                ) : filters?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="space-y-2">
                        <p>No search filters found</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Add Filter" to create your first search filter
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filters?.map((filter: any) => (
                    <TableRow key={filter.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{filter.name}</div>
                          {filter.description && (
                            <div className="text-sm text-muted-foreground">
                              {filter.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {filter.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {filter.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {filter.options ? filter.options.substring(0, 50) + '...' : 'No options'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={filter.status || 'active'}
                          onValueChange={(value) => handleStatusChange(filter.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge variant={getStatusBadgeVariant(filter.status || 'active')}>
                              {filter.status || 'active'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {filter.created_at ? new Date(filter.created_at).toLocaleDateString() : 'N/A'}
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteFilterMutation.mutate(filter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
};

export default SearchFiltersManagement;
