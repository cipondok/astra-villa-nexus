import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";
import SectionErrorBoundary from "./shared/SectionErrorBoundary";
import {
  sectionLabels,
  AdminOverview,
  UserManagementHub,
  UserLevelManagement,
  VerificationManagement,
  UserUpgradeApplications,
  PropertyManagementAdvanced,
  AdminPropertyManagement,
  SystemSettings,
  WebTrafficAnalytics,
  AIBotManagement,
  FeedbackManagement,
  CustomerServiceCenter,
  LiveChatManagement,
  ContactManagement,
  ContentManagement,
  SearchFiltersManagement,
  BillingManagement,
  DatabaseTableManagement,
  SecurityMonitoringDashboard,
  PerformanceMonitor,
  ReportExportFunction,
  PropertyComparison,
  EnhancedSearchFilters,
  SystemReports,
  DailyCheckInManagement,
  ASTRATokenHub,
  ToolsManagementDashboard,
  SEOManagement,
  ProjectDiagnosticSystem,
  IndonesianPaymentMerchantConfig,
  VendorsHubContent,
  EnhancedVendorAgentControl,
  AuthorizationMonitoringSystem,
  AdminAlertSystem,
  CustomerServiceControlPanel,
  DatabaseErrorManager,
  Property3DViewSettings,
  PropertySurveyManagement,
  EmailSettings,
  LocationManagement,
  APISettingsManagement,
  AIPropertyAssistant,
  BookingPaymentSettings,
  BPJSAPISettings,
  AdminKYCReview,
  VideoVerificationReviewDashboard,
  KYCAnalyticsDashboard,
  BulkKYCOperations,
  DocumentOCR,
  ErrorLogsTable,
  ErrorMonitoringDashboard,
  UserExperienceTips,
  AlgorithmDashboard,
  AdminNotificationsCenter,
  LaunchReadinessDashboard,
  AIFeedbackAnalytics,
  HomepageSliderSettings,
  CarouselSettingsManager,
  ProjectMapVisualization,
  CookieConsentSettings,
  CaptchaSettings,
  CloudflareSettings,
  PropertyFiltersManagement,
  SocialMediaSettings,
  VisitorAnalytics,
  BugErrorDashboard,
  TestingDashboard,
  VIPAnalyticsDashboard,
  BookingManagement,
  AdminRentalManagement,
  TransactionManagementTabs,
  InvestorSettingsHub,
  WebsiteDesignControl,
  RateLimitingDashboard,
  VideoTourManager,
  VRTourSettings,
  MortgageManagement,
  LiveMonitoringDashboard,
  AdminBlockchainManagement,
  B2BMarketplaceManagement,
  PartnerProgramManagement,
  ExpansionPlanningManagement,
  MediaNetworkManagement,
  UserAcquisitionManagement,
  InnovationLabManagement,
  MobileEnhancementsManagement,
  SocialCommerceManagement,
  DataExchangeManagement,
  AutomationPlatformManagement,
  TeamManagement,
  ViralGrowthCampaigns,
  MediaCoveragePR,
  AHUCompanyChecker,
  ConciergeServiceManagement,
  SamplePropertyGenerator,
  VerificationSystemSettings,
  AuthRegistrationSettings,
  NearbyFacilitiesSettings,
} from "./adminSectionRegistry";

interface AdminDashboardContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingFallback = () => (
  <div className="p-4 md:p-6 space-y-4 animate-in fade-in duration-300">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-xl bg-muted/40 border border-border/30 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-3">
        <div className="h-8 w-1/3 rounded-lg bg-muted/40 animate-pulse" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-muted/30 border border-border/20 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-48 rounded-xl bg-muted/30 border border-border/20 animate-pulse" />
        <div className="h-28 rounded-xl bg-muted/30 border border-border/20 animate-pulse" />
      </div>
    </div>
  </div>
);

