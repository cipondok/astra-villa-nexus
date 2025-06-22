
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
import { UserCheck, Search, Ban, Eye, Building } from "lucide-react";

interface AgentUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  license_number?: string;
  role: string;
  verification_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  user_level_id?: string;
  user_levels?: {
    name: string;
    max_properties: number;
    max_listings: number;
  };
}

const AgentUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<AgentUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch agent users
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agent-users'],
    queryFn: async (): Promise<AgentUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_levels (
            name,
            max_properties,
            max_listings
          )
        `)
        .eq('role', 'agent')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
      showSuccess("Agent Suspended", "Agent has been suspended successfully.");
      setSuspensionModalOpen(false);
      setSelectedAgent(null);
      setSuspensionReason("");
      queryClient.invalidateQueries({ queryKey: ['agent-users'] });
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
      showSuccess("Agent Unsuspended", "Agent has been unsuspended successfully.");
      queryClient.invalidateQueries({ queryKey: ['agent-users'] });
    },
    onError: (error: any) => {
      showError("Unsuspend Failed", error.message);
    },
  });

  // Filter agents
  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = 
      agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.license_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !agent.is_suspended) ||
      (statusFilter === "suspended" && agent.is_suspended) ||
      (statusFilter === agent.verification_status);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (agent: AgentUser) => {
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

  const handleSuspendAgent = (agent: AgentUser) => {
    setSelectedAgent(agent);
    setSuspensionModalOpen(true);
  };

  const handleViewAgent = (agent: AgentUser) => {
    setSelectedAgent(agent);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="h-5 w-5" />
            Agent User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage real estate agent accounts and licensing verification
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
                  placeholder="Search agents..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Users ({filteredAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
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
                      <div className="font-medium">{agent.license_number || 'No License'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{agent.company_name || 'Independent'}</div>
                    </TableCell>
                    <TableCell>
                      {agent.user_levels ? (
                        <div>
                          <div className="font-medium">{agent.user_levels.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {agent.user_levels.max_properties} props, {agent.user_levels.max_listings} listings
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">No Level</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(agent)}</TableCell>
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
              <DialogTitle>Agent Details</DialogTitle>
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
                  <Label>License Number</Label>
                  <p className="font-medium">{selectedAgent.license_number || 'N/A'}</p>
                </div>
                <div>
                  <Label>Company</Label>
                  <p className="font-medium">{selectedAgent.company_name || 'Independent'}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedAgent)}</div>
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
              <DialogTitle>Suspend Agent</DialogTitle>
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

export default AgentUserManagement;
