import React from 'react';
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

interface DynamicAdminContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

const DynamicAdminContent = ({ activeSection, onSectionChange }: DynamicAdminContentProps) => {
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