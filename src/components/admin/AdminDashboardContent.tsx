
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";
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
import LaunchReadinessDashboard from "./LaunchReadinessDashboard";
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
import UserLevelManagement from "./UserLevelManagement";
import { BugErrorDashboard } from "./diagnostics/BugErrorDashboard";
import VisitorAnalytics from "./VisitorAnalytics";
import TestingDashboard from "./TestingDashboard";
import VIPAnalyticsDashboard from "./VIPAnalyticsDashboard";
import BookingManagement from "./BookingManagement";
import TransactionManagementTabs from "./TransactionManagementTabs";
import LiveChatManagement from "./LiveChatManagement";
import InvestorSettingsHub from "./InvestorSettingsHub";

interface AdminDashboardContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

// Section labels for display
const sectionLabels: Record<string, { label: string; category: string }> = {
  "overview": { label: "Dashboard Overview", category: "" },
  "diagnostic": { label: "Project Diagnostics", category: "System" },
  "project-progress": { label: "Launch Readiness", category: "System" },
  "launch-readiness": { label: "Launch Readiness", category: "System" },
  "user-management": { label: "User Management", category: "Core Management" },
  "user-levels": { label: "User Levels", category: "Core Management" },
  "verification-management": { label: "Verification", category: "Core Management" },
  "upgrade-applications": { label: "Upgrade Applications", category: "Core Management" },
  "property-management": { label: "Property Management", category: "Property System" },
  "property-management-hub": { label: "Properties Hub", category: "Property System" },
  "property-management-advanced": { label: "Advanced Properties", category: "Property System" },
  "system-settings": { label: "System Settings", category: "System & Tools" },
  "settings": { label: "Settings", category: "System & Tools" },
  "smtp-settings": { label: "Email Settings", category: "System & Tools" },
  "indonesian-payment-config": { label: "Payment Config", category: "System & Tools" },
  "visitor-analytics": { label: "Visitor Analytics", category: "Analytics" },
  "analytics": { label: "Web Analytics", category: "Analytics" },
  "ai-bot-management": { label: "AI Bot Management", category: "AI & Tools" },
  "feedback-management": { label: "Feedback", category: "Content" },
  "customer-service": { label: "Customer Service", category: "Support" },
  "chat-management": { label: "Chat Management", category: "Support" },
  "contact-management": { label: "Contacts", category: "Support" },
  "vendors-hub": { label: "Vendors Hub", category: "Vendors & Services" },
  "homepage-slider": { label: "Homepage Slider", category: "Content" },
  "carousel-settings": { label: "Carousel Settings", category: "Content" },
  "social-media-settings": { label: "Social Media", category: "Content" },
  "content-management": { label: "Content Management", category: "Content" },
  "search-filters": { label: "Search Filters", category: "System" },
  "billing-management": { label: "Billing", category: "System" },
  "database-management": { label: "Database", category: "System & Tools" },
  "security-monitoring": { label: "Security", category: "System" },
  "performance-monitor": { label: "Performance", category: "Analytics" },
  "report-export": { label: "Report Export", category: "System" },
  "property-comparison": { label: "Property Comparison", category: "Property System" },
  "enhanced-search": { label: "Enhanced Search", category: "System" },
  "system-reports": { label: "System Reports", category: "System" },
  "daily-checkin": { label: "Daily Check-In", category: "Tokens" },
  "astra-token-hub": { label: "ASTRA Token Hub", category: "Tokens" },
  "tools-management": { label: "Tools Management", category: "System & Tools" },
  "customer-service-control": { label: "CS Control Panel", category: "Support" },
  "seo-settings": { label: "SEO Settings", category: "System" },
  "vendor-agent-control": { label: "Vendor/Agent Control", category: "Vendors & Services" },
  "authorization-monitoring": { label: "Authorization", category: "Security" },
  "admin-alerts": { label: "Admin Alerts", category: "System" },
  "database-errors": { label: "Database Errors", category: "System" },
  "property-3d-settings": { label: "3D View Settings", category: "Property System" },
  "property-survey-management": { label: "Property Surveys", category: "Property System" },
  "location-management": { label: "Location Management", category: "Property System" },
  "api-settings": { label: "API Settings", category: "System & Tools" },
  "ai-assistant": { label: "AI Assistant", category: "AI & Tools" },
  "booking-payment-settings": { label: "Booking Payments", category: "System" },
  "booking-management": { label: "Booking Management", category: "Core Management" },
  "bpjs-api-settings": { label: "BPJS API", category: "System" },
  "admin-kyc-review": { label: "KYC Review", category: "Verification" },
  "kyc-analytics": { label: "KYC Analytics", category: "Verification" },
  "bulk-kyc-operations": { label: "Bulk KYC", category: "Verification" },
  "document-ocr": { label: "Document OCR", category: "Verification" },
  "error-logs": { label: "Error Logs", category: "System" },
  "user-experience-tips": { label: "UX Tips", category: "Content" },
  "algorithm-dashboard": { label: "Algorithm Dashboard", category: "Analytics" },
  "notifications-center": { label: "Notifications Center", category: "System" },
  "ai-feedback-analytics": { label: "AI Feedback Analytics", category: "Analytics" },
  "project-map": { label: "Project Map", category: "System" },
  "cookie-settings": { label: "Cookie Settings", category: "System" },
  "captcha-settings": { label: "Captcha Settings", category: "Security" },
  "cloudflare-settings": { label: "Cloudflare Settings", category: "System" },
  "property-filters": { label: "Property Filters", category: "Property System" },
  "rent-filters": { label: "Rent Filters", category: "Property System" },
  "sale-filters": { label: "Sale Filters", category: "Property System" },
  "new-project-filters": { label: "New Project Filters", category: "Property System" },
  "error-monitoring": { label: "Error Monitoring", category: "System" },
  "bug-error-detection": { label: "Bug Detection", category: "System" },
  "testing-dashboard": { label: "Testing Dashboard", category: "Quality Assurance" },
  "vip-analytics": { label: "VIP Analytics", category: "Analytics" },
  "transaction-hub": { label: "Transaction Management", category: "Transactions" },
  "wna-investment-settings": { label: "WNA Investment Settings", category: "Investor Management" },
  "wni-mortgage-settings": { label: "WNI Mortgage Settings", category: "Investor Management" },
  "investor-analytics": { label: "Investor Analytics", category: "Investor Management" },
};

