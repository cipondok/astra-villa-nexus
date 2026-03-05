/**
 * Admin Section Registry
 *
 * Centralises all lazy imports and section metadata for AdminDashboardContent.
 * Adding a new admin section only requires a change to this file.
 */
import { lazy, ComponentType } from "react";

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

// ─── Section labels metadata ──────────────────────────────────────────────────
export const sectionLabels: Record<string, { label: string; category: string }> = {
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
  "enhanced-search": { label: "Enhanced Search", category: "System" },
  "system-reports": { label: "System Reports", category: "System" },
  "daily-checkin": { label: "Daily Check-In", category: "Tokens" },
  "astra-token-hub": { label: "ASTRA Token Hub", category: "Tokens" },
  "tools-management": { label: "Tools Management", category: "System & Tools" },
  "rate-limiting": { label: "API Rate Limiting", category: "System & Tools" },
  "customer-service-control": { label: "CS Control Panel", category: "Support" },
  "seo-settings": { label: "SEO Hub", category: "Settings" },
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
};
