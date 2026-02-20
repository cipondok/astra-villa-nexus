
import React, { Suspense, lazy, ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";

// Retry wrapper for lazy imports to handle transient chunk loading failures
function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(() => {
    let attempt = 0;
    const load = (): Promise<{ default: T }> =>
      factory().catch((err) => {
        if (attempt < retries) {
          attempt++;
          // Wait briefly then retry - helps with transient network/cache issues
          return new Promise<{ default: T }>((resolve) =>
            setTimeout(() => resolve(load()), 1000 * attempt)
          );
        }
        throw err;
      });
    return load();
  });
}

// Lazy load all admin components with retry logic to prevent module import failures
const AdminOverview = lazyRetry(() => import("./AdminOverview"));
const EnhancedUserManagement = lazyRetry(() => import("./EnhancedUserManagement"));
const UserManagementHub = lazyRetry(() => import("./UserManagementHub"));
const PropertyManagementAdvanced = lazyRetry(() => import("./PropertyManagementAdvanced"));
const AdminPropertyManagement = lazyRetry(() => import("./AdminPropertyManagement"));
const SystemSettings = lazyRetry(() => import("./SystemSettings"));
const WebTrafficAnalytics = lazyRetry(() => import("./WebTrafficAnalytics"));
const AIBotManagement = lazyRetry(() => import("./AIBotManagement"));
const FeedbackManagement = lazyRetry(() => import("./FeedbackManagement"));
const CustomerServiceCenter = lazyRetry(() => import("./CustomerServiceCenter"));
const ContactManagement = lazyRetry(() => import("./ContactManagement"));
const ContentManagement = lazyRetry(() => import("./ContentManagement"));
const SearchFiltersManagement = lazyRetry(() => import("./SearchFiltersManagement"));
const BillingManagement = lazyRetry(() => import("./BillingManagement"));
const DatabaseTableManagement = lazyRetry(() => import("./DatabaseTableManagement"));
const SecurityMonitoringDashboard = lazyRetry(() => import("./SecurityMonitoringDashboard"));
const PerformanceMonitor = lazyRetry(() => import("../PerformanceMonitor"));
const ReportExportFunction = lazyRetry(() => import("./ReportExportFunction"));
const PropertyComparison = lazyRetry(() => import("../PropertyComparison"));
const EnhancedSearchFilters = lazyRetry(() => import("../EnhancedSearchFilters"));
const SystemReports = lazyRetry(() => import("./SystemReports"));
const DailyCheckInManagement = lazyRetry(() => import("./DailyCheckInManagement"));
const ASTRATokenHub = lazyRetry(() => import("./ASTRATokenHub"));
const ToolsManagementDashboard = lazyRetry(() => import("./ToolsManagementDashboard"));
const SEOSettings = lazyRetry(() => import("./SEOSettings"));
const SEOManagement = lazyRetry(() => import("./SEOManagement"));
const ProjectDiagnosticSystem = lazyRetry(() => import("./ProjectDiagnosticSystem"));
const IndonesianPaymentMerchantConfig = lazyRetry(() => import("./IndonesianPaymentMerchantConfig"));
const VendorsHubContent = lazyRetry(() => import("./VendorsHubContent"));
const EnhancedVendorAgentControl = lazyRetry(() => import("./EnhancedVendorAgentControl"));
const AuthorizationMonitoringSystem = lazyRetry(() => import("./AuthorizationMonitoringSystem"));
const AdminAlertSystem = lazyRetry(() => import("./AdminAlertSystem"));
const CustomerServiceControlPanel = lazyRetry(() => import("./CustomerServiceControlPanel"));
const DatabaseErrorManager = lazyRetry(() => import("./cs-tools/DatabaseErrorManager"));
const Property3DViewSettings = lazyRetry(() => import("./Property3DViewSettings"));
const PropertySurveyManagement = lazyRetry(() => import("./PropertySurveyManagement"));
const EmailSettings = lazyRetry(() => import("@/pages/admin/EmailSettings"));
const LocationManagement = lazyRetry(() => import("./LocationManagement"));
const APISettingsManagement = lazyRetry(() => import("./APISettingsManagement"));
const AIPropertyAssistant = lazyRetry(() => import("./AIPropertyAssistant"));
const BookingPaymentSettings = lazyRetry(() => import("./BookingPaymentSettings"));
const BPJSAPISettings = lazyRetry(() => import("./BPJSAPISettings"));
const AdminKYCReview = lazyRetry(() => import("./AdminKYCReview"));
const KYCAnalyticsDashboard = lazyRetry(() => import("./KYCAnalyticsDashboard").then(m => ({ default: m.KYCAnalyticsDashboard })));
const BulkKYCOperations = lazyRetry(() => import("./BulkKYCOperations").then(m => ({ default: m.BulkKYCOperations })));
const DocumentOCR = lazyRetry(() => import("./DocumentOCR").then(m => ({ default: m.DocumentOCR })));
const ErrorLogsTable = lazyRetry(() => import("./ErrorLogsTable"));
const ErrorMonitoringDashboard = lazyRetry(() => import("./ErrorMonitoringDashboard"));
const UserExperienceTips = lazyRetry(() => import("./UserExperienceTips"));
const AlgorithmDashboard = lazyRetry(() => import("./AlgorithmDashboard").then(m => ({ default: m.AlgorithmDashboard })));
const AdminNotificationsCenter = lazyRetry(() => import("./AdminNotificationsCenter").then(m => ({ default: m.AdminNotificationsCenter })));
const LaunchReadinessDashboard = lazyRetry(() => import("./LaunchReadinessDashboard"));
const AIFeedbackAnalytics = lazyRetry(() => import("./AIFeedbackAnalytics").then(m => ({ default: m.AIFeedbackAnalytics })));
const HomepageSliderSettings = lazyRetry(() => import("./HomepageSliderSettings"));
const CarouselSettingsManager = lazyRetry(() => import("./CarouselSettingsManager"));
const ProjectMapVisualization = lazyRetry(() => import("./ProjectMapVisualization"));
const CookieConsentSettings = lazyRetry(() => import("./CookieConsentSettings"));
const CaptchaSettings = lazyRetry(() => import("./CaptchaSettings"));
const CloudflareSettings = lazyRetry(() => import("./CloudflareSettings"));
const PropertyFiltersManagement = lazyRetry(() => import("./PropertyFiltersManagement"));
const SocialMediaSettings = lazyRetry(() => import("./SocialMediaSettings"));
const VerificationManagement = lazyRetry(() => import("./VerificationManagement"));
const UserUpgradeApplications = lazyRetry(() => import("./UserUpgradeApplications"));
const UserLevelManagement = lazyRetry(() => import("./UserLevelManagement"));
const BugErrorDashboard = lazyRetry(() => import("./diagnostics/BugErrorDashboard").then(m => ({ default: m.BugErrorDashboard })));
const VisitorAnalytics = lazyRetry(() => import("./VisitorAnalytics"));
const TestingDashboard = lazyRetry(() => import("./TestingDashboard"));
const VIPAnalyticsDashboard = lazyRetry(() => import("./VIPAnalyticsDashboard"));
const BookingManagement = lazyRetry(() => import("./BookingManagement"));
const TransactionManagementTabs = lazyRetry(() => import("./TransactionManagementTabs"));
const LiveChatManagement = lazyRetry(() => import("./LiveChatManagement"));
const InvestorSettingsHub = lazyRetry(() => import("./InvestorSettingsHub"));
const VideoVerificationReviewDashboard = lazyRetry(() => import("./video-verification/VideoVerificationReviewDashboard"));
const WebsiteDesignControl = lazyRetry(() => import("./WebsiteDesignControl"));
const RateLimitingDashboard = lazyRetry(() => import("./RateLimitingDashboard"));
const VideoTourManager = lazyRetry(() => import("./VideoTourManager"));
const VRTourSettings = lazyRetry(() => import("./VRTourSettings"));
const MortgageManagement = lazyRetry(() => import("./MortgageManagement"));
const LiveMonitoringDashboard = lazyRetry(() => import("./LiveMonitoringDashboard"));
const AdminBlockchainManagement = lazyRetry(() => import("./AdminBlockchainManagement"));
const B2BMarketplaceManagement = lazyRetry(() => import("./B2BMarketplaceManagement"));
const PartnerProgramManagement = lazyRetry(() => import("./PartnerProgramManagement"));
const ExpansionPlanningManagement = lazyRetry(() => import("./ExpansionPlanningManagement"));
const MediaNetworkManagement = lazyRetry(() => import("./MediaNetworkManagement"));
const UserAcquisitionManagement = lazyRetry(() => import("./UserAcquisitionManagement"));
const InnovationLabManagement = lazyRetry(() => import("./InnovationLabManagement"));
const MobileEnhancementsManagement = lazyRetry(() => import("./MobileEnhancementsManagement"));
const SocialCommerceManagement = lazyRetry(() => import("./SocialCommerceManagement"));
const DataExchangeManagement = lazyRetry(() => import("./DataExchangeManagement"));
const AutomationPlatformManagement = lazyRetry(() => import("./AutomationPlatformManagement"));
const TeamManagement = lazyRetry(() => import("./TeamManagement"));
const ViralGrowthCampaigns = lazyRetry(() => import("./ViralGrowthCampaigns"));
const MediaCoveragePR = lazyRetry(() => import("./MediaCoveragePR"));
const AHUCompanyChecker = lazyRetry(() => import("./AHUCompanyChecker"));
const ConciergeServiceManagement = lazyRetry(() => import("./ConciergeServiceManagement"));
const SamplePropertyGenerator = lazyRetry(() => import("./SamplePropertyGenerator"));
const VerificationSystemSettings = lazyRetry(() => import("./settings/VerificationSystemSettings"));
const AuthRegistrationSettings = lazyRetry(() => import("./settings/AuthRegistrationSettings"));

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
  "rate-limiting": { label: "API Rate Limiting", category: "System & Tools" },
  "customer-service-control": { label: "CS Control Panel", category: "Support" },
  "seo-settings": { label: "SEO Settings", category: "Settings" },
  "seo-management": { label: "SEO Management", category: "Marketing" },
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
  "video-tours": { label: "Video Tours (360°)", category: "Core Management" },
  "vr-tour-settings": { label: "VR Tour Settings", category: "Core Management" },
  "bpjs-api-settings": { label: "BPJS API", category: "System" },
  "admin-kyc-review": { label: "KYC Review", category: "Verification" },
  "video-verification-review": { label: "Video Verification Review", category: "Verification" },
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
  "mortgage-management": { label: "Mortgage Management", category: "Transactions" },
  "blockchain-management": { label: "Blockchain Management", category: "Transactions" },
  "b2b-marketplace": { label: "B2B Data Marketplace", category: "Transactions" },
  "partnership-programs": { label: "Partnership Programs", category: "Transactions" },
  "wna-investment-settings": { label: "WNA Investment Settings", category: "Investor Management" },
  "wni-mortgage-settings": { label: "WNI Mortgage Settings", category: "Investor Management" },
  "investor-analytics": { label: "Investor Analytics", category: "Investor Management" },
  "live-monitoring": { label: "Live Monitoring", category: "System" },
  "expansion-planning": { label: "City Expansion Planning", category: "Technical" },
  "innovation-lab": { label: "Innovation Lab", category: "Features" },
  "mobile-enhancements": { label: "Mobile Enhancements", category: "Features" },
  "social-commerce": { label: "Social Commerce", category: "Features" },
  "data-exchange": { label: "Data Exchange Platform", category: "Transactions" },
  "automation-platform": { label: "Automation Platform", category: "Features" },
  "team-management": { label: "Team Management", category: "Features" },
  "viral-growth-campaigns": { label: "Viral Growth Campaigns", category: "Features" },
  "media-coverage-pr": { label: "Media Coverage & PR", category: "Features" },
  "concierge-service": { label: "Concierge Service", category: "Features" },
  "sample-property-generator": { label: "Sample Property Generator", category: "Property System" },
  "verification-system-settings": { label: "Verification System Settings", category: "Settings" },
  "auth-registration-settings": { label: "Auth & Registration", category: "Settings" },
  "ahu-company-checker": { label: "AHU Company Checker", category: "Verification" },
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

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Silently track in production; use error reporting service if needed
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
        return <UserManagementHub onNavigate={onSectionChange} />;
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
      case "rate-limiting":
        return <RateLimitingDashboard />;
      case "customer-service-control":
        return <CustomerServiceControlPanel />;
      case "seo-settings":
        return <SEOSettings />;
      case "seo-management":
        return <SEOManagement />;
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
      case "video-tours":
        return <VideoTourManager />;
      case "vr-tour-settings":
        return <VRTourSettings />;
      case "bpjs-api-settings":
        return <BPJSAPISettings />;
      case "admin-kyc-review":
        return <AdminKYCReview />;
      case "video-verification-review":
        return <VideoVerificationReviewDashboard />;
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
      case "mortgage-management":
        return <MortgageManagement />;
      case "blockchain-management":
        return <AdminBlockchainManagement />;
      case "b2b-marketplace":
        return <B2BMarketplaceManagement />;
      case "partnership-programs":
        return <PartnerProgramManagement />;
      case "wna-investment-settings":
        return <InvestorSettingsHub initialTab="wna" />;
      case "wni-mortgage-settings":
        return <InvestorSettingsHub initialTab="wni" />;
      case "investor-analytics":
        return <InvestorSettingsHub initialTab="analytics" />;
      case "design-system":
      case "website-design":
        return <WebsiteDesignControl />;
      case "live-monitoring":
        return <LiveMonitoringDashboard />;
      case "expansion-planning":
        return <ExpansionPlanningManagement />;
      case "media-network":
        return <MediaNetworkManagement />;
      case "user-acquisition":
        return <UserAcquisitionManagement />;
      case "innovation-lab":
        return <InnovationLabManagement />;
      case "mobile-enhancements":
        return <MobileEnhancementsManagement />;
      case "social-commerce":
        return <SocialCommerceManagement />;
      case "data-exchange":
        return <DataExchangeManagement />;
      case "automation-platform":
        return <AutomationPlatformManagement />;
      case "team-management":
        return <TeamManagement />;
      case "viral-growth-campaigns":
        return <ViralGrowthCampaigns />;
      case "media-coverage-pr":
        return <MediaCoveragePR />;
      case "concierge-service":
        return <ConciergeServiceManagement />;
      case "sample-property-generator":
        return <SamplePropertyGenerator />;
      case "verification-system-settings":
        return <VerificationSystemSettings />;
      case "ahu-company-checker":
        return <AHUCompanyChecker />;
      case "auth-registration-settings":
        return <AuthRegistrationSettings />;
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
        {!isOverview && (
          <AdminCategoryTabs activeSection={activeSection} onSectionChange={onSectionChange} />
        )}
        <SectionErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </SectionErrorBoundary>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
