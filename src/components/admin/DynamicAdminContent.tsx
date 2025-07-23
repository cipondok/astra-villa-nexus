import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Activity, UserPlus } from 'lucide-react';
import AdminOverview from "./AdminOverview";
import EnhancedUserManagement from "./EnhancedUserManagement";
import PropertyManagementAdvanced from "./PropertyManagementAdvanced";
import WebTrafficAnalytics from "./WebTrafficAnalytics";
import CustomerServiceCenter from "./CustomerServiceCenter";
import ToolsManagementDashboard from "./ToolsManagementDashboard";
import SystemReports from "./SystemReports";
import BillingManagement from "./BillingManagement";
import SEOSettings from "./SEOSettings";
import AdminKYCReview from "./AdminKYCReview";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoringDashboard from "./SecurityMonitoringDashboard";
import PaymentSystemStatus from "./PaymentSystemStatus";
import ImageOptimizationPanel from "./ImageOptimizationPanel";

interface DynamicAdminContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

const DynamicAdminContent = ({ activeSection, onSectionChange }: DynamicAdminContentProps) => {
  const { user } = useAuth();
  console.log('DynamicAdminContent: Rendering section:', activeSection);
  
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
      case "overview":
        return <AdminOverview onSectionChange={onSectionChange} />;
      case "users":
      case "user-management":
        return <EnhancedUserManagement />;
      case "properties":
      case "property-management-hub":
        return <PropertyManagementAdvanced />;
      case "analytics":
        return <WebTrafficAnalytics />;
      case "customer-service":
      case "messages":
        return <CustomerServiceCenter />;
      case "tools":
      case "tools-management":
        return <ToolsManagementDashboard />;
      case "reports":
      case "system-reports":
        return <SystemReports />;
      case "billing":
      case "billing-management":
        return <BillingManagement />;
      case "seo":
      case "seo-settings":
        return <SEOSettings />;
      case "kyc":
      case "admin-kyc-review":
        return <AdminKYCReview />;
      case "database":
      case "database-management":
        return <DatabaseTableManagement />;
      case "security":
      case "security-monitoring":
        return <SecurityMonitoringDashboard />;
      case "monitoring":
        return <SecurityMonitoringDashboard />;
      case "ai-diagnostics":
        const DeepSeekDiagnostics = lazy(() => import('./DeepSeekDiagnostics'));
        const EnhancedProjectDiagnostics = lazy(() => import('./EnhancedProjectDiagnostics'));
        return (
          <div className="space-y-6">
            <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>}>
              <EnhancedProjectDiagnostics />
              <DeepSeekDiagnostics />
            </Suspense>
          </div>
        );
      case "payment-system":
        return <PaymentSystemStatus />;
      case "image-optimization":
        return <ImageOptimizationPanel />;
      case "system-alerts":
        return (
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">System Alerts & Monitoring</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                      <p className="text-2xl font-bold text-red-600">3</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
                      <p className="text-2xl font-bold text-green-600">99.8%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Users Today</p>
                      <p className="text-2xl font-bold text-blue-600">12</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent System Events</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { type: 'error', message: 'Database connection timeout detected', time: '2 minutes ago', severity: 'high' },
                      { type: 'security', message: 'Failed login attempt from IP 192.168.1.100', time: '5 minutes ago', severity: 'medium' },
                      { type: 'system', message: 'Cache refresh completed successfully', time: '10 minutes ago', severity: 'low' },
                      { type: 'user', message: 'New user registration: jane.doe@example.com', time: '15 minutes ago', severity: 'low' },
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.severity === 'high' ? 'bg-red-500' :
                            event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{event.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "admin-profile":
      case "profile-settings":
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Profile Settings</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Administrator"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Login
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={new Date().toLocaleDateString()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "file-explorer":
        return (
          <div className="p-6">
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">File Explorer</h2>
              <p className="text-gray-600">Browse and manage project files</p>
              <p className="text-sm text-gray-500 mt-4">This would show the project file structure</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview onSectionChange={onSectionChange} />;
    }
  };

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  );
};

export default DynamicAdminContent;