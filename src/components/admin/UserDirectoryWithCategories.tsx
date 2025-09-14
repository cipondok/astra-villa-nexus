import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Building2, 
  Edit3, 
  Lock, 
  Unlock, 
  Ban, 
  UserCheck, 
  Shield,
  Package,
  Wrench,
  AlertTriangle,
  Eye,
  UserX,
  Settings
} from "lucide-react";

interface VendorProfile {
  id: string;
  business_name: string;
  business_nature_id?: string;
  main_service_category_id?: string;
  can_change_nature: boolean;
  main_category_locked: boolean;
  main_category_locked_at?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  verification_status: string;
  is_suspended: boolean;
  created_at: string;
  phone?: string;
  company_name?: string;
  vendor_business_profiles?: VendorProfile | VendorProfile[];
}

interface MainCategory {
  id: string;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  main_category_id: string;
  is_active: boolean;
}

const UserDirectoryWithCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("none");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  // Fetch users with vendor profiles and categories
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-categories'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          verification_status,
          is_suspended,
          created_at,
          phone,
          company_name,
          vendor_business_profiles (
            id,
            business_name,
            business_nature_id,
            main_service_category_id,
            can_change_nature,
            main_category_locked,
            main_category_locked_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as UserProfile[];
    }
  });

  // Fetch main categories
  const { data: mainCategories } = useQuery({
    queryKey: ['main-categories-admin'],
    queryFn: async (): Promise<MainCategory[]> => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subcategories
  const { data: subCategories } = useQuery({
    queryKey: ['sub-categories-admin'],
    queryFn: async (): Promise<SubCategory[]> => {
      const { data, error } = await supabase
        .from('vendor_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ userId, categoryId, lock }: { userId: string; categoryId: string; lock?: boolean }) => {
      const { error } = await supabase
        .from('vendor_business_profiles')
        .update({
          business_nature_id: categoryId,
          main_service_category_id: categoryId,
          can_change_nature: lock !== undefined ? !lock : undefined,
          main_category_locked: lock,
          main_category_locked_at: lock ? new Date().toISOString() : null
        })
        .eq('vendor_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori vendor berhasil diperbarui"
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-categories'] });
      setEditCategoryDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui kategori",
        variant: "destructive"
      });
    }
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "User berhasil disuspend"
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-categories'] });
      setSuspendDialogOpen(false);
      setSelectedUser(null);
      setSuspendReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal suspend user",
        variant: "destructive"
      });
    }
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "User berhasil diaktifkan kembali"
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal mengaktifkan user",
        variant: "destructive"
      });
    }
  });

  const getVendorProfile = (user: UserProfile): VendorProfile | null => {
    if (user.role !== 'vendor' || !user.vendor_business_profiles) {
      return null;
    }
    
    // Handle both single object and array cases
    return Array.isArray(user.vendor_business_profiles) 
      ? user.vendor_business_profiles[0] 
      : user.vendor_business_profiles;
  };

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    let matchesCategory = true;
    if (categoryFilter !== "all") {
      const profile = getVendorProfile(user);
      if (user.role === 'vendor' && profile) {
        matchesCategory = profile.business_nature_id === categoryFilter || 
                         profile.main_service_category_id === categoryFilter;
      } else if (categoryFilter === "no-category") {
        matchesCategory = user.role === 'vendor' && 
                         (!profile?.business_nature_id && !profile?.main_service_category_id);
      }
    }
    
    return matchesSearch && matchesRole && matchesCategory;
  }) || [];

  const getCategoryInfo = (user: UserProfile) => {
    const profile = getVendorProfile(user);
    if (!profile) return null;

    const categoryId = profile.business_nature_id || profile.main_service_category_id;
    if (!categoryId) return null;
    
    if (!categoryId) return null;

    // Check main categories first
    const mainCategory = mainCategories?.find(cat => cat.id === categoryId);
    if (mainCategory) {
      return {
        ...mainCategory,
        isSubcategory: false,
        isLocked: profile.main_category_locked,
        canChange: profile.can_change_nature,
        parentName: undefined
      };
    }

    // Check subcategories
    const subCategory = subCategories?.find(sub => sub.id === categoryId);
    if (subCategory) {
      const parentCategory = mainCategories?.find(cat => cat.id === subCategory.main_category_id);
      return {
        ...subCategory,
        isSubcategory: true,
        parentName: parentCategory?.name || '',
        type: parentCategory?.type || 'services',
        isLocked: profile.main_category_locked,
        canChange: profile.can_change_nature
      };
    }

    return null;
  };

  const handleEditCategory = (user: UserProfile) => {
    setSelectedUser(user);
    const categoryInfo = getCategoryInfo(user);
    setSelectedCategory(categoryInfo?.id || 'none');
    setEditCategoryDialogOpen(true);
  };

  const handleSuspendUser = (user: UserProfile) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const stats = {
    totalUsers: users?.length || 0,
    activeUsers: users?.filter(u => !u.is_suspended).length || 0,
    vendors: users?.filter(u => u.role === 'vendor').length || 0,
    vendorsWithCategory: users?.filter(u => {
      const profile = getVendorProfile(u);
      return u.role === 'vendor' && profile && 
        (profile.business_nature_id || profile.main_service_category_id);
    }).length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Directory & Categories
          </h2>
          <p className="text-muted-foreground">Manage users and their business categories</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Vendors</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.vendors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Categorized</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.vendorsWithCategory}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="customer_service">Customer Service</SelectItem>
                <SelectItem value="general_user">General User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="no-category">Tanpa Kategori</SelectItem>
                {mainCategories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user profiles and business categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Info</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Business Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const categoryInfo = getCategoryInfo(user);
                  const vendorProfile = getVendorProfile(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.company_name && (
                            <div className="text-xs text-muted-foreground">{user.company_name}</div>
                          )}
                          {vendorProfile?.business_name && (
                            <div className="text-xs font-medium text-blue-600">
                              {vendorProfile.business_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === 'vendor' ? (
                          categoryInfo ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {categoryInfo.type === 'products' ? (
                                  <Package className="h-3 w-3 text-primary" />
                                ) : (
                                  <Wrench className="h-3 w-3 text-primary" />
                                )}
                                <span className="text-sm font-medium">{categoryInfo.name}</span>
                                {categoryInfo.isLocked && (
                                  <Lock className="h-3 w-3 text-orange-500" />
                                )}
                              </div>
                              {categoryInfo.isSubcategory && categoryInfo.parentName && (
                                <div className="text-xs text-muted-foreground">
                                  Sub dari: {categoryInfo.parentName}
                                </div>
                              )}
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {categoryInfo.type === 'products' ? 'Produk' : 'Layanan'}
                                </Badge>
                                {categoryInfo.isLocked ? (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    Terkunci
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    Dapat Diubah
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              Belum dipilih
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.is_suspended ? "destructive" : "default"}>
                            {user.is_suspended ? "SUSPENDED" : "ACTIVE"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user.verification_status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.role === 'vendor' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCategory(user)}
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                          )}
                          {user.is_suspended ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => unsuspendUserMutation.mutate(user.id)}
                              disabled={unsuspendUserMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSuspendUser(user)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Business Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div>
                <Label>Vendor</Label>
                <p className="text-sm">{selectedUser.full_name} ({selectedUser.email})</p>
                {selectedUser.vendor_business_profiles?.[0]?.business_name && (
                  <p className="text-sm font-medium">{selectedUser.vendor_business_profiles[0].business_name}</p>
                )}
              </div>
            )}
            
            <div>
              <Label htmlFor="category">Main Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {mainCategories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.type === 'products' ? (
                          <Package className="h-3 w-3" />
                        ) : (
                          <Wrench className="h-3 w-3" />
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditCategoryDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedUser && selectedCategory) {
                    updateCategoryMutation.mutate({
                      userId: selectedUser.id,
                      categoryId: selectedCategory
                    });
                  }
                }}
                disabled={!selectedCategory || updateCategoryMutation.isPending}
                className="flex-1"
              >
                Update
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  if (selectedUser && selectedCategory) {
                    updateCategoryMutation.mutate({
                      userId: selectedUser.id,
                      categoryId: selectedCategory,
                      lock: true
                    });
                  }
                }}
                disabled={!selectedCategory || updateCategoryMutation.isPending}
              >
                <Lock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to suspend this user?</p>
                {selectedUser && (
                  <p className="font-medium">{selectedUser.full_name} ({selectedUser.email})</p>
                )}
                <div>
                  <Label htmlFor="reason">Suspension Reason</Label>
                  <Textarea
                    id="reason"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Enter reason for suspension..."
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser && suspendReason.trim()) {
                  suspendUserMutation.mutate({
                    userId: selectedUser.id,
                    reason: suspendReason
                  });
                }
              }}
              disabled={!suspendReason.trim() || suspendUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDirectoryWithCategories;