
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
  LogOut,
  Calendar,
  TrendingUp
} from "lucide-react";

interface QuickActionProps {
  onTabChange: (tab: string) => void;
}

const AdminQuickActions = ({ onTabChange }: QuickActionProps) => {
  const { signOut } = useAuth();

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

  const handleLogout = async () => {
    await signOut();
  };

  const quickActions = [
    {
      title: "Total Properties",
      count: propertyStats?.total || 0,
      action: "View All",
      tab: "properties",
      icon: Building2,
      variant: "default" as const,
      description: "All property listings in system"
    },
    {
      title: "New Today",
      count: propertyStats?.newToday || 0,
      action: "Review",
      tab: "properties",
      icon: Calendar,
      variant: "secondary" as const,
      description: "Properties added today"
    },
    {
      title: "Approved Properties",
      count: propertyStats?.approved || 0,
      action: "Manage",
      tab: "properties",
      icon: CheckCircle,
      variant: "default" as const,
      description: "Live approved properties"
    },
    {
      title: "Pending Approval",
      count: propertyStats?.pending || 0,
      action: "Review",
      tab: "properties",
      icon: Clock,
      variant: "destructive" as const,
      description: "Properties awaiting approval"
    },
    {
      title: "Communication Hub",
      count: 23,
      action: "Manage",
      tab: "communication",
      icon: MessageSquare,
      variant: "default" as const,
      description: "Active conversations and channels"
    },
    {
      title: "Vendor Directory",
      count: 8,
      action: "Contact",
      tab: "vendor-directory",
      icon: Phone,
      variant: "secondary" as const,
      description: "Available vendors by service type"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Property Statistics & Quick Actions
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <action.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={action.variant}>{action.count}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTabChange(action.tab)}
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
