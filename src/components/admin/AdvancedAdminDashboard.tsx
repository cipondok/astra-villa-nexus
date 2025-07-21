
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Activity, Globe, Users, FileText, TrendingUp, Home, Settings, Building, Store, Shield, Loader2, Crown, Zap, Database, MessageSquare, AlertTriangle, Monitor, Blocks, Bell, Wrench } from "lucide-react";
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagementHub from './VendorManagementHub';
import SystemSettings from './SystemSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import LoadingPageCustomization from './LoadingPageCustomization';
import SimpleThemeToggle from '@/components/SimpleThemeToggle';
import APIConfiguration from './APIConfiguration';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import AdminDashboardContent from './AdminDashboardContent';
import CompactAdminNavigation from './CompactAdminNavigation';
import RealTimeDashboardStats from './RealTimeDashboardStats';
import ModernTreeNavigation from './ModernTreeNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  console.log('AdvancedAdminDashboard - Current active tab:', activeTab);

  const handleTabChange = (tab: string) => {
    console.log('AdvancedAdminDashboard - Tab changed to:', tab);
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  // Real header counts with basic state
  const [headerCounts, setHeaderCounts] = React.useState({ 
    users: 0, properties: 0, alerts: 0, vendors: 0 
  });

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [users, properties] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id', { count: 'exact', head: true })
        ]);
        
        setHeaderCounts({
          users: users.count || 0,
          properties: properties.count || 0,
          alerts: 0, // Will be updated when admin_alerts table is available
          vendors: 0  // Will be updated when vendor table is available
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen admin-bg text-foreground transition-colors duration-300 flex flex-col">
      {/* HUD Header */}
      <header className="hud-border border-b-2 border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 relative overflow-hidden">
        <div className="data-stream"></div>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full pulse-dot"></div>
                <span className="hud-text font-bold text-xl">ASTRA</span>
                <span className="hud-accent text-sm">ADMIN</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  className="hud-text hover:hud-accent transition-colors text-sm flex items-center gap-2"
                  onClick={() => handleTabChange('overview')}
                >
                  DASHBOARD
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    LIVE
                  </Badge>
                </button>
                <button 
                  className="hud-text hover:hud-accent transition-colors text-sm flex items-center gap-2"
                  onClick={() => handleTabChange('analytics')}
                >
                  ANALYTICS
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                    {headerCounts.properties}
                  </Badge>
                </button>
                <button 
                  className="hud-text hover:hud-accent transition-colors text-sm flex items-center gap-2"
                  onClick={() => handleTabChange('user-management')}
                >
                  USERS
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                    {headerCounts.users}
                  </Badge>
                </button>
                <button 
                  className="hud-text hover:hud-accent transition-colors text-sm flex items-center gap-2"
                  onClick={() => handleTabChange('admin-alerts')}
                >
                  ALERTS
                  {headerCounts.alerts > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 text-xs animate-pulse">
                      {headerCounts.alerts}
                    </Badge>
                  )}
                  <Bell className="h-3 w-3" />
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="hud-accent text-xs">ACTIVE USERS</div>
                <div className="hud-text text-sm font-mono">{headerCounts.users}</div>
              </div>
              <div className="text-right">
                <div className="hud-accent text-xs">PROPERTIES</div>
                <div className="hud-text text-sm font-mono">{headerCounts.properties}</div>
              </div>
              <div className="text-right">
                <div className="hud-accent text-xs">STATUS</div>
                <div className="hud-text text-sm font-mono flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                  SECURE
                </div>
              </div>
              <SimpleThemeToggle />
              
              {/* User Menu with Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hud-border hud-text hover:hud-accent">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.full_name || user?.email || 'Admin'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name || 'Administrator'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/?from=admin')}>
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Real-time Dashboard Stats */}
        <RealTimeDashboardStats />
        
        <div className="flex flex-col space-y-6">
          {/* Modern Tree Navigation */}
          <div className="sticky top-0 z-40">
            <ModernTreeNavigation 
              activeTab={activeTab}
              onTabChange={handleTabChange}
              headerCounts={headerCounts}
            />
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="hidden">
              <CompactAdminNavigation 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                isAdmin={isAdmin} 
              />
            </div>
            
            <div className="hud-border hud-glow p-6 shadow-lg">
              <AdminDashboardContent activeSection={activeTab} onSectionChange={handleTabChange} />
            </div>
          </Tabs>
        </div>
      </div>

      {/* HUD Footer */}
      <footer className="hud-border border-t-2 border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="hud-text font-semibold text-sm">SYSTEM INFO</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="hud-accent">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Build:</span>
                  <span className="hud-accent">20240708</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="hud-accent">99.9%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="hud-text font-semibold text-sm">PERFORMANCE</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-green-400">12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory:</span>
                  <span className="text-green-400">2.1GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="hud-text font-semibold text-sm">SECURITY</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Firewall:</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SSL:</span>
                  <span className="text-green-400">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Auth:</span>
                  <span className="text-green-400">Secure</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="hud-text font-semibold text-sm">QUICK ACCESS</h4>
              <div className="flex flex-wrap gap-2">
                <button className="hud-border px-2 py-1 text-xs hud-text hover:hud-accent transition-colors">
                  LOGS
                </button>
                <button className="hud-border px-2 py-1 text-xs hud-text hover:hud-accent transition-colors">
                  BACKUP
                </button>
                <button className="hud-border px-2 py-1 text-xs hud-text hover:hud-accent transition-colors">
                  RESTART
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-cyan-400/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                <span className="text-xs text-gray-400">All Systems Operational</span>
              </div>
              <div className="text-xs text-gray-400">
                Last Updated: {new Date().toLocaleString()}
              </div>
            </div>
            <div className="text-xs hud-accent">
              © 2024 ASTRA ADMIN INTERFACE - CLASSIFIED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdvancedAdminDashboard;
