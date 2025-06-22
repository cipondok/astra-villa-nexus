
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell,
  FileText,
  Database,
  Globe,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ToolsManagementDashboard from '@/components/admin/ToolsManagementDashboard';

interface TabItem {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  props?: any;
}

interface TabCategory {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  tabs?: TabItem[];
  items?: TabItem[];
}

const AdminDashboard = () => {
  const { profile, user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view this dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Convert to object for proper indexing
  const tabCategories: Record<string, TabCategory> = {
    overview: {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'System overview and key metrics',
      tabs: [
        { id: 'dashboard', label: 'Dashboard', component: AdminOverview },
        { id: 'analytics', label: 'Analytics', component: AdminAnalytics }
      ]
    },
    users: {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage users, vendors, and permissions',
      tabs: [
        { id: 'all-users', label: 'All Users', component: UserManagement },
        { id: 'vendors', label: 'Vendors', component: VendorManagement },
        { id: 'verification', label: 'Verification', component: UserVerification }
      ]
    },
    system: {
      id: 'system',
      label: 'System Settings',
      icon: Settings,
      description: 'Configure system settings and tools',
      tabs: [
        { id: 'tools', label: 'Tools Management', component: ToolsManagementDashboard },
        { id: 'settings', label: 'Site Settings', component: SystemSettings },
        { id: 'content', label: 'Content Management', component: ContentManagement }
      ]
    },
    security: {
      id: 'security',
      label: 'Security & Monitoring',
      icon: Shield,
      description: 'Security logs and monitoring',
      tabs: [
        { id: 'logs', label: 'System Logs', component: SecurityLogs },
        { id: 'alerts', label: 'Alerts', component: SecurityAlerts },
        { id: 'monitoring', label: 'Monitoring', component: SystemMonitoring }
      ]
    }
  };

  const currentCategory = tabCategories[activeCategory];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your platform and monitor system performance
          </p>
        </div>

        {/* Category Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.values(tabCategories).map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => {
                  setActiveCategory(category.id);
                  setActiveTab(category.tabs?.[0]?.id || category.items?.[0]?.id || '');
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold">{category.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tab Content */}
        {currentCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentCategory.icon className="h-5 w-5" />
                {currentCategory.label}
              </CardTitle>
              <CardDescription>{currentCategory.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentCategory.tabs && currentCategory.tabs.length > 1 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    {currentCategory.tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {currentCategory.tabs.map((tab) => {
                    const TabComponent = tab.component;
                    return (
                      <TabsContent key={tab.id} value={tab.id} className="mt-6">
                        <TabComponent {...(tab.props || {})} />
                      </TabsContent>
                    );
                  })}
                </Tabs>
              ) : currentCategory.tabs?.[0] ? (
                (() => {
                  const TabComponent = currentCategory.tabs[0].component;
                  return <TabComponent {...(currentCategory.tabs[0].props || {})} />;
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Content coming soon...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Placeholder components for different admin sections
const AdminOverview = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">1,234</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Vendors</p>
            <p className="text-2xl font-bold">89</p>
          </div>
          <UserCheck className="h-8 w-8 text-green-500" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">System Health</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
          </div>
          <Activity className="h-8 w-8 text-green-500" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const AdminAnalytics = () => (
  <div className="text-center py-8">
    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">Analytics dashboard coming soon...</p>
  </div>
);

const UserManagement = () => (
  <div className="text-center py-8">
    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">User management interface coming soon...</p>
  </div>
);

const VendorManagement = () => (
  <div className="text-center py-8">
    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">Vendor management interface coming soon...</p>
  </div>
);

const UserVerification = () => (
  <div className="text-center py-8">
    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">User verification dashboard coming soon...</p>
  </div>
);

const SystemSettings = () => (
  <div className="text-center py-8">
    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">System settings panel coming soon...</p>
  </div>
);

const ContentManagement = () => (
  <div className="text-center py-8">
    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">Content management system coming soon...</p>
  </div>
);

const SecurityLogs = () => (
  <div className="text-center py-8">
    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">Security logs viewer coming soon...</p>
  </div>
);

const SecurityAlerts = () => (
  <div className="text-center py-8">
    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">Security alerts dashboard coming soon...</p>
  </div>
);

const SystemMonitoring = () => (
  <div className="text-center py-8">
    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">System monitoring dashboard coming soon...</p>
  </div>
);

export default AdminDashboard;
