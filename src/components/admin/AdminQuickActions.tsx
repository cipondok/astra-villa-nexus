
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
      
      try {
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
      } catch (error) {
        console.error('Error fetching property stats:', error);
        return {
          total: 0,
          newToday: 0,
          approved: 0,
          pending: 0
        };
      }
    },
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      try {
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
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'vendor');

        // Agents
        const { count: agents } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'agent');

        return {
          total: totalUsers || 0,
          newToday: newUsersToday || 0,
          vendors: vendors || 0,
          agents: agents || 0
        };
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
          total: 0,
          newToday: 0,
          vendors: 0,
          agents: 0
        };
      }
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
      tab: "property-management-hub",
      icon: Building2,
      variant: "default" as const,
      description: "All property listings in system",
      onClick: () => handleQuickAction("property-management-hub")
    },
    {
      title: "New Today",
      count: propertyStats?.newToday || 0,
      action: "Review",
      tab: "property-management-hub",
      icon: Calendar,
      variant: "secondary" as const,
      description: "Properties added today",
      onClick: () => handleQuickAction("property-management-hub")
    },
    {
      title: "Approved Properties",
      count: propertyStats?.approved || 0,
      action: "Manage",
      tab: "property-management-hub",
      icon: CheckCircle,
      variant: "default" as const,
      description: "Live approved properties",
      onClick: () => handleQuickAction("property-management-hub")
    },
    {
      title: "Pending Approval",
      count: propertyStats?.pending || 0,
      action: "Review",
      tab: "property-management-hub",
      icon: Clock,
      variant: "destructive" as const,
      description: "Properties awaiting approval",
      onClick: () => handleQuickAction("property-management-hub")
    },
    {
      title: "Total Users",
      count: userStats?.total || 0,
      action: "Manage",
      tab: "user-management",
      icon: Users,
      variant: "default" as const,
      description: "All registered users",
      onClick: () => handleQuickAction("user-management")
    },
    {
      title: "Vendors",
      count: userStats?.vendors || 0,
      action: "View",
      tab: "user-management",
      icon: MessageSquare,
      variant: "secondary" as const,
      description: "Registered vendor accounts",
      onClick: () => handleQuickAction("user-management")
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <Card className="border-border/30 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Quick Statistics
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="h-6 text-[10px] px-2"
            >
              <Home className="h-3 w-3 mr-1" />
              Home
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <action.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-xs">{action.title}</div>
                  <div className="text-[9px] text-muted-foreground">{action.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge 
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 px-1.5"
                >
                  {action.count}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[9px] px-2"
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

      <Card className="border-border/30 bg-background/50 backdrop-blur-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-1.5">
          {todayActivity && todayActivity.length > 0 ? (
            todayActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/30">
                <activity.icon className={`h-3.5 w-3.5 ${
                  activity.type === 'success' ? 'text-green-500' :
                  activity.type === 'warning' ? 'text-orange-500' :
                  'text-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{activity.action}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{activity.user}</div>
                </div>
                <div className="text-[9px] text-muted-foreground">{activity.time}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs">No activity today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuickActions;
