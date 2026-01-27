
import React, { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";

// Lazy load all admin components to prevent module import failures
const AdminOverview = lazy(() => import("./AdminOverview"));
const EnhancedUserManagement = lazy(() => import("./EnhancedUserManagement"));
const PropertyManagementAdvanced = lazy(() => import("./PropertyManagementAdvanced"));
const AdminPropertyManagement = lazy(() => import("./AdminPropertyManagement"));
const SystemSettings = lazy(() => import("./SystemSettings"));
const WebTrafficAnalytics = lazy(() => import("./WebTrafficAnalytics"));
const AIBotManagement = lazy(() => import("./AIBotManagement"));
const FeedbackManagement = lazy(() => import("./FeedbackManagement"));
const CustomerServiceCenter = lazy(() => import("./CustomerServiceCenter"));
const ContactManagement = lazy(() => import("./ContactManagement"));
const ContentManagement = lazy(() => import("./ContentManagement"));
const SearchFiltersManagement = lazy(() => import("./SearchFiltersManagement"));
const BillingManagement = lazy(() => import("./BillingManagement"));
const DatabaseTableManagement = lazy(() => import("./DatabaseTableManagement"));
const SecurityMonitoringDashboard = lazy(() => import("./SecurityMonitoringDashboard"));
const PerformanceMonitor = lazy(() => import("../PerformanceMonitor"));
const ReportExportFunction = lazy(() => import("./ReportExportFunction"));
const PropertyComparison = lazy(() => import("../PropertyComparison"));
const EnhancedSearchFilters = lazy(() => import("../EnhancedSearchFilters"));
const SystemReports = lazy(() => import("./SystemReports"));
const DailyCheckInManagement = lazy(() => import("./DailyCheckInManagement"));
const ASTRATokenHub = lazy(() => import("./ASTRATokenHub"));
const ToolsManagementDashboard = lazy(() => import("./ToolsManagementDashboard"));
const SEOSettings = lazy(() => import("./SEOSettings"));
const ProjectDiagnosticSystem = lazy(() => import("./ProjectDiagnosticSystem"));
const IndonesianPaymentMerchantConfig = lazy(() => import("./IndonesianPaymentMerchantConfig"));
const VendorsHubContent = lazy(() => import("./VendorsHubContent"));
const EnhancedVendorAgentControl = lazy(() => import("./EnhancedVendorAgentControl"));
const AuthorizationMonitoringSystem = lazy(() => import("./AuthorizationMonitoringSystem"));
const AdminAlertSystem = lazy(() => import("./AdminAlertSystem"));
const CustomerServiceControlPanel = lazy(() => import("./CustomerServiceControlPanel"));
const DatabaseErrorManager = lazy(() => import("./cs-tools/DatabaseErrorManager"));
const Property3DViewSettings = lazy(() => import("./Property3DViewSettings"));
const PropertySurveyManagement = lazy(() => import("./PropertySurveyManagement"));
const EmailSettings = lazy(() => import("@/pages/admin/EmailSettings"));
const LocationManagement = lazy(() => import("./LocationManagement"));
const APISettingsManagement = lazy(() => import("./APISettingsManagement"));
const AIPropertyAssistant = lazy(() => import("./AIPropertyAssistant"));
const BookingPaymentSettings = lazy(() => import("./BookingPaymentSettings"));
const BPJSAPISettings = lazy(() => import("./BPJSAPISettings"));
const AdminKYCReview = lazy(() => import("./AdminKYCReview"));
const KYCAnalyticsDashboard = lazy(() => import("./KYCAnalyticsDashboard").then(m => ({ default: m.KYCAnalyticsDashboard })));
const BulkKYCOperations = lazy(() => import("./BulkKYCOperations").then(m => ({ default: m.BulkKYCOperations })));
const DocumentOCR = lazy(() => import("./DocumentOCR").then(m => ({ default: m.DocumentOCR })));
const ErrorLogsTable = lazy(() => import("./ErrorLogsTable"));
const ErrorMonitoringDashboard = lazy(() => import("./ErrorMonitoringDashboard"));
const UserExperienceTips = lazy(() => import("./UserExperienceTips"));
const AlgorithmDashboard = lazy(() => import("./AlgorithmDashboard").then(m => ({ default: m.AlgorithmDashboard })));
const AdminNotificationsCenter = lazy(() => import("./AdminNotificationsCenter").then(m => ({ default: m.AdminNotificationsCenter })));
const LaunchReadinessDashboard = lazy(() => import("./LaunchReadinessDashboard"));
const AIFeedbackAnalytics = lazy(() => import("./AIFeedbackAnalytics").then(m => ({ default: m.AIFeedbackAnalytics })));
const HomepageSliderSettings = lazy(() => import("./HomepageSliderSettings"));
const CarouselSettingsManager = lazy(() => import("./CarouselSettingsManager"));
const ProjectMapVisualization = lazy(() => import("./ProjectMapVisualization"));
const CookieConsentSettings = lazy(() => import("./CookieConsentSettings"));
const CaptchaSettings = lazy(() => import("./CaptchaSettings"));
const CloudflareSettings = lazy(() => import("./CloudflareSettings"));
const PropertyFiltersManagement = lazy(() => import("./PropertyFiltersManagement"));
const SocialMediaSettings = lazy(() => import("./SocialMediaSettings"));
const VerificationManagement = lazy(() => import("./VerificationManagement"));
const UserUpgradeApplications = lazy(() => import("./UserUpgradeApplications"));
const UserLevelManagement = lazy(() => import("./UserLevelManagement"));
const BugErrorDashboard = lazy(() => import("./diagnostics/BugErrorDashboard").then(m => ({ default: m.BugErrorDashboard })));
const VisitorAnalytics = lazy(() => import("./VisitorAnalytics"));
const TestingDashboard = lazy(() => import("./TestingDashboard"));
const VIPAnalyticsDashboard = lazy(() => import("./VIPAnalyticsDashboard"));
const BookingManagement = lazy(() => import("./BookingManagement"));
const TransactionManagementTabs = lazy(() => import("./TransactionManagementTabs"));
const LiveChatManagement = lazy(() => import("./LiveChatManagement"));
const InvestorSettingsHub = lazy(() => import("./InvestorSettingsHub"));

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
  "seo-settings": { label: "SEO Settings", category: "Settings" },
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

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading section...</p>
    </div>
  </div>
);

// Error fallback for lazy components
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin section error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 p-6 bg-destructive/5 rounded-lg border border-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-1">Failed to load section</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {this.state.error?.message || 'An error occurred while loading this section'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
        return <InvestorSettingsHub initialTab="wna" />;
      case "wni-mortgage-settings":
        return <InvestorSettingsHub initialTab="wni" />;
      case "investor-analytics":
        return <InvestorSettingsHub initialTab="analytics" />;
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

            {/* Home Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 md:h-6 md:w-6 shrink-0 hover:bg-primary/10"
              onClick={handleBackToDashboard}
            >
              <Home className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </Button>

            <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />

            {/* Category Badge */}
            {currentSection.category && (
              <>
                <Badge 
                  variant="outline" 
                  className="text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 bg-secondary/50 border-secondary shrink-0"
                >
                  {currentSection.category}
                </Badge>
                <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />
              </>
            )}

            {/* Section Title */}
            <span className="text-[10px] md:text-xs font-medium text-foreground shrink-0">
              {currentSection.label}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="animate-in fade-in duration-300">
        {isOverview ? (
          <AdminCategoryTabs activeSection={activeSection} onSectionChange={onSectionChange} />
        ) : (
          <SectionErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </SectionErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardContent;
