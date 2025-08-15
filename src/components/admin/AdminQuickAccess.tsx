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
  ExternalLink
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
      color: "text-purple-500",
      badge: "Token Management"
    },
    {
      title: "System Settings",
      description: "General system configuration and preferences",
      icon: Settings,
      action: "settings",
      color: "text-blue-500",
      badge: "Configuration"
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      action: "user-management",
      color: "text-green-500",
      badge: "Users"
    },
    {
      title: "Analytics Dashboard",
      description: "View platform analytics and performance metrics",
      icon: BarChart3,
      action: "analytics",
      color: "text-orange-500",
      badge: "Analytics"
    },
    {
      title: "Security Monitor",
      description: "Monitor system security and audit logs",
      icon: Shield,
      action: "security-monitor",
      color: "text-red-500",
      badge: "Security"
    },
    {
      title: "Database Management",
      description: "Database administration and monitoring tools",
      icon: Database,
      action: "database",
      color: "text-indigo-500",
      badge: "Database"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Quick Access</h3>
          <p className="text-muted-foreground">Jump to frequently used admin sections</p>
        </div>
        <Button 
          onClick={handleDirectTokenAccess}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Coins className="h-4 w-4 mr-2" />
          Token Settings
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickAccessItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary group"
              onClick={() => handleQuickAccess(item.action, item.title)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className={`h-6 w-6 ${item.color}`} />
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Direct Token Settings Access */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Coins className="h-5 w-5" />
            ASTRA Token Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
            Configure all aspects of the ASTRA token system including welcome bonuses, 
            daily check-in rewards, transaction bonuses, and transfer settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAccess('settings', 'System Settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAccess('astra-tokens', 'ASTRA Tokens')}
            >
              <Coins className="h-4 w-4 mr-2" />
              Token Hub
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAccess('analytics', 'Analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuickAccess;