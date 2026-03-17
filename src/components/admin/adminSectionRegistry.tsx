/**
 * Admin Section Registry
 *
 * Centralises all lazy imports and section metadata for AdminDashboardContent.
 * Adding a new admin section only requires a change to this file.
 */
import React, { lazy, ComponentType } from "react";

// ─── Retry-aware lazy loader ──────────────────────────────────────────────────
function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
) {
  return lazy(() => {
    let attempt = 0;
    const load = (): Promise<{ default: T }> =>
      factory().catch((err) => {
        if (attempt < retries) {
          attempt++;
          return new Promise<{ default: T }>((resolve) =>
            setTimeout(() => resolve(load()), 1000 * attempt)
          );
        }
        throw err;
      });
    return load();
  });
}

// ─── Lazy component registry ──────────────────────────────────────────────────
export const AdminOverview = lazyRetry(() => import("./AdminOverview"));
export const UserManagementHub = lazyRetry(() => import("./UserManagementHub"));
export const UserLevelManagement = lazyRetry(() => import("./UserLevelManagement"));
export const VerificationManagement = lazyRetry(() => import("./VerificationManagement"));
export const UserUpgradeApplications = lazyRetry(() => import("./UserUpgradeApplications"));
export const PropertyManagementAdvanced = lazyRetry(() => import("./PropertyManagementAdvanced"));
export const AdminPropertyManagement = lazyRetry(() => import("./AdminPropertyManagement"));
export const SystemSettings = lazyRetry(() => import("./SystemSettings"));
export const WebTrafficAnalytics = lazyRetry(() => import("./WebTrafficAnalytics"));
export const AIBotManagement = lazyRetry(() => import("./AIBotManagement"));
export const FeedbackManagement = lazyRetry(() => import("./FeedbackManagement"));
export const CustomerServiceCenter = lazyRetry(() => import("./CustomerServiceCenter"));
export const LiveChatManagement = lazyRetry(() => import("./LiveChatManagement"));
export const ContactManagement = lazyRetry(() => import("./ContactManagement"));
export const ContentManagement = lazyRetry(() => import("./ContentManagement"));
export const SearchFiltersManagement = lazyRetry(() => import("./SearchFiltersManagement"));
export const BillingManagement = lazyRetry(() => import("./BillingManagement"));
export const DatabaseTableManagement = lazyRetry(() => import("./DatabaseTableManagement"));
export const SecurityMonitoringDashboard = lazyRetry(() => import("./SecurityMonitoringDashboard"));
export const PerformanceMonitor = lazyRetry(() => import("../PerformanceMonitor"));
export const ReportExportFunction = lazyRetry(() => import("./ReportExportFunction"));
export const PropertyComparison = lazyRetry(() => import("../PropertyComparison"));
export const EnhancedSearchFilters = lazyRetry(() => import("../EnhancedSearchFilters"));
export const SystemReports = lazyRetry(() => import("./SystemReports"));
export const DailyCheckInManagement = lazyRetry(() => import("./DailyCheckInManagement"));
export const ASTRATokenHub = lazyRetry(() => import("./ASTRATokenHub"));
export const ToolsManagementDashboard = lazyRetry(() => import("./ToolsManagementDashboard"));
// SEOSettings removed – use SystemSettings with defaultTab="seo-hub" instead
export const SEOManagement = lazyRetry(() => import("./SEOManagement"));
export const PropertySEOChecker = lazyRetry(() => import("./PropertySEOChecker"));
export const ProjectDiagnosticSystem = lazyRetry(() => import("./ProjectDiagnosticSystem"));
export const IndonesianPaymentMerchantConfig = lazyRetry(() => import("./IndonesianPaymentMerchantConfig"));
export const VendorsHubContent = lazyRetry(() => import("./VendorsHubContent"));
export const EnhancedVendorAgentControl = lazyRetry(() => import("./EnhancedVendorAgentControl"));
export const AuthorizationMonitoringSystem = lazyRetry(() => import("./AuthorizationMonitoringSystem"));
export const AdminAlertSystem = lazyRetry(() => import("./AdminAlertSystem"));
export const CustomerServiceControlPanel = lazyRetry(() => import("./CustomerServiceControlPanel"));
export const DatabaseErrorManager = lazyRetry(() => import("./cs-tools/DatabaseErrorManager"));
export const Property3DViewSettings = lazyRetry(() => import("./Property3DViewSettings"));
export const PropertySurveyManagement = lazyRetry(() => import("./PropertySurveyManagement"));
export const EmailSettings = lazyRetry(() => import("@/pages/admin/EmailSettings"));
export const LocationManagement = lazyRetry(() => import("./LocationManagement"));
export const APISettingsManagement = lazyRetry(() => import("./APISettingsManagement"));
export const AIPropertyAssistant = lazyRetry(() => import("./AIPropertyAssistant"));
export const BookingPaymentSettings = lazyRetry(() => import("./BookingPaymentSettings"));
export const BPJSAPISettings = lazyRetry(() => import("./BPJSAPISettings"));
export const AdminKYCReview = lazyRetry(() => import("./AdminKYCReview"));
export const VideoVerificationReviewDashboard = lazyRetry(() => import("./video-verification/VideoVerificationReviewDashboard"));
export const KYCAnalyticsDashboard = lazyRetry(() => import("./KYCAnalyticsDashboard").then((m) => ({ default: m.KYCAnalyticsDashboard })));
export const BulkKYCOperations = lazyRetry(() => import("./BulkKYCOperations").then((m) => ({ default: m.BulkKYCOperations })));
export const DocumentOCR = lazyRetry(() => import("./DocumentOCR").then((m) => ({ default: m.DocumentOCR })));
export const ErrorLogsTable = lazyRetry(() => import("./ErrorLogsTable"));
export const ErrorMonitoringDashboard = lazyRetry(() => import("./ErrorMonitoringDashboard"));
export const UserExperienceTips = lazyRetry(() => import("./UserExperienceTips"));
export const AlgorithmDashboard = lazyRetry(() => import("./AlgorithmDashboard").then((m) => ({ default: m.AlgorithmDashboard })));
export const AdminNotificationsCenter = lazyRetry(() => import("./AdminNotificationsCenter").then((m) => ({ default: m.AdminNotificationsCenter })));
export const LaunchReadinessDashboard = lazyRetry(() => import("./LaunchReadinessDashboard"));
export const AIFeedbackAnalytics = lazyRetry(() => import("./AIFeedbackAnalytics").then((m) => ({ default: m.AIFeedbackAnalytics })));
export const HomepageSliderSettings = lazyRetry(() => import("./HomepageSliderSettings"));
export const CarouselSettingsManager = lazyRetry(() => import("./CarouselSettingsManager"));
export const ProjectMapVisualization = lazyRetry(() => import("./ProjectMapVisualization"));
export const CookieConsentSettings = lazyRetry(() => import("./CookieConsentSettings"));
export const CaptchaSettings = lazyRetry(() => import("./CaptchaSettings"));
export const CloudflareSettings = lazyRetry(() => import("./CloudflareSettings"));
export const PropertyFiltersManagement = lazyRetry(() => import("./PropertyFiltersManagement"));
export const SocialMediaSettings = lazyRetry(() => import("./SocialMediaSettings"));
export const VisitorAnalytics = lazyRetry(() => import("./VisitorAnalytics"));
export const BugErrorDashboard = lazyRetry(() => import("./diagnostics/BugErrorDashboard").then((m) => ({ default: m.BugErrorDashboard })));
export const TestingDashboard = lazyRetry(() => import("./TestingDashboard"));
export const VIPAnalyticsDashboard = lazyRetry(() => import("./VIPAnalyticsDashboard"));
export const RolePermissionManager = lazyRetry(() => import("./RolePermissionManager"));
export const AdminRevenueCommissionDashboard = lazyRetry(() => import("./AdminRevenueCommissionDashboard"));
export const AdminRevenueIntelligenceDashboard = lazyRetry(() => import("./AdminRevenueIntelligenceDashboard"));
export const CategoryOverviewDashboard = lazyRetry(() => import("./CategoryOverviewDashboard"));
export const BookingManagement = lazyRetry(() => import("./BookingManagement"));
export const AdminRentalManagement = lazyRetry(() => import("./AdminRentalManagement"));
export const TransactionManagementTabs = lazyRetry(() => import("./TransactionManagementTabs"));
export const InvestorSettingsHub = lazyRetry(() => import("./InvestorSettingsHub"));
export const WebsiteDesignControl = lazyRetry(() => import("./WebsiteDesignControl"));
export const RateLimitingDashboard = lazyRetry(() => import("./RateLimitingDashboard"));
export const VideoTourManager = lazyRetry(() => import("./VideoTourManager"));
export const VRTourSettings = lazyRetry(() => import("./VRTourSettings"));
export const MortgageManagement = lazyRetry(() => import("./MortgageManagement"));
export const LiveMonitoringDashboard = lazyRetry(() => import("./LiveMonitoringDashboard"));
export const AdminBlockchainManagement = lazyRetry(() => import("./AdminBlockchainManagement"));
export const B2BMarketplaceManagement = lazyRetry(() => import("./B2BMarketplaceManagement"));
export const PartnerProgramManagement = lazyRetry(() => import("./PartnerProgramManagement"));
export const ExpansionPlanningManagement = lazyRetry(() => import("./ExpansionPlanningManagement"));
export const MediaNetworkManagement = lazyRetry(() => import("./MediaNetworkManagement"));
export const UserAcquisitionManagement = lazyRetry(() => import("./UserAcquisitionManagement"));
export const InnovationLabManagement = lazyRetry(() => import("./InnovationLabManagement"));
export const MobileEnhancementsManagement = lazyRetry(() => import("./MobileEnhancementsManagement"));
export const SocialCommerceManagement = lazyRetry(() => import("./SocialCommerceManagement"));
export const DataExchangeManagement = lazyRetry(() => import("./DataExchangeManagement"));
export const AutomationPlatformManagement = lazyRetry(() => import("./AutomationPlatformManagement"));
export const TeamManagement = lazyRetry(() => import("./TeamManagement"));
export const ViralGrowthCampaigns = lazyRetry(() => import("./ViralGrowthCampaigns"));
export const MediaCoveragePR = lazyRetry(() => import("./MediaCoveragePR"));
export const AHUCompanyChecker = lazyRetry(() => import("./AHUCompanyChecker"));
export const ConciergeServiceManagement = lazyRetry(() => import("./ConciergeServiceManagement"));
export const SamplePropertyGenerator = lazyRetry(() => import("./SamplePropertyGenerator"));
export const BulkImageGenerator = lazyRetry(() => import("./BulkImageGenerator"));
export const VerificationSystemSettings = lazyRetry(() => import("./settings/VerificationSystemSettings"));
export const AuthRegistrationSettings = lazyRetry(() => import("./settings/AuthRegistrationSettings"));
export const NearbyFacilitiesSettings = lazyRetry(() => import("./settings/NearbyFacilitiesSettings"));
export const AIPerformanceDashboard = lazyRetry(() => import("./AIPerformanceDashboard"));
export const AIModelWeightsPanel = lazyRetry(() => import("./AIModelWeightsPanel"));
export const DOMAccuracyReport = lazyRetry(() => import("./DOMAccuracyReport"));
export const CronJobMonitor = lazyRetry(() => import("./CronJobMonitor"));
export const WeightTuningHistory = lazyRetry(() => import("./WeightTuningHistory"));
export const SystemHealthDashboard = lazyRetry(() => import("./SystemHealthDashboard"));
export const AdminGuide = lazyRetry(() => import("./AdminGuide"));
export const AuditTrailDashboard = lazyRetry(() => import("./AuditTrailDashboard"));
export const RevenueAnalyticsDashboard = lazyRetry(() => import("./RevenueAnalyticsDashboard"));
export const BulkPropertyActions = lazyRetry(() => import("./BulkPropertyActions"));
export const NotificationTemplatesManager = lazyRetry(() => import("./NotificationTemplatesManager"));
export const UserEngagementAnalytics = lazyRetry(() => import("./UserEngagementAnalytics"));
export const AdminQuickActions = lazyRetry(() => import("./AdminQuickActions"));
export const DataBackupExport = lazyRetry(() => import("./DataBackupExport"));
export const PlatformChangelog = lazyRetry(() => import("./PlatformChangelog"));
export const APIUsageAnalytics = lazyRetry(() => import("./APIUsageAnalytics"));
export const SLAComplianceMonitor = lazyRetry(() => import("./SLAComplianceMonitor"));
export const CompetitorAnalysis = lazyRetry(() => import("./CompetitorAnalysis"));
export const SystemAnnouncements = lazyRetry(() => import("./SystemAnnouncements"));
export const FeedbackSentimentAnalysis = lazyRetry(() => import("./FeedbackSentimentAnalysis"));
export const ContentModerationQueue = lazyRetry(() => import("./ContentModerationQueue"));
export const ABTestResults = lazyRetry(() => import("./ABTestResults"));
export const GeoAnalytics = lazyRetry(() => import("./GeoAnalytics"));
export const ScheduledReportsManager = lazyRetry(() => import("./ScheduledReportsManager"));
export const PropertyHeatmapAnalytics = lazyRetry(() => import("./PropertyHeatmapAnalytics"));
export const AdminActivityLog = lazyRetry(() => import("./AdminActivityLog"));
export const PlatformHealthScore = lazyRetry(() => import("./PlatformHealthScore"));
export const UserFunnelAnalysis = lazyRetry(() => import("./UserFunnelAnalysis"));
export const EmailCampaignManager = lazyRetry(() => import("./EmailCampaignManager"));
export const PropertyQualityScore = lazyRetry(() => import("./PropertyQualityScore"));
export const UserSegmentation = lazyRetry(() => import("./UserSegmentation"));
export const RevenueForecasting = lazyRetry(() => import("./RevenueForecasting"));
export const ApiUsageMonitor = lazyRetry(() => import("./ApiUsageMonitor"));
export const TenantLeaseTracker = lazyRetry(() => import("./TenantLeaseTracker"));
export const SupportTicketAnalytics = lazyRetry(() => import("./SupportTicketAnalytics"));
export const NotificationCenterManager = lazyRetry(() => import("./NotificationCenterManager"));
export const VendorPerformanceDashboard = lazyRetry(() => import("./VendorPerformanceDashboard"));
export const CommissionTracker = lazyRetry(() => import("./CommissionTracker"));
export const PropertyComparisonTool = lazyRetry(() => import("./PropertyComparisonTool"));
export const SystemAuditTrail = lazyRetry(() => import("./SystemAuditTrail"));
export const SubscriptionPlanManager = lazyRetry(() => import("./SubscriptionPlanManager"));
export const DocumentVerificationQueue = lazyRetry(() => import("./DocumentVerificationQueue"));
export const MarketTrendsDashboard = lazyRetry(() => import("./MarketTrendsDashboard"));
export const PlatformFeedbackHub = lazyRetry(() => import("./PlatformFeedbackHub"));
export const ReferralProgramDashboard = lazyRetry(() => import("./ReferralProgramDashboard"));
export const PaymentTransactionLog = lazyRetry(() => import("./PaymentTransactionLog"));
export const PropertyStagingQueue = lazyRetry(() => import("./PropertyStagingQueue"));
export const AgentPerformanceLeaderboard = lazyRetry(() => import("./AgentPerformanceLeaderboard"));
export const InventoryAnalytics = lazyRetry(() => import("./InventoryAnalytics"));
export const LeadScoringDashboard = lazyRetry(() => import("./LeadScoringDashboard"));
export const ComplianceReportingCenter = lazyRetry(() => import("./ComplianceReportingCenter"));
export const CustomerJourneyMap = lazyRetry(() => import("./CustomerJourneyMap"));
export const MaintenanceRequestTracker = lazyRetry(() => import("./MaintenanceRequestTracker"));
export const InsurancePartnerManager = lazyRetry(() => import("./InsurancePartnerManager"));
export const KnowledgeBaseManager = lazyRetry(() => import("./KnowledgeBaseManager"));
export const AdCampaignManager = lazyRetry(() => import("./AdCampaignManager"));
export const WorkforceScheduler = lazyRetry(() => import("./WorkforceScheduler"));
export const TaxConfigCenter = lazyRetry(() => import("./TaxConfigCenter"));
export const LoyaltyProgramManager = lazyRetry(() => import("./LoyaltyProgramManager"));
export const MultiLanguageManager = lazyRetry(() => import("./MultiLanguageManager"));
export const EnvironmentalSustainability = lazyRetry(() => import("./EnvironmentalSustainability"));
export const ContractTemplateManager = lazyRetry(() => import("./ContractTemplateManager"));
export const PriceAlertManager = lazyRetry(() => import("./PriceAlertManager"));
export const DeveloperPortal = lazyRetry(() => import("./DeveloperPortal"));
export const EscrowManagement = lazyRetry(() => import("./EscrowManagement"));
export const AffiliateDashboard = lazyRetry(() => import("./AffiliateDashboard"));
export const ChatBotTraining = lazyRetry(() => import("./ChatBotTraining"));
export const PropertyValuationTool = lazyRetry(() => import("./PropertyValuationTool"));
export const FraudDetectionDashboard = lazyRetry(() => import("./FraudDetectionDashboard"));
export const SmartHomeIntegration = lazyRetry(() => import("./SmartHomeIntegration"));
export const CurrencyExchangeMonitor = lazyRetry(() => import("./CurrencyExchangeMonitor"));
export const CommunityForumManager = lazyRetry(() => import("./CommunityForumManager"));
export const NeighborhoodInsights = lazyRetry(() => import("./NeighborhoodInsights"));
export const DocumentSigningHub = lazyRetry(() => import("./DocumentSigningHub"));
export const PropertyAuctionManager = lazyRetry(() => import("./PropertyAuctionManager"));
export const TenantScreening = lazyRetry(() => import("./TenantScreening"));
export const AICommandCenter = lazyRetry(() => import("./AICommandCenter"));
export const GlobalStrategyPanel = lazyRetry(() => import("./GlobalStrategyPanel"));
export const InvestorDNAAdminPanel = lazyRetry(() => import("./InvestorDNAAdminPanel"));
export const GlobalMacroIntelligencePanel = lazyRetry(() => import("@/pages/GlobalMacroIntelligencePage"));
export const DealHunterAdminPanel = lazyRetry(() => import("./DealHunterAdminPanel"));
export const MarketHeatIntelligence = lazyRetry(() => import("./MarketHeatIntelligence"));
export const OpportunityScoringEngine = lazyRetry(() => import("./OpportunityScoringEngine"));
export const PricePredictionEngine = lazyRetry(() => import("./PricePredictionEngine"));
export const OffPlanProjectManager = lazyRetry(() => import("./OffPlanProjectManager"));

