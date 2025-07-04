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
import { 
  Settings, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Edit, 
  Plus, 
  Trash2, 
  Filter, 
  Search, 
  BarChart3,
  Shield,
  FileText,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Clock,
  Verified
} from "lucide-react";
import { formatIDR } from "@/utils/currency";
import VendorVerificationPanel from "./VendorVerificationPanel";
import VendorKYCManagement from "./VendorKYCManagement";
import VendorServiceForm from "./VendorServiceForm";

const ComprehensiveVendorServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [adminAction, setAdminAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVerification, setFilterVerification] = useState("all");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all vendor services with comprehensive data
  const { data: services, isLoading } = useQuery({
    queryKey: ['comprehensive-vendor-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles(
            business_name, 
            vendor_id, 
            business_email, 
            is_verified,
            bpjs_ketenagakerjaan_verified,
            bpjs_kesehatan_verified,
            profile_completion_percentage
          ),
          profiles!vendor_services_vendor_id_fkey(full_name, email, role),
          vendor_service_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch vendor verification statistics
  const { data: verificationStats } = useQuery({
    queryKey: ['vendor-verification-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_kyc_status')
        .select('kyc_status, access_level, verification_level');
      
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        verified: data?.filter(v => v.kyc_status === 'verified').length || 0,
        pending: data?.filter(v => v.kyc_status === 'pending_review').length || 0,
        rejected: data?.filter(v => v.kyc_status === 'rejected').length || 0,
        fullAccess: data?.filter(v => v.access_level === 'full').length || 0,
        limitedAccess: data?.filter(v => v.access_level === 'limited').length || 0
      };
      
      return stats;
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('vendor_services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Service deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['comprehensive-vendor-services'] });
    },
    onError: () => {
      showError("Error", "Failed to delete service");
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
      queryClient.invalidateQueries({ queryKey: ['comprehensive-vendor-services'] });
    },
    onError: () => {
      showError("Error", "Failed to update service status");
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
      queryClient.invalidateQueries({ queryKey: ['comprehensive-vendor-services'] });
      setIsDialogOpen(false);
      setAdminNotes("");
      setAdminAction("");
    },
    onError: () => {
      showError("Error", "Failed to apply admin action");
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

  const handleDeleteService = (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  // Filter services based on search and filters
  const filteredServices = services?.filter(service => {
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.vendor_business_profiles?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && service.is_active) ||
                         (filterStatus === "inactive" && !service.is_active);
    
    const matchesCategory = filterCategory === "all" || service.category_id === filterCategory;
    
    const matchesVerification = filterVerification === "all" ||
                               (filterVerification === "verified" && service.vendor_business_profiles?.is_verified) ||
                               (filterVerification === "unverified" && !service.vendor_business_profiles?.is_verified) ||
                               (filterVerification === "pending" && false); // Remove KYC status check for now
    
    return matchesSearch && matchesStatus && matchesCategory && matchesVerification;
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading comprehensive vendor services...</div>;
  }

  const stats = {
    total: services?.length || 0,
    active: services?.filter(s => s.is_active).length || 0,
    pending: services?.filter(s => !s.is_active).length || 0,
    verified: services?.filter(s => s.vendor_business_profiles?.is_verified).length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Vendor Service Management</h2>
          <p className="text-muted-foreground">Advanced vendor service management with KYC, verification, and Indonesian compliance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                <p className="text-sm text-muted-foreground">Active</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
              </div>
              <Verified className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KYC Verified</p>
                <p className="text-2xl font-bold text-purple-600">{verificationStats?.verified || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Full Access</p>
                <p className="text-2xl font-bold text-indigo-600">{verificationStats?.fullAccess || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="verification">KYC & Verification</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {/* Enhanced Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services, vendors, or business names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Service Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVerification} onValueChange={setFilterVerification}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Services Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Verification</TableHead>
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
                          <div className="flex gap-1 mt-1">
                            {service.vendor_business_profiles?.bpjs_ketenagakerjaan_verified && (
                              <Badge variant="outline" className="text-xs">BPJS-TK</Badge>
                            )}
                            {service.vendor_business_profiles?.bpjs_kesehatan_verified && (
                              <Badge variant="outline" className="text-xs">BPJS-KS</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={service.vendor_business_profiles?.is_verified ? "default" : "secondary"}>
                            {service.vendor_business_profiles?.is_verified ? "Verified" : "Unverified"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            KYC: Pending Setup
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Limited Access
                          </Badge>
                        </div>
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
                            {service.vendor_service_items.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx}>
                                {formatIDR(item.price || 0)}
                              </div>
                            ))}
                            {service.vendor_service_items.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{service.vendor_service_items.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No pricing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(service.vendor_business_profiles);
                              setIsVerificationDialogOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="verification">
          <VendorKYCManagement />
        </TabsContent>

        <TabsContent value="documents">
          <VendorVerificationPanel />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Verification Management</CardTitle>
              <CardDescription>Manage vendor payment verification and financial compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment verification panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Analytics</CardTitle>
                <CardDescription>Service performance, verification trends, and compliance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Verification Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <SelectItem value="flagged">Flag for Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add detailed notes about this action..."
              />
            </div>
            <Button onClick={handleAdminAction} className="w-full">
              Apply Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Vendor Service</DialogTitle>
          </DialogHeader>
          <VendorServiceForm 
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['comprehensive-vendor-services'] });
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service: {selectedService?.service_name}</DialogTitle>
          </DialogHeader>
          <VendorServiceForm 
            service={selectedService}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['comprehensive-vendor-services'] });
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Vendor Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Verification: {selectedVendor?.business_name}</DialogTitle>
          </DialogHeader>
          <VendorVerificationPanel vendor={selectedVendor} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveVendorServiceManagement;