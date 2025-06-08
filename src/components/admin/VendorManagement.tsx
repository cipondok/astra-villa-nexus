
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

  const { data: vendorRequests, isLoading: loadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: async () => {
      console.log('Fetching vendor requests');
      
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
      
      if (error) {
        console.error('Error fetching vendor requests:', error);
        throw error;
      }
      
      console.log('Fetched vendor requests:', data?.length || 0);
      return data;
    },
  });

  const { data: vendorProfiles, isLoading: loadingProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: ['vendor-profiles'],
    queryFn: async () => {
      console.log('Fetching vendor profiles');
      
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select(`
          *,
          profiles!vendor_business_profiles_vendor_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor profiles:', error);
        throw error;
      }
      
      console.log('Fetched vendor profiles:', data?.length || 0);
      return data;
    },
  });

  const { data: vendorServices, refetch: refetchServices } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: async () => {
      console.log('Fetching vendor services');
      
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor services:', error);
        throw error;
      }
      
      console.log('Fetched vendor services:', data?.length || 0);
      return data;
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      console.log('Reviewing vendor request:', id, status);
      
      const { error } = await supabase
        .from('vendor_requests')
        .update({ 
          status, 
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) {
        console.error('Error reviewing vendor request:', error);
        throw error;
      }

      // If approved, also update the vendor profile to be active
      if (status === 'approved') {
        const request = vendorRequests?.find(r => r.id === id);
        if (request?.user_id) {
          const { error: profileError } = await supabase
            .from('vendor_business_profiles')
            .update({ is_active: true, is_verified: true })
            .eq('vendor_id', request.user_id);
            
          if (profileError) {
            console.error('Error activating vendor profile:', profileError);
          }
        }
      }
      
      console.log('Vendor request reviewed successfully');
    },
    onSuccess: () => {
      showSuccess("Request Reviewed", "Vendor request has been reviewed successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
      refetchRequests();
      refetchProfiles();
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: (error: any) => {
      console.error('Review request mutation error:', error);
      showError("Review Failed", error.message);
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: any) => {
      console.log('Creating new vendor:', vendorData);
      
      // First create a user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          email: vendorData.email,
          full_name: vendorData.full_name,
          role: 'vendor',
          verification_status: 'verified'
        }])
        .select()
        .single();
        
      if (profileError) {
        console.error('Error creating vendor profile:', profileError);
        throw profileError;
      }

      // Then create the business profile
      const { error: businessError } = await supabase
        .from('vendor_business_profiles')
        .insert([{
          vendor_id: profile.id,
          business_name: vendorData.business_name,
          business_type: vendorData.business_type,
          business_email: vendorData.email,
          is_active: true,
          is_verified: true
        }]);
        
      if (businessError) {
        console.error('Error creating vendor business profile:', businessError);
        throw businessError;
      }
      
      console.log('Vendor created successfully');
    },
    onSuccess: () => {
      showSuccess("Vendor Created", "New vendor has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
      refetchProfiles();
      setShowAddVendorDialog(false);
      setNewVendor({ business_name: '', business_type: '', email: '', full_name: '' });
    },
    onError: (error: any) => {
      console.error('Create vendor mutation error:', error);
      showError("Creation Failed", error.message);
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      console.log('Creating new service:', serviceData);
      
      const { error } = await supabase
        .from('vendor_services')
        .insert([{
          service_name: serviceData.service_name,
          service_description: serviceData.service_description,
          service_category: serviceData.service_category,
          is_active: serviceData.is_active,
          featured: serviceData.featured,
          vendor_id: null // Will be assigned to vendors later
        }]);
        
      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }
      
      console.log('Service created successfully');
    },
    onSuccess: () => {
      showSuccess("Service Created", "New service has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      refetchServices();
      setShowServiceDialog(false);
      setServiceForm({ service_name: '', service_description: '', service_category: '', is_active: true, featured: false });
    },
    onError: (error: any) => {
      console.error('Create service mutation error:', error);
      showError("Creation Failed", error.message);
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, updates }: { serviceId: string; updates: any }) => {
      console.log('Updating service:', serviceId, updates);
      
      const { error } = await supabase
        .from('vendor_services')
        .update(updates)
        .eq('id', serviceId);
        
      if (error) {
        console.error('Error updating service:', error);
        throw error;
      }
      
      console.log('Service updated successfully');
    },
    onSuccess: () => {
      showSuccess("Service Updated", "Service has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      refetchServices();
    },
    onError: (error: any) => {
      console.error('Update service mutation error:', error);
      showError("Update Failed", error.message);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      console.log('Deleting service:', serviceId);
      
      const { error } = await supabase
        .from('vendor_services')
        .delete()
        .eq('id', serviceId);
        
      if (error) {
        console.error('Error deleting service:', error);
        throw error;
      }
      
      console.log('Service deleted successfully');
    },
    onSuccess: () => {
      showSuccess("Service Deleted", "Service has been removed successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      refetchServices();
    },
    onError: (error: any) => {
      console.error('Delete service mutation error:', error);
      showError("Deletion Failed", error.message);
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

  const handleAddVendor = async () => {
    createVendorMutation.mutate(newVendor);
  };

  const handleServiceToggle = async (serviceId: string, isActive: boolean) => {
    updateServiceMutation.mutate({ serviceId, updates: { is_active: isActive } });
  };

  const handleDeleteService = async (serviceId: string) => {
    deleteServiceMutation.mutate(serviceId);
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
              <Button onClick={() => refetchRequests()} variant="outline">
                Refresh Data
              </Button>
            </div>

            {/* Pending Vendor Requests */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Pending Vendor Requests</h3>
              <div className="border border-white/20 rounded-lg bg-white/5">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-gray-300">Business Name</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Submitted</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRequests ? (
                      <TableRow className="border-white/20">
                        <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                          Loading vendor requests...
                        </TableCell>
                      </TableRow>
                    ) : vendorRequests?.length === 0 ? (
                      <TableRow className="border-white/20">
                        <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                          No vendor requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendorRequests?.map((request) => (
                        <TableRow key={request.id} className="border-white/20">
                          <TableCell className="text-white font-medium">
                            {request.business_name}
                          </TableCell>
                          <TableCell className="text-gray-300 capitalize">
                            {request.business_type}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="text-sm">
                              <div>{request.profiles?.full_name || 'No name'}</div>
                              <div className="text-gray-400">{request.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-gray-600 text-gray-300 mr-2"
                              onClick={() => handleReview(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProfiles ? (
                      <TableRow className="border-white/20">
                        <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                          Loading vendor profiles...
                        </TableCell>
                      </TableRow>
                    ) : vendorProfiles?.length === 0 ? (
                      <TableRow className="border-white/20">
                        <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                          No vendor profiles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendorProfiles?.map((vendor) => (
                        <TableRow key={vendor.id} className="border-white/20">
                          <TableCell className="text-white font-medium">
                            {vendor.business_name}
                          </TableCell>
                          <TableCell className="text-gray-300 capitalize">
                            {vendor.business_type}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="text-sm">
                              <div>{vendor.profiles?.full_name || 'No name'}</div>
                              <div className="text-gray-400">{vendor.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={vendor.is_active ? 'default' : 'outline'}>
                              {vendor.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A'}
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
                      ))
                    )}
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
                {vendorServices?.map((service) => (
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
                            {service.service_category}
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
                          Total Bookings: {service.total_bookings || 0}
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

      {/* Review Request Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Review Vendor Request</DialogTitle>
            <DialogDescription className="text-gray-300">
              Review and approve or reject this vendor registration request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Business Name:</span>
                  <p className="text-white">{selectedRequest.business_name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Business Type:</span>
                  <p className="text-white">{selectedRequest.business_type}</p>
                </div>
                <div>
                  <span className="text-gray-400">Contact:</span>
                  <p className="text-white">{selectedRequest.profiles?.full_name}</p>
                  <p className="text-gray-300">{selectedRequest.profiles?.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">Submitted:</span>
                  <p className="text-white">
                    {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              variant="destructive"
            >
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={() => createServiceMutation.mutate(serviceForm)}
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
