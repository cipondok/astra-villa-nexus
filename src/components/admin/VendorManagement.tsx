import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Store, Eye, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const VendorManagement = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    business_name: '',
    business_type: '',
    email: '',
    full_name: ''
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    service_description: '',
    service_category: '',
    is_active: true,
    featured: false
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: vendorRequests, isLoading } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_requests')
        .select(`
          *,
          profiles!vendor_requests_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: vendorServices } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('vendor_requests')
        .update({ 
          status, 
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Request Reviewed", "Vendor request has been reviewed successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: (error: any) => {
      showError("Review Failed", error.message);
    },
  });

  const handleReview = (request: any) => {
    setSelectedRequest(request);
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      reviewRequestMutation.mutate({ 
        id: selectedRequest.id, 
        status: 'approved', 
        notes: reviewNotes 
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      reviewRequestMutation.mutate({ 
        id: selectedRequest.id, 
        status: 'rejected', 
        notes: reviewNotes 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Mock data for demo purposes
  const mockVendorServices = [
    {
      id: '1',
      service_name: 'Home Cleaning Service',
      service_description: 'Professional residential cleaning services including deep cleaning, regular maintenance, and move-in/move-out cleaning.',
      service_category: 'Cleaning',
      is_active: true,
      featured: true,
      vendor_name: 'CleanPro Services',
      rating: 4.8,
      total_bookings: 150
    },
    {
      id: '2',
      service_name: 'Property Maintenance',
      service_description: 'Complete property maintenance including plumbing, electrical, and general repairs.',
      service_category: 'Maintenance',
      is_active: true,
      featured: false,
      vendor_name: 'FixIt Fast',
      rating: 4.6,
      total_bookings: 89
    },
    {
      id: '3',
      service_name: 'Landscaping & Gardening',
      service_description: 'Professional landscaping, garden design, lawn care, and outdoor maintenance services.',
      service_category: 'Landscaping',
      is_active: false,
      featured: false,
      vendor_name: 'Green Thumb Gardens',
      rating: 4.9,
      total_bookings: 203
    },
    {
      id: '4',
      service_name: 'Interior Design Consultation',
      service_description: 'Expert interior design consultation for residential and commercial properties.',
      service_category: 'Design',
      is_active: true,
      featured: true,
      vendor_name: 'Design Studio Plus',
      rating: 4.7,
      total_bookings: 67
    }
  ];

  const mockVendors = [
    {
      id: '1',
      business_name: 'CleanPro Services',
      business_type: 'cleaning',
      email: 'contact@cleanpro.com',
      full_name: 'Sarah Johnson',
      status: 'approved',
      created_at: '2024-01-15',
      total_services: 3,
      active_services: 3
    },
    {
      id: '2',
      business_name: 'FixIt Fast',
      business_type: 'maintenance',
      email: 'info@fixitfast.com',
      full_name: 'Mike Rodriguez',
      status: 'approved',
      created_at: '2024-01-20',
      total_services: 5,
      active_services: 4
    },
    {
      id: '3',
      business_name: 'Green Thumb Gardens',
      business_type: 'landscaping',
      email: 'hello@greenthumb.com',
      full_name: 'Lisa Chen',
      status: 'pending',
      created_at: '2024-02-01',
      total_services: 2,
      active_services: 1
    }
  ];

  const handleAddVendor = async () => {
    // In a real app, this would create a vendor in the database
    showSuccess("Vendor Added", "New vendor has been created successfully.");
    setShowAddVendorDialog(false);
    setNewVendor({ business_name: '', business_type: '', email: '', full_name: '' });
  };

  const handleServiceToggle = async (serviceId: string, isActive: boolean) => {
    // In a real app, this would update the service status in the database
    showSuccess("Service Updated", `Service has been ${isActive ? 'enabled' : 'disabled'}.`);
  };

  const handleDeleteService = async (serviceId: string) => {
    // In a real app, this would delete the service from the database
    showSuccess("Service Deleted", "Service has been removed successfully.");
  };

  return (
    <div className="space-y-6">
      <Card className="glass-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Store className="h-5 w-5" />
            Vendor Management
          </CardTitle>
          <CardDescription className="text-gray-300">
            Review and manage vendor registration requests and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setShowAddVendorDialog(true)} variant="ios">
                <Plus className="h-4 w-4 mr-2" />
                Add New Vendor
              </Button>
            </div>

            {/* Active Vendors */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Active Vendors</h3>
              <div className="border border-white/20 rounded-lg bg-white/5">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-gray-300">Business Name</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Services</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockVendors.map((vendor) => (
                      <TableRow key={vendor.id} className="border-white/20">
                        <TableCell className="text-white font-medium">
                          {vendor.business_name}
                        </TableCell>
                        <TableCell className="text-gray-300 capitalize">
                          {vendor.business_type}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="text-sm">
                            <div>{vendor.full_name}</div>
                            <div className="text-gray-400">{vendor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="text-sm">
                            <div>{vendor.active_services}/{vendor.total_services} active</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(vendor.status)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 mr-2"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Vendor Services Management */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Service Management</h3>
                <Button onClick={() => setShowServiceDialog(true)} variant="ios-green" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockVendorServices.map((service) => (
                  <Card key={service.id} className="bg-white/5 border-white/20">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            {service.service_name}
                            {service.featured && (
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-gray-300 text-xs">
                            {service.vendor_name} • {service.service_category}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                        {service.service_description}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">
                          ⭐ {service.rating} ({service.total_bookings} bookings)
                        </span>
                        <Badge variant={service.is_active ? 'default' : 'outline'} className="text-xs">
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Vendor Dialog */}
      <Dialog open={showAddVendorDialog} onOpenChange={setShowAddVendorDialog}>
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Vendor</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create a new vendor account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Business Name</Label>
                <Input
                  value={newVendor.business_name}
                  onChange={(e) => setNewVendor({ ...newVendor, business_name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Business Type</Label>
                <Input
                  value={newVendor.business_type}
                  onChange={(e) => setNewVendor({ ...newVendor, business_type: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Contact Name</Label>
                <Input
                  value={newVendor.full_name}
                  onChange={(e) => setNewVendor({ ...newVendor, full_name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddVendorDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddVendor}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Service</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create a new service offering
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Service Name</Label>
              <Input
                value={serviceForm.service_name}
                onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Category</Label>
              <Input
                value={serviceForm.service_category}
                onChange={(e) => setServiceForm({ ...serviceForm, service_category: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={serviceForm.service_description}
                onChange={(e) => setServiceForm({ ...serviceForm, service_description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={serviceForm.is_active}
                  onCheckedChange={(checked) => setServiceForm({ ...serviceForm, is_active: checked })}
                />
                <Label className="text-gray-300">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={serviceForm.featured}
                  onCheckedChange={(checked) => setServiceForm({ ...serviceForm, featured: checked })}
                />
                <Label className="text-gray-300">Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowServiceDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                showSuccess("Service Added", "New service has been created successfully.");
                setShowServiceDialog(false);
                setServiceForm({ service_name: '', service_description: '', service_category: '', is_active: true, featured: false });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