// Feature Enhancement dashboards
export const LaunchRoadmapDashboard = lazyRetry(() => import("./LaunchRoadmapDashboard"));
export const GrowthExecutionDashboard = lazyRetry(() => import("./GrowthExecutionDashboard"));
export const AgentAcquisitionDashboard = lazyRetry(() => import("./AgentAcquisitionDashboard"));
export const SupplyExpansionDashboard = lazyRetry(() => import("./SupplyExpansionDashboard"));
export const InvestorFunnelDashboard = lazyRetry(() => import("./InvestorFunnelDashboard"));
export const ViralContentDashboard = lazyRetry(() => import("./ViralContentDashboard"));
export const PartnershipExpansionDashboard = lazyRetry(() => import("./PartnershipExpansionDashboard"));
export const BrandAuthorityDashboard = lazyRetry(() => import("./BrandAuthorityDashboard"));
export const MonetizationStrategyDashboard = lazyRetry(() => import("./MonetizationStrategyDashboard"));
export const InvestorPitchDashboard = lazyRetry(() => import("./InvestorPitchDashboard"));
export const InvestorCommunityDashboard = lazyRetry(() => import("./InvestorCommunityDashboard"));
export const GeoExpansionDashboard = lazyRetry(() => import("./GeoExpansionDashboard"));
export const FounderBrandingDashboard = lazyRetry(() => import("./FounderBrandingDashboard"));
export const HiringRoadmapDashboard = lazyRetry(() => import("./HiringRoadmapDashboard"));
export const PartnershipManagerRole = lazyRetry(() => import("./PartnershipManagerRole"));
export const DigitalGrowthRole = lazyRetry(() => import("./DigitalGrowthRole"));
export const PropertySupplyManagerRole = lazyRetry(() => import("./PropertySupplyManagerRole"));
export const CustomerSuccessRole = lazyRetry(() => import("./CustomerSuccessRole"));
export const OrgChartDashboard = lazyRetry(() => import("./OrgChartDashboard"));
export const MarketingBudgetDashboard = lazyRetry(() => import("./MarketingBudgetDashboard"));
export const FundraisingReadinessDashboard = lazyRetry(() => import("./FundraisingReadinessDashboard"));
export const InvestorKPIDashboard = lazyRetry(() => import("./InvestorKPIDashboard"));
export const DeveloperPartnershipFramework = lazyRetry(() => import("./DeveloperPartnershipFramework"));
export const FounderWeeklyRoutine = lazyRetry(() => import("./FounderWeeklyRoutine"));
export const PRLaunchStrategyDashboard = lazyRetry(() => import("./PRLaunchStrategyDashboard"));
export const InvestorOutreachDashboard = lazyRetry(() => import("./InvestorOutreachDashboard"));
export const FounderDailySystem = lazyRetry(() => import("./FounderDailySystem"));
export const HyperExecutionPlan = lazyRetry(() => import("./HyperExecutionPlan"));
export const NinetyDayMasterPlan = lazyRetry(() => import("./NinetyDayMasterPlan"));
export const UIUXRedesignBlueprint = lazyRetry(() => import("./UIUXRedesignBlueprint"));
export const HomepageBlueprint = lazyRetry(() => import("./HomepageBlueprint"));
export const UIAuditReport = lazyRetry(() => import("./UIAuditReport"));
export const LegalSetupRoadmap = lazyRetry(() => import("./LegalSetupRoadmap"));
export const FinancialProjectionModel = lazyRetry(() => import("./FinancialProjectionModel"));
export const FundraisingExitRoadmap = lazyRetry(() => import("./FundraisingExitRoadmap"));
export const FounderBrandStrategy = lazyRetry(() => import("./FounderBrandStrategy"));
export const EquityAllocationFramework = lazyRetry(() => import("./EquityAllocationFramework"));
export const InvestorQAPrep = lazyRetry(() => import("./InvestorQAPrep"));
export const HiringRoadmap = lazyRetry(() => import("./HiringRoadmap"));
export const CustomerSupportFramework = lazyRetry(() => import("./CustomerSupportFramework"));
export const MarketplaceIntegrity = lazyRetry(() => import("./MarketplaceIntegrity"));
export const TeamKPIFramework = lazyRetry(() => import("./TeamKPIFramework"));
export const WeeklyLeadershipReview = lazyRetry(() => import("./WeeklyLeadershipReview"));
export const CompanyCulturePrinciples = lazyRetry(() => import("./CompanyCulturePrinciples"));
export const FounderDailyRoutine = lazyRetry(() => import("./FounderDailyRoutine"));
export const FounderMentalFramework = lazyRetry(() => import("./FounderMentalFramework"));
export const ThreeYearRoadmap = lazyRetry(() => import("./ThreeYearRoadmap"));

