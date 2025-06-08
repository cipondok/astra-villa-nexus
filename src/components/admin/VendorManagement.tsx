
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { CheckCircle, XCircle, Eye, Search, Filter, UserCheck, UserX, RefreshCw } from "lucide-react";

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor requests
  const { data: vendorRequests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: async () => {
      console.log('Fetching vendor requests');
      const { data, error } = await supabase
        .from('vendor_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor requests:', error);
        throw error;
      }
      
      console.log('Fetched vendor requests:', data);
      return data || [];
    },
  });

  // Fetch vendor profiles
  const { data: vendorProfiles, isLoading: profilesLoading, refetch: refetchProfiles } = useQuery({
    queryKey: ['vendor-profiles'],
    queryFn: async () => {
      console.log('Fetching vendor profiles');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'vendor')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor profiles:', error);
        throw error;
      }
      
      console.log('Fetched vendor profiles:', data);
      return data || [];
    },
  });

  // Approve vendor mutation
  const approveVendorMutation = useMutation({
    mutationFn: async (requestId: string) => {
      console.log('Approving vendor request:', requestId);
      
      // Get the request details first
      const { data: request, error: requestError } = await supabase
        .from('vendor_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) {
        console.error('Error fetching request:', requestError);
        throw requestError;
      }
      
      // Update the request status
      const { error: updateError } = await supabase
        .from('vendor_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) {
        console.error('Error updating request:', updateError);
        throw updateError;
      }
      
      // Update the user's profile to vendor role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'vendor',
          verification_status: 'approved'
        })
        .eq('id', request.user_id);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }
      
      console.log('Vendor approved successfully');
    },
    onSuccess: () => {
      showSuccess("Vendor Approved", "The vendor application has been approved successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
      refetchRequests();
      refetchProfiles();
    },
    onError: (error: any) => {
      console.error('Approve vendor error:', error);
      showError("Approval Failed", error.message);
    },
  });

  // Reject vendor mutation
  const rejectVendorMutation = useMutation({
    mutationFn: async (requestId: string) => {
      console.log('Rejecting vendor request:', requestId);
      
      const { error } = await supabase
        .from('vendor_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error rejecting request:', error);
        throw error;
      }
      
      console.log('Vendor rejected successfully');
    },
    onSuccess: () => {
      showSuccess("Vendor Rejected", "The vendor application has been rejected.");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      refetchRequests();
    },
    onError: (error: any) => {
      console.error('Reject vendor error:', error);
      showError("Rejection Failed", error.message);
    },
  });

  // Filter data
  const filteredRequests = vendorRequests?.filter((request) => {
    const matchesSearch = request.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.business_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredProfiles = vendorProfiles?.filter((profile) => {
    return profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Vendor Management
          </CardTitle>
          <CardDescription>
            Manage vendor applications and approved vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { refetchRequests(); refetchProfiles(); }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            Review and approve vendor applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="text-center py-8">Loading vendor applications...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vendor applications found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.business_name}</TableCell>
                    <TableCell>{request.business_type}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveVendorMutation.mutate(request.id)}
                              disabled={approveVendorMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectVendorMutation.mutate(request.id)}
                              disabled={rejectVendorMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Vendors</CardTitle>
          <CardDescription>
            Manage existing vendor accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profilesLoading ? (
            <div className="text-center py-8">Loading vendor profiles...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No approved vendors found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={profile.verification_status === 'approved' ? 'default' : 'secondary'}>
                        {profile.verification_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive">
                          <UserX className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorManagement;
