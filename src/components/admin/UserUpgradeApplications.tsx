import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Home,
  Building2,
  UserPlus,
  Users,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  user_id: string;
  type: 'property_owner' | 'vendor' | 'agent';
  status: string;
  created_at: string;
  review_notes?: string;
  reviewed_at?: string;
  // Property Owner specific
  full_name?: string;
  phone?: string;
  owner_type?: string;
  property_types?: string[];
  province?: string;
  city?: string;
  business_name?: string;
  // Vendor specific
  business_type?: string;
  // Agent specific
  company_name?: string;
  license_number?: string;
  email?: string;
}

const UserUpgradeApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Fetch all applications from all three tables
  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['upgrade-applications', activeTab],
    queryFn: async () => {
      const allApplications: Application[] = [];

      // Fetch property owner requests
      const { data: propertyOwnerData } = await supabase
        .from('property_owner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertyOwnerData) {
        propertyOwnerData.forEach(item => {
          allApplications.push({
            ...item,
            type: 'property_owner' as const
          });
        });
      }

      // Fetch vendor requests
      const { data: vendorData } = await supabase
        .from('vendor_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorData) {
        vendorData.forEach(item => {
          allApplications.push({
            id: item.id,
            user_id: item.user_id || '',
            type: 'vendor' as const,
            status: item.status || 'pending',
            created_at: item.created_at || '',
            review_notes: item.review_notes || undefined,
            reviewed_at: item.updated_at || undefined, // Use updated_at as reviewed_at
            business_name: item.business_name,
            business_type: item.business_type || undefined,
            full_name: item.business_name // Use business name as display name
          });
        });
      }

      // Fetch agent requests
      const { data: agentData } = await supabase
        .from('agent_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentData) {
        agentData.forEach(item => {
          allApplications.push({
            id: item.id,
            user_id: item.user_id || '',
            type: 'agent' as const,
            status: item.status || 'pending',
            created_at: item.created_at || '',
            review_notes: item.review_notes || undefined,
            reviewed_at: item.reviewed_at || undefined,
            full_name: item.full_name,
            email: item.email,
            phone: item.phone || undefined,
            company_name: item.company_name || undefined,
            license_number: item.license_number || undefined,
            business_type: item.business_type
          });
        });
      }

      // Sort by created_at descending
      allApplications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Filter based on active tab
      if (activeTab === 'pending') {
        return allApplications.filter(app => app.status === 'pending' || app.status === 'under_review');
      } else if (activeTab === 'approved') {
        return allApplications.filter(app => app.status === 'approved');
      } else if (activeTab === 'rejected') {
        return allApplications.filter(app => app.status === 'rejected');
      }
      
      return allApplications;
    }
  });

  // Stats calculation
  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter(a => a.status === 'pending' || a.status === 'under_review').length || 0,
    approved: applications?.filter(a => a.status === 'approved').length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0
  };

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ app, notes }: { app: Application; notes: string }) => {
      const tableName = app.type === 'property_owner' 
        ? 'property_owner_requests' 
        : app.type === 'vendor' 
          ? 'vendor_requests' 
          : 'agent_registration_requests';

      const roleName = app.type === 'property_owner' 
        ? 'property_owner' 
        : app.type === 'vendor' 
          ? 'vendor' 
          : 'agent';

      // Update application status
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          status: 'approved',
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', app.id);

      if (updateError) throw updateError;

      // Assign role to user
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: app.user_id,
          role: roleName,
          is_active: true,
          assigned_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,role'
        });

      if (roleError) throw roleError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: app.user_id,
        activity_type: 'role_upgrade_approved',
        activity_description: `User upgrade to ${roleName} approved`,
        metadata: { application_id: app.id, role: roleName }
      });

      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Application Approved", description: "User role has been upgraded successfully." });
      setIsReviewDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ['upgrade-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ app, notes }: { app: Application; notes: string }) => {
      const tableName = app.type === 'property_owner' 
        ? 'property_owner_requests' 
        : app.type === 'vendor' 
          ? 'vendor_requests' 
          : 'agent_registration_requests';

      const { error } = await supabase
        .from(tableName)
        .update({
          status: 'rejected',
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', app.id);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: app.user_id,
        activity_type: 'role_upgrade_rejected',
        activity_description: `User upgrade application rejected`,
        metadata: { application_id: app.id, reason: notes }
      });

      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Application Rejected", description: "Application has been rejected." });
      setIsReviewDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ['upgrade-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property_owner': return <Home className="h-4 w-4" />;
      case 'vendor': return <Building2 className="h-4 w-4" />;
      case 'agent': return <UserPlus className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'property_owner': 
        return <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">Owner</Badge>;
      case 'vendor': 
        return <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">Vendor</Badge>;
      case 'agent': 
        return <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-green-50 text-green-700 border-green-200">Agent</Badge>;
      default: 
        return <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'under_review':
        return <Badge className="text-[8px] px-1 py-0 h-4 bg-yellow-100 text-yellow-800"><Clock className="h-2.5 w-2.5 mr-0.5" />Pending</Badge>;
      case 'approved':
        return <Badge className="text-[8px] px-1 py-0 h-4 bg-green-100 text-green-800"><CheckCircle className="h-2.5 w-2.5 mr-0.5" />Approved</Badge>;
      case 'rejected':
        return <Badge className="text-[8px] px-1 py-0 h-4 bg-red-100 text-red-800"><XCircle className="h-2.5 w-2.5 mr-0.5" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">{status}</Badge>;
    }
  };

  const openReviewDialog = (app: Application) => {
    setSelectedApp(app);
    setReviewNotes(app.review_notes || "");
    setIsReviewDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold">User Upgrade Applications</h1>
          <p className="text-[10px] text-muted-foreground">Review and process user role upgrade requests</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="h-7 text-[10px]">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground">Approved</p>
              <p className="text-lg font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground">Rejected</p>
              <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs">Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 h-7">
              <TabsTrigger value="all" className="text-[10px] h-6 px-2">All</TabsTrigger>
              <TabsTrigger value="pending" className="text-[10px] h-6 px-2">
                Pending {stats.pending > 0 && <Badge className="ml-1 text-[8px] h-4 px-1 bg-yellow-500">{stats.pending}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-[10px] h-6 px-2">Approved</TabsTrigger>
              <TabsTrigger value="rejected" className="text-[10px] h-6 px-2">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
              ) : applications && applications.length > 0 ? (
                <ScrollArea className="h-[350px]">
                  <Table className="text-[10px]">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[9px] font-semibold py-1.5 px-2">Type</TableHead>
                        <TableHead className="text-[9px] font-semibold py-1.5 px-2">Name</TableHead>
                        <TableHead className="text-[9px] font-semibold py-1.5 px-2">Details</TableHead>
                        <TableHead className="text-[9px] font-semibold py-1.5 px-2">Status</TableHead>
                        <TableHead className="text-[9px] font-semibold py-1.5 px-2">Date</TableHead>
                        <TableHead className="text-[9px] font-semibold py-1.5 px-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={`${app.type}-${app.id}`} className="hover:bg-muted/20">
                          <TableCell className="py-1.5 px-2">{getTypeBadge(app.type)}</TableCell>
                          <TableCell className="py-1.5 px-2 text-[10px] font-medium max-w-[100px] truncate">
                            {app.full_name || app.business_name || 'N/A'}
                          </TableCell>
                          <TableCell className="py-1.5 px-2 text-[9px] text-muted-foreground max-w-[120px] truncate">
                            {app.type === 'property_owner' && app.owner_type && (
                              <span>{app.owner_type}</span>
                            )}
                            {app.type === 'vendor' && app.business_type && (
                              <span>{app.business_type}</span>
                            )}
                            {app.type === 'agent' && (
                              <span>{app.business_type}</span>
                            )}
                          </TableCell>
                          <TableCell className="py-1.5 px-2">{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="py-1.5 px-2 text-[9px] text-muted-foreground">
                            {format(new Date(app.created_at), 'MMM dd')}
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => openReviewDialog(app)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-4 text-[10px] text-muted-foreground">
                  No applications found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApp && getTypeIcon(selectedApp.type)}
              Review Application
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Application Type</Label>
                  <p className="font-medium">{getTypeBadge(selectedApp.type)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedApp.status)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedApp.full_name || selectedApp.business_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Submitted</Label>
                  <p>{format(new Date(selectedApp.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                
                {/* Type-specific details */}
                {selectedApp.type === 'property_owner' && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Owner Type</Label>
                      <p>{selectedApp.owner_type || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Location</Label>
                      <p>{selectedApp.province}, {selectedApp.city}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Property Types</Label>
                      <p>{selectedApp.property_types?.join(', ') || 'N/A'}</p>
                    </div>
                  </>
                )}
                
                {selectedApp.type === 'vendor' && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Business Name</Label>
                      <p>{selectedApp.business_name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Business Type</Label>
                      <p>{selectedApp.business_type || 'N/A'}</p>
                    </div>
                  </>
                )}
                
                {selectedApp.type === 'agent' && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p>{selectedApp.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p>{selectedApp.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Company</Label>
                      <p>{selectedApp.company_name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">License</Label>
                      <p>{selectedApp.license_number || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Review Notes */}
              <div>
                <Label htmlFor="review-notes">Review Notes</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={3}
                />
              </div>

              {/* Previous Review Notes */}
              {selectedApp.review_notes && selectedApp.reviewed_at && (
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Previous Review Notes</Label>
                  <p className="text-sm">{selectedApp.review_notes}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviewed on {format(new Date(selectedApp.reviewed_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            {selectedApp && (selectedApp.status === 'pending' || selectedApp.status === 'under_review') && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => rejectMutation.mutate({ app: selectedApp, notes: reviewNotes })}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => approveMutation.mutate({ app: selectedApp, notes: reviewNotes })}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserUpgradeApplications;
