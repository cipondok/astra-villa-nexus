import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAlert } from "@/contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Headphones, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Send,
  Star,
  User,
  FileText,
  BarChart3,
  Phone,
  Search,
  Timer,
  TrendingUp,
  Users,
  Award,
  Menu,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Moon,
  Sun
} from "lucide-react";

const CustomerServiceDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [replyDialog, setReplyDialog] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  const { user, signOut } = useAuth();
  const { showSuccess, showError } = useAlert();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Fetch tickets assigned to me
  const { data: myTickets, isLoading: myTicketsLoading } = useQuery({
    queryKey: ['my-tickets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_complaints')
        .select(`
          id,
          user_id,
          complaint_type,
          subject,
          description,
          priority,
          status,
          created_at,
          updated_at,
          resolution_notes
        `)
        .eq('assigned_to', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch unassigned tickets
  const { data: unassignedTickets, isLoading: unassignedLoading } = useQuery({
    queryKey: ['unassigned-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_complaints')
        .select(`
          id,
          user_id,
          complaint_type,
          subject,
          description,
          priority,
          status,
          created_at
        `)
        .is('assigned_to', null)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch inquiries to respond to
  const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['pending-inquiries'],
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
          created_at
        `)
        .in('status', ['new', 'pending'])
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Assign ticket to myself
  const assignTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('customer_complaints')
        .update({ 
          assigned_to: user?.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-tickets'] });
      showSuccess("Ticket Assigned", "Ticket has been assigned to you.");
    },
    onError: () => {
      showError("Assignment Failed", "Failed to assign ticket.");
    },
  });

  // Resolve ticket
  const resolveTicketMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('customer_complaints')
        .update({ 
          status: 'resolved',
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      showSuccess("Ticket Resolved", "Ticket has been marked as resolved.");
      setReplyDialog({ open: false, item: null });
      setReplyText("");
    },
    onError: () => {
      showError("Resolution Failed", "Failed to resolve ticket.");
    },
  });

  // Reply to inquiry
  const replyInquiryMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const { error } = await supabase
        .from('inquiries')
        .update({ 
          status: 'responded',
          admin_response: response,
          responded_by: user?.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-inquiries'] });
      showSuccess("Response Sent", "Response has been sent to the customer.");
      setReplyDialog({ open: false, item: null });
      setReplyText("");
    },
    onError: () => {
      showError("Reply Failed", "Failed to send response.");
    },
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    
    if (replyDialog.item?.complaint_type) {
      // It's a ticket
      resolveTicketMutation.mutate({ 
        id: replyDialog.item.id, 
        notes: replyText 
      });
    } else {
      // It's an inquiry
      replyInquiryMutation.mutate({ 
        id: replyDialog.item.id, 
        response: replyText 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
      case 'new':
        return <Badge className="bg-blue-500 text-white">Open</Badge>;
      case 'in_progress':
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
      case 'resolved':
      case 'responded':
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
  const myOpenTickets = myTickets?.filter(t => t.status !== 'resolved').length || 0;
  const myResolvedToday = myTickets?.filter(t => 
    t.status === 'resolved' && 
    new Date(t.updated_at).toDateString() === new Date().toDateString()
  ).length || 0;
  const pendingInquiries = inquiries?.length || 0;
  const availableTickets = unassignedTickets?.length || 0;

  // Navigation menu items
  const navItems = [
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "My Tickets", value: "my-tickets", icon: FileText, badge: myOpenTickets },
    { title: "Inquiries", value: "inquiries", icon: MessageSquare, badge: pendingInquiries },
    { title: "Available", value: "available", icon: Clock, badge: availableTickets },
    { title: "Analytics", value: "analytics", icon: BarChart3 },
    { title: "Settings", value: "settings", icon: Settings },
  ];

  // Create the sidebar component
  const CSNavSidebar = () => (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-6 w-6 text-blue-600" />
            <h2 className="font-semibold text-lg">CS Dashboard</h2>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.value)}
                    className={activeTab === item.value ? "bg-blue-100 text-blue-700" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Phone className="h-4 w-4" />
                  <span>Live Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle className="h-4 w-4" />
                  <span>Help Center</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CSNavSidebar />
        
        <main className="flex-1">
          {/* Header with top menu navigation */}
          <div className="border-b bg-background">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>{theme === "light" ? "Dark" : "Light"}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
            
            {/* Main Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Customer Service Dashboard</h1>
                  <p className="text-muted-foreground">Manage support tickets and customer inquiries</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  <Users className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Open Tickets</p>
                <p className="text-2xl font-bold text-orange-600">{myOpenTickets}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{myResolvedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Inquiries</p>
                <p className="text-2xl font-bold text-blue-600">{pendingInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Tickets</p>
                <p className="text-2xl font-bold text-purple-600">{availableTickets}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="my-tickets" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Tickets ({myOpenTickets})
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Inquiries ({pendingInquiries})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Available ({availableTickets})
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Overview */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tickets Resolved</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{myResolvedToday}</span>
                    <Award className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">15 min</span>
                    <Timer className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">4.8</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Start Live Chat Session
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search Customer History
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Knowledge Base
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="my-tickets" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTicketsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading your tickets...
                    </TableCell>
                  </TableRow>
                ) : myTickets?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No tickets assigned to you
                    </TableCell>
                  </TableRow>
                ) : (
                  myTickets?.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.description?.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.complaint_type}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ticket.status !== 'resolved' && (
                            <Button
                              size="sm"
                              onClick={() => setReplyDialog({ open: true, item: ticket })}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Resolve
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

        {/* Inquiries */}
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
                      No pending inquiries
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries?.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inquiry.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {inquiry.message?.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{inquiry.contact_email}</div>
                          {inquiry.contact_phone && (
                            <div className="text-muted-foreground">{inquiry.contact_phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setReplyDialog({ open: true, item: inquiry })}
                        >
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

        {/* Available Tickets */}
        <TabsContent value="available" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading available tickets...
                    </TableCell>
                  </TableRow>
                ) : unassignedTickets?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No available tickets
                    </TableCell>
                  </TableRow>
                ) : (
                  unassignedTickets?.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.description?.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.complaint_type}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => assignTicketMutation.mutate(ticket.id)}
                          disabled={assignTicketMutation.isPending}
                        >
                          <User className="h-3 w-3 mr-1" />
                          Take
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={replyDialog.open} onOpenChange={(open) => setReplyDialog({ open, item: replyDialog.item })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {replyDialog.item?.complaint_type ? 'Resolve Ticket' : 'Reply to Inquiry'}
            </DialogTitle>
            <DialogDescription>
              {replyDialog.item?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                {replyDialog.item?.description || replyDialog.item?.message}
              </p>
            </div>
            <Textarea
              placeholder={replyDialog.item?.complaint_type ? "Resolution notes..." : "Your response..."}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReplyDialog({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyText.trim() || resolveTicketMutation.isPending || replyInquiryMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {replyDialog.item?.complaint_type ? 'Resolve' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CustomerServiceDashboard;