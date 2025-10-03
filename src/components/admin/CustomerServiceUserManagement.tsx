
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { Headphones, Search, Ban, UserCheck, Eye } from "lucide-react";

interface CustomerServiceUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  verification_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  availability_status?: string;
  last_seen_at?: string;
  user_level_id?: string;
  user_levels?: {
    name: string;
    max_properties: number;
    max_listings: number;
  };
}

const CustomerServiceUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<CustomerServiceUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch customer service users
  const { data: agents, isLoading } = useQuery({
    queryKey: ['customer-service-users'],
    queryFn: async (): Promise<CustomerServiceUser[]> => {
      const { data, error } = await supabase
        .rpc('get_admin_profiles', { p_role: 'customer_service', p_limit: 500, p_offset: 0 });
      if (error) throw error;
      return (data as CustomerServiceUser[]) || [];
    },
  });

  // Get ticket counts for each agent
  const { data: ticketCounts } = useQuery({
    queryKey: ['ticket-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_service_tickets')
        .select('assigned_to')
        .not('assigned_to', 'is', null);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(ticket => {
        counts[ticket.assigned_to] = (counts[ticket.assigned_to] || 0) + 1;
      });
      
      return counts;
    },
  });

  // Suspend agent mutation
  const suspendAgentMutation = useMutation({
    mutationFn: async ({ agentId, reason }: { agentId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          suspended_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', agentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Customer Service Agent Suspended", "Customer service agent has been suspended successfully.");
      setSuspensionModalOpen(false);
      setSelectedAgent(null);
      setSuspensionReason("");
      queryClient.invalidateQueries({ queryKey: ['customer-service-users'] });
    },
    onError: (error: any) => {
      showError("Suspension Failed", error.message);
    },
  });

  // Unsuspend agent mutation
  const unsuspendAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', agentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Customer Service Agent Unsuspended", "Customer service agent has been unsuspended successfully.");
      queryClient.invalidateQueries({ queryKey: ['customer-service-users'] });
    },
    onError: (error: any) => {
      showError("Unsuspend Failed", error.message);
    },
  });

  // Filter agents
  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = 
      agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !agent.is_suspended) ||
      (statusFilter === "suspended" && agent.is_suspended) ||
      (statusFilter === agent.verification_status) ||
      (statusFilter === agent.availability_status);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (agent: CustomerServiceUser) => {
    if (agent.is_suspended) {
      return <Badge variant="destructive">SUSPENDED</Badge>;
    }
    
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={colors[agent.verification_status as keyof typeof colors] || colors.pending}>
        {agent.verification_status.toUpperCase()}
      </Badge>
    );
  };

  const getAvailabilityBadge = (status?: string) => {
    const colors = {
      online: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      offline: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.offline}>
        {(status || 'offline').toUpperCase()}
      </Badge>
    );
  };

  const handleSuspendAgent = (agent: CustomerServiceUser) => {
    setSelectedAgent(agent);
    setSuspensionModalOpen(true);
  };

  const handleViewAgent = (agent: CustomerServiceUser) => {
    setSelectedAgent(agent);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Customer Service User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage customer service agents and support team members
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customer service agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Service Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Service Agents ({filteredAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customer service agents...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Assigned Tickets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.full_name || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground">{agent.email}</div>
                        {agent.phone && (
                          <div className="text-sm text-muted-foreground">{agent.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAvailabilityBadge(agent.availability_status)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {ticketCounts?.[agent.id] || 0} Tickets
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(agent)}</TableCell>
                    <TableCell>
                      {agent.last_seen_at ? new Date(agent.last_seen_at).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAgent(agent)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {agent.is_suspended ? (
                          <Button
                            size="sm"
                            onClick={() => unsuspendAgentMutation.mutate(agent.id)}
                            disabled={unsuspendAgentMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSuspendAgent(agent)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Agent Modal */}
      {selectedAgent && viewModalOpen && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Service Agent Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{selectedAgent.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedAgent.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Availability</Label>
                  <div>{getAvailabilityBadge(selectedAgent.availability_status)}</div>
                </div>
                <div>
                  <Label>Assigned Tickets</Label>
                  <p className="font-medium">{ticketCounts?.[selectedAgent.id] || 0} Tickets</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedAgent)}</div>
                </div>
                <div>
                  <Label>Last Seen</Label>
                  <p className="font-medium">
                    {selectedAgent.last_seen_at ? new Date(selectedAgent.last_seen_at).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{new Date(selectedAgent.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedAgent.is_suspended && (
                <div>
                  <Label>Suspension Reason</Label>
                  <p className="text-red-600">{selectedAgent.suspension_reason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspension Modal */}
      {selectedAgent && suspensionModalOpen && (
        <Dialog open={suspensionModalOpen} onOpenChange={setSuspensionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Customer Service Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Agent</Label>
                <p>{selectedAgent.full_name} ({selectedAgent.email})</p>
              </div>
              <div>
                <Label>Suspension Reason</Label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => suspendAgentMutation.mutate({
                    agentId: selectedAgent.id,
                    reason: suspensionReason
                  })}
                  disabled={suspendAgentMutation.isPending || !suspensionReason}
                  variant="destructive"
                  className="flex-1"
                >
                  {suspendAgentMutation.isPending ? 'Suspending...' : 'Suspend Agent'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSuspensionModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerServiceUserManagement;
