
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, Eye, CheckCircle, XCircle, Clock, User, Mail, MessageSquare } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveChatManagement from "./LiveChatManagement";

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
          customer:profiles!customer_id ( id, full_name, email, availability_status ),
          agent:profiles!assigned_to ( id, full_name, availability_status )
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
  
  const getAvailabilityBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const badgeClasses = {
      online: "border-green-500 text-green-500",
      busy: "border-yellow-500 text-yellow-500",
      offline: "border-gray-500 text-gray-500",
    };
    const text = status.charAt(0).toUpperCase() + status.slice(1);
    
    const className = badgeClasses[status as keyof typeof badgeClasses] || "border-gray-400 text-gray-400";

    return <Badge variant="outline" className={`${className} text-xs`}>{text}</Badge>;
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
            Support Center
          </CardTitle>
          <CardDescription>
            Manage customer support tickets and live chat inquiries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" /> Tickets
              </TabsTrigger>
              <TabsTrigger value="live-chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Live Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="mt-4">
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
                            <TableCell>
                              <div className="font-medium">{item.customer?.full_name || 'N/A'}</div>
                              {item.customer?.id && <div className="text-xs text-muted-foreground font-mono">{item.customer.id}</div>}
                              <div className="mt-1">{getAvailabilityBadge(item.customer?.availability_status)}</div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.agent?.full_name || 'Unassigned'}</div>
                              {item.agent?.id && <div className="text-xs text-muted-foreground font-mono">{item.agent.id}</div>}
                              {item.agent && <div className="mt-1">{getAvailabilityBadge(item.agent?.availability_status)}</div>}
                            </TableCell>
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
            </TabsContent>
            <TabsContent value="live-chat" className="mt-4">
              <LiveChatManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5" />
              <span>Ticket Details</span>
            </DialogTitle>
            <DialogDescription>
              Review ticket details and communicate with the customer.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Ticket #:</label>
                  <p>{selectedTicket.ticket_number}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Customer:</label>
                  <p className="flex items-center gap-2"><User className="h-4 w-4" /> {selectedTicket.customer?.full_name || 'N/A'}</p>
                  {selectedTicket.customer?.id && <p className="text-xs text-muted-foreground pl-6 font-mono">{selectedTicket.customer.id}</p>}
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status:</label>
                  <div>{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Priority:</label>
                  <div>{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Assigned to:</label>
                  {selectedTicket.agent ? (
                    <div>
                      <p className="flex items-center gap-2"><User className="h-4 w-4" /> {selectedTicket.agent.full_name}</p>
                      {selectedTicket.agent.id && <p className="text-xs text-muted-foreground pl-6 font-mono">{selectedTicket.agent.id}</p>}
                    </div>
                  ) : <p>Unassigned</p>}
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Customer Status:</label>
                  <div>{getAvailabilityBadge(selectedTicket.customer?.availability_status)}</div>
                </div>
              </div>

              {/* Conversation */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 border-b pb-2">Conversation History</h3>
                
                {/* User's Message */}
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                     {selectedTicket.customer?.full_name?.charAt(0) || 'U'}
                   </div>
                   <div className="flex-1">
                     <div className="font-semibold">{selectedTicket.subject}</div>
                     <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg rounded-tl-none mt-1">
                       <p className="text-sm text-gray-800 dark:text-gray-200">{selectedTicket.description}</p>
                     </div>
                     <p className="text-xs text-gray-500 mt-1">
                       {new Date(selectedTicket.created_at).toLocaleString()}
                     </p>
                   </div>
                 </div>

                {/* Admin's Response */}
                {selectedTicket.resolution && (
                   <div className="flex gap-3 justify-end">
                     <div className="flex-1 max-w-[85%] text-right">
                        <div className="bg-blue-100 dark:bg-blue-900/50 inline-block p-3 rounded-lg rounded-br-none text-left">
                          <p className="font-semibold text-sm text-blue-800 dark:text-blue-200">Our response:</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200">{selectedTicket.resolution}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedTicket.resolved_at ? new Date(selectedTicket.resolved_at).toLocaleString() : ''}
                        </p>
                     </div>
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        S
                      </div>
                   </div>
                 )}
              </div>
              
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div>
                  <Label htmlFor="resolution" className="font-medium text-muted-foreground">Your Response / Resolution Notes:</Label>
                  <Textarea id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Enter response or internal resolution notes here..." rows={4}/>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cancel</Button>
            {selectedTicket?.status === 'open' && (
              <Button onClick={() => handleStatusUpdate('in_progress')} disabled={updateTicketMutation.isPending} className="bg-yellow-500 hover:bg-yellow-600">Take Ownership &amp; Start</Button>
            )}
            {selectedTicket?.status !== 'resolved' && selectedTicket?.status !== 'closed' && (
              <Button onClick={() => handleStatusUpdate('resolved')} disabled={updateTicketMutation.isPending || !resolution.trim()} className="bg-green-600 hover:bg-green-700">Mark Resolved &amp; Send Response</Button>
            )}
            {selectedTicket?.status !== 'closed' && (
              <Button variant="destructive" onClick={() => handleStatusUpdate('closed')} disabled={updateTicketMutation.isPending}>Close Ticket</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerServiceTicketManagement;
