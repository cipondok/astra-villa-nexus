
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
import ContentManagement from "./ContentManagement";
import SearchFiltersManagement from "./SearchFiltersManagement";
import BillingManagement from "./BillingManagement";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoring from "./SecurityMonitoring";
import SystemReports from "./SystemReports";
import DailyCheckInManagement from "./DailyCheckInManagement";
import ASTRATokenHub from "./ASTRATokenHub";
import ToolsManagementDashboard from "./ToolsManagementDashboard";
import SEOSettings from "./SEOSettings";
import ProjectDiagnosticSystem from "./ProjectDiagnosticSystem";
import IndonesianPaymentMerchantConfig from "./IndonesianPaymentMerchantConfig";
import VendorsHubContent from "./VendorsHubContent";
import EnhancedVendorAgentControl from "./EnhancedVendorAgentControl";
import AuthorizationMonitoringSystem from "./AuthorizationMonitoringSystem";
import AdminAlertSystem from "./AdminAlertSystem";
import CustomerServiceControlPanel from "./CustomerServiceControlPanel";
import DatabaseErrorManager from "./cs-tools/DatabaseErrorManager";
import Property3DViewSettings from "./Property3DViewSettings";
import PropertySurveyManagement from "./PropertySurveyManagement";
import SMTPSettings from "./SMTPSettings";

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
      case "smtp-settings":
        return <SMTPSettings />;
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
      case "vendors-hub":
        return <VendorsHubContent />;
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
      case "astra-token-hub":
        return <ASTRATokenHub />;
      case "tools-management":
        return <ToolsManagementDashboard />;
      case "customer-service-control":
        return <CustomerServiceControlPanel />;
      case "seo-settings":
        return <SEOSettings />;
      case "vendor-agent-control":
        return <EnhancedVendorAgentControl />;
      case "authorization-monitoring":
        return <AuthorizationMonitoringSystem />;
      case "admin-alerts":
        return <AdminAlertSystem />;
      case "database-errors":
        return <DatabaseErrorManager />;
      case "property-3d-settings":
        return <Property3DViewSettings />;
      case "property-survey-management":
        return <PropertySurveyManagement />;
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
