import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Headphones, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Star,
  TrendingUp,
  UserPlus,
  Settings,
  Phone,
  Mail,
  FileText,
  BarChart3,
  Activity
} from "lucide-react";
import CSEmailTemplatesManager from "./cs-tools/CSEmailTemplatesManager";
import CSKnowledgeBaseManager from "./cs-tools/CSKnowledgeBaseManager";
import CSAutomationRulesManager from "./cs-tools/CSAutomationRulesManager";
import CSPerformanceMonitor from "./cs-tools/CSPerformanceMonitor";
import DatabaseErrorManager from "./cs-tools/DatabaseErrorManager";

const CustomerServiceControlPanel = () => {
  const [activeTab, setActiveTab] = useState("agents");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [agentAssignDialog, setAgentAssignDialog] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch customer service agents
  const { data: csAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['cs-agents', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          verification_status,
          created_at,
          updated_at
        `)
        .eq('role', 'customer_service')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch customer complaints/tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['customer-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('customer_complaints')
        .select(`
          id,
          user_id,
          complaint_type,
          subject,
          description,
          priority,
          status,
          assigned_to,
          created_at,
          updated_at,
          resolution_notes
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user inquiries
  const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['user-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          user_id,
          inquiry_type,
          subject,
          message,
          contact_email,
          contact_phone,
          status,
          admin_response,
          responded_by,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create new CS agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: { email: string; full_name: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'customer_service',
          verification_status: 'approved',
          full_name: agentData.full_name
        })
        .eq('email', agentData.email);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-agents'] });
      showSuccess("Agent Created", "Customer service agent has been created successfully.");
    },
    onError: () => {
      showError("Creation Failed", "Failed to create customer service agent.");
    },
  });

  // Assign ticket mutation
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, agentId }: { ticketId: string; agentId: string }) => {
      const { error } = await supabase
        .from('customer_complaints')
        .update({ 
          assigned_to: agentId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tickets'] });
      showSuccess("Ticket Assigned", "Ticket has been assigned successfully.");
      setAgentAssignDialog(false);
    },
    onError: () => {
      showError("Assignment Failed", "Failed to assign ticket.");
    },
  });

  // Update ticket status mutation
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status, notes }: { ticketId: string; status: string; notes?: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.resolution_notes = notes;
      }
      
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customer_complaints')
        .update(updateData)
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tickets'] });
      showSuccess("Status Updated", "Ticket status has been updated successfully.");
    },
    onError: () => {
      showError("Update Failed", "Failed to update ticket status.");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 text-white">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500 text-white">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Calculate stats
  const totalTickets = tickets?.length || 0;
  const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
  const resolvedTickets = tickets?.filter(t => t.status === 'resolved').length || 0;
  const avgResponseTime = "2.5 hours"; // This would be calculated from actual data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Customer Service Control Panel
          </CardTitle>
          <CardDescription>
            Comprehensive customer service management, agent control, and support tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold text-blue-600">{totalTickets}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                    <p className="text-2xl font-bold text-orange-600">{openTickets}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{resolvedTickets}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CS Agents</p>
                    <p className="text-2xl font-bold text-purple-600">{csAgents?.length || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                CS Agents ({csAgents?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tickets ({totalTickets})
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Inquiries
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                CS Tools
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Customer Service Agents Tab */}
            <TabsContent value="agents" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search agents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add CS Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Customer Service Agent</DialogTitle>
                      <DialogDescription>
                        Promote an existing user to customer service agent role
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="User Email" />
                      <Input placeholder="Full Name" />
                      <Button className="w-full">Create CS Agent</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Active Tickets</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading agents...
                        </TableCell>
                      </TableRow>
                    ) : csAgents?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No customer service agents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      csAgents?.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Headphones className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{agent.full_name || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">ID: {agent.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{agent.email}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 text-white">Active</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(agent.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tickets?.filter(t => t.assigned_to === agent.id && t.status !== 'resolved').length || 0} active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">4.8</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Support Tickets Tab */}
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tickets</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading tickets...
                        </TableCell>
                      </TableRow>
                    ) : tickets?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No tickets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets?.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{ticket.subject}</div>
                              <div className="text-sm text-muted-foreground">#{ticket.id.slice(0, 8)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">Customer User</div>
                              <div className="text-sm text-muted-foreground">customer@example.com</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.complaint_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(ticket.priority)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(ticket.status)}
                          </TableCell>
                          <TableCell>
                            {ticket.assigned_to ? 'Agent Assigned' : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setAgentAssignDialog(true);
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {ticket.status === 'open' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateTicketStatusMutation.mutate({
                                    ticketId: ticket.id,
                                    status: 'resolved'
                                  })}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="inquiries" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading inquiries...
                        </TableCell>
                      </TableRow>
                    ) : inquiries?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No inquiries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      inquiries?.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            <div className="font-medium">{inquiry.subject}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{inquiry.contact_email}</div>
                              {inquiry.contact_phone && (
                                <div className="text-sm text-muted-foreground">{inquiry.contact_phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(inquiry.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Send className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* CS Tools Tab */}
            <TabsContent value="tools" className="space-y-4">
              <Tabs defaultValue="live-chat" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="live-chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Live Chat
                  </TabsTrigger>
                  <TabsTrigger value="email-templates" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Knowledge
                  </TabsTrigger>
                  <TabsTrigger value="automation" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Automation
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="database-errors" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    DB Errors
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="live-chat">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Live Chat Management</h3>
                        <p className="text-muted-foreground mb-4">
                          Access the complete live chat system for real-time customer support
                        </p>
                        <Button 
                          className="w-full max-w-sm"
                          onClick={() => window.open('/admin#chat-management', '_blank')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Live Chat Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email-templates">
                  <CSEmailTemplatesManager />
                </TabsContent>

                <TabsContent value="knowledge-base">
                  <CSKnowledgeBaseManager />
                </TabsContent>

                <TabsContent value="automation">
                  <CSAutomationRulesManager />
                </TabsContent>

                <TabsContent value="performance">
                  <CSPerformanceMonitor />
                </TabsContent>

                <TabsContent value="database-errors">
                  <DatabaseErrorManager />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Average Response Time</span>
                        <span className="font-bold">2.5 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Response Time</span>
                        <span className="font-bold">45 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolution Time</span>
                        <span className="font-bold">1.2 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Overall Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-bold">4.6/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfied Customers</span>
                        <span className="font-bold text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Repeat Issues</span>
                        <span className="font-bold text-red-600">8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Assignment Dialog */}
      <Dialog open={agentAssignDialog} onOpenChange={setAgentAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent to Ticket</DialogTitle>
            <DialogDescription>
              Select a customer service agent for this ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {csAgents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name || agent.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAgentAssignDialog(false)}>
                Cancel
              </Button>
              <Button>
                Assign Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerServiceControlPanel;