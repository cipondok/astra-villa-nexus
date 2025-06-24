
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
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminAlertBadge from "./AdminAlertBadge";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
}

const AdminDashboardHeader = ({ isAdmin, user, profile }: AdminDashboardHeaderProps) => {
  const { signOut, extendSession } = useAuth();
  const navigate = useNavigate();
  const [sessionTime, setSessionTime] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as AdminAlert[];
    },
  });

  // Mark alert as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
    },
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      setShowAlertDetails(false);
      setSelectedAlert(null);
      toast.success("Alert deleted successfully");
    },
  });

  // Session monitoring
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
    if (isSigningOut) return;
    
    try {
      console.log('AdminDashboardHeader: Starting sign out process...');
      setIsSigningOut(true);
      
      toast.loading('Signing out...', { duration: 2000 });
      
      setShowProfile(false);
      setShowAlerts(false);
      
      await signOut();
      
    } catch (error) {
      console.error('AdminDashboardHeader: Error signing out:', error);
      setIsSigningOut(false);
      toast.error('Error signing out');
      window.location.href = '/';
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

  const handleAlertsClick = () => {
    console.log('Opening alerts dialog...');
    setShowAlerts(true);
  };

  const handleProfileClick = () => {
    console.log('Opening profile dialog...');
    setShowProfile(true);
  };

  const handleViewAlert = (alert: AdminAlert) => {
    setSelectedAlert(alert);
    setShowAlertDetails(true);
    
    // Mark as read when opened
    if (!alert.is_read) {
      markAsReadMutation.mutate(alert.id);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
      case 'warning':
        return AlertTriangle;
      case 'property':
        return Building2;
      case 'user':
        return Users;
      default:
        return Bell;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-500';
    if (type === 'error' || type === 'warning') return 'text-orange-500';
    if (type === 'success') return 'text-green-500';
    return 'text-blue-500';
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  {isAdmin ? "Admin Control Panel" : "Support Dashboard"}
                </h1>
                <p className="text-blue-100 text-lg mt-1">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-4 py-2">
                <User className="h-4 w-4 mr-2" />
                {isAdmin ? "System Administrator" : "Support Staff"}
              </Badge>
              
              <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-300/30 px-4 py-2">
                <Activity className="h-4 w-4 mr-2" />
                Online
              </Badge>
              
              {sessionTime && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-500/20 text-blue-100 border-blue-300/30 px-4 py-2 cursor-pointer hover:bg-blue-500/30"
                  onClick={handleExtendSession}
                  title="Click to extend session"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Session: {sessionTime}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Home Button */}
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:block">Home</span>
            </Button>

            {/* Alerts Button */}
            <Button
              onClick={handleAlertsClick}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 flex items-center gap-2"
            >
              <AdminAlertBadge />
            </Button>

            {/* Theme Switcher */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
              <ThemeSwitcher variant="compact" />
            </div>

            {/* Admin Control Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={isSigningOut}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block">{profile?.full_name || 'Admin'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <DropdownMenuLabel className="text-gray-900 dark:text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'Administrator'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{user?.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">System Administrator</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Profile Management */}
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Admin Profile
                </DropdownMenuItem>
                
                {/* Dashboard Navigation */}
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/admin')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/wallet')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
                
                {/* System Management */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <Database className="h-4 w-4 mr-2" />
                    System Management
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <Building2 className="h-4 w-4 mr-2" />
                      Property Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                {/* Session Management */}
                <DropdownMenuItem 
                  onClick={handleExtendSession}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session ({sessionTime})
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  disabled={isSigningOut}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Alerts Dialog */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bell className="h-5 w-5" />
              System Alerts
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Recent system alerts and notifications
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {alertsLoading ? (
                <div className="text-center py-4">Loading alerts...</div>
              ) : alerts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                alerts?.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        !alert.is_read ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : ''
                      }`}
                      onClick={() => handleViewAlert(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-4 w-4 mt-0.5 ${getAlertColor(alert.type, alert.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium truncate ${!alert.is_read ? 'font-semibold' : ''}`}>
                              {alert.title}
                            </h4>
                            <Badge variant={getPriorityVariant(alert.priority)} className="text-xs">
                              {alert.priority}
                            </Badge>
                            {alert.action_required && (
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                            {!alert.is_read && (
                              <Badge variant="default" className="text-xs bg-blue-500">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAlert(alert);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                {selectedAlert && (
                  <>
                    {(() => {
                      const Icon = getAlertIcon(selectedAlert.type);
                      return <Icon className={`h-5 w-5 ${getAlertColor(selectedAlert.type, selectedAlert.priority)}`} />;
                    })()}
                    {selectedAlert.title}
                  </>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAlertDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityVariant(selectedAlert.priority)}>
                  {selectedAlert.priority} priority
                </Badge>
                <Badge variant="outline">
                  {selectedAlert.type}
                </Badge>
                {selectedAlert.action_required && (
                  <Badge variant="destructive">
                    Action Required
                  </Badge>
                )}
                {selectedAlert.is_read && (
                  <Badge variant="default" className="bg-green-500">
                    Read
                  </Badge>
                )}
              </div>
              
              <Separator />
              
              <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {selectedAlert.message}
              </DialogDescription>
              
              {selectedAlert.reference_type && selectedAlert.reference_id && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <strong>Reference:</strong> {selectedAlert.reference_type} ({selectedAlert.reference_id})
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                <strong>Created:</strong> {new Date(selectedAlert.created_at).toLocaleString()}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAlertDetails(false)}
                >
                  Close
                </Button>
                {!selectedAlert.is_read && (
                  <Button
                    variant="default"
                    onClick={() => {
                      markAsReadMutation.mutate(selectedAlert.id);
                    }}
                    disabled={markAsReadMutation.isPending}
                  >
                    {markAsReadMutation.isPending ? 'Marking...' : 'Mark as Read'}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteAlertMutation.mutate(selectedAlert.id);
                  }}
                  disabled={deleteAlertMutation.isPending}
                >
                  {deleteAlertMutation.isPending ? 'Deleting...' : 'Delete Alert'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Admin Profile Management</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <p className="text-gray-900 dark:text-white">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <p className="text-gray-900 dark:text-white">{profile?.role || 'admin'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Duration</label>
              <p className="text-gray-900 dark:text-white">{sessionTime || '0m'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
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
  );
};

export default AdminDashboardHeader;
