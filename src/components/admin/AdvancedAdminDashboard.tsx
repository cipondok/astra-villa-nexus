
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTabNavigation from './AdminTabNavigation';
import AdminOverview from './AdminOverview';
import SimpleUserManagement from './SimpleUserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagement from './VendorManagement';
import SystemSettings from './SystemSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import SecurityManagement from './SecurityManagement';
import ContentManagement from './ContentManagement';
import AdminAlertSystem from './AdminAlertSystem';
import WebsiteDesignControl from './WebsiteDesignControl';
import SocialMediaManagement from './SocialMediaManagement';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, 
  Users, 
  Building2, 
  BarChart3, 
  Shield, 
  FileText, 
  Bell,
  Palette,
  Share2,
  AlertTriangle,
  Activity,
  RefreshCw
} from 'lucide-react';

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { showSuccess, showError } = useAlert();

  // Track alert counts for different sections
  const { data: alertCounts } = useQuery({
    queryKey: ['admin-alert-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('alert_category, priority')
        .eq('is_read', false);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(alert => {
        const category = alert.alert_category || 'general';
        counts[category] = (counts[category] || 0) + 1;
      });
      
      return counts;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  console.log('AdvancedAdminDashboard - Current active tab:', activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <SimpleUserManagement />;
      case 'properties':
        return <PropertyManagement />;
      case 'vendors':
        return <VendorManagement />;
      case 'system-settings':
        return <SystemSettings />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'security':
        return <SecurityManagement />;
      case 'content':
        return <ContentManagement />;
      case 'alerts':
        return <AdminAlertSystem />;
      case 'website-design':
        return <WebsiteDesignControl />;
      case 'social-media':
        return <SocialMediaManagement />;
      default:
        return (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Feature Coming Soon
                </h3>
                <p className="text-gray-300 mb-6">
                  This administrative feature is currently under development and will be available in a future update.
                </p>
                <Button 
                  onClick={() => setActiveTab('overview')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Return to Overview
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Administrative Dashboard
            </h1>
            <p className="text-gray-300">
              Comprehensive system management and monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-white/20 text-white">
              Active Session
            </Badge>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto">
                <AdminTabNavigation 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                  alertCounts={alertCounts || {}}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