// ── Section render map ────────────────────────────────────────────────────────
// Maps section keys to a factory that returns JSX given an optional onSectionChange.
// Sections with custom props are listed explicitly; all others are simple <Component />.

type SectionRenderer = (onSectionChange?: (s: string) => void) => React.ReactNode;

export const sectionRenderMap: Record<string, SectionRenderer> = {
  // Overview & diagnostics
  "overview":            (sc) => <AdminOverview onSectionChange={sc} />,
  "diagnostic":          () => <ProjectDiagnosticSystem />,
  "project-progress":    (sc) => <LaunchReadinessDashboard onSectionChange={sc} />,
  "launch-readiness":    (sc) => <LaunchReadinessDashboard onSectionChange={sc} />,

  // Category overview dashboards
  "investor-management-overview":  (sc) => <CategoryOverviewDashboard category="investor-management" onSectionChange={sc} />,
  "transactions-overview":         (sc) => <CategoryOverviewDashboard category="transactions" onSectionChange={sc} />,
  "astra-token-overview":          (sc) => <CategoryOverviewDashboard category="astra-token" onSectionChange={sc} />,
  "tools-overview":                (sc) => <CategoryOverviewDashboard category="tools" onSectionChange={sc} />,
  "core-management-overview":      (sc) => <CategoryOverviewDashboard category="core-management" onSectionChange={sc} />,
  "customer-service-overview":     (sc) => <CategoryOverviewDashboard category="customer-service" onSectionChange={sc} />,
  "user-management-overview":      (sc) => <CategoryOverviewDashboard category="user-management" onSectionChange={sc} />,
  "vendor-management-overview":    (sc) => <CategoryOverviewDashboard category="vendor-management" onSectionChange={sc} />,
  "analytics-monitoring-overview": (sc) => <CategoryOverviewDashboard category="analytics-monitoring" onSectionChange={sc} />,
  "content-settings-overview":     (sc) => <CategoryOverviewDashboard category="content-settings" onSectionChange={sc} />,
  "system-settings-overview":      (sc) => <CategoryOverviewDashboard category="system-settings" onSectionChange={sc} />,
  "technical-overview":            (sc) => <CategoryOverviewDashboard category="technical" onSectionChange={sc} />,
  "features-overview":             (sc) => <CategoryOverviewDashboard category="features" onSectionChange={sc} />,
  "help-overview":                 (sc) => <CategoryOverviewDashboard category="help" onSectionChange={sc} />,

  // User management
  "user-management":     (sc) => <UserManagementHub onNavigate={sc} />,
  "user-levels":         (sc) => <UserLevelManagement onNavigate={sc} />,
  "verification-management": () => <VerificationManagement />,
  "upgrade-applications":    () => <UserUpgradeApplications />,
  "role-permission-management": () => <RolePermissionManager />,

  // Property
  "property-management":        () => <AdminPropertyManagement />,
  "property-management-hub":    () => <AdminPropertyManagement />,
  "property-management-advanced": () => <PropertyManagementAdvanced />,

  // Settings
  "system-settings":     () => <SystemSettings />,
  "settings":            () => <SystemSettings />,
  "smtp-settings":       () => <EmailSettings />,
  "indonesian-payment-config": () => <IndonesianPaymentMerchantConfig />,
  "seo-settings":        () => <SystemSettings defaultTab="seo-hub" />,

  // Analytics
  "visitor-analytics":   () => <VisitorAnalytics />,
  "analytics":           () => <WebTrafficAnalytics />,
  "performance-monitor": () => <PerformanceMonitor />,

  // AI & Tools
  "ai-bot-management":   () => <AIBotManagement />,
  "ai-assistant":        () => <AIPropertyAssistant />,
  "ai-command-center":   () => <AICommandCenter />,
  "ai-performance":      () => <AIPerformanceDashboard />,
  "ai-model-weights":    () => <AIModelWeightsPanel />,
  "ai-feedback-analytics": () => <AIFeedbackAnalytics />,

  // Support
  "feedback-management": () => <FeedbackManagement />,
  "customer-service":    () => <CustomerServiceCenter />,
  "chat-management":     () => <LiveChatManagement />,
  "contact-management":  () => <ContactManagement />,
  "customer-service-control": () => <CustomerServiceControlPanel />,

  // Vendors
  "vendors-hub":         () => <VendorsHubContent />,
  "vendor-agent-control": () => <EnhancedVendorAgentControl />,

  // Content
  "homepage-slider":     () => <HomepageSliderSettings />,
  "carousel-settings":   () => <CarouselSettingsManager />,
  "social-media-settings": () => <SocialMediaSettings />,
  "content-management":  () => <ContentManagement />,
  "search-filters":      () => <SearchFiltersManagement />,

  // Billing & payments
  "billing-management":  () => <BillingManagement />,
  "booking-payment-settings": () => <BookingPaymentSettings />,
  "booking-management":  () => <BookingManagement />,
  "transaction-hub":     () => <TransactionManagementTabs />,
  "mortgage-management": () => <MortgageManagement />,
  "revenue-commissions": () => <AdminRevenueIntelligenceDashboard />,

  // System
  "database-management": () => <DatabaseTableManagement />,
  "security-monitoring": () => <SecurityMonitoringDashboard />,
  "report-export":       () => <ReportExportFunction />,
  "enhanced-search":     () => <EnhancedSearchFilters />,
  "system-reports":      () => <SystemReports />,
  "daily-checkin":       () => <DailyCheckInManagement />,
  "astra-token-hub":     () => <ASTRATokenHub />,
  "tools-management":    () => <ToolsManagementDashboard />,
  "rate-limiting":       () => <RateLimitingDashboard />,
  "authorization-monitoring": () => <AuthorizationMonitoringSystem />,
  "admin-alerts":        () => <AdminAlertSystem />,
  "database-errors":     () => <DatabaseErrorManager />,
  "error-logs":          () => <ErrorLogsTable />,
  "error-monitoring":    () => <ErrorMonitoringDashboard />,
  "bug-error-detection": () => <BugErrorDashboard />,

  // SEO
  "seo-management":      () => <SEOManagement />,
  "property-seo-checker": () => <PropertySEOChecker />,

  // Property extras
  "property-3d-settings": () => <Property3DViewSettings />,
  "property-survey-management": () => <PropertySurveyManagement />,
  "location-management": () => <LocationManagement />,
  "property-comparison": () => <PropertyComparison />,
  "video-tours":         () => <VideoTourManager />,
  "vr-tour-settings":    () => <VRTourSettings />,
  "off-plan-manager":    () => <OffPlanProjectManager />,
  "sample-property-generator": () => <SamplePropertyGenerator />,
  "bulk-image-generator": () => <BulkImageGenerator />,

  // Property filters
  "property-filters":    () => <PropertyFiltersManagement filterType="all" title="All Property Filters" />,
  "rent-filters":        () => <PropertyFiltersManagement filterType="rent" title="Rent Property Filters" description="Manage filters for rental properties" />,
  "sale-filters":        () => <PropertyFiltersManagement filterType="sale" title="Sale Property Filters" description="Manage filters for properties for sale" />,
  "new-project-filters": () => <PropertyFiltersManagement filterType="all" title="New Project Filters" description="Manage filters for new development projects" />,

  // API & settings
  "api-settings":        () => <APISettingsManagement />,
  "bpjs-api-settings":   () => <BPJSAPISettings />,
  "cookie-settings":     () => <CookieConsentSettings />,
  "captcha-settings":    () => <CaptchaSettings />,
  "cloudflare-settings": () => <CloudflareSettings />,
  "nearby-facilities-settings": () => <NearbyFacilitiesSettings />,
  "verification-system-settings": () => <VerificationSystemSettings />,
  "auth-registration-settings": () => <AuthRegistrationSettings />,

  // KYC
  "admin-kyc-review":    () => <AdminKYCReview />,
  "video-verification-review": () => <VideoVerificationReviewDashboard />,
  "kyc-analytics":       () => <KYCAnalyticsDashboard />,
  "bulk-kyc-operations": () => <BulkKYCOperations />,
  "document-ocr":        () => <DocumentOCR />,

  // UX & algorithm
  "user-experience-tips": () => <UserExperienceTips />,
  "algorithm-dashboard": () => <AlgorithmDashboard />,
  "notifications-center": (sc) => <AdminNotificationsCenter onSectionChange={sc} />,
  "project-map":         () => <ProjectMapVisualization />,
  "testing-dashboard":   () => <TestingDashboard />,
  "vip-analytics":       (sc) => <VIPAnalyticsDashboard onNavigate={sc} />,

  // Investor settings
  "wna-investment-settings": () => <InvestorSettingsHub initialTab="wna" />,
  "wni-mortgage-settings":   () => <InvestorSettingsHub initialTab="wni" />,
  "investor-analytics":      () => <InvestorSettingsHub initialTab="analytics" />,

  // Design & monitoring
  "design-system":       () => <WebsiteDesignControl />,
  "website-design":      () => <WebsiteDesignControl />,
  "live-monitoring":     () => <LiveMonitoringDashboard />,
  "rental-management":   () => <AdminRentalManagement />,

  // Growth & features
  "blockchain-management": () => <AdminBlockchainManagement />,
  "b2b-marketplace":     () => <B2BMarketplaceManagement />,
  "partnership-programs": () => <PartnerProgramManagement />,
  "expansion-planning":  () => <ExpansionPlanningManagement />,
  "media-network":       () => <MediaNetworkManagement />,
  "user-acquisition":    () => <UserAcquisitionManagement />,
  "innovation-lab":      () => <InnovationLabManagement />,
  "mobile-enhancements": () => <MobileEnhancementsManagement />,
  "social-commerce":     () => <SocialCommerceManagement />,
  "data-exchange":       () => <DataExchangeManagement />,
  "automation-platform": () => <AutomationPlatformManagement />,
  "team-management":     () => <TeamManagement />,
  "viral-growth-campaigns": () => <ViralGrowthCampaigns />,
  "media-coverage-pr":   () => <MediaCoveragePR />,
  "concierge-service":   () => <ConciergeServiceManagement />,
  "ahu-company-checker": () => <AHUCompanyChecker />,

  // AI admin panels
  "dom-accuracy":        () => <DOMAccuracyReport />,
  "cron-monitor":        () => <CronJobMonitor />,
  "weight-tuning-history": () => <WeightTuningHistory />,
  "system-health":       () => <SystemHealthDashboard />,
  "admin-guide":         () => <AdminGuide />,
  "audit-trail":         () => <AuditTrailDashboard />,
  "revenue-analytics":   () => <RevenueAnalyticsDashboard />,
  "bulk-property-actions": () => <BulkPropertyActions />,
  "notification-templates": () => <NotificationTemplatesManager />,
  "user-engagement":     () => <UserEngagementAnalytics />,
  "data-backup":         () => <DataBackupExport />,
  "platform-changelog":  () => <PlatformChangelog />,
  "api-usage":           () => <ApiUsageMonitor />,
  "sla-compliance":      () => <SLAComplianceMonitor />,
  "competitor-analysis": () => <CompetitorAnalysis />,
  "system-announcements": () => <SystemAnnouncements />,
  "feedback-sentiment":  () => <FeedbackSentimentAnalysis />,
  "content-moderation":  () => <ContentModerationQueue />,
  "ab-test-results":     () => <ABTestResults />,
  "geo-analytics":       () => <GeoAnalytics />,
  "scheduled-reports":   () => <ScheduledReportsManager />,
  "property-heatmap":    () => <PropertyHeatmapAnalytics />,
  "admin-activity-log":  () => <AdminActivityLog />,
  "platform-health-score": () => <PlatformHealthScore />,
  "user-funnel":         () => <UserFunnelAnalysis />,
  "email-campaigns":     () => <EmailCampaignManager />,
  "property-quality":    () => <PropertyQualityScore />,
  "user-segmentation":   () => <UserSegmentation />,
  "revenue-forecasting": () => <RevenueForecasting />,
  "tenant-leases":       () => <TenantLeaseTracker />,
  "support-analytics":   () => <SupportTicketAnalytics />,
  "notification-center": () => <NotificationCenterManager />,
  "vendor-performance":  () => <VendorPerformanceDashboard />,
  "commission-tracker":  () => <CommissionTracker />,
  "system-audit-trail":  () => <SystemAuditTrail />,
  "subscription-plans":  () => <SubscriptionPlanManager />,
  "document-verification": () => <DocumentVerificationQueue />,
  "market-trends":       () => <MarketTrendsDashboard />,
  "platform-feedback":   () => <PlatformFeedbackHub />,
  "referral-program":    () => <ReferralProgramDashboard />,
  "payment-transactions": () => <PaymentTransactionLog />,
  "property-staging":    () => <PropertyStagingQueue />,
  "agent-leaderboard":   () => <AgentPerformanceLeaderboard />,
  "inventory-analytics": () => <InventoryAnalytics />,
  "lead-scoring":        () => <LeadScoringDashboard />,
  "compliance-reporting": () => <ComplianceReportingCenter />,
  "customer-journey":    () => <CustomerJourneyMap />,
  "maintenance-requests": () => <MaintenanceRequestTracker />,
  "insurance-partners":  () => <InsurancePartnerManager />,
  "knowledge-base":      () => <KnowledgeBaseManager />,
  "ad-campaigns":        () => <AdCampaignManager />,
  "workforce-scheduler": () => <WorkforceScheduler />,
  "tax-config":          () => <TaxConfigCenter />,
  "loyalty-program":     () => <LoyaltyProgramManager />,
  "multi-language":      () => <MultiLanguageManager />,
  "environmental-sustainability": () => <EnvironmentalSustainability />,
  "contract-templates":  () => <ContractTemplateManager />,
  "price-alerts":        () => <PriceAlertManager />,
  "developer-portal":    () => <DeveloperPortal />,
  "escrow-management":   () => <EscrowManagement />,
  "affiliate-dashboard": () => <AffiliateDashboard />,
  "chatbot-training":    () => <ChatBotTraining />,
  "property-valuation":  () => <PropertyValuationTool />,
  "fraud-detection":     () => <FraudDetectionDashboard />,
  "smart-home":          () => <SmartHomeIntegration />,
  "currency-exchange":   () => <CurrencyExchangeMonitor />,
  "community-forum":     () => <CommunityForumManager />,
  "neighborhood-insights": () => <NeighborhoodInsights />,
  "document-signing":    () => <DocumentSigningHub />,
  "property-auctions":   () => <PropertyAuctionManager />,
  "tenant-screening":    () => <TenantScreening />,
  "global-strategy":     () => <GlobalStrategyPanel />,
  "investor-dna-admin":  () => <InvestorDNAAdminPanel />,
  "global-macro-intelligence": () => <GlobalMacroIntelligencePanel />,
  "deal-hunter-admin":   () => <DealHunterAdminPanel />,
  "market-heat-intelligence": () => <MarketHeatIntelligence />,
  "opportunity-scoring-engine": () => <OpportunityScoringEngine />,
  "price-prediction-engine": () => <PricePredictionEngine />,
  "property-comparison-tool": () => <PropertyComparisonTool />,

  // Feature Enhancement dashboards
  "launch-roadmap":             () => <LaunchRoadmapDashboard />,
  "growth-execution":           () => <GrowthExecutionDashboard />,
  "agent-acquisition":          () => <AgentAcquisitionDashboard />,
  "supply-expansion":           () => <SupplyExpansionDashboard />,
  "investor-funnel":            () => <InvestorFunnelDashboard />,
  "viral-content":              () => <ViralContentDashboard />,
  "partnership-expansion":      () => <PartnershipExpansionDashboard />,
  "brand-authority":            () => <BrandAuthorityDashboard />,
  "monetization-strategy":      () => <MonetizationStrategyDashboard />,
  "investor-pitch":             () => <InvestorPitchDashboard />,
  "investor-community":         () => <InvestorCommunityDashboard />,
  "geo-expansion":              () => <GeoExpansionDashboard />,
  "founder-branding":           () => <FounderBrandingDashboard />,
  "hiring-roadmap":             () => <HiringRoadmapDashboard />,
  "partnership-manager-role":   () => <PartnershipManagerRole />,
  "digital-growth-role":        () => <DigitalGrowthRole />,
  "property-supply-manager-role": () => <PropertySupplyManagerRole />,
  "customer-success-role":      () => <CustomerSuccessRole />,
  "org-chart":                  () => <OrgChartDashboard />,
  "marketing-budget":           () => <MarketingBudgetDashboard />,
  "fundraising-readiness":      () => <FundraisingReadinessDashboard />,
  "investor-kpi-framework":     () => <InvestorKPIDashboard />,
  "developer-partnership-framework": () => <DeveloperPartnershipFramework />,
  "founder-weekly-routine":     () => <FounderWeeklyRoutine />,
  "pr-launch-strategy":         () => <PRLaunchStrategyDashboard />,
  "investor-outreach":          () => <InvestorOutreachDashboard />,
  "founder-daily-system":       () => <FounderDailySystem />,
  "hyper-execution-plan":       () => <HyperExecutionPlan />,
  "ninety-day-master-plan":     () => <NinetyDayMasterPlan />,
  "uiux-redesign-blueprint":    () => <UIUXRedesignBlueprint />,
  "homepage-blueprint":         () => <HomepageBlueprint />,
  "ui-audit-report":            () => <UIAuditReport />,
  "legal-setup-roadmap":        () => <LegalSetupRoadmap />,
  "financial-projection":       () => <FinancialProjectionModel />,
  "fundraising-exit-roadmap":   () => <FundraisingExitRoadmap />,
  "founder-brand-strategy":     () => <FounderBrandStrategy />,
  "equity-allocation-framework": () => <EquityAllocationFramework />,
  "investor-qa-prep":           () => <InvestorQAPrep />,
  "hiring-roadmap-10":          () => <HiringRoadmap />,
  "customer-support-framework": () => <CustomerSupportFramework />,
  "marketplace-integrity":      () => <MarketplaceIntegrity />,
  "team-kpi-framework":         () => <TeamKPIFramework />,
  "weekly-leadership-review":   () => <WeeklyLeadershipReview />,
  "company-culture-principles": () => <CompanyCulturePrinciples />,
  "founder-daily-routine":      () => <FounderDailyRoutine />,
  "founder-mental-framework":   () => <FounderMentalFramework />,
  "three-year-roadmap":         () => <ThreeYearRoadmap />,
};

