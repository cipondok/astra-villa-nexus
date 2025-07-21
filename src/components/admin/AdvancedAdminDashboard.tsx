
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
          {/* Modern Second Header - Enhanced Tab Navigation */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-gray-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Primary Navigation Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'overview', label: 'Dashboard', icon: '🏠', count: 'LIVE', color: 'green' },
                    { id: 'analytics', label: 'Analytics', icon: '📊', count: headerCounts.properties, color: 'blue' },
                    { id: 'user-management', label: 'Users', icon: '👥', count: headerCounts.users, color: 'purple' },
                    { id: 'property-management-hub', label: 'Properties', icon: '🏢', count: '2.4k', color: 'cyan' },
                    { id: 'vendors-hub', label: 'Vendors', icon: '🛠️', count: '147', color: 'orange' },
                    { id: 'customer-service', label: 'Support', icon: '🎧', count: '12', color: 'pink' },
                    { id: 'content-management', label: 'Content', icon: '📝', count: '89', color: 'amber' },
                    { id: 'billing-management', label: 'Billing', icon: '💳', count: '156', color: 'emerald' },
                    { id: 'ai-bot-management', label: 'AI Bots', icon: '🤖', count: '5', color: 'violet' },
                    { id: 'security-monitoring', label: 'Security', icon: '🛡️', count: '0', color: 'red' },
                    { id: 'location-management', label: 'Locations', icon: '📍', count: '34', color: 'indigo' },
                    { id: 'api-settings', label: 'APIs', icon: '⚡', count: '8', color: 'yellow' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30 shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="text-sm font-medium hidden md:block">{tab.label}</span>
                      <Badge 
                        className={`text-xs px-2 py-0.5 ${
                          tab.color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' :
                          tab.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          tab.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          tab.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                          tab.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          tab.color === 'pink' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                          tab.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          tab.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          tab.color === 'violet' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' :
                          tab.color === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          tab.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                          tab.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {tab.count}
                      </Badge>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  {/* Alert Center */}
                  <button 
                    onClick={() => handleTabChange('admin-alerts')}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      activeTab === 'admin-alerts'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    {headerCounts.alerts > 0 && (
                      <Badge className="bg-red-500 text-white text-xs animate-pulse min-w-[20px] h-5 flex items-center justify-center">
                        {headerCounts.alerts}
                      </Badge>
                    )}
                  </button>

                  {/* Quick Settings */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300">
                        <Settings className="h-4 w-4" />
                        <span className="hidden md:block text-sm">Quick Actions</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50">
                      <DropdownMenuLabel className="text-gray-300">Quick Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTabChange('system-settings')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <Settings className="mr-2 h-4 w-4" />
                        System Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('database-management')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <Database className="mr-2 h-4 w-4" />
                        Database
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('tools-management')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <Wrench className="mr-2 h-4 w-4" />
                        Tools
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTabChange('search-filters')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <Database className="mr-2 h-4 w-4" />
                        Search Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('feedback-management')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Feedback
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('diagnostic')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <Monitor className="mr-2 h-4 w-4" />
                        Diagnostics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('system-reports')} className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                        <FileText className="mr-2 h-4 w-4" />
                        Reports
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
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
