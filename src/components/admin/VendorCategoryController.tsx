import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Wrench, 
  Users, 
  Building2,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
}

interface VendorCategoryAssignment {
  vendor_id: string;
  category_id: string;
  locked_at?: string;
  can_change: boolean;
  vendor_business_profiles?: {
    business_name: string;
    vendor_id: string;
  };
}

const VendorCategoryController = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [searchVendor, setSearchVendor] = useState('');

  // Fetch main categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-vendor-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch vendor assignments
  const { data: vendorAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['vendor-category-assignments', selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select(`
          vendor_id,
          business_name,
          business_nature_id,
          can_change_nature,
          main_category_locked,
          main_category_locked_at
        `)
        .eq('business_nature_id', selectedCategory.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory
  });

  // Fetch available vendors for assignment
  const { data: availableVendors } = useQuery({
    queryKey: ['available-vendors', searchVendor],
    queryFn: async () => {
      let query = supabase
        .from('vendor_business_profiles')
        .select('vendor_id, business_name')
        .is('business_nature_id', null);
      
      if (searchVendor) {
        query = query.ilike('business_name', `%${searchVendor}%`);
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Partial<Category>) => {
      if (!categoryData.name) throw new Error('Category name is required');
      
      const { error } = await supabase
        .from('vendor_main_categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || '',
          type: categoryData.type || 'services',
          is_active: categoryData.is_active ?? true,
          display_order: categoryData.display_order ?? 0
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dibuat"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-categories'] });
      setIsCreateDialogOpen(false);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat kategori",
        variant: "destructive"
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<Category> & { id: string }) => {
      const updateData: any = {};
      
      if (categoryData.name) updateData.name = categoryData.name;
      if (categoryData.description !== undefined) updateData.description = categoryData.description;
      if (categoryData.type) updateData.type = categoryData.type;
      if (categoryData.is_active !== undefined) updateData.is_active = categoryData.is_active;
      if (categoryData.display_order !== undefined) updateData.display_order = categoryData.display_order;
      
      const { error } = await supabase
        .from('vendor_main_categories')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-categories'] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui kategori",
        variant: "destructive"
      });
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
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-categories'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus kategori",
        variant: "destructive"
      });
    }
  });

  // Assign vendor to category
  const assignVendorMutation = useMutation({
    mutationFn: async ({ vendorId, categoryId }: { vendorId: string; categoryId: string }) => {
      const { error } = await supabase
        .from('vendor_business_profiles')
        .update({
          business_nature_id: categoryId,
          main_service_category_id: categoryId
        })
        .eq('vendor_id', vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Vendor berhasil ditetapkan ke kategori"
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-category-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['available-vendors'] });
      setSelectedVendor('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menetapkan vendor",
        variant: "destructive"
      });
    }
  });

  // Lock/unlock vendor category
  const toggleVendorLockMutation = useMutation({
    mutationFn: async ({ vendorId, lock }: { vendorId: string; lock: boolean }) => {
      const { error } = await supabase
        .from('vendor_business_profiles')
        .update({
          can_change_nature: !lock,
          main_category_locked: lock,
          main_category_locked_at: lock ? new Date().toISOString() : null
        })
        .eq('vendor_id', vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Status kategori vendor berhasil diperbarui"
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-category-assignments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah status kategori",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (category: Category) => {
    setEditForm(category);
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditForm({
      name: '',
      description: '',
      type: 'services',
      is_active: true,
      display_order: (categories?.length || 0) + 1
    });
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kontrol Kategori Vendor</h2>
          <p className="text-muted-foreground">Kelola kategori bisnis dan penetapan vendor</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Kategori Utama
            </CardTitle>
            <CardDescription>Kelola kategori bisnis utama</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center p-4">Memuat kategori...</div>
            ) : (
              categories?.map((category) => (
                <div 
                  key={category.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCategory?.id === category.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {category.type === 'products' ? (
                        <Package className="h-4 w-4 text-primary" />
                      ) : (
                        <Wrench className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(category.id);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Vendor Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vendor Terdaftar
              {selectedCategory && (
                <Badge variant="outline" className="ml-2">
                  {selectedCategory.name}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedCategory 
                ? `Vendor yang terdaftar dalam kategori ${selectedCategory.name}` 
                : "Pilih kategori untuk melihat vendor"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCategory && (
              <>
                {/* Assign New Vendor */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">Tetapkan Vendor Baru</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cari nama bisnis vendor..."
                      value={searchVendor}
                      onChange={(e) => setSearchVendor(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Pilih vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVendors?.map((vendor) => (
                          <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                            {vendor.business_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => {
                        if (selectedVendor && selectedCategory) {
                          assignVendorMutation.mutate({
                            vendorId: selectedVendor,
                            categoryId: selectedCategory.id
                          });
                        }
                      }}
                      disabled={!selectedVendor || assignVendorMutation.isPending}
                    >
                      Tetapkan
                    </Button>
                  </div>
                </div>

                {/* Current Assignments */}
                <div className="space-y-2">
                  {assignmentsLoading ? (
                    <div className="text-center p-4">Memuat vendor...</div>
                  ) : vendorAssignments?.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      Belum ada vendor dalam kategori ini
                    </div>
                  ) : (
                    vendorAssignments?.map((assignment) => (
                      <div key={assignment.vendor_id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div>
                          <p className="font-medium">{assignment.business_name}</p>
                          <p className="text-xs text-muted-foreground">ID: {assignment.vendor_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.can_change_nature ? "secondary" : "destructive"}>
                            {assignment.can_change_nature ? "Unlocked" : "Locked"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toggleVendorLockMutation.mutate({
                                vendorId: assignment.vendor_id,
                                lock: assignment.can_change_nature
                              });
                            }}
                          >
                            {assignment.can_change_nature ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditForm({});
          setSelectedCategory(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? "Buat Kategori Baru" : "Edit Kategori"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Masukkan nama kategori"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Masukkan deskripsi kategori"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Jenis</Label>
              <Select 
                value={editForm.type || 'services'} 
                onValueChange={(value) => setEditForm({ ...editForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="services">Layanan</SelectItem>
                  <SelectItem value="products">Produk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={editForm.is_active || false}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditForm({});
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button 
                onClick={() => {
                  if (isCreateDialogOpen) {
                    createCategoryMutation.mutate(editForm);
                  } else if (editForm.id) {
                    updateCategoryMutation.mutate(editForm as Partial<Category> & { id: string });
                  }
                }}
                disabled={!editForm.name || createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="flex-1"
              >
                {isCreateDialogOpen ? "Buat" : "Perbarui"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi vendor yang terdaftar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteCategoryMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorCategoryController;