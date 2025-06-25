
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Building2, 
  MessageSquare, 
  Settings, 
  Shield, 
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Wifi,
  Calendar,
  TrendingUp,
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";

interface QuickActionProps {
  onTabChange: (tab: string) => void;
}

const AdminQuickActions = ({ onTabChange }: QuickActionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize admin alerts hook to start monitoring
  useAdminAlerts();

  // Fetch property statistics
  const { data: propertyStats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // New today
      const { count: newToday } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Approved properties
      const { count: approved } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Pending properties
      const { count: pending } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval');

      return {
        total: totalProperties || 0,
        newToday: newToday || 0,
        approved: approved || 0,
        pending: pending || 0
      };
    },
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // New users today
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Vendors
      const { count: vendors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor');

      // Agents
      const { count: agents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent');

      return {
        total: totalUsers || 0,
        newToday: newUsersToday || 0,
        vendors: vendors || 0,
        agents: agents || 0
      };
    },
  });

  // Fetch today's activity
  const { data: todayActivity } = useQuery({
    queryKey: ['today-activity'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's properties with owner info
      const { data: newProperties } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          created_at,
          status,
          owner_id
        `)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get owner profiles for the properties
      if (newProperties && newProperties.length > 0) {
        const ownerIds = [...new Set(newProperties.map(p => p.owner_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ownerIds);

        return newProperties.map(property => {
          const owner = profiles?.find(p => p.id === property.owner_id);
          return {
            action: "New property added",
            user: property.title,
            time: new Date(property.created_at).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            icon: Building2,
            type: property.status === 'approved' ? 'success' : 'info'
          };
        });
      }

      return [];
    },
  });

  const handleQuickAction = (tab: string) => {
    console.log('Quick action clicked:', tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const quickActions = [
    {
      title: "Total Properties",
      count: propertyStats?.total || 0,
      action: "View All",
      tab: "properties",
      icon: Building2,
      variant: "default" as const,
      description: "All property listings in system",
      onClick: () => handleQuickAction("properties")
    },
    {
      title: "New Today",
      count: propertyStats?.newToday || 0,
      action: "Review",
      tab: "properties",
      icon: Calendar,
      variant: "secondary" as const,
      description: "Properties added today",
      onClick: () => handleQuickAction("properties")
    },
    {
      title: "Approved Properties",
      count: propertyStats?.approved || 0,
      action: "Manage",
      tab: "properties",
      icon: CheckCircle,
      variant: "default" as const,
      description: "Live approved properties",
      onClick: () => handleQuickAction("properties")
    },
    {
      title: "Pending Approval",
      count: propertyStats?.pending || 0,
      action: "Review",
      tab: "properties",
      icon: Clock,
      variant: "destructive" as const,
      description: "Properties awaiting approval",
      onClick: () => handleQuickAction("properties")
    },
    {
      title: "Total Users",
      count: userStats?.total || 0,
      action: "Manage",
      tab: "users",
      icon: Users,
      variant: "default" as const,
      description: "All registered users",
      onClick: () => handleQuickAction("users")
    },
    {
      title: "Vendors",
      count: userStats?.vendors || 0,
      action: "View",
      tab: "users",
      icon: MessageSquare,
      variant: "secondary" as const,
      description: "Registered vendor accounts",
      onClick: () => handleQuickAction("users")
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="bg-samsung-gradient text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              Quick Statistics & Actions
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-3">
                <action.icon className="h-5 w-5 text-white/80" />
                <div>
                  <div className="font-medium text-white">{action.title}</div>
                  <div className="text-xs text-white/70">{action.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="bg-white/20 text-white border-white/30"
                >
                  {action.count}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                >
                  {action.action}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayActivity && todayActivity.length > 0 ? (
            todayActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2">
                <activity.icon className={`h-4 w-4 ${
                  activity.type === 'success' ? 'text-green-500' :
                  activity.type === 'warning' ? 'text-orange-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.user}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity today yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuickActions;
