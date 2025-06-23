
import { useState } from "react";
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
  Building2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: "Users",
      count: "1.2k",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Building2,
      label: "Properties",
      count: "856",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Database,
      label: "Locations",
      count: "34k",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Activity,
      label: "Active",
      count: "99%",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        {/* Top Row - Title and User Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-3 bg-white/70 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {profile?.full_name || user?.email}
                  </p>
                  <p className="text-gray-600 text-xs">Administrator</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
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
                  className="pl-10 bg-white/70 border-white/50 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 min-w-[100px]"
              >
                <div className={`p-1.5 rounded-md ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{action.label}</p>
                  <p className="font-semibold text-gray-900">{action.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/50">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Database className="h-3 w-3 mr-1" />
              Database Connected
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Shield className="h-3 w-3 mr-1" />
              Security Active
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTopMenu;
