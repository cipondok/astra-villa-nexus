
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
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Settings, Eye, CheckCircle, XCircle, Pause, Edit, Plus, Trash2 } from "lucide-react";

const AdminVendorServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [adminAction, setAdminAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Format IDR currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch all vendor services
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-vendor-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles(business_name, vendor_id),
          profiles(full_name, email),
          vendor_service_items(*)
        `)
        .order('created_at', { ascending: false });
      
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
        .order('created_at', { ascending: false });
      
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Service Management</h2>
          <p className="text-muted-foreground">Manage vendor services, pricing, and approvals</p>
        </div>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="controls">Admin Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services?.map((service) => (
              <Card key={service.id} className="card-ios">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.service_name}</CardTitle>
                      <CardDescription>
                        {service.vendor_business_profiles?.business_name} • {service.profiles?.email}
                      </CardDescription>
                    </div>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground">{service.service_category || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm text-muted-foreground">
                        {service.duration_value} {service.duration_unit}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location Type</Label>
                      <p className="text-sm text-muted-foreground capitalize">{service.location_type}</p>
                    </div>
                  </div>

                  {service.vendor_service_items && service.vendor_service_items.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Service Items & Pricing (IDR)</Label>
                      <div className="grid gap-2">
                        {service.vendor_service_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{item.item_name}</span>
                            <span className="text-sm font-medium">
                              {formatIDR(item.price || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedService(service)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Admin Action
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
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {services?.filter(s => !s.is_active).map((service) => (
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

        <TabsContent value="controls">
          <div className="space-y-4">
            {serviceControls?.map((control) => (
              <Card key={control.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVendorServiceManagement;
