import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAlert } from "@/contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Phone,
  Search,
  Timer,
  TrendingUp,
  Users,
  Award,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Moon,
  Sun,
  Send,
  Star,
  FileText,
  BarChart3,
  CheckCircle,
  User,
  MessageSquare,
  Clock
} from "lucide-react";
import LiveChatManager from "./LiveChatManager";
import CSNavSidebar from "./cs/CSNavSidebar";
import CSQuickStats from "./cs/CSQuickStats";
import CSTicketsTable from "./cs/CSTicketsTable";
import CSInquiriesTable from "./cs/CSInquiriesTable";
import CSSettings from "./cs/CSSettings";
import DraggableLiveChatStatus from "./cs/DraggableLiveChatStatus";

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
  
  const [csSettings, setCsSettings] = useState({
    autoAssignTickets: true,
    emailNotifications: true,
    displayName: "Customer Service Agent",
    statusMessage: "Available for support",
    workingHours: "9-5",
  });
  
  // Live Chat State
  const [selectedChatSession, setSelectedChatSession] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

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


  // Calculate stats
  const myOpenTickets = myTickets?.filter(t => t.status !== 'resolved').length || 0;
  const myResolvedToday = myTickets?.filter(t => 
    t.status === 'resolved' && 
    new Date(t.updated_at).toDateString() === new Date().toDateString()
  ).length || 0;
  const pendingInquiries = inquiries?.length || 0;
  const availableTickets = unassignedTickets?.length || 0;


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CSNavSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myOpenTickets={myOpenTickets}
          pendingInquiries={pendingInquiries}
          availableTickets={availableTickets}
        />
        
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
                {/* Static status removed - now using draggable version */}
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">

      {/* Quick Stats */}
      <CSQuickStats 
        myOpenTickets={myOpenTickets}
        myResolvedToday={myResolvedToday}
        pendingInquiries={pendingInquiries}
        availableTickets={availableTickets}
      />

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
          <CSTicketsTable 
            tickets={myTickets}
            isLoading={myTicketsLoading}
            type="my-tickets"
            onReply={(ticket) => setReplyDialog({ open: true, item: ticket })}
          />
        </TabsContent>

        {/* Inquiries */}
        <TabsContent value="inquiries" className="space-y-4">
          <CSInquiriesTable 
            inquiries={inquiries}
            isLoading={inquiriesLoading}
            onReply={(inquiry) => setReplyDialog({ open: true, item: inquiry })}
          />
        </TabsContent>

        {/* Available Tickets */}
        <TabsContent value="available" className="space-y-4">
          <CSTicketsTable 
            tickets={unassignedTickets}
            isLoading={unassignedLoading}
            type="available"
            onAssign={(ticketId) => assignTicketMutation.mutate(ticketId)}
            isAssigning={assignTicketMutation.isPending}
          />
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
          <CSSettings 
            settings={csSettings}
            onSettingsChange={setCsSettings}
            onSave={saveSettings}
            isSaving={saveSettingsMutation.isPending}
          />
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

      {/* Live Chat Manager */}
      <LiveChatManager 
        isOpen={showLiveChat} 
        onClose={() => setShowLiveChat(false)} 
      />

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
        
        {/* Draggable Live Chat Status */}
        <DraggableLiveChatStatus 
          isOnline={true} 
          onOpenChat={() => setShowLiveChat(true)}
          activeChatCount={0} // You can connect this to actual chat count later
        />
      </div>
    </SidebarProvider>
  );
};

export default CustomerServiceDashboard;