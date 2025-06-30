
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
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';

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
        return <div className="text-gray-900 dark:text-gray-100">Blockchain Tools - Coming Soon</div>;
      case 'monitor':
        return <AdminOverview />;
      case 'errors':
        return <div className="text-gray-900 dark:text-gray-100">Error Management - Coming Soon</div>;
      case 'chat':
        return <div className="text-gray-900 dark:text-gray-100">Chat Management - Coming Soon</div>;
      case 'database':
        return <div className="text-gray-900 dark:text-gray-100">Database Management - Coming Soon</div>;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Add Navigation from Home Page */}
      <EnhancedNavigation 
        language="en" 
        onLanguageToggle={() => {}} 
      />
      
      <div className="container mx-auto px-4 py-4 space-y-4 mt-20">
        
        {/* Improved Stats Overview with Better Light Mode Colors */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-blue-800 dark:text-blue-400 text-xs font-semibold">Total Users</div>
              <Users className="h-3 w-3 text-blue-800 dark:text-blue-400" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">12,547</div>
            <div className="text-green-800 dark:text-green-400 text-[10px] font-medium">+18.5%</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-green-800 dark:text-green-400 text-xs font-semibold">Active Users</div>
              <Activity className="h-3 w-3 text-green-800 dark:text-green-400" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">8,234</div>
            <div className="text-green-800 dark:text-green-400 text-[10px] font-medium">Online</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-orange-800 dark:text-orange-400 text-xs font-semibold">Errors</div>
              <Shield className="h-3 w-3 text-orange-800 dark:text-orange-400" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">0</div>
            <div className="text-green-800 dark:text-green-400 text-[10px] font-medium">All good</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-blue-800 dark:text-blue-400 text-xs font-semibold">Transfers</div>
              <TrendingUp className="h-3 w-3 text-blue-800 dark:text-blue-400" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">$45,789</div>
            <div className="text-green-800 dark:text-green-400 text-[10px] font-medium">+12.3%</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-purple-800 dark:text-purple-400 text-xs font-semibold">Health</div>
              <Zap className="h-3 w-3 text-purple-800 dark:text-purple-400" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">98.5%</div>
            <div className="text-green-800 dark:text-green-400 text-[10px] font-medium">Excellent</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-amber-800 dark:text-yellow-400 text-xs font-semibold">AI Status</div>
              <Activity className="h-3 w-3 text-amber-800 dark:text-yellow-400" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-sm font-bold">Online</div>
            <div className="inline-block w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-300 dark:border-gray-700 shadow-sm">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all text-xs font-medium
                  data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg
                  text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <tab.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-4 shadow-sm">
            {renderTabContent()}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