// ─── Section labels metadata ──────────────────────────────────────────────────
export const sectionLabels: Record<string, { label: string; category: string }> = {
  "deal-hunter-admin": { label: "Deal Hunter Engine", category: "Investor Management" },
  "market-heat-intelligence": { label: "Market Heat Intelligence", category: "Investor Management" },
  "opportunity-scoring-engine": { label: "AI Scoring Engine", category: "AI & Tools" },
  "price-prediction-engine": { label: "Price Prediction Engine", category: "AI & Tools" },
  "ai-command-center": { label: "AI Command Center", category: "AI & Tools" },
  "investor-dna-admin": { label: "Investor DNA Intelligence", category: "Investor Management" },
  "global-macro-intelligence": { label: "Global Macro Intelligence", category: "Investor Management" },
  "global-strategy": { label: "Global Strategy", category: "AI & Tools" },
  "overview": { label: "Dashboard Overview", category: "" },
  "diagnostic": { label: "Project Diagnostics", category: "System" },
  "project-progress": { label: "Launch Readiness", category: "System" },
  "launch-readiness": { label: "Launch Readiness", category: "System" },
  "user-management": { label: "User Management", category: "Core Management" },
  "user-levels": { label: "User Levels", category: "Core Management" },
  "verification-management": { label: "Verification", category: "Core Management" },
  "upgrade-applications": { label: "Upgrade Applications", category: "Core Management" },
  "role-permission-management": { label: "Role & Permissions", category: "Core Management" },
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
  "enhanced-search": { label: "Enhanced Search", category: "System" },
  "system-reports": { label: "System Reports", category: "System" },
  "daily-checkin": { label: "Daily Check-In", category: "Tokens" },
  "astra-token-hub": { label: "ASTRA Token Hub", category: "Tokens" },
  "tools-management": { label: "Tools Management", category: "System & Tools" },
  "rate-limiting": { label: "API Rate Limiting", category: "System & Tools" },
  "customer-service-control": { label: "CS Control Panel", category: "Support" },
  "seo-settings": { label: "SEO Hub", category: "Settings" },
  "seo-management": { label: "SEO Management", category: "Marketing" },
  "property-seo-checker": { label: "Property SEO Checker", category: "Core Management" },
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
  "revenue-commissions": { label: "Revenue & Commissions", category: "Transactions" },
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
  "bulk-image-generator": { label: "Bulk AI Image Generator", category: "Property System" },
  "verification-system-settings": { label: "Verification System Settings", category: "Settings" },
  "auth-registration-settings": { label: "Auth & Registration", category: "Settings" },
  "ahu-company-checker": { label: "AHU Company Checker", category: "Verification" },
  "design-system": { label: "Design System", category: "Settings" },
  "website-design": { label: "Design System", category: "Settings" },
  "media-network": { label: "Media Network", category: "Features" },
  "user-acquisition": { label: "User Acquisition", category: "Features" },
  "nearby-facilities-settings": { label: "Nearby & Payment Settings", category: "Property System" },
  "off-plan-manager": { label: "Off-Plan Project Manager", category: "Property System" },
  "ai-performance": { label: "AI Performance", category: "Analytics" },
  "system-health": { label: "System Health", category: "Technical" },
  "admin-guide": { label: "Admin Guide", category: "Help" },
  "audit-trail": { label: "Audit Trail", category: "Security" },
  "revenue-analytics": { label: "Revenue Analytics", category: "Analytics" },
  "bulk-property-actions": { label: "Bulk Property Actions", category: "Property System" },
  "notification-templates": { label: "Notification Templates", category: "System" },
  "user-engagement": { label: "User Engagement", category: "Analytics" },
  "data-backup": { label: "Data Backup & Export", category: "System & Tools" },
  "platform-changelog": { label: "Platform Changelog", category: "Help" },
  
  "sla-compliance": { label: "SLA Compliance", category: "Analytics" },
  "competitor-analysis": { label: "Competitor Analysis", category: "Analytics" },
  "system-announcements": { label: "System Announcements", category: "System" },
  "feedback-sentiment": { label: "Feedback Sentiment", category: "Analytics" },
  "content-moderation": { label: "Content Moderation", category: "Core Management" },
  "ab-test-results": { label: "A/B Test Results", category: "Analytics" },
  "geo-analytics": { label: "Geo Analytics", category: "Analytics" },
  "scheduled-reports": { label: "Scheduled Reports", category: "System & Tools" },
  "property-heatmap": { label: "Property Heatmap", category: "Analytics" },
  "admin-activity-log": { label: "Admin Activity Log", category: "Security" },
  "platform-health-score": { label: "Platform Health Score", category: "System" },
  "user-funnel": { label: "User Funnel Analysis", category: "Analytics" },
  "email-campaigns": { label: "Email Campaigns", category: "Marketing" },
  "property-quality": { label: "Property Quality Score", category: "Property System" },
  "user-segmentation": { label: "User Segmentation", category: "Analytics" },
  "revenue-forecasting": { label: "Revenue Forecasting", category: "Analytics" },
  "api-usage": { label: "API Usage Monitor", category: "System" },
  "tenant-leases": { label: "Tenant & Lease Tracker", category: "Property System" },
  "support-analytics": { label: "Support Ticket Analytics", category: "Support" },
  "notification-center": { label: "Notification Center", category: "Marketing" },
  "vendor-performance": { label: "Vendor Performance", category: "Vendor System" },
  "commission-tracker": { label: "Commission Tracker", category: "Finance" },
  "property-comparison": { label: "Property Comparison", category: "Property System" },
  "system-audit-trail": { label: "System Audit Trail", category: "Security" },
  "subscription-plans": { label: "Subscription Plans", category: "Finance" },
  "document-verification": { label: "Document Verification", category: "Verification" },
  "market-trends": { label: "Market Trends", category: "Analytics" },
  "platform-feedback": { label: "Platform Feedback", category: "Support" },
  "referral-program": { label: "Referral Program", category: "Marketing" },
  "payment-transactions": { label: "Payment Transactions", category: "Finance" },
  "property-staging": { label: "Property Staging", category: "Property System" },
  "agent-leaderboard": { label: "Agent Leaderboard", category: "Analytics" },
  "inventory-analytics": { label: "Inventory Analytics", category: "Property System" },
  "lead-scoring": { label: "Lead Scoring", category: "Analytics" },
  "compliance-reporting": { label: "Compliance Reporting", category: "Governance" },
  "customer-journey": { label: "Customer Journey", category: "Analytics" },
  "maintenance-requests": { label: "Maintenance Requests", category: "Property System" },
  "insurance-partners": { label: "Insurance Partners", category: "Finance" },
  "knowledge-base": { label: "Knowledge Base", category: "Help" },
  "ad-campaigns": { label: "Ad Campaigns", category: "Marketing" },
  "workforce-scheduler": { label: "Workforce Scheduler", category: "Operations" },
  "tax-config": { label: "Tax Configuration", category: "Finance" },
  "loyalty-program": { label: "Loyalty Program", category: "Marketing" },
  "multi-language": { label: "Multi-Language", category: "Settings" },
  "escrow-management": { label: "Escrow Management", category: "Finance" },
  "affiliate-dashboard": { label: "Affiliate Program", category: "Marketing" },
  "chatbot-training": { label: "Chatbot Training", category: "AI & Tools" },
  "property-valuation": { label: "Property Valuation", category: "Property System" },
  // Feature Enhancement dashboards
  "launch-roadmap": { label: "Launch Roadmap", category: "Features" },
  "growth-execution": { label: "90-Day Growth Plan", category: "Features" },
  "agent-acquisition": { label: "Agent Acquisition", category: "Features" },
  "supply-expansion": { label: "Supply Expansion", category: "Features" },
  "investor-funnel": { label: "Investor Growth Funnel", category: "Features" },
  "viral-content": { label: "Viral Content Strategy", category: "Features" },
  "partnership-expansion": { label: "Partnership Expansion", category: "Features" },
  "brand-authority": { label: "Brand Authority Strategy", category: "Features" },
  "monetization-strategy": { label: "Monetization Strategy", category: "Features" },
  "investor-pitch": { label: "Investor Pitch Deck", category: "Features" },
  "investor-community": { label: "Investor Community", category: "Features" },
  "geo-expansion": { label: "Geographic Expansion", category: "Features" },
  "founder-branding": { label: "Founder Branding", category: "Features" },
  "hiring-roadmap": { label: "Hiring Roadmap", category: "Features" },
  "partnership-manager-role": { label: "Partnership Manager Role", category: "Features" },
  "digital-growth-role": { label: "Digital Growth Lead Role", category: "Features" },
  "property-supply-manager-role": { label: "Property Supply Manager Role", category: "Features" },
  "customer-success-role": { label: "Customer Success Role", category: "Features" },
  "org-chart": { label: "Org Chart & Structure", category: "Features" },
  "marketing-budget": { label: "Marketing Budget Plan", category: "Features" },
  "fundraising-readiness": { label: "Fundraising Readiness", category: "Features" },
  "investor-kpi-framework": { label: "Investor KPI Framework", category: "Features" },
  "developer-partnership-framework": { label: "Developer Partnership Framework", category: "Features" },
  "founder-weekly-routine": { label: "Founder Weekly Routine", category: "Features" },
  "pr-launch-strategy": { label: "PR Launch Strategy", category: "Features" },
  "investor-outreach": { label: "Investor Outreach Plan", category: "Features" },
  "founder-daily-system": { label: "Founder Daily System", category: "Features" },
  "hyper-execution-plan": { label: "30-Day Hyper Execution", category: "Features" },
  "ninety-day-master-plan": { label: "90-Day Master Execution", category: "Features" },
  "uiux-redesign-blueprint": { label: "UI/UX Redesign Blueprint", category: "Features" },
  "homepage-blueprint": { label: "Homepage Layout Blueprint", category: "Features" },
  "ui-audit-report": { label: "UI/UX Audit Report", category: "Features" },
  "legal-setup-roadmap": { label: "Legal Setup & Licensing", category: "Features" },
  "financial-projection": { label: "24-Month Financial Projection", category: "Features" },
  "fundraising-exit-roadmap": { label: "Fundraising & Exit Roadmap", category: "Features" },
  "founder-brand-strategy": { label: "Founder Brand Strategy", category: "Features" },
  "equity-allocation-framework": { label: "Equity Allocation Framework", category: "Features" },
  "investor-qa-prep": { label: "Investor Q&A Preparation", category: "Features" },
  "hiring-roadmap-10": { label: "First 10 Hires Roadmap", category: "Features" },
  "customer-support-framework": { label: "Customer Support Framework", category: "Features" },
  "marketplace-integrity": { label: "Marketplace Integrity & QC", category: "Features" },
  "team-kpi-framework": { label: "Team KPI Framework", category: "Features" },
  "weekly-leadership-review": { label: "Weekly Leadership Review", category: "Features" },
  "company-culture-principles": { label: "Culture & Workflow Principles", category: "Features" },
  "founder-daily-routine": { label: "Founder Daily Routine", category: "Features" },
  "founder-mental-framework": { label: "Founder Mental Framework", category: "Features" },
  "three-year-roadmap": { label: "3-Year Strategic Roadmap", category: "Features" },
};
