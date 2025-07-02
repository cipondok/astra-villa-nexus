
import React from "react";
import AdminOverview from "./AdminOverview";
import EnhancedUserManagement from "./EnhancedUserManagement";
import PropertyManagementAdvanced from "./PropertyManagementAdvanced";
import SystemSettings from "./SystemSettings";
import WebTrafficAnalytics from "./WebTrafficAnalytics";
import AIBotManagement from "./AIBotManagement";
import FeedbackManagement from "./FeedbackManagement";
import CustomerServiceCenter from "./CustomerServiceCenter";
import ContactManagement from "./ContactManagement";
import VendorManagementHub from "./VendorManagementHub";
import VendorCategoryManagement from "./VendorCategoryManagement";
import VendorInventoryManagement from "./VendorInventoryManagement";
import ContentManagement from "./ContentManagement";
import SearchFiltersManagement from "./SearchFiltersManagement";
import BillingManagement from "./BillingManagement";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoring from "./SecurityMonitoring";
import SystemReports from "./SystemReports";
import DailyCheckInManagement from "./DailyCheckInManagement";
import ASTRATokenAnalytics from "./ASTRATokenAnalytics";
import ASTRATokenSettings from "./ASTRATokenSettings";
import ToolsManagementDashboard from "./ToolsManagementDashboard";
import SEOSettings from "./SEOSettings";

interface AdminDashboardContentProps {
  activeSection: string;
}

const AdminDashboardContent = ({ activeSection }: AdminDashboardContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "user-management":
        return <EnhancedUserManagement />;
      case "property-management":
        return <PropertyManagementAdvanced />;
      case "property-management-hub":
        return <PropertyManagementAdvanced />;
      case "system-settings":
        return <SystemSettings />;
      case "analytics":
        return <WebTrafficAnalytics />;
      case "ai-bot-management":
        return <AIBotManagement />;
      case "feedback-management":
        return <FeedbackManagement />;
      case "customer-service":
        return <CustomerServiceCenter />;
      case "contact-management":
        return <ContactManagement />;
      case "vendor-management-hub":
        return <VendorManagementHub />;
      case "vendor-service-categories":
        return <VendorCategoryManagement />;
      case "vendor-inventory":
        return <VendorInventoryManagement />;
      case "content-management":
        return <ContentManagement />;
      case "search-filters":
        return <SearchFiltersManagement />;
      case "billing-management":
        return <BillingManagement />;
      case "database-management":
        return <DatabaseTableManagement />;
      case "security-monitoring":
        return <SecurityMonitoring />;
      case "system-reports":
        return <SystemReports />;
      case "daily-checkin":
        return <DailyCheckInManagement />;
      case "astra-token":
        return <ASTRATokenAnalytics />;
      case "astra-token-settings":
        return <ASTRATokenSettings />;
      case "tools-management":
        return <ToolsManagementDashboard />;
      case "seo-settings":
        return <SEOSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  );
};

export default AdminDashboardContent;
