
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  MessageSquare, 
  Settings, 
  Shield, 
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";

interface QuickActionProps {
  onTabChange: (tab: string) => void;
}

const AdminQuickActions = ({ onTabChange }: QuickActionProps) => {
  const quickActions = [
    {
      title: "Pending User Approvals",
      count: 12,
      action: "Review",
      tab: "users",
      icon: Users,
      variant: "destructive" as const,
      description: "New user registrations awaiting approval"
    },
    {
      title: "Property Reviews",
      count: 8,
      action: "Moderate",
      tab: "properties",
      icon: Building2,
      variant: "secondary" as const,
      description: "Properties pending approval or requiring attention"
    },
    {
      title: "Support Tickets",
      count: 5,
      action: "Handle",
      tab: "support",
      icon: MessageSquare,
      variant: "default" as const,
      description: "Open support tickets requiring response"
    },
    {
      title: "System Alerts",
      count: 2,
      action: "Check",
      tab: "system",
      icon: AlertTriangle,
      variant: "destructive" as const,
      description: "System issues or warnings"
    }
  ];

  const recentActivities = [
    {
      action: "User registered",
      user: "john.doe@example.com",
      time: "5 min ago",
      icon: Users,
      type: "info"
    },
    {
      action: "Property approved",
      user: "Villa Sunset Beach",
      time: "15 min ago",
      icon: CheckCircle,
      type: "success"
    },
    {
      action: "Vendor application",
      user: "CleanPro Services",
      time: "1 hour ago",
      icon: Clock,
      type: "warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
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
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.map((activity, index) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuickActions;
