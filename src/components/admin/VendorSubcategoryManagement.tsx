
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { List, Plus, Edit, Trash2 } from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  icon?: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  main_category_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vendor_main_categories?: MainCategory;
}

const VendorSubcategoryManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    main_category_id: "",
    display_order: 0,
    is_active: true
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch main categories for dropdown
  const { data: mainCategories } = useQuery({
    queryKey: ['vendor-main-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as MainCategory[];
    }
  });

  // Fetch subcategories with main category info
  const { data: subcategories, isLoading } = useQuery({
    queryKey: ['vendor-subcategories-with-main'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subcategories')
        .select(`
          *,
          vendor_main_categories (
            name,
            icon
          )
        `)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Subcategory[];
    }
  });

  // Create subcategory mutation
  const createSubcategoryMutation = useMutation({
    mutationFn: async (subcategoryData: typeof formData) => {
      const { error } = await supabase
        .from('vendor_subcategories')
        .insert(subcategoryData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Subcategory created successfully");
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendor-subcategories-with-main'] });
    },
    onError: () => {
      showError("Error", "Failed to create subcategory");
    }
  });

  // Update subcategory mutation
  const updateSubcategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('vendor_subcategories')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Subcategory updated successfully");
      setEditingSubcategory(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendor-subcategories-with-main'] });
    },
    onError: () => {
      showError("Error", "Failed to update subcategory");
    }
  });

  // Delete subcategory mutation
  const deleteSubcategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_subcategories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Subcategory deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-subcategories-with-main'] });
    },
    onError: () => {
      showError("Error", "Failed to delete subcategory");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "",
      main_category_id: "",
      display_order: 0,
      is_active: true
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showError("Error", "Subcategory name is required");
      return;
    }

    if (!formData.main_category_id) {
      showError("Error", "Main category is required");
      return;
    }

    if (editingSubcategory) {
      updateSubcategoryMutation.mutate({ id: editingSubcategory.id, data: formData });
    } else {
      createSubcategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      slug: subcategory.slug || "",
      description: subcategory.description || "",
      icon: subcategory.icon || "",
      main_category_id: subcategory.main_category_id || "",
      display_order: subcategory.display_order || 0,
      is_active: subcategory.is_active
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      deleteSubcategoryMutation.mutate(id);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading subcategories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subcategory Management</h2>
          <p className="text-muted-foreground">Manage vendor service subcategories</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setEditingSubcategory(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="main_category_id">Main Category</Label>
                <Select
                  value={formData.main_category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, main_category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Subcategory Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      name,
                      slug: generateSlug(name)
                    }));
                  }}
                  placeholder="Enter subcategory name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="subcategory-slug"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter subcategory description"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="⚡"
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Subcategories ({subcategories?.length || 0})
          </CardTitle>
          <CardDescription>
            Manage subcategories organized under main categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subcategories && subcategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Main Category</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{subcategory.vendor_main_categories?.icon}</span>
                        <span className="text-sm text-muted-foreground">
                          {subcategory.vendor_main_categories?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-lg">{subcategory.icon}</span>
                    </TableCell>
                    <TableCell className="font-medium">{subcategory.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{subcategory.slug || 'No slug'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {subcategory.description || 'No description'}
                    </TableCell>
                    <TableCell>{subcategory.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={subcategory.is_active ? "default" : "secondary"}>
                        {subcategory.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subcategory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subcategories found. Create your first subcategory to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorSubcategoryManagement;
