
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
  const { user, profile } = useAuth();

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
      <CardContent className="p-6">
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

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative bg-white/70 dark:bg-slate-700/70 hover:bg-white dark:hover:bg-slate-600">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                3
              </Badge>
            </Button>

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
