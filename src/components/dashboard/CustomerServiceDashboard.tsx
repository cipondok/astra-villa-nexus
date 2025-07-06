import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";

const CustomerServiceDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [replyDialog, setReplyDialog] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  
  const { user, signOut } = useAuth();
  const { showSuccess, showError } = useAlert();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // CS Settings State
  const [csSettings, setCsSettings] = useState({
    autoAssignTickets: true,
    emailNotifications: true,
    displayName: "Customer Service Agent",
    statusMessage: "Available for support",
    workingHours: "9-5",
  });

  // Load CS settings from database
  const { data: userSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['cs-user-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('cs_user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading CS settings:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Update local state when database data is loaded
  useEffect(() => {
    if (userSettings) {
      setCsSettings({
        autoAssignTickets: userSettings.auto_assign_tickets,
        emailNotifications: userSettings.email_notifications,
        displayName: userSettings.display_name,
        statusMessage: userSettings.status_message,
        workingHours: userSettings.working_hours,
      });
    }
  }, [userSettings]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const settingsData = {
        user_id: user.id,
        auto_assign_tickets: csSettings.autoAssignTickets,
        email_notifications: csSettings.emailNotifications,
        display_name: csSettings.displayName,
        status_message: csSettings.statusMessage,
        working_hours: csSettings.workingHours,
      };

      // Try to update existing settings first
      const { data, error } = await supabase
        .from('cs_user_settings')
        .upsert(settingsData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-user-settings', user?.id] });
      showSuccess("Settings Saved", "Your CS preferences have been saved successfully!");
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      showError("Save Failed", "Failed to save settings. Please try again.");
    },
  });

  // Save settings function
  const saveSettings = async () => {
    saveSettingsMutation.mutate();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'live-chat':
        setShowLiveChat(true);
        showSuccess("Live Chat", "Opening live chat interface...");
        break;
      case 'search-customer':
        setActiveTab('inquiries');
        showSuccess("Customer Search", "Switching to customer inquiries...");
        break;
      case 'knowledge-base':
        setShowHelpCenter(true);
        showSuccess("Help Center", "Opening help center...");
        break;
      case 'help-center':
        setShowHelpCenter(true);
        showSuccess("Help Center", "Opening help center...");
        break;
      default:
        break;
    }
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
                  onClick={() => {
                    // Clear the redirect logic so user can visit home
                    sessionStorage.setItem('hasVisitedHome', 'true');
                    navigate('/?stay=true');
                  }}
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
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
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
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('live-chat')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Live Chat Session
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('search-customer')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Customer History
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('knowledge-base')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Knowledge Base
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('help-center')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Your performance metrics this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tickets Handled</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">{myTickets?.length || 0}</span>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resolution Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">
                      {myTickets?.length ? Math.round((myTickets.filter(t => t.status === 'resolved').length / myTickets.length) * 100) : 0}%
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Response Time</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">12 min</span>
                    <Timer className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">4.7</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Types Breakdown</CardTitle>
                <CardDescription>Distribution of ticket types you handle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['technical', 'billing', 'general', 'account'].map((type) => {
                  const count = myTickets?.filter(t => t.complaint_type === type).length || 0;
                  const percentage = myTickets?.length ? Math.round((count / myTickets.length) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{type}</Badge>
                        <span className="text-sm text-muted-foreground">{count} tickets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CS Preferences</CardTitle>
                <CardDescription>Customize your customer service settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-assign tickets</label>
                    <p className="text-xs text-muted-foreground">Automatically assign new tickets to you</p>
                  </div>
                  <Switch
                    checked={csSettings.autoAssignTickets}
                    onCheckedChange={(checked) => 
                      setCsSettings(prev => ({ ...prev, autoAssignTickets: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Email notifications</label>
                    <p className="text-xs text-muted-foreground">Get notified about new tickets</p>
                  </div>
                  <Switch
                    checked={csSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setCsSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Response templates</label>
                    <p className="text-xs text-muted-foreground">Manage your quick response templates</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => showSuccess("Templates", "Template management coming soon!")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
                <Button 
                  className="w-full" 
                  onClick={saveSettings}
                  disabled={saveSettingsMutation.isPending}
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your CS account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input 
                    value={csSettings.displayName}
                    onChange={(e) => setCsSettings(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Message</label>
                  <Input 
                    value={csSettings.statusMessage}
                    onChange={(e) => setCsSettings(prev => ({ ...prev, statusMessage: e.target.value }))}
                    placeholder="Enter your status message"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Working Hours</label>
                  <Select 
                    value={csSettings.workingHours}
                    onValueChange={(value) => setCsSettings(prev => ({ ...prev, workingHours: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9-5">9 AM - 5 PM</SelectItem>
                      <SelectItem value="24-7">24/7 Available</SelectItem>
                      <SelectItem value="custom">Custom Hours</SelectItem>
                      <SelectItem value="flexible">Flexible Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full"
                  onClick={saveSettings}
                  disabled={saveSettingsMutation.isPending}
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {/* Current Settings Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Current Settings</CardTitle>
                <CardDescription>Preview of your current CS configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Auto-assign</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {csSettings.autoAssignTickets ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {csSettings.emailNotifications ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Display Name</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {csSettings.displayName}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Working Hours</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {csSettings.workingHours === '9-5' ? '9 AM - 5 PM' :
                       csSettings.workingHours === '24-7' ? '24/7 Available' :
                       csSettings.workingHours === 'custom' ? 'Custom Hours' :
                       'Flexible Schedule'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* Live Chat Modal */}
      <Dialog open={showLiveChat} onOpenChange={setShowLiveChat}>
        <DialogContent className="max-w-4xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Live Chat Session
            </DialogTitle>
            <DialogDescription>
              Manage real-time customer conversations
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
            {/* Chat List */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Active Chats</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Customer {i}</p>
                        <p className="text-xs text-muted-foreground">Property inquiry...</p>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">Online</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat Window */}
            <div className="lg:col-span-2 border rounded-lg flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Customer 1</h4>
                    <p className="text-sm text-muted-foreground">Online • Property inquiry</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-xs">
                    <p className="text-sm">Hi, I'm interested in the property listing on Jalan Sudirman. Can you provide more details?</p>
                    <p className="text-xs text-muted-foreground mt-1">2:30 PM</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                    <p className="text-sm">Hello! I'd be happy to help you with that property. Let me get the details for you.</p>
                    <p className="text-xs text-blue-100 mt-1">2:32 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Type your message..." className="flex-1" />
                  <Button size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Center Modal */}
      <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
        <DialogContent className="max-w-4xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </DialogTitle>
            <DialogDescription>
              Access knowledge base and support resources
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px] overflow-y-auto">
            {/* Quick Help Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Help</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Property Listings", desc: "Help with property management", icon: FileText },
                  { title: "Customer Inquiries", desc: "Handling customer questions", icon: MessageSquare },
                  { title: "Ticket Resolution", desc: "Best practices for tickets", icon: CheckCircle },
                  { title: "System Navigation", desc: "Using the CS dashboard", icon: Settings },
                ].map((item, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
                    <div className="flex items-start gap-3">
                      <item.icon className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {[
                  { q: "How do I assign a ticket to myself?", a: "Go to Available tab and click 'Take' on any unassigned ticket." },
                  { q: "What's the best response time?", a: "Aim to respond within 15 minutes for optimal customer satisfaction." },
                  { q: "How do I escalate a complex issue?", a: "Use the priority settings and contact your supervisor if needed." },
                  { q: "Can I create response templates?", a: "Yes, go to Settings > Response Templates to manage your templates." },
                ].map((item, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{item.q}</h4>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowHelpCenter(false)}>
              Close
            </Button>
            <Button onClick={() => window.open('https://docs.astravilla.com', '_blank')}>
              <FileText className="h-4 w-4 mr-2" />
              Full Documentation
            </Button>
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