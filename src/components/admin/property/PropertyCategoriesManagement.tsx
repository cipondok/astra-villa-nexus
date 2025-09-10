import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Home, TreePine, Factory, Store, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  meta_data?: {
    min_price?: number;
    max_price?: number;
    typical_features?: string[];
    target_market?: string;
    legal_requirements?: string[];
  };
  created_at: string;
  updated_at: string;
}

const INDONESIAN_PROPERTY_TYPES = [
  { value: 'rumah', label: 'Rumah', icon: 'Home', description: 'Single family houses' },
  { value: 'apartemen', label: 'Apartemen', icon: 'Building', description: 'Apartment units' },
  { value: 'kondominium', label: 'Kondominium', icon: 'Building', description: 'Condominium units' },
  { value: 'villa', label: 'Villa', icon: 'TreePine', description: 'Luxury villas' },
  { value: 'townhouse', label: 'Townhouse', icon: 'Home', description: 'Connected houses' },
  { value: 'ruko', label: 'Ruko (Rumah Toko)', icon: 'Store', description: 'Shop houses' },
  { value: 'rukan', label: 'Rukan (Rumah Kantor)', icon: 'Factory', description: 'Office houses' },
  { value: 'gudang', label: 'Gudang', icon: 'Factory', description: 'Warehouses' },
  { value: 'pabrik', label: 'Pabrik', icon: 'Factory', description: 'Factory buildings' },
  { value: 'tanah', label: 'Tanah', icon: 'TreePine', description: 'Land plots' },
  { value: 'kavling', label: 'Kavling', icon: 'TreePine', description: 'Housing lots' },
  { value: 'kos', label: 'Kos-kosan', icon: 'Building', description: 'Boarding houses' },
  { value: 'hotel', label: 'Hotel', icon: 'Building', description: 'Hotel properties' },
  { value: 'resort', label: 'Resort', icon: 'TreePine', description: 'Resort properties' }
];

