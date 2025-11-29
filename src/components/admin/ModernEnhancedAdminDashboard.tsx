import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import AdminDashboardContent from "./AdminDashboardContent";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ModernEnhancedAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const { theme, setTheme } = useTheme();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Fetch unread notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Notification marked as read');
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });

  const handleNotificationClick = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
    setNotificationsOpen(false);
    setActiveSection('admin-alerts');
  };

  const unreadCount = notifications.length;

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        {/* Sidebar */}
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl shadow-sm">
            <div className="flex h-12 items-center gap-3 px-4">
              <SidebarTrigger className="-ml-1 h-8 w-8" />
              
              {/* Breadcrumb */}
              <div className="flex-1">
                <AdminBreadcrumb 
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2">
                <AdminCommandPalette onSectionChange={setActiveSection} />
                
                {/* Notifications Dropdown */}
                <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-8 w-8 hover:bg-primary/10"
                      title="Notifications"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 backdrop-blur-xl bg-background/95 border-border/50">
                    <DropdownMenuLabel className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Notifications ({unreadCount})</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px] px-2" 
                          onClick={() => {
                            setNotificationsOpen(false);
                            setActiveSection('admin-alerts');
                          }}
                        >
                          View All
                        </Button>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((notification) => {
                          const priorityColor = 
                            notification.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                            notification.priority === 'medium' ? 'bg-orange-500/10 text-orange-600' :
                            'bg-primary/10 text-primary';

                          return (
                            <DropdownMenuItem 
                              key={notification.id} 
                              className="flex flex-col items-start py-2 px-3 cursor-pointer hover:bg-accent/50"
                              onClick={() => handleNotificationClick(notification.id)}
                            >
                              <div className="flex items-start justify-between w-full mb-1">
                                <p className="text-xs font-medium flex-1 pr-2 line-clamp-1">{notification.title}</p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${priorityColor}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                                {notification.message}
                              </p>
                              <span className="text-[9px] text-muted-foreground/70">
                                {new Date(notification.created_at).toLocaleString()}
                              </span>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No new notifications
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8">
                      <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl bg-background/95 border-border/50">
                    <DropdownMenuLabel className="py-2">
                      <div className="flex flex-col">
                        <p className="text-xs font-medium">{profile?.full_name || 'Admin'}</p>
                        <p className="text-[10px] text-muted-foreground">{profile?.role || 'Administrator'}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveSection('system-settings')} className="text-xs py-1.5">
                      <Settings className="h-3.5 w-3.5 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/')} className="text-xs py-1.5">
                      <Bell className="h-3.5 w-3.5 mr-2" />
                      Go to Home
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive text-xs py-1.5">
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <AdminDashboardContent 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ModernEnhancedAdminDashboard;
