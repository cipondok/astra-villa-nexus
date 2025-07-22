
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Activity, Globe, Users, FileText, TrendingUp, Home, Settings, Building, Store, Shield, Loader2, Crown, Zap, Database, MessageSquare, AlertTriangle, Monitor, Blocks, Bell, Wrench } from "lucide-react";
import SystemDiagnostics from './SystemDiagnostics';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagementHub from './VendorManagementHub';
import SystemSettings from './SystemSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import LoadingPageCustomization from './LoadingPageCustomization';
import AnimatedThemeToggle from '@/components/ui/animated-theme-toggle';
import APIConfiguration from './APIConfiguration';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import AdminDashboardContent from './AdminDashboardContent';
import CompactAdminNavigation from './CompactAdminNavigation';
import RealTimeDashboardStats from './RealTimeDashboardStats';
import EnhancedTreeNavigation from './EnhancedTreeNavigation';
import AdminDashboardHeader from './AdminDashboardHeader';
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
import MobileOptimizedLayout from '../MobileOptimizedLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  console.log('AdvancedAdminDashboard - Current active tab:', activeTab);

  // Listen for tab changes from header
  React.useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };
    
    window.addEventListener('admin-tab-change', handleTabChange as EventListener);
    return () => window.removeEventListener('admin-tab-change', handleTabChange as EventListener);
  }, []);

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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Admin Header */}
      <AdminDashboardHeader 
        isAdmin={isAdmin} 
        user={user} 
        profile={profile} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <MobileOptimizedLayout className={`${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
        <div className="space-y-4 sm:space-y-6">
          {/* Main Content */}
          <div className={`space-y-4 ${isMobile ? 'sm:space-y-6' : 'space-y-6'}`}>
            {activeTab === 'overview' && (
              <div className={`space-y-4 ${isMobile ? 'sm:space-y-6' : 'space-y-6'}`}>
                <AdminOverview onSectionChange={handleTabChange} />
              </div>
            )}
          
          {activeTab === 'diagnostic' && <SystemDiagnostics />}
          
            {activeTab === 'tools-management' && (
              <div className={`space-y-4 ${isMobile ? 'sm:space-y-6' : 'space-y-6'}`}>
                <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold flex items-center gap-2`}>
                  <Wrench className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-muted-foreground`} />
                  Tools Management
                </h2>
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} sm:gap-6`}>
                <Card>
                  <CardHeader>
                    <CardTitle>System Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Enable/disable system maintenance tools</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Developer Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Access developer utilities and debugging tools</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Utilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Administrative tools and shortcuts</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeTab === 'user-management' && <UserManagement />}
          {activeTab === 'property-management' && <PropertyManagement />}
          {activeTab === 'vendor-management' && <VendorManagementHub />}
          
          {activeTab === 'astra-tokens' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-500" />
                ASTRA Token Management
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Manage daily check-in rewards and streaks</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Token Balances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">View and manage ASTRA token balances</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Token API Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Configure ASTRA token API endpoints</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'customer-service' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-yellow-500" />
                Customer Service Hub
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Chat Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Manage customer chat sessions and support</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Handle customer inquiries and feedback</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>User Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Send and manage user notifications</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Review customer feedback and ratings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Security Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Monitor login alerts and security events</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Support Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Track support metrics and performance</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics & Reports */}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'reports' && (
            <Card>
              <CardHeader>
                <CardTitle>📋 System Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>System reports coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* KYC Management */}
          {activeTab === 'kyc-review' && (
            <Card>
              <CardHeader>
                <CardTitle>📋 KYC Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>KYC review system coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'kyc-analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>📊 KYC Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>KYC analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'bulk-kyc' && (
            <Card>
              <CardHeader>
                <CardTitle>📦 Bulk KYC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Bulk KYC processing coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Business Management */}
          {activeTab === 'locations' && (
            <Card>
              <CardHeader>
                <CardTitle>📍 Location Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Location management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'content' && (
            <Card>
              <CardHeader>
                <CardTitle>📝 Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Content management system coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Additional Support Functions */}
          {activeTab === 'cs-control' && (
            <Card>
              <CardHeader>
                <CardTitle>🎛️ CS Control Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Customer service control panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'contacts' && (
            <Card>
              <CardHeader>
                <CardTitle>📞 Contact Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Contact management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'feedback' && (
            <Card>
              <CardHeader>
                <CardTitle>⭐ Feedback System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Feedback system coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Financial */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>💰 Billing Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Billing management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'payment-config' && (
            <Card>
              <CardHeader>
                <CardTitle>🏦 Payment Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Payment configuration coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'booking-payments' && (
            <Card>
              <CardHeader>
                <CardTitle>💳 Booking Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Booking payment management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'bpjs-api' && (
            <Card>
              <CardHeader>
                <CardTitle>🏥 BPJS API Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>BPJS API integration coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* AI & Automation */}
          {activeTab === 'ai-bots' && (
            <Card>
              <CardHeader>
                <CardTitle>🤖 AI Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Blocks className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>AI bot management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'ai-assistant' && (
            <Card>
              <CardHeader>
                <CardTitle>🧠 AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>AI assistant features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'document-ocr' && (
            <Card>
              <CardHeader>
                <CardTitle>🔍 Document OCR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Document OCR system coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* System Configuration */}
          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle>💾 Database Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Database management tools coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'smtp-settings' && (
            <Card>
              <CardHeader>
                <CardTitle>📧 SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>SMTP email configuration coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'seo-settings' && (
            <Card>
              <CardHeader>
                <CardTitle>🔍 SEO Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>SEO settings coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Security & Monitoring */}
          {activeTab === 'security-monitor' && (
            <Card>
              <CardHeader>
                <CardTitle>🛡️ Security Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Security monitoring dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'auth-monitor' && (
            <Card>
              <CardHeader>
                <CardTitle>🔐 Authentication Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Authentication monitoring coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'alert-system' && (
            <Card>
              <CardHeader>
                <CardTitle>🚨 Alert System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Alert management system coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Search & Filters */}
          {activeTab === 'search-filters' && (
            <Card>
              <CardHeader>
                <CardTitle>🔍 Search Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Advanced search filters coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api-configuration' && <APIConfiguration />}
          {activeTab === 'error-reporting' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Error Reporting & Diagnostics
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Database Error Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Monitor and resolve database errors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-blue-500" />
                      System Diagnostics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Real-time system health monitoring</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'loading-customization' && <LoadingPageCustomization />}
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
       </MobileOptimizedLayout>
     </div>
   );
 };

 export default AdvancedAdminDashboard;
