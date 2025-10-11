
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Building2, 
  Settings,
  Activity,
  AlertTriangle,
  Bell,
  User,
  LogOut,
  Clock,
  RefreshCw,
  UserCog,
  Database,
  Monitor,
  ChevronDown,
  Home,
  X,
  Eye,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminAlertBadge from "./AdminAlertBadge";
import EnhancedAlertBadge from "./EnhancedAlertBadge";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  action_required: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

interface AdminDashboardHeaderProps {
  isAdmin: boolean;
  user: any;
  profile: any;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AdminDashboardHeader = ({ isAdmin, user, profile, activeTab, onTabChange }: AdminDashboardHeaderProps) => {
  const { signOut, extendSession } = useAuth();
  const navigate = useNavigate();
  const [sessionTime, setSessionTime] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const queryClient = useQueryClient();
  const { isMobile } = useIsMobile();

  // Fetch admin counts for badge - use same query key as other components
  const { data: unreadCountData = 0 } = useQuery({
    queryKey: ['admin-alerts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('admin_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (error) {
        console.error('Error fetching alert count:', error);
        return 0;
      }
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch other admin counts
  const { data: adminCounts = { pendingTasks: 0, systemIssues: 0 } } = useQuery({
    queryKey: ['admin-other-counts', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return { pendingTasks: 0, systemIssues: 0 };
      
      const counts = {
        pendingTasks: 0,
        systemIssues: 0,
      };

      try {
        // Get pending tasks (you can adjust this query based on your needs)
        const { count: tasksCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending');
        counts.pendingTasks = tasksCount || 0;

        // Get system issues count (example query)
        const { count: issuesCount } = await supabase
          .from('admin_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'system_issue')
          .eq('action_required', true);
        counts.systemIssues = issuesCount || 0;
      } catch (error) {
        console.error('Error fetching admin counts:', error);
      }

      return counts;
    },
    enabled: !!user?.id && isAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const updateSessionTime = () => {
      const loginTime = localStorage.getItem('login_time');
      
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setSessionTime(`${hours}h ${minutes}m`);
        } else {
          setSessionTime(`${minutes}m`);
        }
      }
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('AdminDashboardHeader: Fast sign out initiated...');
      setShowProfile(false);
      await signOut();
    } catch (error) {
      console.error('AdminDashboardHeader: Error signing out:', error);
    }
  };

  const handleExtendSession = async () => {
    try {
      await extendSession();
      toast.success('Session extended successfully! You can continue working.');
    } catch (error) {
      console.error('Error extending session:', error);
      toast.error('Failed to extend session');
    }
  };

  const handleProfileClick = () => {
    console.log('Opening profile dialog...');
    setShowProfile(true);
  };

  // Get proper display name and email
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Administrator';
  const displayEmail = user?.email || 'admin@astra.com';
  const userRole = profile?.role || 'admin';

  // Calculate total badge count using consistent unread count
  const unreadCount = typeof unreadCountData === 'number' ? unreadCountData : 0;
  
  const getTotalBadgeCount = () => {
    return unreadCount + adminCounts.pendingTasks + adminCounts.systemIssues;
  };

  const badgeCount = getTotalBadgeCount();

  return (
    <TooltipProvider>
      <div className="sticky top-0 left-0 right-0 z-[10000] header-ios border-b border-border backdrop-blur-xl shadow-lg transform-gpu will-change-transform animate-fade-in bg-background/95">
        <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-12 xl:px-16">
          <div className={`flex items-center justify-between ${isMobile ? 'h-12' : 'h-14'}`}>
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-primary to-blue-600 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                <Shield className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-white animate-pulse`} />
              </div>
              {!isMobile && (
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">ASTRA</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">Villa</span>
                </div>
              )}
            </div>

            {/* Main Admin Functions Menu - Mobile Responsive */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="default" 
                    size={isMobile ? "sm" : "lg"} 
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isMobile ? (
                      <>
                        <Settings className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </>
                    ) : (
                      <>
                        🚀 All Admin Functions
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align={isMobile ? "end" : "center"} 
                  className={`${isMobile ? 'w-80' : 'w-96'} max-h-[70vh] overflow-y-auto bg-background border-2 border-border shadow-2xl rounded-xl z-[9999]`}
                  sideOffset={5}
                >
                <div className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground p-3 rounded-t-xl">
                  <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>Admin Control Center</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>Access all administrative functions</p>
                </div>
                
                <ScrollArea className={isMobile ? "max-h-80" : "max-h-96"}>
                  <div className={`${isMobile ? 'p-2' : 'p-3'} space-y-2`}>
                    
                    {/* Analytics & Reports */}
                    <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded-lg">
                      <div className={`px-2 py-1 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide`}>📊 Analytics & Reports</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('analytics')} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded cursor-pointer`}>
                        📈 Analytics Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('diagnostic')} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded cursor-pointer`}>
                        🔍 System Diagnostics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('reports')} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded cursor-pointer`}>
                        📋 System Reports
                      </DropdownMenuItem>
                    </div>
                    
                    {/* User Management */}
                    <div className="bg-green-50 dark:bg-green-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">👥 User Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('user-management')} className="flex items-center gap-2 text-sm hover:bg-green-100 dark:hover:bg-green-900/50 rounded">
                        👤 User Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('kyc-review')} className="flex items-center gap-2 text-sm hover:bg-green-100 dark:hover:bg-green-900/50 rounded">
                        📋 KYC Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('kyc-analytics')} className="flex items-center gap-2 text-sm hover:bg-green-100 dark:hover:bg-green-900/50 rounded">
                        📊 KYC Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('bulk-kyc')} className="flex items-center gap-2 text-sm hover:bg-green-100 dark:hover:bg-green-900/50 rounded">
                        📦 Bulk KYC Processing
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Business Management */}
                    <div className="bg-purple-50 dark:bg-purple-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">🏢 Business Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('property-management')} className="flex items-center gap-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded">
                        🏢 Property Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('vendor-management')} className="flex items-center gap-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded">
                        🛠️ Vendor Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('locations')} className="flex items-center gap-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded">
                        📍 Location Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('content')} className="flex items-center gap-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded">
                        📝 Content Management
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Support & Communication */}
                    <div className="bg-yellow-50 dark:bg-yellow-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">💬 Support & Communication</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('customer-service')} className="flex items-center gap-2 text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded">
                        💬 Support Center
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('cs-control')} className="flex items-center gap-2 text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded">
                        🎛️ CS Control Panel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('contacts')} className="flex items-center gap-2 text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded">
                        📞 Contact Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('feedback')} className="flex items-center gap-2 text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded">
                        ⭐ Feedback System
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Financial */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">💰 Financial Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('billing')} className="flex items-center gap-2 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded">
                        💰 Billing Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('payment-config')} className="flex items-center gap-2 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded">
                        🏦 Payment Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('booking-payments')} className="flex items-center gap-2 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded">
                        💳 Booking Payments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('bpjs-api')} className="flex items-center gap-2 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded">
                        🏥 BPJS API Integration
                      </DropdownMenuItem>
                    </div>
                    
                    {/* AI & Automation */}
                    <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">🤖 AI & Automation</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('ai-bots')} className="flex items-center gap-2 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded">
                        🤖 AI Bot Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('ai-assistant')} className="flex items-center gap-2 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded">
                        🧠 AI Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('document-ocr')} className="flex items-center gap-2 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded">
                        🔍 Document OCR
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Core Management */}
                    <div className="bg-orange-50 dark:bg-orange-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">🎯 Core Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('property-filters')} className="flex items-center gap-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded">
                        🔧 Property Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('rent-filters')} className="flex items-center gap-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded">
                        🏠 Rent Property Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('sale-filters')} className="flex items-center gap-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded">
                        💰 Sale Property Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('new-project-filters')} className="flex items-center gap-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded">
                        🏗️ New Project Filters
                      </DropdownMenuItem>
                    </div>
                    
                    {/* System Configuration */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">⚙️ System Configuration</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('settings')} className="flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        ⚙️ System Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('tools-management')} className="flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        🔧 Tools Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('api-configuration')} className="flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        ⚡ API Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('database')} className="flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        💾 Database Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('smtp-settings')} className="flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        📧 SMTP Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('seo-settings')} className="flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        🔍 SEO Configuration
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Security & Monitoring */}
                    <div className="bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">🛡️ Security & Monitoring</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('security-monitor')} className="flex items-center gap-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/50 rounded">
                        🛡️ Security Monitor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('auth-monitor')} className="flex items-center gap-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/50 rounded">
                        🔐 Auth Monitor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('alert-system')} className="flex items-center gap-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/50 rounded">
                        🚨 Alert System
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('error-reporting')} className="flex items-center gap-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/50 rounded">
                        ⚠️ Error Reports
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Search & Filters */}
                    <div className="bg-cyan-50 dark:bg-cyan-950/50 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">🔍 Search & Tools</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('search-filters')} className="flex items-center gap-2 text-sm hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded">
                        🔍 Advanced Search Filters
                      </DropdownMenuItem>
                    </div>
                    
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            
            <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
              {/* Status Badge */}
              <Badge variant="outline" className="hidden sm:flex bg-green-500/20 text-green-600 dark:text-green-400 border-green-400/50 px-2 py-0.5 text-xs backdrop-blur-sm">
                <Activity className="h-2 w-2 mr-1" />
                Online
              </Badge>
              
              {sessionTime && (
                <Badge 
                  variant="outline" 
                  className="hidden md:flex bg-primary/20 text-primary border-primary/50 px-2 py-0.5 text-xs cursor-pointer hover:bg-primary/30 backdrop-blur-sm animate-scale-in"
                  onClick={handleExtendSession}
                  title="Click to extend session"
                >
                  <Clock className="h-2 w-2 mr-1" />
                  {sessionTime}
                </Badge>
              )}

              {/* Enhanced Home Button */}
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="w-11 h-11 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg animate-scale-in"
              >
                <Home className="h-5 w-5" />
              </Button>

              {/* Theme Switcher */}
              <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
                <ThemeSwitcher variant="compact" />
              </div>

              {/* Enhanced Alerts Button */}
              <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
                <EnhancedAlertBadge />
              </div>

              {/* Admin Control Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                       variant="ghost"
                       size="sm"
                       className="relative w-12 h-12 p-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                     >
                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                         <UserCog className="h-5 w-5 text-white drop-shadow-sm" />
                       </div>
                      
                      {/* Badge Count */}
                      {badgeCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                    <div className="text-center">
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-gray-300">{userRole} • {sessionTime || '0m'}</p>
                      {badgeCount > 0 && (
                        <p className="text-xs text-orange-300 mt-1">{badgeCount} pending items</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{displayEmail}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{userRole} Access</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                
                {/* Profile Management */}
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Admin Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/wallet')}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
                
                {/* System Management */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Database className="h-4 w-4 mr-2" />
                    System Management
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                    <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Building2 className="h-4 w-4 mr-2" />
                      Property Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                
                {/* Session Management */}
                <DropdownMenuItem 
                  onClick={handleExtendSession}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session ({sessionTime})
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </div>

        {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Admin Profile Management</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-gray-100">{displayEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <p className="text-gray-900 dark:text-gray-100">{displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <p className="text-gray-900 dark:text-gray-100 capitalize">{userRole}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Duration</label>
              <p className="text-gray-900 dark:text-gray-100">{sessionTime || '0m'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600">
                Active
              </Badge>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={handleExtendSession} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminDashboardHeader;
