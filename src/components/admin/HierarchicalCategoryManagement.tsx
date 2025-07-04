import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FolderTree, 
  Eye, 
  EyeOff,
  DollarSign,
  Settings
} from "lucide-react";

interface CategoryHierarchy {
  id: string;
  category_code: string;
  name_en: string;
  name_id: string;
  level: number;
  parent_id: string | null;
  vendor_type: string;
  requirements: any;
  commission_rate: number;
  icon: string;
  is_active: boolean;
  display_order: number;
}

const HierarchicalCategoryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryHierarchy | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [formData, setFormData] = useState({
    category_code: '',
    name_en: '',
    name_id: '',
    level: 1,
    parent_id: '',
    vendor_type: 'both',
    requirements: {},
    commission_rate: 5.00,
    icon: '📦',
    is_active: true,
    display_order: 0
  });

  // Fetch all categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['hierarchical-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('*')
        .order('level', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as CategoryHierarchy[];
    }
  });

  // Group categories by level
  const categoriesByLevel = categories?.reduce((acc, category) => {
    if (!acc[category.level]) acc[category.level] = [];
    acc[category.level].push(category);
    return acc;
  }, {} as Record<number, CategoryHierarchy[]>) || {};

  const resetForm = () => {
    setFormData({
      category_code: '',
      name_en: '',
      name_id: '',
      level: 1,
      parent_id: '',
      vendor_type: 'both',
      requirements: {},
      commission_rate: 5.00,
      icon: '📦',
      is_active: true,
      display_order: 0
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: CategoryHierarchy) => {
    setEditingCategory(category);
    setFormData({
      category_code: category.category_code,
      name_en: category.name_en,
      name_id: category.name_id,
      level: category.level,
      parent_id: category.parent_id || '',
      vendor_type: category.vendor_type,
      requirements: category.requirements || {},
      commission_rate: category.commission_rate,
      icon: category.icon,
      is_active: category.is_active,
      display_order: category.display_order
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        parent_id: formData.parent_id || null,
        requirements: typeof formData.requirements === 'string' 
          ? JSON.parse(formData.requirements) 
          : formData.requirements
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('vendor_categories_hierarchy')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('vendor_categories_hierarchy')
          .insert([categoryData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully"
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['hierarchical-categories'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (category: CategoryHierarchy) => {
    try {
      const { error } = await supabase
        .from('vendor_categories_hierarchy')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['hierarchical-categories'] });
      
      toast({
        title: "Success",
        description: `Category ${!category.is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (category: CategoryHierarchy) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('vendor_categories_hierarchy')
        .delete()
        .eq('id', category.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['hierarchical-categories'] });
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const iconOptions = ['📦', '🛠️', '🏠', '🏢', '🚗', '🔧', '🧹', '❄️', '⚡', '🪑', '📱', '🚙', '🏠', '🏢'];

  const renderCategoryCard = (category: CategoryHierarchy, level: number) => (
    <Card key={category.id} className={`mb-3 ${!category.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{category.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{category.name_en}</h4>
                <Badge variant="outline" className="text-xs">
                  {category.vendor_type}
                </Badge>
                {!category.is_active && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{category.name_id}</p>
              <p className="text-xs text-muted-foreground">Code: {category.category_code}</p>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs">{category.commission_rate}%</span>
                </div>
                
                {category.requirements && Object.keys(category.requirements).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {category.requirements.docs?.map((doc: string) => (
                      <Badge key={doc} variant="secondary" className="text-xs">
                        {doc.toUpperCase()}
                      </Badge>
                    ))}
                    {category.requirements.license && (
                      <Badge variant="secondary" className="text-xs">License</Badge>
                    )}
                    {category.requirements.insurance && (
                      <Badge variant="secondary" className="text-xs">Insurance</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleActive(category)}
            >
              {category.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading hierarchical categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="h-8 w-8 text-blue-600" />
            Hierarchical Category Management
          </h1>
          <p className="text-muted-foreground">
            Manage multi-level vendor service categories (Products → Services → Specializations)
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category Code *</Label>
                  <Input
                    value={formData.category_code}
                    onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                    placeholder="e.g., cleaning_residential"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select
                    value={formData.level.toString()}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      level: parseInt(value),
                      parent_id: parseInt(value) === 1 ? '' : formData.parent_id
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 (Main)</SelectItem>
                      <SelectItem value="2">Level 2 (Sub)</SelectItem>
                      <SelectItem value="3">Level 3 (Specialization)</SelectItem>
                      <SelectItem value="4">Level 4 (Detail)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Category name in English"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Name (Indonesian) *</Label>
                  <Input
                    value={formData.name_id}
                    onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                    placeholder="Nama kategori dalam Bahasa Indonesia"
                    required
                  />
                </div>
              </div>

              {formData.level > 1 && (
                <div className="space-y-2">
                  <Label>Parent Category *</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesByLevel[formData.level - 1]?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vendor Type *</Label>
                  <Select
                    value={formData.vendor_type}
                    onValueChange={(value) => setFormData({ ...formData, vendor_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Only</SelectItem>
                      <SelectItem value="service">Service Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon} {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Commission Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirements (JSON)</Label>
                <Textarea
                  value={typeof formData.requirements === 'string' ? formData.requirements : JSON.stringify(formData.requirements, null, 2)}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder='{"docs":["ktp","sertifikat"],"license":true,"insurance":false}'
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Format: {"{"}"docs":["ktp","skk"],"license":true,"insurance":false{"}"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4].map((level) => (
          <Card key={level}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Level {level} Categories
                <Badge variant="outline">
                  {categoriesByLevel[level]?.length || 0} categories
                </Badge>
              </CardTitle>
              <CardDescription>
                {level === 1 && "Main categories (Products vs Services)"}
                {level === 2 && "Subcategories (Property Services, Transportation, etc.)"}
                {level === 3 && "Specializations (Cleaning, AC Repair, etc.)"}
                {level === 4 && "Detail types (Residential, Commercial, etc.)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesByLevel[level]?.length > 0 ? (
                <div className="space-y-3">
                  {categoriesByLevel[level].map((category) => renderCategoryCard(category, level))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No level {level} categories found
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HierarchicalCategoryManagement;