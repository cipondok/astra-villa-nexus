
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Settings, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Search, 
  Globe, 
  Activity, 
  Wrench,
  HeadphonesIcon,
  Eye,
  Filter,
  AlertTriangle,
  TrendingUp,
  Database,
  Bell,
  UserCheck,
  FileText,
  Lock,
  HelpCircle,
  Zap
} from 'lucide-react';

// Import management components
import UserActivityMonitoring from './UserActivityMonitoring';
import VendorControlPanel from './VendorControlPanel';
import PropertyManagementAdvanced from './PropertyManagementAdvanced';
import PropertyFiltersManagement from './PropertyFiltersManagement';
import SEOManagement from './SEOManagement';
import WebSettingsControl from './WebSettingsControl';
import SecurityManagement from './SecurityManagement';
import CommunicationCenter from './CommunicationCenter';
import SystemAnalytics from './SystemAnalytics';
import CustomerServiceCenter from './CustomerServiceCenter';
import MaintenancePanel from './MaintenancePanel';
import HelpDeskManagement from './HelpDeskManagement';

interface DashboardSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  category: string;
  status?: 'active' | 'warning' | 'error';
  count?: number;
  component: React.ComponentType<any>;
}

const AdvancedAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const dashboardSections: DashboardSection[] = [
    // User Management
    {
      id: 'user-control',
      label: 'User Control & Activities',
      icon: Users,
      description: 'Monitor user activities, sessions, and behavior patterns',
      category: 'User Management',
      status: 'active',
      count: 1234,
      component: UserActivityMonitoring
    },
    {
      id: 'vendor-control',
      label: 'Vendor Control Panel',
      icon: UserCheck,
      description: 'Advanced vendor management and approval workflows',
      category: 'User Management',
      status: 'active',
      count: 89,
      component: VendorControlPanel
    },

    // Content Management
    {
      id: 'property-advanced',
      label: 'Property Management Advanced',
      icon: Building2,
      description: 'Advanced property listing control and approval system',
      category: 'Content Management',
      status: 'active',
      count: 567,
      component: PropertyManagementAdvanced
    },
    {
      id: 'property-filters',
      label: 'Property Filters Control',
      icon: Filter,
      description: 'Manage search filters and property categorization',
      category: 'Content Management',
      status: 'active',
      component: PropertyFiltersManagement
    },
    {
      id: 'seo-management',
      label: 'SEO Management',
      icon: Search,
      description: 'Search engine optimization and content management',
      category: 'Content Management',
      status: 'active',
      component: SEOManagement
    },

    // System Control
    {
      id: 'web-settings',
      label: 'Web Settings Control',
      icon: Globe,
      description: 'Global website settings and configuration',
      category: 'System Control',
      status: 'active',
      component: WebSettingsControl
    },
    {
      id: 'security-management',
      label: 'Security Management',
      icon: Shield,
      description: 'Security monitoring, logs, and threat detection',
      category: 'System Control',
      status: 'warning',
      component: SecurityManagement
    },
    {
      id: 'maintenance',
      label: 'System Maintenance',
      icon: Wrench,
      description: 'System maintenance, updates, and health monitoring',
      category: 'System Control',
      status: 'active',
      component: MaintenancePanel
    },

    // Analytics & Monitoring
    {
      id: 'system-analytics',
      label: 'System Analytics',
      icon: BarChart3,
      description: 'Comprehensive system analytics and reporting',
      category: 'Analytics & Monitoring',
      status: 'active',
      component: SystemAnalytics
    },
    {
      id: 'activity-monitoring',
      label: 'Activity Monitoring',
      icon: Activity,
      description: 'Real-time system activity and performance monitoring',
      category: 'Analytics & Monitoring',
      status: 'active',
      component: UserActivityMonitoring
    },

    // Communication & Support
    {
      id: 'communication-center',
      label: 'Communication Center',
      icon: MessageSquare,
      description: 'Manage all communication channels and messaging',
      category: 'Communication & Support',
      status: 'active',
      component: CommunicationCenter
    },
    {
      id: 'customer-service',
      label: 'Customer Service Center',
      icon: HeadphonesIcon,
      description: 'Advanced customer support and ticket management',
      category: 'Communication & Support',
      status: 'active',
      count: 42,
      component: CustomerServiceCenter
    },
    {
      id: 'help-desk',
      label: 'Help Desk Management',
      icon: HelpCircle,
      description: 'Help desk operations and knowledge base management',
      category: 'Communication & Support',
      status: 'active',
      component: HelpDeskManagement
    }
  ];

  const categories = [
    'User Management',
    'Content Management', 
    'System Control',
    'Analytics & Monitoring',
    'Communication & Support'
  ];

  const filteredSections = dashboardSections.filter(section =>
    section.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return null;
    }
  };

  const renderActiveComponent = () => {
    if (activeSection === 'overview') {
      return <DashboardOverview sections={dashboardSections} />;
    }
    
    const section = dashboardSections.find(s => s.id === activeSection);
    if (section) {
      const Component = section.component;
      return <Component />;
    }
    
    return <div>Component not found</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Admin Control Panel</h1>
            <p className="text-gray-600 mt-2">Comprehensive system management and monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800">
              <Activity className="h-4 w-4 mr-1" />
              System Online
            </Badge>
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Alerts (3)
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Properties</p>
                  <p className="text-2xl font-bold">567</p>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold">98.5%</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-yellow-600">3 urgent</p>
                </div>
                <HeadphonesIcon className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="user-control">Users</TabsTrigger>
                  <TabsTrigger value="property-advanced">Properties</TabsTrigger>
                  <TabsTrigger value="system-analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="security-management">Security</TabsTrigger>
                  <TabsTrigger value="customer-service">Support</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview">
                <DashboardOverview sections={dashboardSections} onSectionSelect={setActiveSection} />
              </TabsContent>

              {dashboardSections.map(section => (
                <TabsContent key={section.id} value={section.id}>
                  <section.component />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Dashboard Overview Component
interface DashboardOverviewProps {
  sections: DashboardSection[];
  onSectionSelect?: (sectionId: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ sections, onSectionSelect }) => {
  const categories = [
    'User Management',
    'Content Management', 
    'System Control',
    'Analytics & Monitoring',
    'Communication & Support'
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections
              .filter(section => section.category === category)
              .map(section => {
                const Icon = section.icon;
                return (
                  <Card 
                    key={section.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:bg-gray-50"
                    onClick={() => onSectionSelect?.(section.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Icon className="h-6 w-6 text-blue-600" />
                        {getStatusBadge(section.status)}
                      </div>
                      <CardTitle className="text-base">{section.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                      {section.count !== undefined && (
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-blue-600">{section.count}</span>
                          <span className="text-sm text-gray-500 ml-2">items</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdvancedAdminDashboard;
