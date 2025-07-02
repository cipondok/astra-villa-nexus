
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
import AdminDashboardContent from './AdminDashboardContent';
import AdminTabNavigation from './AdminTabNavigation';
import RealTimeDashboardStats from './RealTimeDashboardStats';
import { useAuth } from '@/contexts/AuthContext';

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('diagnostic');
  const { user, profile } = useAuth();

  console.log('AdvancedAdminDashboard - Current active tab:', activeTab);

  const handleTabChange = (tab: string) => {
    console.log('AdvancedAdminDashboard - Tab changed to:', tab);
    setActiveTab(tab);
  };

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300">
      {/* Add Navigation from Home Page */}
      <EnhancedNavigation 
        language="en" 
        onLanguageToggle={() => {}} 
      />
      
      <div className="container mx-auto px-4 py-4 space-y-6 mt-16">
        
        {/* Real-time Dashboard Stats */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg">
          <RealTimeDashboardStats />
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg p-2">
            <AdminTabNavigation isAdmin={isAdmin} />
          </div>
          
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg p-6">
            <AdminDashboardContent isAdmin={isAdmin} setActiveTab={setActiveTab} />
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
