
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Store,
  Settings,
  FileText,
  Palette,
  Loader2,
  LayoutDashboard
} from 'lucide-react';
import AdminDashboardHeader from './AdminDashboardHeader';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import SystemSettings from './SystemSettings';
import WebSettingsControl from './WebSettingsControl';
import ThemeSettings from './ThemeSettings';
import ContentManagement from './ContentManagement';
import AlertMonitoring from './AlertMonitoring';
import LoadingCustomization from './LoadingCustomization';
import { useAuth } from '@/contexts/AuthContext';
import { adminNavigationSections } from './navigationSections';

const AdvancedAdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const { user, profile } = useAuth();

  const renderActiveComponent = () => {
    console.log('Rendering component:', activeComponent);
    
    switch (activeComponent) {
      case 'Dashboard':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Welcome to the admin dashboard. Manage users, properties, and system settings.
              </p>
            </CardContent>
          </Card>
        );
      case 'UserManagement':
        return <UserManagement />;
      case 'PropertyManagement':
        return <PropertyManagement />;
      case 'SystemSettings':
        return <SystemSettings />;
      case 'WebSettingsControl':
        return <WebSettingsControl />;
      case 'ThemeSettings':
        return <ThemeSettings />;
      case 'ContentManagement':
        return <ContentManagement />;
      case 'AlertMonitoring':
        return <AlertMonitoring />;
      case 'LoadingCustomization':
        return <LoadingCustomization />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Under Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section is currently under development. Please check back later.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboardHeader 
        isAdmin={true} 
        user={user} 
        profile={profile} 
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Admin Navigation</CardTitle>
                <CardContent>
                  Select a section to manage
                </CardContent>
              </CardHeader>
              <CardContent className="space-y-2">
                {adminNavigationSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{section.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{section.description}</p>
                    <ul className="ml-2 space-y-1">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start ${activeComponent === item.component ? 'text-blue-600 dark:text-blue-400' : ''}`}
                            onClick={() => setActiveComponent(item.component)}
                          >
                            {item.title}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