const AdminDashboardContent = ({ activeSection, onSectionChange }: AdminDashboardContentProps) => {
  const isOverview = activeSection === "overview";
  const currentSection = sectionLabels[activeSection] || { label: activeSection, category: "Other" };

  const handleBackToDashboard = () => {
    if (onSectionChange) {
      onSectionChange("overview");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview onSectionChange={onSectionChange} />;
      case "diagnostic":
        return <ProjectDiagnosticSystem />;
      case "project-progress":
      case "launch-readiness":
        return <LaunchReadinessDashboard onSectionChange={onSectionChange} />;
      case "user-management":
        return <EnhancedUserManagement />;
      case "user-levels":
        return <UserLevelManagement onNavigate={onSectionChange} />;
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
      case "visitor-analytics":
        return <VisitorAnalytics />;
      case "analytics":
        return <WebTrafficAnalytics />;
      case "ai-bot-management":
        return <AIBotManagement />;
      case "feedback-management":
        return <FeedbackManagement />;
      case "customer-service":
        return <CustomerServiceCenter />;
      case "chat-management":
        return <LiveChatManagement />;
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
      case "booking-management":
        return <BookingManagement />;
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
      case "bug-error-detection":
        return <BugErrorDashboard />;
      case "testing-dashboard":
        return <TestingDashboard />;
      case "vip-analytics":
        return <VIPAnalyticsDashboard onNavigate={onSectionChange} />;
      case "transaction-hub":
        return <TransactionManagementTabs />;
      case "wna-investment-settings":
      case "wni-mortgage-settings":
      case "investor-analytics":
        return <InvestorSettingsHub />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex-1 p-2 md:p-3 lg:p-4">
      {/* Back Navigation & Active Section Indicator */}
      {!isOverview && (
        <div className="mb-2 md:mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-primary/5 via-background to-accent/5 border border-border/40 overflow-x-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 md:h-7 px-1.5 md:px-2 gap-1 md:gap-1.5 hover:bg-primary/10 transition-all shrink-0"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[9px] md:text-[10px] font-medium">Back</span>
            </Button>

            {/* Breadcrumb Separator */}
            <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />

            {/* Home Link */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-0.5 md:gap-1 text-[9px] md:text-[10px] text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              <Home className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span className="hidden xs:inline">Dashboard</span>
            </button>

            <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />

            {/* Category Badge */}
            {currentSection.category && (
              <>
                <Badge variant="outline" className="text-[8px] md:text-[9px] h-4 md:h-5 px-1 md:px-1.5 border-border/50 bg-background/50 shrink-0">
                  {currentSection.category}
                </Badge>
                <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0 hidden sm:block" />
              </>
            )}

            {/* Active Section Indicator */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <div className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md bg-primary/10 border border-primary/30">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-semibold text-primary truncate max-w-[80px] md:max-w-none">
                  {currentSection.label}
                </span>
              </div>
              <Badge variant="secondary" className="text-[7px] md:text-[8px] h-3.5 md:h-4 px-1 md:px-1.5 bg-green-500/10 text-green-600 border-green-500/30 hidden sm:flex">
                Active
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs - Shows all related links for current category */}
      {!isOverview && onSectionChange && (
        <AdminCategoryTabs 
          activeSection={activeSection} 
          onSectionChange={onSectionChange} 
        />
      )}

      {renderContent()}
    </div>
  );
};

export default AdminDashboardContent;