// ─── Section renderer ─────────────────────────────────────────────────────────
const renderSection = (
  section: string,
  onSectionChange?: (s: string) => void
): React.ReactNode => {
  switch (section) {
    case "overview":            return <AdminOverview onSectionChange={onSectionChange} />;
    case "diagnostic":          return <ProjectDiagnosticSystem />;
    case "project-progress":
    case "launch-readiness":    return <LaunchReadinessDashboard onSectionChange={onSectionChange} />;
    case "user-management":     return <UserManagementHub onNavigate={onSectionChange} />;
    case "user-levels":         return <UserLevelManagement onNavigate={onSectionChange} />;
    case "verification-management": return <VerificationManagement />;
    case "upgrade-applications":    return <UserUpgradeApplications />;
    case "property-management":
    case "property-management-hub": return <AdminPropertyManagement />;
    case "property-management-advanced": return <PropertyManagementAdvanced />;
    case "system-settings":
    case "settings":            return <SystemSettings />;
    case "smtp-settings":       return <EmailSettings />;
    case "indonesian-payment-config": return <IndonesianPaymentMerchantConfig />;
    case "visitor-analytics":   return <VisitorAnalytics />;
    case "analytics":           return <WebTrafficAnalytics />;
    case "ai-bot-management":   return <AIBotManagement />;
    case "feedback-management": return <FeedbackManagement />;
    case "customer-service":    return <CustomerServiceCenter />;
    case "chat-management":     return <LiveChatManagement />;
    case "contact-management":  return <ContactManagement />;
    case "vendors-hub":         return <VendorsHubContent />;
    case "homepage-slider":     return <HomepageSliderSettings />;
    case "carousel-settings":   return <CarouselSettingsManager />;
    case "social-media-settings": return <SocialMediaSettings />;
    case "content-management":  return <ContentManagement />;
    case "search-filters":      return <SearchFiltersManagement />;
    case "billing-management":  return <BillingManagement />;
    case "database-management": return <DatabaseTableManagement />;
    case "security-monitoring": return <SecurityMonitoringDashboard />;
    case "performance-monitor": return <PerformanceMonitor />;
    case "report-export":       return <ReportExportFunction />;
    case "property-comparison": return <PropertyComparison />;
    case "enhanced-search":     return <EnhancedSearchFilters />;
    case "system-reports":      return <SystemReports />;
    case "daily-checkin":       return <DailyCheckInManagement />;
    case "astra-token-hub":     return <ASTRATokenHub />;
    case "tools-management":    return <ToolsManagementDashboard />;
    case "rate-limiting":       return <RateLimitingDashboard />;
    case "customer-service-control": return <CustomerServiceControlPanel />;
    case "seo-settings":        return <SystemSettings defaultTab="seo-hub" />;
    case "seo-management":      return <SEOManagement />;
    case "vendor-agent-control": return <EnhancedVendorAgentControl />;
    case "authorization-monitoring": return <AuthorizationMonitoringSystem />;
    case "admin-alerts":        return <AdminAlertSystem />;
    case "database-errors":     return <DatabaseErrorManager />;
    case "property-3d-settings": return <Property3DViewSettings />;
    case "property-survey-management": return <PropertySurveyManagement />;
    case "location-management": return <LocationManagement />;
    case "api-settings":        return <APISettingsManagement />;
    case "ai-assistant":        return <AIPropertyAssistant />;
    case "booking-payment-settings": return <BookingPaymentSettings />;
    case "booking-management":  return <BookingManagement />;
    case "rental-management":   return <AdminRentalManagement />;
    case "video-tours":         return <VideoTourManager />;
    case "vr-tour-settings":    return <VRTourSettings />;
    case "bpjs-api-settings":   return <BPJSAPISettings />;
    case "admin-kyc-review":    return <AdminKYCReview />;
    case "video-verification-review": return <VideoVerificationReviewDashboard />;
    case "kyc-analytics":       return <KYCAnalyticsDashboard />;
    case "bulk-kyc-operations": return <BulkKYCOperations />;
    case "document-ocr":        return <DocumentOCR />;
    case "error-logs":          return <ErrorLogsTable />;
    case "user-experience-tips": return <UserExperienceTips />;
    case "algorithm-dashboard": return <AlgorithmDashboard />;
    case "notifications-center": return <AdminNotificationsCenter onSectionChange={onSectionChange} />;
    case "ai-feedback-analytics": return <AIFeedbackAnalytics />;
    case "project-map":         return <ProjectMapVisualization />;
    case "cookie-settings":     return <CookieConsentSettings />;
    case "captcha-settings":    return <CaptchaSettings />;
    case "cloudflare-settings": return <CloudflareSettings />;
    case "property-filters":    return <PropertyFiltersManagement filterType="all" title="All Property Filters" />;
    case "rent-filters":        return <PropertyFiltersManagement filterType="rent" title="Rent Property Filters" description="Manage filters for rental properties" />;
    case "sale-filters":        return <PropertyFiltersManagement filterType="sale" title="Sale Property Filters" description="Manage filters for properties for sale" />;
    case "new-project-filters": return <PropertyFiltersManagement filterType="all" title="New Project Filters" description="Manage filters for new development projects" />;
    case "nearby-facilities-settings": return <NearbyFacilitiesSettings />;
    case "error-monitoring":    return <ErrorMonitoringDashboard />;
    case "bug-error-detection": return <BugErrorDashboard />;
    case "testing-dashboard":   return <TestingDashboard />;
    case "vip-analytics":       return <VIPAnalyticsDashboard onNavigate={onSectionChange} />;
    case "transaction-hub":     return <TransactionManagementTabs />;
    case "mortgage-management": return <MortgageManagement />;
    case "blockchain-management": return <AdminBlockchainManagement />;
    case "b2b-marketplace":     return <B2BMarketplaceManagement />;
    case "partnership-programs": return <PartnerProgramManagement />;
    case "wna-investment-settings": return <InvestorSettingsHub initialTab="wna" />;
    case "wni-mortgage-settings": return <InvestorSettingsHub initialTab="wni" />;
    case "investor-analytics":  return <InvestorSettingsHub initialTab="analytics" />;
    case "design-system":
    case "website-design":      return <WebsiteDesignControl />;
    case "live-monitoring":     return <LiveMonitoringDashboard />;
    case "expansion-planning":  return <ExpansionPlanningManagement />;
    case "media-network":       return <MediaNetworkManagement />;
    case "user-acquisition":    return <UserAcquisitionManagement />;
    case "innovation-lab":      return <InnovationLabManagement />;
    case "mobile-enhancements": return <MobileEnhancementsManagement />;
    case "social-commerce":     return <SocialCommerceManagement />;
    case "data-exchange":       return <DataExchangeManagement />;
    case "automation-platform": return <AutomationPlatformManagement />;
    case "team-management":     return <TeamManagement />;
    case "viral-growth-campaigns": return <ViralGrowthCampaigns />;
    case "media-coverage-pr":   return <MediaCoveragePR />;
    case "concierge-service":   return <ConciergeServiceManagement />;
    case "sample-property-generator": return <SamplePropertyGenerator />;
    case "verification-system-settings": return <VerificationSystemSettings />;
    case "ahu-company-checker": return <AHUCompanyChecker />;
    case "auth-registration-settings": return <AuthRegistrationSettings />;
    default:                    return <AdminOverview />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboardContent = ({ activeSection, onSectionChange }: AdminDashboardContentProps) => {
  const isOverview = activeSection === "overview";
  const currentSection = sectionLabels[activeSection] ?? { label: activeSection, category: "Other" };

  const handleBack = () => onSectionChange?.("overview");

  return (
    <div className="flex-1 p-2 md:p-3 lg:p-4">
      {/* Back navigation breadcrumb */}
      {!isOverview && (
        <motion.div
          className="mb-2 md:mb-3"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-primary/5 via-background to-accent/5 border border-border/40 overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 md:h-7 px-1.5 md:px-2 gap-1 md:gap-1.5 hover:bg-primary/10 transition-all shrink-0"
              onClick={handleBack}
            >
              <ArrowLeft className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[9px] md:text-[10px] font-medium">Back</span>
            </Button>

            <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 md:h-6 md:w-6 shrink-0 hover:bg-primary/10"
              onClick={handleBack}
            >
              <Home className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </Button>

            <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />

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

            <span className="text-[10px] md:text-xs font-medium text-foreground shrink-0">
              {currentSection.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Animated section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {!isOverview && (
            <AdminCategoryTabs
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          )}
          <SectionErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {renderSection(activeSection, onSectionChange)}
            </Suspense>
          </SectionErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardContent;
