import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Globe, Users, FileText, TrendingUp, Home, Settings, Building, Store, Shield, Loader2, Crown, Zap, Database, MessageSquare, AlertTriangle, Monitor, Blocks } from "lucide-react";
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagementHub from './VendorManagementHub';
import SystemSettings from './SystemSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import LoadingPageCustomization from './LoadingPageCustomization';
import SimpleThemeToggle from '@/components/SimpleThemeToggle';
import APIConfiguration from './APIConfiguration';

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  console.log('AdvancedAdminDashboard - Current active tab:', activeTab);

  const handleTabChange = (tab: string) => {
    console.log('AdvancedAdminDashboard - Tab changed to:', tab);
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    console.log('AdvancedAdminDashboard - Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'api':
        return <APIConfiguration />;
      case 'project':
        return <PropertyManagement />;
      case 'system':
        return <SystemSettings />;
      case 'blockchain':
        return <div className="text-white">Blockchain Tools - Coming Soon</div>;
      case 'monitor':
        return <AdminOverview />;
      case 'errors':
        return <div className="text-white">Error Management - Coming Soon</div>;
      case 'chat':
        return <div className="text-white">Chat Management - Coming Soon</div>;
      case 'database':
        return <div className="text-white">Database Management - Coming Soon</div>;
      default:
        console.log('AdvancedAdminDashboard - Unknown tab, showing analytics');
        return <AnalyticsDashboard />;
    }
  };

  const tabs = [
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      description: 'Real-time insights and performance metrics' 
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users,
      description: 'User management and permissions'
    },
    { 
      id: 'api', 
      label: 'API', 
      icon: Settings,
      description: 'ASTRA Token API configuration and management'
    },
    { 
      id: 'project', 
      label: 'Project', 
      icon: Building,
      description: 'Project and property management'
    },
    { 
      id: 'system', 
      label: 'System', 
      icon: Monitor,
      description: 'System configuration and settings'
    },
    { 
      id: 'blockchain', 
      label: 'Blockchain', 
      icon: Blocks,
      description: 'Blockchain and Web3 tools'
    },
    { 
      id: 'monitor', 
      label: 'Monitor', 
      icon: Activity,
      description: 'System monitoring and health'
    },
    { 
      id: 'errors', 
      label: 'Errors', 
      icon: AlertTriangle,
      description: 'Error tracking and management'
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: MessageSquare,
      description: 'Chat and communication tools'
    },
    { 
      id: 'database', 
      label: 'Database', 
      icon: Database,
      description: 'Database management and queries'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ASTRA AI Control Center</h1>
              <p className="text-purple-300">
                Advanced System Monitoring & Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SimpleThemeToggle />
            <div className="text-right">
              <div className="text-sm text-gray-300">Welcome back,</div>
              <div className="text-cyan-400 font-medium">admin@astra.com</div>
            </div>
            <Button variant="outline" className="bg-slate-800/50 border-purple-500/20 text-white hover:bg-slate-700/50">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-400 text-sm">Total Users</div>
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-white text-2xl font-bold">12,547</div>
            <div className="text-green-400 text-xs">+18.5% from last month</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-400 text-sm">Active Users</div>
              <Activity className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-white text-2xl font-bold">8,234</div>
            <div className="text-green-400 text-xs">Currently online</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-orange-400 text-sm">Unresolved Errors</div>
              <Shield className="h-4 w-4 text-orange-400" />
            </div>
            <div className="text-white text-2xl font-bold">0</div>
            <div className="text-green-400 text-xs">All systems operational</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-400 text-sm">Total Transfers</div>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-white text-2xl font-bold">$45,789</div>
            <div className="text-green-400 text-xs">+12.3% this week</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-purple-400 text-sm">System Health</div>
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-white text-2xl font-bold">98.5%</div>
            <div className="text-green-400 text-xs">Excellent performance</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-400 text-sm">AI Status</div>
              <Activity className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-white text-lg font-bold">Online</div>
            <div className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-slate-800/50 rounded-2xl p-2 border border-purple-500/20">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  flex items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 
                  data-[state=active]:text-white data-[state=active]:shadow-lg
                  text-gray-400 hover:text-white hover:bg-slate-700/50
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mt-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
            {renderTabContent()}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
