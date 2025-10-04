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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                </Button>

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
