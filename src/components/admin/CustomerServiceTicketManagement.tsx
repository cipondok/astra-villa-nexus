
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";

const CustomerServiceTicketManagement = () => {
  const { profile } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [resolution, setResolution] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['customer-service-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('customer_service_tickets')
        .select(`
          *,
          customer:customer_id ( full_name, email ),
          vendor:vendor_id ( business_name ),
          agent:assigned_to ( full_name )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      };
      return data;
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, resolution, assigned_to }: { id: string; status: string; resolution?: string; assigned_to?: string }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (resolution) updateData.resolution = resolution;
      if (assigned_to) {
        updateData.assigned_to = assigned_to;
        if(status === 'in_progress' && !selectedTicket.agent) {
          updateData.status = 'in_progress';
        }
      }
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('customer_service_tickets')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Ticket Updated", "Ticket has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['customer-service-tickets'] });
      setShowDetailDialog(false);
      setSelectedTicket(null);
      setResolution("");
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleViewDetails = (item: any) => {
    setSelectedTicket(item);
    setResolution(item.resolution || "");
    setShowDetailDialog(true);
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({ 
        id: selectedTicket.id, 
        status, 
        resolution: resolution.trim() || undefined,
        assigned_to: selectedTicket.assigned_to || profile?.id,
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'closed':
          return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      case 'open':
      default:
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Open</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return <Badge className={colors[priority] || 'bg-gray-500'}>{priority?.toUpperCase()}</Badge>;
  };
  
  const authorizedRoles = ['admin', 'customer_service'];
  if (!profile || !authorizedRoles.includes(profile.role)) {
    return (
      <Card>
        <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
        <CardContent><p>You do not have permission to view this page.</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Customer Service Tickets
          </CardTitle>
          <CardDescription>
            Manage and resolve customer and vendor support tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">Loading tickets...</TableCell></TableRow>
                  ) : tickets?.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">No tickets found.</TableCell></TableRow>
                  ) : (
                    tickets?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.ticket_number}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell>{item.customer?.full_name || 'N/A'}</TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.agent?.full_name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(item)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Ticket Details</DialogTitle></DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><label className="font-medium text-muted-foreground">Ticket #:</label><p>{selectedTicket.ticket_number}</p></div>
                <div><label className="font-medium text-muted-foreground">Customer:</label><p>{selectedTicket.customer?.full_name || 'N/A'}</p></div>
                <div><label className="font-medium text-muted-foreground">Status:</label><div>{getStatusBadge(selectedTicket.status)}</div></div>
                <div><label className="font-medium text-muted-foreground">Priority:</label><div>{getPriorityBadge(selectedTicket.priority)}</div></div>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Subject:</label>
                <p>{selectedTicket.subject}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Description:</label>
                <p className="border p-2 rounded bg-muted">{selectedTicket.description}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Resolution Notes:</label>
                <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Enter resolution notes..." rows={3}/>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cancel</Button>
            <Button onClick={() => handleStatusUpdate('in_progress')} disabled={updateTicketMutation.isPending} className="bg-yellow-500 hover:bg-yellow-600">Take Ownership &amp; Start</Button>
            <Button onClick={() => handleStatusUpdate('resolved')} disabled={updateTicketMutation.isPending} className="bg-green-600 hover:bg-green-700">Mark Resolved</Button>
            <Button variant="destructive" onClick={() => handleStatusUpdate('closed')} disabled={updateTicketMutation.isPending}>Close Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerServiceTicketManagement;
