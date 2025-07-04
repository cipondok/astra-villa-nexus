
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
import ComprehensiveVendorServiceManagement from "./ComprehensiveVendorServiceManagement";
import VendorServiceCategoryManagement from "./VendorServiceCategoryManagement";
import VendorInventoryManagement from "./VendorInventoryManagement";
import VendorApplicationManagement from "./VendorApplicationManagement";
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
import ProjectDiagnosticSystem from "./ProjectDiagnosticSystem";
import IndonesianPaymentMerchantConfig from "./IndonesianPaymentMerchantConfig";

interface AdminDashboardContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

const AdminDashboardContent = ({ activeSection, onSectionChange }: AdminDashboardContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview onSectionChange={onSectionChange} />;
      case "diagnostic":
        return <ProjectDiagnosticSystem />;
      case "user-management":
        return <EnhancedUserManagement />;
      case "property-management-hub":
        return <PropertyManagementAdvanced />;
      case "system-settings":
        return <SystemSettings />;
      case "indonesian-payment-config":
        return <IndonesianPaymentMerchantConfig />;
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
      case "vendor-service-management":
        return <ComprehensiveVendorServiceManagement />;
      case "vendor-category-management":
        return <VendorServiceCategoryManagement />;
      case "vendor-applications":
        return <VendorApplicationManagement />;
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
