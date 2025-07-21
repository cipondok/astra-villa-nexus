
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  // Fetch admin alerts
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate unread count
  const unreadCount = alerts.filter(alert => !alert.is_read).length;

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

  const quickActions = [
    {
      icon: Globe,
      label: "Provinces",
      count: locationStats?.provinces?.toString() || "0",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
    },
    {
      icon: Building2,
      label: "Cities",
      count: locationStats?.cities?.toString() || "0",
      color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
    },
    {
      icon: MapPin,
      label: "Areas",
      count: locationStats?.areas?.toString() || "0",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
    },
    {
      icon: Activity,
      label: "Active",
      count: locationStats?.active?.toString() || "0",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
    }
  ];

  return (
    <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm">
      <CardContent className="p-6 max-w-screen-2xl mx-auto">
        {/* Top Row - Title and User Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <ThemeSwitcher variant="compact" className="bg-white/70 dark:bg-slate-700/70" />

            {/* Enhanced Notifications with Alert Dropdown */}
            <Popover open={showAlerts} onOpenChange={setShowAlerts}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative bg-white/70 dark:bg-slate-700/70 hover:bg-white dark:hover:bg-slate-600"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
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
            <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-700/70 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile?.full_name || user?.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">Administrator</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-slate-600">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Middle Row - Search and Quick Actions */}
        <div className="flex items-center justify-between gap-6">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations, users, properties..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-white/70 dark:bg-slate-700/70 border-white/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-600"
                />
              </div>
            </div>
          )}

          {/* Location Stats */}
          <div className="flex items-center gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/70 dark:bg-slate-700/70 rounded-lg px-3 py-2 min-w-[100px]"
              >
                <div className={`p-1.5 rounded-md ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{action.label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{action.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/50 dark:border-slate-600/50">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Database className="h-3 w-3 mr-1" />
              Database Connected
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              <Shield className="h-3 w-3 mr-1" />
              Security Active
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTopMenu;
