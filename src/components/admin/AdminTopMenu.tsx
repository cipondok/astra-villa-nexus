
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Bell, 
  BellRing,
  Settings, 
  User, 
  LogOut, 
  Shield,
  Activity,
  Database,
  Users,
  Building2,
  MapPin,
  Globe,
  Crown,
  Home,
  FileText,
  MessageSquare,
  BarChart3,
  ShoppingBag,
  Wrench,
  Headphones,
  CreditCard,
  Clock,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface AdminTopMenuProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const AdminTopMenu = ({ 
  title, 
  subtitle, 
  showSearch = true, 
  onSearch 
}: AdminTopMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

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
      // Invalidate both queries to ensure count and list are updated
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    },
  });

  // Fetch admin alerts - use same query key as other components
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

  // Fetch alerts for the dropdown - use same query key as other components
  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
      return data as AdminAlert[] || [];
    },
    refetchInterval: 30000,
  });

  // Use the count from the dedicated count query
  const unreadCount = typeof unreadCountData === 'number' ? unreadCountData : 0;

  // Fetch location statistics
  const { data: locationStats } = useQuery({
    queryKey: ['admin-location-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_name, city_name, area_name, is_active');
      
      if (error) throw error;
      
      const provinces = new Set(data?.map(loc => loc.province_name) || []);
      const cities = new Set(data?.map(loc => loc.city_name) || []);
      const areas = data?.length || 0;
      const active = data?.filter(loc => loc.is_active).length || 0;
      
      return {
        provinces: provinces.size,
        cities: cities.size,
        areas: areas,
        active: active
      };
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'property':
        return '🏠';
      case 'user':
        return '👤';
      case 'vendor':
        return '🔧';
      case 'security':
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-orange-600 dark:text-orange-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Enhanced Quick Actions with Web Links and Counts
  const quickActions = [
    {
      icon: Globe,
      label: "Provinces",
      count: locationStats?.provinces?.toString() || "0",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      href: "/admin-dashboard?section=locations"
    },
    {
      icon: Building2,
      label: "Cities",
      count: locationStats?.cities?.toString() || "0",
      color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      href: "/admin-dashboard?section=property-management"
    },
    {
      icon: Users,
      label: "Users",
      count: "2.4k",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      href: "/admin-dashboard?section=user-management"
    },
    {
      icon: ShoppingBag,
      label: "Vendors",
      count: "147",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      href: "/admin-dashboard?section=vendors-hub"
    }
  ];

  // Additional Web Navigation Links with Counts
  const webNavLinks = [
    {
      icon: BarChart3,
      label: "Analytics",
      count: "Real-time",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
      href: "/admin-dashboard?section=analytics"
    },
    {
      icon: MessageSquare,
      label: "Support",
      count: "12",
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400",
      href: "/admin-dashboard?section=customer-service"
    },
    {
      icon: Wrench,
      label: "Tools",
      count: "8",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400",
      href: "/admin-dashboard?section=tools-management"
    },
    {
      icon: FileText,
      label: "Reports",
      count: "5",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
      href: "/admin-dashboard?section=system-reports"
    }
  ];

  return (
    <div className="sticky top-0 left-0 right-0 z-[10000] header-ios border-b border-white/10 backdrop-blur-xl shadow-lg transform-gpu will-change-transform mb-6">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 xl:px-16">
        {/* Top Row - Title and User Info */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <Crown className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            {showSearch && (
              <div className="hidden md:flex relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search admin panel..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/20 border border-white/30 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm"
                />
              </div>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher variant="compact" className="w-11 h-11 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg" />

            {/* Enhanced Notifications with Alert Dropdown */}
            <Popover open={showAlerts} onOpenChange={setShowAlerts}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-11 h-11 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg relative"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs border-2 border-white dark:border-gray-800 animate-pulse rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Admin Alerts</h3>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount} unread
                      </Badge>
                    )}
                  </div>
                </div>
                <ScrollArea className="h-80">
                  <div className="p-2">
                    {alerts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No alerts at this time</p>
                        <p className="text-sm">System is running smoothly</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {alerts.map((alert) => (
                           <div
                             key={alert.id}
                             className={`p-3 border rounded-lg transition-colors hover:bg-muted/50 cursor-pointer ${
                               !alert.is_read 
                                 ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                                 : 'hover:bg-muted/50'
                             }`}
                             onClick={() => {
                               if (!alert.is_read) {
                                 markAsReadMutation.mutate(alert.id);
                               }
                             }}
                           >
                            <div className="flex items-start gap-3">
                              <span className="text-base mt-0.5">
                                {getAlertIcon(alert.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-medium line-clamp-1 ${!alert.is_read ? 'font-semibold' : ''}`}>
                                    {alert.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(alert.priority)}`}
                                  >
                                    {alert.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {alert.message}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(alert.created_at)}
                                  </span>
                                  {!alert.is_read && (
                                    <Badge variant="default" className="text-xs bg-blue-500">
                                      New
                                    </Badge>
                                  )}
                                  {alert.action_required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Action Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                {alerts.length > 0 && (
                  <div className="p-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setShowAlerts(false);
                        // You can add navigation to full alerts page here
                      }}
                    >
                      View All Alerts
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-11 h-11 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      
      {/* Enhanced Quick Actions Section - Below Header */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-white/20 dark:border-gray-800/50">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 xl:px-16 py-4">
          <div className="flex flex-col gap-4">
            {/* Main Quick Actions Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 rounded-xl px-3 py-2 min-w-[100px] backdrop-blur-sm border border-white/30 dark:border-gray-700/50 hover:scale-105 transition-all duration-200 group cursor-pointer"
                  >
                    <div className={`p-1.5 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{action.label}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{action.count}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Online
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Database className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </div>

            {/* Additional Web Navigation Links */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/20 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick Links:</span>
              {webNavLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg px-2.5 py-1.5 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:scale-105 transition-all duration-200 group cursor-pointer"
                >
                  <div className={`p-1 rounded-md ${link.color} group-hover:scale-110 transition-transform duration-200`}>
                    <link.icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{link.label}</span>
                  <Badge variant="outline" className="text-xs h-4 px-1.5 bg-white/70 dark:bg-gray-800/70">
                    {link.count}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopMenu;
