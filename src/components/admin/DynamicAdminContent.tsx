import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Activity, UserPlus } from 'lucide-react';
import AdminOverview from "./AdminOverview";
import EnhancedUserManagement from "./EnhancedUserManagement";
import UserUpgradeApplications from "./UserUpgradeApplications";
import UserDirectoryWithCategories from "./UserDirectoryWithCategories";
import UserDirectoryFixed from "./UserDirectoryFixed";
import PropertyManagementAdvanced from "./PropertyManagementAdvanced";
import EnhancedPropertyManagement from "./EnhancedPropertyManagement";
import WebTrafficAnalytics from "./WebTrafficAnalytics";
import CustomerServiceCenter from "./CustomerServiceCenter";
import ToolsManagementDashboard from "./ToolsManagementDashboard";
import SystemReports from "./SystemReports";
import BillingManagement from "./BillingManagement";
import SystemSettings from "./SystemSettings";
import AdminKYCReview from "./AdminKYCReview";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoringDashboard from "./SecurityMonitoringDashboard";
import PaymentSystemStatus from "./PaymentSystemStatus";
import ImageOptimizationPanel from "./ImageOptimizationPanel";
import PaymentGatewaySetup from "./PaymentGatewaySetup";
import AdminPropertyManagement from "./AdminPropertyManagement";
import LocationManagement from "./LocationManagement";
import SystemToolsDashboard from "./SystemToolsDashboard";
import MediaGallery from "./MediaGallery";
import TransactionManagementTabs from "./TransactionManagementTabs";
import WelcomeScreenSettings from "./WelcomeScreenSettings";
import InvestorSettingsHub from "./InvestorSettingsHub";


// Move lazy loading outside the component to prevent re-creation on every render
const DeepSeekDiagnostics = lazy(() => import('./DeepSeekDiagnostics'));
const EnhancedProjectDiagnostics = lazy(() => import('./EnhancedProjectDiagnostics'));

interface DynamicAdminContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

const DynamicAdminContent = ({ activeSection, onSectionChange }: DynamicAdminContentProps) => {
  const { user } = useAuth();
  
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
      case "overview":
        return <AdminOverview onSectionChange={onSectionChange} />;
      // Transaction Management - Unified with Tabs
      case "transaction-hub":
      case "transactions":
      case "tax-configuration":
      case "transaction-monitor":
      case "audit-trail":
      case "feedback-bug-system":
        return <TransactionManagementTabs />;
      case "users":
      case "user-management":
        return <EnhancedUserManagement />;
      case "upgrade-applications":
        return <UserUpgradeApplications />;
      case "user-directory":
        return <UserDirectoryFixed />;
      case "properties":
      case "property-management-hub":
        return <AdminPropertyManagement />;
      case "property-management-advanced":
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
        return <SystemSettings defaultTab="seo-hub" />;
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
      case "locations":
      case "location-management":
        return <LocationManagement />;
      case "media":
      case "media-gallery":
        return <MediaGallery />;
      case "ai-diagnostics":
        return (
          <div className="space-y-6">
            <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <EnhancedProjectDiagnostics />
              <DeepSeekDiagnostics />
            </Suspense>
          </div>
        );
      case "payment-system":
        return <PaymentSystemStatus />;
      case "payment-gateway-setup":
      case "gateway-setup":
        return <PaymentGatewaySetup />;
      case "system-tools":
        return <SystemToolsDashboard />;
      case "error-logs":
        return <SystemToolsDashboard />;
      case "image-optimization":
        return <ImageOptimizationPanel />;
      case "welcome-screen-settings":
        return <WelcomeScreenSettings />;
      case "wna-investment-settings":
        return <InvestorSettingsHub initialTab="wna" />;
      case "wni-mortgage-settings":
        return <InvestorSettingsHub initialTab="wni" />;
      case "investor-analytics":
        return <InvestorSettingsHub initialTab="analytics" />;
      case "system-alerts":
        return (
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">System Alerts & Monitoring</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-card rounded-lg shadow p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                      <p className="text-2xl font-bold text-destructive">3</p>
                    </div>
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg shadow p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                      <p className="text-2xl font-bold text-chart-1">99.8%</p>
                    </div>
                    <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-chart-1" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg shadow p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">New Users Today</p>
                      <p className="text-2xl font-bold text-chart-2">12</p>
                    </div>
                    <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-chart-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Recent System Events</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { type: 'error', message: 'Database connection timeout detected', time: '2 minutes ago', severity: 'high' },
                      { type: 'security', message: 'Failed login attempt from IP 192.168.1.100', time: '5 minutes ago', severity: 'medium' },
                      { type: 'system', message: 'Cache refresh completed successfully', time: '10 minutes ago', severity: 'low' },
                      { type: 'user', message: 'New user registration: jane.doe@example.com', time: '15 minutes ago', severity: 'low' },
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.severity === 'high' ? 'bg-destructive' :
                            event.severity === 'medium' ? 'bg-chart-3' : 'bg-chart-1'
                          }`}></div>
                          <div>
                            <p className="text-sm">{event.message}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                          event.severity === 'medium' ? 'bg-chart-3/10 text-chart-3' :
                          'bg-chart-1/10 text-chart-1'
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
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              <div className="bg-card rounded-lg shadow p-6 border">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ''}
                      className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Administrator"
                      className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Login
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={new Date().toLocaleDateString()}
                      className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground"
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
              <h2 className="text-2xl font-bold mb-2">File Explorer</h2>
              <p className="text-muted-foreground">Browse and manage project files</p>
              <p className="text-sm text-muted-foreground mt-4">This would show the project file structure</p>
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