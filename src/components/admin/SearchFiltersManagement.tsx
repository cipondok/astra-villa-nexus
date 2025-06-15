import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SearchFiltersManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [formData, setFormData] = useState({
    filter_name: '',
    filter_type: 'dropdown',
    filter_options: {},
    category: '',
    is_active: true,
    display_order: 0
  });
  // New: Manage subcategories state for UI only
  const [subCategory, setSubCategory] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: filters, isLoading } = useQuery({
    queryKey: ['search-filters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const createFilterMutation = useMutation({
    mutationFn: async (filterData: any) => {
      const { error } = await supabase
        .from('search_filters')
        .insert([filterData]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Created", "Search filter has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const updateFilterMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('search_filters')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Updated", "Search filter has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
      setShowForm(false);
      setEditingFilter(null);
      resetForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deleteFilterMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('search_filters')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Filter Deleted", "Search filter has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('search_filters')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-filters'] });
    },
  });

  // New: Helpers to extract category and subcategory logic
  const parseCategory = (category?: string) => {
    if (!category) return { main: "", sub: "" };
    const [main, ...rest] = category.split("/");
    return { main, sub: rest.join("/") };
  };

  // Precomputed list of main categories for selection
  const mainCategories = Array.from(
    new Set(filters?.map((f: any) => parseCategory(f.category).main).filter(Boolean) || [])
  );

  // Precomputed list of subcategories for current main category
  const subCategories = Array.from(
    new Set(
      filters
        ?.filter((f: any) => parseCategory(f.category).main === formData.category)
        .map((f: any) => parseCategory(f.category).sub)
        .filter((sc) => sc && sc.length > 0) || []
    )
  );

  const resetForm = () => {
    setFormData({
      filter_name: '',
      filter_type: 'dropdown',
      filter_options: {},
      category: '',
      is_active: true,
      display_order: 0
    });
  };

  const handleSubmit = () => {
    if (editingFilter) {
      updateFilterMutation.mutate({ id: editingFilter.id, updates: formData });
    } else {
      createFilterMutation.mutate(formData);
    }
  };

  const handleEdit = (filter: any) => {
    setEditingFilter(filter);
    setFormData({
      filter_name: filter.filter_name,
      filter_type: filter.filter_type,
      filter_options: filter.filter_options || {},
      category: filter.category || '',
      is_active: filter.is_active,
      display_order: filter.display_order || 0
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this filter?')) {
      deleteFilterMutation.mutate(id);
    }
  };

  const moveFilter = (id: string, direction: 'up' | 'down') => {
    const currentFilter = filters?.find(f => f.id === id);
    if (!currentFilter) return;

    const currentOrder = currentFilter.display_order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    updateOrderMutation.mutate({ id, newOrder });
  };

  const getFilterTypeIcon = (type: string) => {
    switch (type) {
      case 'dropdown': return '📋';
      case 'checkbox': return '☑️';
      case 'range': return '📊';
      case 'text': return '📝';
      default: return '🔍';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="h-5 w-5" />
                Search Filters Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure search filters, categories, sub-categories and display options
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { resetForm(); setEditingFilter(null); setSubCategory(""); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingFilter ? 'Edit Filter' : 'Add Search Filter'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Configure a new search filter for users to filter content.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="filter_name" className="text-white">Filter Name</Label>
                      <Input
                        id="filter_name"
                        value={formData.filter_name}
                        onChange={(e) => setFormData({ ...formData, filter_name: e.target.value })}
                        placeholder="Price Range"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="filter_type" className="text-white">Filter Type</Label>
                      <Select value={formData.filter_type} onValueChange={(value) => setFormData({ ...formData, filter_type: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="range">Range Slider</SelectItem>
                          <SelectItem value="text">Text Input</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* New: Grouped category & subcategory select */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-white">Main Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          setFormData({ ...formData, category: value });
                          setSubCategory("");
                        }}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select or create category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {mainCategories.map((mc) =>
                            <SelectItem key={mc} value={mc}>{mc}</SelectItem>
                          )}
                          <SelectItem value="">New Category…</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Enter new category if blank */}
                      {!formData.category && (
                        <Input
                          className="mt-2 bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter new main category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subcategory" className="text-white">Subcategory</Label>
                      <Select
                        value={subCategory}
                        onValueChange={(value) => {
                          setSubCategory(value);
                          setFormData({ ...formData, category: formData.category ? `${formData.category}${value ? "/" + value : ""}` : "" });
                        }}
                        disabled={!formData.category}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select or create subcategory" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {subCategories.map((sc) =>
                            <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                          )}
                          <SelectItem value="">New Subcategory…</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Enter new subcategory if blank */}
                      {formData.category && !subCategory && (
                        <Input
                          className="mt-2 bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter new subcategory"
                          value={subCategory}
                          onChange={(e) => {
                            setSubCategory(e.target.value);
                            setFormData({ ...formData, category: formData.category ? `${formData.category}/${e.target.value}` : "" });
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="property, general, etc."
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="display_order" className="text-white">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="filter_options" className="text-white">Filter Options (JSON)</Label>
                    <Textarea
                      id="filter_options"
                      value={JSON.stringify(formData.filter_options, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({ ...formData, filter_options: parsed });
                        } catch (error) {
                          // Invalid JSON, keep the text as is
                        }
                      }}
                      placeholder='{"options": ["option1", "option2"], "min": 0, "max": 100}'
                      rows={6}
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                    />
                    <p className="text-sm text-gray-400">
                      For dropdown/checkbox: {"{"}"options": ["value1", "value2"]{"}"}
                      <br />
                      For range: {"{"}"min": 0, "max": 1000, "step": 10{"}"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="text-white">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createFilterMutation.isPending || updateFilterMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingFilter ? 'Update' : 'Create'} Filter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-white/20 rounded-lg bg-white/5">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-gray-300">Order</TableHead>
                  <TableHead className="text-gray-300">Filter</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                      Loading filters...
                    </TableCell>
                  </TableRow>
                ) : filters?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                      No filters found
                    </TableCell>
                  </TableRow>
                ) : (
                  filters?.map((filter) => (
                    <TableRow key={filter.id} className="border-white/20">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-1">
                          <span className="w-8 text-center">{filter.display_order}</span>
                          <div className="flex flex-col">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => moveFilter(filter.id, 'up')}
                              className="p-1 h-6 text-gray-400 hover:text-white"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => moveFilter(filter.id, 'down')}
                              className="p-1 h-6 text-gray-400 hover:text-white"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-medium">{filter.filter_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFilterTypeIcon(filter.filter_type)}</span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                            {filter.filter_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {filter.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={filter.is_active ? 'default' : 'outline'} className={filter.is_active ? 'bg-green-600' : 'border-gray-600 text-gray-300'}>
                          {filter.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(filter)} className="border-gray-600 text-gray-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(filter.id)}
                            className="border-gray-600 text-gray-300"
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
