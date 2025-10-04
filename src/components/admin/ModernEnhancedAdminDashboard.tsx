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

const ModernEnhancedAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const { theme, setTheme } = useTheme();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Mock notifications - you can replace this with real data from your admin_alerts table
  const notifications = [
    { id: 1, title: "New user registration", time: "5 mins ago", type: "info" },
    { id: 2, title: "System update available", time: "1 hour ago", type: "warning" },
    { id: 3, title: "Database backup completed", time: "2 hours ago", type: "success" },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-2" />
              
              {/* Breadcrumb */}
              <div className="flex-1">
                <AdminBreadcrumb 
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-3">
                <AdminCommandPalette onSectionChange={setActiveSection} />
                
                {/* Notifications Dropdown */}
                <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative"
                      title="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setActiveSection('admin-alerts')}>
                          View All
                        </Button>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3">
                          <div className="flex items-start justify-between w-full">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {/* Profile Dropdown */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.full_name || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{profile?.role || 'Administrator'}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveSection('system-settings')}
                      title="System Settings"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <Bell className="h-4 w-4 mr-2" />
                      Go to Home
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
