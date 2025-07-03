import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Settings, Eye, CheckCircle, XCircle, Pause, Edit, Plus, Trash2, Filter, Search, BarChart3 } from "lucide-react";
import { formatIDR } from "@/utils/currency";

const EnhancedVendorServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [adminAction, setAdminAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all vendor services with enhanced filtering
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-vendor-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles(business_name, vendor_id, business_email),
          profiles!vendor_services_vendor_id_fkey(full_name, email),
          vendor_service_items(*),
          vendor_service_categories(name, icon)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch service categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['vendor-service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch service control history
  const { data: serviceControls } = useQuery({
    queryKey: ['service-controls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_vendor_service_controls')
        .select(`
          *,
          vendor_services(service_name),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Admin action mutation
  const adminActionMutation = useMutation({
    mutationFn: async ({ serviceId, action, notes }: { serviceId: string; action: string; notes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_vendor_service_controls')
        .insert({
          service_id: serviceId,
          admin_action: action,
          admin_notes: notes,
          admin_id: user.user?.id
        });
      
      if (error) throw error;

      // Update service status based on action
      const serviceUpdate: any = {};
      if (action === 'approved') serviceUpdate.is_active = true;
      if (action === 'rejected' || action === 'suspended') serviceUpdate.is_active = false;

      const { error: updateError } = await supabase
        .from('vendor_services')
        .update(serviceUpdate)
        .eq('id', serviceId);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      showSuccess("Success", "Admin action applied successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-controls'] });
      setIsDialogOpen(false);
      setAdminNotes("");
      setAdminAction("");
    },
    onError: () => {
      showError("Error", "Failed to apply admin action");
    }
  });

  // Toggle service status
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('vendor_services')
        .update({ is_active: isActive })
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Service status updated");
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-services'] });
    },
    onError: () => {
      showError("Error", "Failed to update service status");
    }
  });

  const handleAdminAction = () => {
    if (!selectedService || !adminAction) return;
    
    adminActionMutation.mutate({
      serviceId: selectedService.id,
      action: adminAction,
      notes: adminNotes
    });
  };

  // Filter services based on search and filters
  const filteredServices = services?.filter(service => {
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.vendor_business_profiles?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && service.is_active) ||
                         (filterStatus === "inactive" && !service.is_active);
    
    const matchesCategory = filterCategory === "all" || service.category_id === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading services...</div>;
  }

  const stats = {
    total: services?.length || 0,
    active: services?.filter(s => s.is_active).length || 0,
    pending: services?.filter(s => !s.is_active).length || 0,
    categories: categories?.length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Vendor Service Management</h2>
          <p className="text-muted-foreground">Comprehensive management of vendor services with advanced filtering and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending/Inactive</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Pause className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="controls">Admin Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Services Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices?.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration_value} {service.duration_unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.vendor_business_profiles?.business_name}</p>
                          <p className="text-sm text-muted-foreground">{service.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {service.vendor_service_categories?.name || service.service_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={(checked) => 
                              toggleServiceMutation.mutate({ serviceId: service.id, isActive: checked })
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.vendor_service_items && service.vendor_service_items.length > 0 ? (
                          <div className="text-sm">
                            {service.vendor_service_items.map((item: any, idx: number) => (
                              <div key={idx}>
                                {formatIDR(item.price || 0)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No pricing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedService(service)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Admin Action: {selectedService?.service_name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Action</Label>
                                  <Select value={adminAction} onValueChange={setAdminAction}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approved">Approve Service</SelectItem>
                                      <SelectItem value="rejected">Reject Service</SelectItem>
                                      <SelectItem value="suspended">Suspend Service</SelectItem>
                                      <SelectItem value="requires_review">Requires Review</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Admin Notes</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this action..."
                                  />
                                </div>
                                <Button onClick={handleAdminAction} className="w-full">
                                  Apply Action
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {filteredServices?.filter(s => !s.is_active).map((service) => (
              <Card key={service.id} className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-800">{service.service_name}</CardTitle>
                  <CardDescription>Pending approval from {service.vendor_business_profiles?.business_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      setSelectedService(service);
                      setAdminAction("approved");
                      setIsDialogOpen(true);
                    }}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      setSelectedService(service);
                      setAdminAction("rejected");
                      setIsDialogOpen(true);
                    }}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Analytics Overview</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{Math.round((stats.active / stats.total) * 100)}%</p>
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Admin Actions</CardTitle>
                <CardDescription>Latest administrative actions on vendor services</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceControls?.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{control.vendor_services?.service_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Action: <Badge variant="outline">{control.admin_action}</Badge>
                      </p>
                      {control.admin_notes && (
                        <p className="text-sm text-muted-foreground mt-1">{control.admin_notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        By: {control.profiles?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(control.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedVendorServiceManagement;
