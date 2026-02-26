
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
      if (error) return 0;
      return count || 0;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60000,
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
        const [tasksResult, issuesResult] = await Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
          supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('type', 'system_issue').eq('action_required', true),
        ]);
        counts.pendingTasks = tasksResult.count || 0;
        counts.systemIssues = issuesResult.count || 0;
      } catch {
        // silently return defaults
      }

      return counts;
    },
    enabled: !!user?.id && isAdmin,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
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
    setShowProfile(false);
    await signOut().catch(() => {});
  };

  const handleExtendSession = async () => {
    try {
      await extendSession();
      toast.success('Session extended successfully! You can continue working.');
    } catch {
      toast.error('Failed to extend session');
    }
  };

  const handleProfileClick = () => {
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
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-primary to-accent backdrop-blur-sm border border-primary-foreground/30 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                <Shield className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-primary-foreground animate-pulse`} />
              </div>
              {!isMobile && (
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">ASTRA</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">Villa</span>
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
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                <div className="bg-primary text-primary-foreground p-3 rounded-t-xl">
                  <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>Admin Control Center</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>Access all administrative functions</p>
                </div>
                
                <ScrollArea className={isMobile ? "max-h-80" : "max-h-96"}>
                  <div className={`${isMobile ? 'p-2' : 'p-3'} space-y-2`}>
                    
                    {/* Analytics & Reports */}
                    <div className="bg-chart-2/10 border border-chart-2/20 p-2 rounded-lg">
                      <div className={`px-2 py-1 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-chart-2 uppercase tracking-wide`}>📊 Analytics & Reports</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('analytics')} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} hover:bg-chart-2/10 rounded cursor-pointer`}>
                        📈 Analytics Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('diagnostic')} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} hover:bg-chart-2/10 rounded cursor-pointer`}>
                        🔍 System Diagnostics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('reports')} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} hover:bg-chart-2/10 rounded cursor-pointer`}>
                        📋 System Reports
                      </DropdownMenuItem>
                    </div>
                    
                    {/* User Management */}
                    <div className="bg-chart-1/10 border border-chart-1/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-chart-1 uppercase tracking-wide">👥 User Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('user-management')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        👤 User Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('kyc-review')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        📋 KYC Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('kyc-analytics')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        📊 KYC Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('bulk-kyc')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        📦 Bulk KYC Processing
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Business Management */}
                    <div className="bg-chart-4/10 border border-chart-4/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-chart-4 uppercase tracking-wide">🏢 Business Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('property-management')} className="flex items-center gap-2 text-sm hover:bg-chart-4/10 rounded">
                        🏢 Property Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('vendor-management')} className="flex items-center gap-2 text-sm hover:bg-chart-4/10 rounded">
                        🛠️ Vendor Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('locations')} className="flex items-center gap-2 text-sm hover:bg-chart-4/10 rounded">
                        📍 Location Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('content')} className="flex items-center gap-2 text-sm hover:bg-chart-4/10 rounded">
                        📝 Content Management
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Support & Communication */}
                    <div className="bg-chart-3/10 border border-chart-3/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-chart-3 uppercase tracking-wide">💬 Support & Communication</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('customer-service')} className="flex items-center gap-2 text-sm hover:bg-chart-3/10 rounded">
                        💬 Support Center
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('cs-control')} className="flex items-center gap-2 text-sm hover:bg-chart-3/10 rounded">
                        🎛️ CS Control Panel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('contacts')} className="flex items-center gap-2 text-sm hover:bg-chart-3/10 rounded">
                        📞 Contact Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('feedback')} className="flex items-center gap-2 text-sm hover:bg-chart-3/10 rounded">
                        ⭐ Feedback System
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Financial */}
                    <div className="bg-chart-1/10 border border-chart-1/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-chart-1 uppercase tracking-wide">💰 Financial Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('billing')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        💰 Billing Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('payment-config')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        🏦 Payment Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('booking-payments')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        💳 Booking Payments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('bpjs-api')} className="flex items-center gap-2 text-sm hover:bg-chart-1/10 rounded">
                        🏥 BPJS API Integration
                      </DropdownMenuItem>
                    </div>
                    
                    {/* AI & Automation */}
                    <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-primary uppercase tracking-wide">🤖 AI & Automation</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('ai-bots')} className="flex items-center gap-2 text-sm hover:bg-primary/10 rounded">
                        🤖 AI Bot Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('ai-assistant')} className="flex items-center gap-2 text-sm hover:bg-primary/10 rounded">
                        🧠 AI Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('document-ocr')} className="flex items-center gap-2 text-sm hover:bg-primary/10 rounded">
                        🔍 Document OCR
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Core Management */}
                    <div className="bg-chart-5/10 border border-chart-5/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-chart-5 uppercase tracking-wide">🎯 Core Management</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('property-filters')} className="flex items-center gap-2 text-sm hover:bg-chart-5/10 rounded">
                        🔧 Property Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('rent-filters')} className="flex items-center gap-2 text-sm hover:bg-chart-5/10 rounded">
                        🏠 Rent Property Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('sale-filters')} className="flex items-center gap-2 text-sm hover:bg-chart-5/10 rounded">
                        💰 Sale Property Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('new-project-filters')} className="flex items-center gap-2 text-sm hover:bg-chart-5/10 rounded">
                        🏗️ New Project Filters
                      </DropdownMenuItem>
                    </div>
                    
                    {/* System Configuration */}
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">⚙️ System Configuration</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('settings')} className="flex items-center gap-2 text-sm hover:bg-accent rounded">
                        ⚙️ System Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('tools-management')} className="flex items-center gap-2 text-sm hover:bg-accent rounded">
                        🔧 Tools Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('api-configuration')} className="flex items-center gap-2 text-sm hover:bg-accent rounded">
                        ⚡ API Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('database')} className="flex items-center gap-2 text-sm hover:bg-accent rounded">
                        💾 Database Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('smtp-settings')} className="flex items-center gap-2 text-sm hover:bg-accent rounded">
                        📧 SMTP Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('seo-settings')} className="flex items-center gap-2 text-sm hover:bg-accent rounded">
                        🔍 SEO Hub
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Security & Monitoring */}
                    <div className="bg-destructive/10 border border-destructive/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-destructive uppercase tracking-wide">🛡️ Security & Monitoring</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('live-monitoring')} className="flex items-center gap-2 text-sm hover:bg-destructive/10 rounded">
                        📡 Live Monitoring
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('security-monitoring')} className="flex items-center gap-2 text-sm hover:bg-destructive/10 rounded">
                        🛡️ Security Monitor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('authorization-monitoring')} className="flex items-center gap-2 text-sm hover:bg-destructive/10 rounded">
                        🔐 Auth Monitor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('admin-alerts')} className="flex items-center gap-2 text-sm hover:bg-destructive/10 rounded">
                        🚨 Alert System
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTabChange?.('error-monitoring')} className="flex items-center gap-2 text-sm hover:bg-destructive/10 rounded">
                        ⚠️ Error Reports
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Search & Filters */}
                    <div className="bg-chart-2/10 border border-chart-2/20 p-2 rounded-lg">
                      <div className="px-2 py-1 text-xs font-bold text-chart-2 uppercase tracking-wide">🔍 Search & Tools</div>
                      <DropdownMenuItem onClick={() => onTabChange?.('search-filters')} className="flex items-center gap-2 text-sm hover:bg-chart-2/10 rounded">
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
              <Badge variant="outline" className="hidden sm:flex bg-chart-1/20 text-chart-1 border-chart-1/50 px-2 py-0.5 text-xs backdrop-blur-sm">
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
                className="w-11 h-11 p-0 rounded-xl bg-background/20 hover:bg-background/30 hover:scale-105 transition-all duration-200 border border-border/30 text-foreground shadow-lg animate-scale-in"
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
                       className="relative w-12 h-12 p-0 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                     >
                       <div className="w-10 h-10 bg-gradient-to-br from-primary via-chart-4 to-chart-5 rounded-full flex items-center justify-center shadow-lg ring-2 ring-border/20">
                          <UserCog className="h-5 w-5 text-primary-foreground drop-shadow-sm" />
                       </div>
                      
                      {/* Badge Count */}
                      {badgeCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs animate-pulse">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                   <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
                    <div className="text-center">
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{userRole} • {sessionTime || '0m'}</p>
                      {badgeCount > 0 && (
                        <p className="text-xs text-chart-3 mt-1">{badgeCount} pending items</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card border border-border z-50">
                <DropdownMenuLabel className="text-card-foreground">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                    <p className="text-xs text-chart-2 capitalize">{userRole} Access</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                
                {/* Profile Management */}
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="text-foreground hover:bg-accent cursor-pointer"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Admin Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/wallet')}
                  className="text-foreground hover:bg-accent cursor-pointer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
                
                {/* System Management */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-foreground hover:bg-accent">
                    <Database className="h-4 w-4 mr-2" />
                    System Management
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-card border border-border z-50">
                    <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                      <Building2 className="h-4 w-4 mr-2" />
                      Property Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator className="bg-border" />
                
                {/* Session Management */}
                <DropdownMenuItem 
                  onClick={handleExtendSession}
                  className="text-foreground hover:bg-accent cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session ({sessionTime})
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border" />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-destructive hover:bg-destructive/10 cursor-pointer"
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
        <DialogContent className="bg-card text-card-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Admin Profile Management</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{displayEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-foreground">{displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-foreground capitalize">{userRole}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Session Duration</label>
              <p className="text-foreground">{sessionTime || '0m'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30">
                Active
              </Badge>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={handleExtendSession}>
                <Clock className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
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
