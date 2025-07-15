
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
import { FolderTree, Plus, Edit, Trash2, Package, Wrench } from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  type: 'service' | 'product';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const VendorMainCategoryManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MainCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    type: "service" as "service" | "product",
    display_order: 0,
    is_active: true
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch main categories
  const { data: mainCategories, isLoading } = useQuery({
    queryKey: ['vendor-main-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as MainCategory[];
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: typeof formData) => {
      const { error } = await supabase
        .from('vendor_main_categories')
        .insert(categoryData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Main category created successfully");
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendor-main-categories'] });
    },
    onError: () => {
      showError("Error", "Failed to create main category");
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('vendor_main_categories')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Main category updated successfully");
      setEditingCategory(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendor-main-categories'] });
    },
    onError: () => {
      showError("Error", "Failed to update main category");
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_main_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Main category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-main-categories'] });
    },
    onError: () => {
      showError("Error", "Failed to delete main category");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "",
      type: "service",
      display_order: 0,
      is_active: true
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showError("Error", "Category name is required");
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (category: MainCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      icon: category.icon || "",
      type: category.type || "service",
      display_order: category.display_order || 0,
      is_active: category.is_active
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this main category? This will affect all related subcategories.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading main categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Main Category Management</h2>
          <p className="text-muted-foreground">Manage vendor service main categories</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setEditingCategory(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Main Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Main Category' : 'Create New Main Category'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
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
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🏠"
                />
              </div>
              <div>
                <Label htmlFor="type">Category Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "service" | "product") => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Service
                      </div>
                    </SelectItem>
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Main Categories ({mainCategories?.length || 0})
          </CardTitle>
          <CardDescription>
            Manage top-level service categories for vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mainCategories && mainCategories.length > 0 ? (
            <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Order</TableHead>
                   <TableHead>Icon</TableHead>
                   <TableHead>Name</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Slug</TableHead>
                   <TableHead>Description</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {mainCategories.map((category) => (
                  <TableRow key={category.id}>
                     <TableCell>{category.display_order}</TableCell>
                     <TableCell>
                       <span className="text-lg">{category.icon}</span>
                     </TableCell>
                     <TableCell className="font-medium">{category.name}</TableCell>
                     <TableCell>
                       <Badge variant={category.type === 'product' ? 'default' : 'outline'} className="flex items-center gap-1 w-fit">
                         {category.type === 'product' ? (
                           <>
                             <Package className="h-3 w-3" />
                             Product
                           </>
                         ) : (
                           <>
                             <Wrench className="h-3 w-3" />
                             Service
                           </>
                         )}
                       </Badge>
                     </TableCell>
                     <TableCell className="text-sm text-muted-foreground">{category.slug || 'No slug'}</TableCell>
                     <TableCell className="max-w-xs truncate">
                       {category.description || 'No description'}
                     </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
              No main categories found. Create your first main category to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorMainCategoryManagement;
