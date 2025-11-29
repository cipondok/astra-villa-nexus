
import React from "react";
import AdminOverview from "./AdminOverview";
import EnhancedUserManagement from "./EnhancedUserManagement";
import PropertyManagementAdvanced from "./PropertyManagementAdvanced";
import AdminPropertyManagement from "./AdminPropertyManagement";
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
import SecurityMonitoringDashboard from "./SecurityMonitoringDashboard";
import PerformanceMonitor from "../PerformanceMonitor";
import ReportExportFunction from "./ReportExportFunction";
import PropertyComparison from "../PropertyComparison";
import EnhancedSearchFilters from "../EnhancedSearchFilters";
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
import EmailSettings from "@/pages/admin/EmailSettings";
import LocationManagement from "./LocationManagement";
import APISettingsManagement from "./APISettingsManagement";
import AIPropertyAssistant from "./AIPropertyAssistant";
import BookingPaymentSettings from "./BookingPaymentSettings";
import BPJSAPISettings from "./BPJSAPISettings";
import AdminKYCReview from "./AdminKYCReview";
import { KYCAnalyticsDashboard } from "./KYCAnalyticsDashboard";
import { BulkKYCOperations } from "./BulkKYCOperations";
import { DocumentOCR } from "./DocumentOCR";
import ErrorLogsTable from "./ErrorLogsTable";
import ErrorMonitoringDashboard from "./ErrorMonitoringDashboard";
import UserExperienceTips from "./UserExperienceTips";
import { AlgorithmDashboard } from "./AlgorithmDashboard";
import { AdminNotificationsCenter } from "./AdminNotificationsCenter";
import ProjectProgressReport from "./ProjectProgressReport";
import { AIFeedbackAnalytics } from "./AIFeedbackAnalytics";
import HomepageSliderSettings from "./HomepageSliderSettings";
import CarouselSettingsManager from "./CarouselSettingsManager";
import ProjectMapVisualization from "./ProjectMapVisualization";
import CookieConsentSettings from "./CookieConsentSettings";
import CaptchaSettings from "./CaptchaSettings";
import CloudflareSettings from "./CloudflareSettings";
import PropertyFiltersManagement from "./PropertyFiltersManagement";
import SocialMediaSettings from "./SocialMediaSettings";
import VerificationManagement from "./VerificationManagement";
import UserUpgradeApplications from "./UserUpgradeApplications";

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
      case "project-progress":
        return <ProjectProgressReport />;
      case "user-management":
        return <EnhancedUserManagement />;
      case "verification-management":
        return <VerificationManagement />;
      case "upgrade-applications":
        return <UserUpgradeApplications />;
      case "property-management":
      case "property-management-hub":
        return <AdminPropertyManagement />;
      case "property-management-advanced":
        return <PropertyManagementAdvanced />;
      case "system-settings":
      case "settings":
        return <SystemSettings />;
      case "smtp-settings":
        return <EmailSettings />;
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
      case "homepage-slider":
        return <HomepageSliderSettings />;
      case "carousel-settings":
        return <CarouselSettingsManager />;
      case "social-media-settings":
        return <SocialMediaSettings />;
      case "content-management":
        return <ContentManagement />;
      case "search-filters":
        return <SearchFiltersManagement />;
      case "billing-management":
        return <BillingManagement />;
      case "database-management":
        return <DatabaseTableManagement />;
      case "security-monitoring":
        return <SecurityMonitoringDashboard />;
      case "performance-monitor":
        return <PerformanceMonitor />;
      case "report-export":
        return <ReportExportFunction />;
      case "property-comparison":
        return <PropertyComparison />;
      case "enhanced-search":
        return <EnhancedSearchFilters />;
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
      case "location-management":
        return <LocationManagement />;
      case "api-settings":
        return <APISettingsManagement />;
      case "ai-assistant":
        return <AIPropertyAssistant />;
      case "booking-payment-settings":
        return <BookingPaymentSettings />;
      case "bpjs-api-settings":
        return <BPJSAPISettings />;
      case "admin-kyc-review":
        return <AdminKYCReview />;
      case "kyc-analytics":
        return <KYCAnalyticsDashboard />;
      case "bulk-kyc-operations":
        return <BulkKYCOperations />;
      case "document-ocr":
        return <DocumentOCR />;
      case "error-logs":
        return <ErrorLogsTable />;
      case "user-experience-tips":
        return <UserExperienceTips />;
      case "algorithm-dashboard":
        return <AlgorithmDashboard />;
      case "notifications-center":
        return <AdminNotificationsCenter onSectionChange={onSectionChange} />;
      case "ai-feedback-analytics":
        return <AIFeedbackAnalytics />;
      case "project-map":
        return <ProjectMapVisualization />;
      case "cookie-settings":
        return <CookieConsentSettings />;
      case "captcha-settings":
        return <CaptchaSettings />;
      case "cloudflare-settings":
        return <CloudflareSettings />;
      case "property-filters":
        return <PropertyFiltersManagement filterType="all" title="All Property Filters" />;
      case "rent-filters":
        return <PropertyFiltersManagement filterType="rent" title="Rent Property Filters" description="Manage filters for rental properties" />;
      case "sale-filters":
        return <PropertyFiltersManagement filterType="sale" title="Sale Property Filters" description="Manage filters for properties for sale" />;
      case "new-project-filters":
        return <PropertyFiltersManagement filterType="all" title="New Project Filters" description="Manage filters for new development projects" />;
      case "error-monitoring":
        return <ErrorMonitoringDashboard />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex-1 p-3 md:p-4">
      {renderContent()}
    </div>
  );
};

export default AdminDashboardContent;