const PropertyCategoriesManagement = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PropertyCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parent_id: '',
    display_order: 0,
    is_active: true,
    meta_data: {
      min_price: '',
      max_price: '',
      typical_features: '',
      target_market: '',
      legal_requirements: ''
    }
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['property-categories', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('property_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyCategory[];
    }
  });

  // Get parent categories for dropdown
  const parentCategories = categories?.filter(c => !c.parent_id) || [];

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const processedData = {
        ...categoryData,
        meta_data: {
          min_price: categoryData.meta_data.min_price ? parseFloat(categoryData.meta_data.min_price) : null,
          max_price: categoryData.meta_data.max_price ? parseFloat(categoryData.meta_data.max_price) : null,
          typical_features: categoryData.meta_data.typical_features 
            ? categoryData.meta_data.typical_features.split(',').map((f: string) => f.trim())
            : [],
          target_market: categoryData.meta_data.target_market || null,
          legal_requirements: categoryData.meta_data.legal_requirements
            ? categoryData.meta_data.legal_requirements.split(',').map((r: string) => r.trim())
            : []
        }
      };

      const { error } = await supabase.from('property_categories').insert([processedData]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Category Added', 'Property category has been added successfully');
      queryClient.invalidateQueries({ queryKey: ['property-categories'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      showError('Error', error.message);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('property_categories')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Category Updated', 'Property category has been updated successfully');
      queryClient.invalidateQueries({ queryKey: ['property-categories'] });
      setEditingCategory(null);
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      showError('Error', error.message);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Category Deleted', 'Property category has been deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['property-categories'] });
    },
    onError: (error: any) => {
      showError('Error', error.message);
    }
  });

  const resetForm = () => {
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parent_id: '',
      display_order: 0,
      is_active: true,
      meta_data: {
        min_price: '',
        max_price: '',
        typical_features: '',
        target_market: '',
        legal_requirements: ''
      }
    });
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ 
        id: editingCategory.id, 
        updates: {
          ...newCategory,
          meta_data: {
            ...newCategory.meta_data,
            min_price: newCategory.meta_data.min_price ? parseFloat(newCategory.meta_data.min_price) : null,
            max_price: newCategory.meta_data.max_price ? parseFloat(newCategory.meta_data.max_price) : null,
            typical_features: newCategory.meta_data.typical_features 
              ? newCategory.meta_data.typical_features.split(',').map(f => f.trim())
              : [],
            legal_requirements: newCategory.meta_data.legal_requirements
              ? newCategory.meta_data.legal_requirements.split(',').map(r => r.trim())
              : []
          }
        }
      });
    } else {
      createCategoryMutation.mutate(newCategory);
    }
  };

  const handleEdit = (category: PropertyCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parent_id: category.parent_id || '',
      display_order: category.display_order,
      is_active: category.is_active,
      meta_data: {
        min_price: category.meta_data?.min_price?.toString() || '',
        max_price: category.meta_data?.max_price?.toString() || '',
        typical_features: category.meta_data?.typical_features?.join(', ') || '',
        target_market: category.meta_data?.target_market || '',
        legal_requirements: category.meta_data?.legal_requirements?.join(', ') || ''
      }
    });
    setIsAddDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name: string) => {
    setNewCategory({
      ...newCategory,
      name,
      slug: generateSlug(name)
    });
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Home': return <Home className="h-4 w-4" />;
      case 'Building': return <Building className="h-4 w-4" />;
      case 'TreePine': return <TreePine className="h-4 w-4" />;
      case 'Factory': return <Factory className="h-4 w-4" />;
      case 'Store': return <Store className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Categories Management
          </CardTitle>
          <CardDescription>
            Manage Indonesian property types, categories, and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="indonesian-types">Indonesian Types</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center">
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingCategory(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure property category details and metadata
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g., Rumah Modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={newCategory.slug}
                        onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                        placeholder="auto-generated"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                        placeholder="Category description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select value={newCategory.icon} onValueChange={(value) => setNewCategory({...newCategory, icon: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Building">Building</SelectItem>
                          <SelectItem value="TreePine">TreePine</SelectItem>
                          <SelectItem value="Factory">Factory</SelectItem>
                          <SelectItem value="Store">Store</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Parent Category</Label>
                      <Select value={newCategory.parent_id} onValueChange={(value) => setNewCategory({...newCategory, parent_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Parent</SelectItem>
                          {parentCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={newCategory.display_order}
                        onChange={(e) => setNewCategory({...newCategory, display_order: parseInt(e.target.value) || 0})}
                        placeholder="Display order"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Price (IDR)</Label>
                      <Input
                        type="number"
                        value={newCategory.meta_data.min_price}
                        onChange={(e) => setNewCategory({
                          ...newCategory, 
                          meta_data: {...newCategory.meta_data, min_price: e.target.value}
                        })}
                        placeholder="e.g., 500000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Price (IDR)</Label>
                      <Input
                        type="number"
                        value={newCategory.meta_data.max_price}
                        onChange={(e) => setNewCategory({
                          ...newCategory, 
                          meta_data: {...newCategory.meta_data, max_price: e.target.value}
                        })}
                        placeholder="e.g., 5000000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Market</Label>
                      <Select value={newCategory.meta_data.target_market} onValueChange={(value) => setNewCategory({
                        ...newCategory, 
                        meta_data: {...newCategory.meta_data, target_market: value}
                      })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target market" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first-time-buyer">First-time Buyer</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                          <SelectItem value="luxury">Luxury Market</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Typical Features (comma-separated)</Label>
                      <Textarea
                        value={newCategory.meta_data.typical_features}
                        onChange={(e) => setNewCategory({
                          ...newCategory, 
                          meta_data: {...newCategory.meta_data, typical_features: e.target.value}
                        })}
                        placeholder="e.g., Swimming Pool, Garden, Garage, Security"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Legal Requirements (comma-separated)</Label>
                      <Textarea
                        value={newCategory.meta_data.legal_requirements}
                        onChange={(e) => setNewCategory({
                          ...newCategory, 
                          meta_data: {...newCategory.meta_data, legal_requirements: e.target.value}
                        })}
                        placeholder="e.g., IMB, SHM, BPHTB, PBB"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                      <Switch
                        checked={newCategory.is_active}
                        onCheckedChange={(checked) => setNewCategory({...newCategory, is_active: checked})}
                      />
                      <Label>Active Category</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="categories" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Target Market</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading categories...
                        </TableCell>
                      </TableRow>
                    ) : categories?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category.icon)}
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-muted-foreground">{category.slug}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {category.parent_id 
                              ? categories.find(c => c.id === category.parent_id)?.name || '-'
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {category.meta_data?.min_price && category.meta_data?.max_price ? (
                              <div className="text-sm">
                                <div>Min: Rp {category.meta_data.min_price.toLocaleString()}</div>
                                <div>Max: Rp {category.meta_data.max_price.toLocaleString()}</div>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {category.meta_data?.target_market ? (
                              <Badge variant="outline" className="capitalize">
                                {category.meta_data.target_market.replace('-', ' ')}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => deleteCategoryMutation.mutate(category.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="indonesian-types" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Indonesian Property Types</CardTitle>
                  <CardDescription>
                    Standard property classifications used in Indonesian real estate market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INDONESIAN_PROPERTY_TYPES.map((type) => (
                      <Card key={type.value} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getCategoryIcon(type.icon)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {type.description}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {type.value}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{categories?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Active categories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parent Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{parentCategories.length}</div>
                    <p className="text-sm text-muted-foreground">Main categories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sub Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {categories?.filter(c => c.parent_id).length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Sub categories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {categories?.filter(c => c.is_active).length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyCategoriesManagement;