import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Coins, 
  Shield, 
  Users,
  BarChart3,
  Database,
  Bell,
  Monitor,
  ExternalLink,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminQuickAccessProps {
  onSectionChange?: (section: string) => void;
}

const AdminQuickAccess: React.FC<AdminQuickAccessProps> = ({ onSectionChange }) => {
  const navigate = useNavigate();

  const quickAccessItems = [
    {
      title: "ASTRA Token Settings",
      description: "Configure token rewards, daily check-ins, and transfer settings",
      icon: Coins,
      action: "settings",
      color: "text-chart-4",
      badge: "Token Management"
    },
    {
      title: "System Settings",
      description: "General system configuration and preferences",
      icon: Settings,
      action: "settings",
      color: "text-chart-2",
      badge: "Configuration"
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      action: "user-management",
      color: "text-chart-1",
      badge: "Users"
    },
    {
      title: "Analytics Dashboard",
      description: "View platform analytics and performance metrics",
      icon: BarChart3,
      action: "analytics",
      color: "text-chart-3",
      badge: "Analytics"
    },
    {
      title: "Security Monitor",
      description: "Monitor system security and audit logs",
      icon: Shield,
      action: "security-monitor",
      color: "text-destructive",
      badge: "Security"
    },
    {
      title: "Database Management",
      description: "Database administration and monitoring tools",
      icon: Database,
      action: "database",
      color: "text-chart-5",
      badge: "Database"
    },
    {
      title: "SEO Management",
      description: "Search engine optimization and content management",
      icon: Search,
      action: "seo-management",
      color: "text-primary",
      badge: "SEO"
    }
  ];

  const handleQuickAccess = (action: string, title: string) => {
    if (onSectionChange) {
      onSectionChange(action);
    } else {
      // Fallback navigation
      navigate(`/admin-dashboard?section=${action}`);
    }
  };

  const handleDirectTokenAccess = () => {
    // Direct link to ASTRA token settings within system settings
    if (onSectionChange) {
      onSectionChange('settings');
    } else {
      navigate('/admin-dashboard?section=settings&tab=astra-tokens');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Quick Access</h3>
          <p className="text-[10px] text-muted-foreground">Jump to admin sections</p>
        </div>
        <Button 
          onClick={handleDirectTokenAccess}
          size="sm"
          className="h-7 text-xs"
        >
          <Coins className="h-3 w-3 mr-1.5" />
          Token Settings
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {quickAccessItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={index}
              className="hover:shadow-md transition-all duration-200 cursor-pointer border-border/30 hover:border-primary/40 group bg-background/50"
              onClick={() => handleQuickAccess(item.action, item.title)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <IconComponent className={`h-4 w-4 ${item.color}`} />
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </CardTitle>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Direct Token Settings Access */}
      <Card className="border-chart-4/20 bg-chart-4/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-chart-4" />
              <span className="text-xs font-medium text-chart-4">ASTRA Token Management</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button 
                size="sm" 
                variant="outline"
                className="h-6 text-[10px] px-2"
                onClick={() => handleQuickAccess('settings', 'System Settings')}
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-6 text-[10px] px-2"
                onClick={() => handleQuickAccess('astra-tokens', 'ASTRA Tokens')}
              >
                <Coins className="h-3 w-3 mr-1" />
                Token Hub
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-6 text-[10px] px-2"
                onClick={() => handleQuickAccess('analytics', 'Analytics')}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuickAccess;