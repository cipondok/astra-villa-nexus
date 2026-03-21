// App entry point
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { Loader2 } from 'lucide-react';

import { PropertyComparisonProvider } from '@/contexts/PropertyComparisonContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminOnlyRoute from '@/components/AdminOnlyRoute';
import { DesignSystemProvider } from '@/components/DesignSystemProvider';
import CookieSystem from '@/components/cookies/CookieSystem';
import { useTranslation } from '@/i18n/useTranslation';
import { useCLSMonitor } from '@/hooks/useCLSMonitor';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReferralTracking } from '@/hooks/useReferralTracking';

const AuthenticatedHooks = lazy(() => import('@/components/AuthenticatedHooks'));

import { useAdminCheck } from '@/hooks/useAdminCheck';
import MaintenancePage from '@/pages/MaintenancePage';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
import { DataSaverProvider } from '@/contexts/DataSaverContext';
// Lazy load all non-critical shell components — reduces initial parse time
const Navigation = lazy(() => import('@/components/Navigation'));
const ProfessionalFooter = lazy(() => import('@/components/ProfessionalFooter'));
const MobileFooter = lazy(() => import('@/components/MobileFooter'));
import InitialLoadingScreen from '@/components/ui/InitialLoadingScreen';
const GlobalLoadingIndicator = lazy(() => import('@/components/ui/GlobalLoadingIndicator'));


const ResponsiveAIChatWidget = lazy(() => import('@/components/ai/ResponsiveAIChatWidget'));

const WhatsAppInquiryButton = lazy(() => import('@/components/WhatsAppInquiryButton'));
const FloatingThemeToggle = lazy(() => import('@/components/FloatingThemeToggle'));
const MobileBottomTabBar = lazy(() => import('@/components/navigation/MobileBottomTabBar'));


// Lazy load shell handlers — none are needed for first paint
const SessionExpirationHandler = lazy(() => import('@/components/SessionExpirationHandler'));
const AuthNotificationHandler = lazy(() => import('@/components/AuthNotificationHandler'));

// Route guards — lazy loaded since they're only used by specific routes
const VendorOnlyRoute = lazy(() => import('@/components/VendorOnlyRoute'));
const AgentOnlyRoute = lazy(() => import('@/components/AgentOnlyRoute'));
const PropertyOwnerOnlyRoute = lazy(() => import('@/components/PropertyOwnerOnlyRoute'));

// All pages — lazy loaded for minimum initial bundle
const Index = lazy(() => import('@/pages/Index'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const CityInvestmentPage = lazy(() => import('@/pages/CityInvestmentPage'));
const InvestorOnboarding = lazy(() => import('@/pages/InvestorOnboarding'));
const AIListingGenerator = lazy(() => import('@/pages/AIListingGenerator'));
const Search = lazy(() => import('@/pages/Search'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const Dijual = lazy(() => import('@/pages/Dijual'));
const Disewa = lazy(() => import('@/pages/Disewa'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const ProvinceProperties = lazy(() => import('@/pages/ProvinceProperties'));
const LocationAnalyticsDashboard = lazy(() => import('@/pages/LocationAnalyticsDashboard'));
const AIPerformanceDashboard = lazy(() => import('@/components/admin/AIPerformanceDashboard'));
const AdminListingReview = lazy(() => import('@/pages/AdminListingReview'));
const AgentDashboard = lazy(() => import('@/pages/AgentDashboard'));
const VendorDashboard = lazy(() => import('@/pages/VendorDashboard'));
const PropertyOwnerDashboard = lazy(() => import('@/pages/PropertyOwnerDashboard'));
const VendorKYCDashboard = lazy(() => import('@/pages/VendorKYCDashboard'));
const CustomerServiceDashboardPage = lazy(() => import('@/pages/CustomerServiceDashboard'));
const UserDashboardPage = lazy(() => import('@/pages/UserDashboardPage'));
// ThreeDShowcase removed - consolidated into VR Tour
const AddProperty = lazy(() => import('@/pages/AddProperty'));
const SubmitPropertyListing = lazy(() => import('@/pages/SubmitPropertyListing'));
const InvestorLandingPage = lazy(() => import('@/pages/InvestorLandingPage'));
const DealRoom = lazy(() => import('@/pages/DealRoom'));
const LaunchCommandCenter = lazy(() => import('@/pages/LaunchCommandCenter'));
const PropertyDeepAnalysis = lazy(() => import('@/pages/PropertyDeepAnalysis'));
const InvestorOnboardingWizard = lazy(() => import('@/pages/InvestorOnboardingWizard'));
const InvestorReferralEngine = lazy(() => import('@/pages/InvestorReferralEngine'));
const MarketIntelligenceHeatmap = lazy(() => import('@/pages/MarketIntelligenceHeatmap'));
const SmartDealMatching = lazy(() => import('@/pages/SmartDealMatching'));
const InvestorIntelligenceReports = lazy(() => import('@/pages/InvestorIntelligenceReports'));
const LiquidityForecastEngine = lazy(() => import('@/pages/LiquidityForecastEngine'));
const InvestorIntelligenceDeck = lazy(() => import('@/pages/InvestorIntelligenceDeck'));
const DeveloperPipelineCRM = lazy(() => import('@/pages/DeveloperPipelineCRM'));
const PricingInefficiencyDetector = lazy(() => import('@/pages/PricingInefficiencyDetector'));
const InvestmentPerformanceTracker = lazy(() => import('@/pages/InvestmentPerformanceTracker'));
const AutonomousDealAlerts = lazy(() => import('@/pages/AutonomousDealAlerts'));
const InvestorRiskIntelligence = lazy(() => import('@/pages/InvestorRiskIntelligence'));
const ExitStrategyPlanner = lazy(() => import('@/pages/ExitStrategyPlanner'));
const DemandSentimentAnalyzer = lazy(() => import('@/pages/DemandSentimentAnalyzer'));
const CapitalAllocationOptimizer = lazy(() => import('@/pages/CapitalAllocationOptimizer'));
const DealSyndicationHub = lazy(() => import('@/pages/DealSyndicationHub'));
const GrowthIntelligenceBrain = lazy(() => import('@/pages/GrowthIntelligenceBrain'));
const GlobalExpansionSimulator = lazy(() => import('@/pages/GlobalExpansionSimulator'));
const PropertyTokenizationHub = lazy(() => import('@/pages/PropertyTokenizationHub'));
const MarketCyclePredictionEngine = lazy(() => import('@/pages/MarketCyclePredictionEngine'));
const CrossBorderInvestorGateway = lazy(() => import('@/pages/CrossBorderInvestorGateway'));
const AutonomousAcquisitionEngine = lazy(() => import('@/pages/AutonomousAcquisitionEngine'));
const GlobalDealFlowNetwork = lazy(() => import('@/pages/GlobalDealFlowNetwork'));
const HedgeFundMode = lazy(() => import('@/pages/HedgeFundMode'));
const UrbanGrowthSimulator = lazy(() => import('@/pages/UrbanGrowthSimulator'));
const AutonomousClosingSystem = lazy(() => import('@/pages/AutonomousClosingSystem'));
const RealEstateMacroRadar = lazy(() => import('@/pages/RealEstateMacroRadar'));
const InvestorBehaviorPrediction = lazy(() => import('@/pages/InvestorBehaviorPrediction'));
const IPORoadshowPage = lazy(() => import('@/pages/IPORoadshowPage'));
const MarketplaceOperationsBrain = lazy(() => import('@/pages/MarketplaceOperationsBrain'));
const SelfLearningValuationCore = lazy(() => import('@/pages/SelfLearningValuationCore'));
const RealEstateIntelligenceAPIHub = lazy(() => import('@/pages/RealEstateIntelligenceAPIHub'));
const AIWealthAdvisor = lazy(() => import('@/pages/AIWealthAdvisor'));
const AutonomousGlobalPropertyExchange = lazy(() => import('@/pages/AutonomousGlobalPropertyExchange'));
const RealEstateIntelligenceOS = lazy(() => import('@/pages/RealEstateIntelligenceOS'));
const WealthUniverseEngine = lazy(() => import('@/pages/WealthUniverseEngine'));
const GlobalInvestorNetworkAI = lazy(() => import('@/pages/GlobalInvestorNetworkAI'));
const SelfOptimizingEcosystem = lazy(() => import('@/pages/SelfOptimizingEcosystem'));
const InvestorAcquisitionFunnel = lazy(() => import('@/pages/InvestorAcquisitionFunnel'));
const ListingSEOTrafficEngine = lazy(() => import('@/pages/ListingSEOTrafficEngine'));
const PropertyContentEngine = lazy(() => import('@/pages/PropertyContentEngine'));
const MarketplaceEvolution = lazy(() => import('@/pages/MarketplaceEvolution'));
const LiquidityIntelligenceEngine = lazy(() => import('@/pages/LiquidityIntelligenceEngine'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const BookingSuccessPage = lazy(() => import('@/pages/BookingSuccessPage'));
const MembershipPage = lazy(() => import('@/pages/MembershipPage'));
const AstraTokensPage = lazy(() => import('@/pages/AstraTokensPage'));
const Community = lazy(() => import('@/pages/Community'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const MarketplaceCategory = lazy(() => import('@/pages/MarketplaceCategory'));
const VendorRegistration = lazy(() => import('@/pages/VendorRegistration'));
const ConstructionCostCalculator = lazy(() => import('@/pages/calculators/ConstructionCostCalculator'));
const HomeLoanCalculator = lazy(() => import('@/pages/calculators/HomeLoanCalculator'));
const AreaUnitConverter = lazy(() => import('@/pages/calculators/AreaUnitConverter'));
const Saved = lazy(() => import('@/pages/Saved'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileEditPage = lazy(() => import('@/pages/ProfileEditPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const DesignSystemSettings = lazy(() => import('@/pages/admin/DesignSystemSettings'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceCategory = lazy(() => import('@/pages/ServiceCategory'));
const ServiceProviderProfile = lazy(() => import('@/pages/ServiceProviderProfile'));
const LegalServices = lazy(() => import('@/pages/LegalServices'));
const MyRentalInquiries = lazy(() => import('@/pages/MyRentalInquiries'));
const InvestorWatchlist = lazy(() => import('@/pages/InvestorWatchlist'));
const ProjectShowcase = lazy(() => import('@/pages/ProjectShowcase'));
const DeveloperDashboard = lazy(() => import('@/pages/DeveloperDashboard'));
const PreLaunching = lazy(() => import('@/pages/PreLaunching'));
const NewProjects = lazy(() => import('@/pages/NewProjects'));
const AreaGuides = lazy(() => import('@/pages/AreaGuides'));
const Properties = lazy(() => import('@/pages/Properties'));
const InvestorDemo = lazy(() => import('@/pages/InvestorDemo'));
const MyProperties = lazy(() => import('@/pages/MyProperties'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Users = lazy(() => import('@/pages/Users'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const MobileFirstDemo = lazy(() => import('@/components/responsive/MobileFirstDemo'));
const Investment = lazy(() => import('@/pages/Investment'));
const Offers = lazy(() => import('@/pages/Offers'));
const PartnerNetwork = lazy(() => import('@/pages/partners/PartnerNetwork'));
const BecomePartner = lazy(() => import('@/pages/partners/BecomePartner'));
const PartnerBenefits = lazy(() => import('@/pages/partners/PartnerBenefits'));
const JointVentures = lazy(() => import('@/pages/partners/JointVentures'));
const SharedSearch = lazy(() => import('@/pages/SharedSearch'));
const AdvancedSearchPage = lazy(() => import('@/pages/AdvancedSearchPage'));
const AstraDevelopment = lazy(() => import('@/pages/AstraDevelopment'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const LocationMap = lazy(() => import('@/pages/LocationMap'));
const AIMapSearchPage = lazy(() => import('@/pages/AIMapSearchPage'));
const PropertyMapSearchPage = lazy(() => import('@/pages/PropertyMapSearch'));
const DigitalTwinPage = lazy(() => import('@/pages/DigitalTwinPage'));
const VirtualStagingPage = lazy(() => import('@/pages/VirtualStagingPage'));
const AIImageEnhancePage = lazy(() => import('@/pages/AIImageEnhancePage'));
const PropertyVideoTourPage = lazy(() => import('@/pages/PropertyVideoTourPage'));
const ReferralAffiliatePage = lazy(() => import('@/pages/ReferralAffiliatePage'));
const MarketReportPage = lazy(() => import('@/pages/MarketReportPage'));
const FraudDetectorPage = lazy(() => import('@/pages/FraudDetectorPage'));
const AIRecommendationsPage = lazy(() => import('@/pages/AIRecommendationsPage'));
const ImageQualityAnalyzerPage = lazy(() => import('@/pages/ImageQualityAnalyzerPage'));
const TenantScreeningPage = lazy(() => import('@/pages/TenantScreeningPage'));
const VirtualTourGeneratorPage = lazy(() => import('@/pages/VirtualTourGeneratorPage'));
const ComparativeMarketAnalysisPage = lazy(() => import('@/pages/ComparativeMarketAnalysisPage'));
const SmartNotificationsPage = lazy(() => import('@/pages/SmartNotificationsPage'));
const NeighborhoodInsightsPage = lazy(() => import('@/pages/NeighborhoodInsightsPage'));
const ContractAnalyzerPage = lazy(() => import('@/pages/ContractAnalyzerPage'));
const AILeadScoringPage = lazy(() => import('@/pages/AILeadScoringPage'));
const AIInteriorDesignPage = lazy(() => import('@/pages/AIInteriorDesignPage'));
const AISocialCopyPage = lazy(() => import('@/pages/AISocialCopyPage'));
const AIDocumentVerifierPage = lazy(() => import('@/pages/AIDocumentVerifierPage'));
const AIRentalYieldPage = lazy(() => import('@/pages/AIRentalYieldPage'));
const AIMortgageAdvisorPage = lazy(() => import('@/pages/AIMortgageAdvisorPage'));
const AIPropertyValuationPage = lazy(() => import('@/pages/AIPropertyValuationPage'));
const AITenantMatchingPage = lazy(() => import('@/pages/AITenantMatchingPage'));
const AISmartPricingPage = lazy(() => import('@/pages/AISmartPricingPage'));
const MLValuationEnginePage = lazy(() => import('@/pages/MLValuationEnginePage'));
const InvestmentScenarioSimulatorPage = lazy(() => import('@/pages/InvestmentScenarioSimulatorPage'));
const InstitutionalAnalyticsPage = lazy(() => import('@/pages/InstitutionalAnalyticsPage'));
const OpportunityDiscoveryEnginePage = lazy(() => import('@/pages/OpportunityDiscoveryEnginePage'));
const AIDocumentGeneratorPage = lazy(() => import('@/pages/AIDocumentGeneratorPage'));
const RentalYieldOptimizerPage = lazy(() => import('@/pages/RentalYieldOptimizerPage'));
const WealthSimulatorPage = lazy(() => import('@/pages/WealthSimulatorPage'));
const GlobalMacroIntelligencePage = lazy(() => import('@/pages/GlobalMacroIntelligencePage'));
const Contact = lazy(() => import('@/pages/Contact'));
const Help = lazy(() => import('@/pages/Help'));
const About = lazy(() => import('@/pages/About'));
const WNIPage = lazy(() => import('@/pages/investor/WNIPage'));
const WNAPage = lazy(() => import('@/pages/investor/WNAPage'));
const VerificationCenter = lazy(() => import('@/pages/VerificationCenter'));
const CommunityHub = lazy(() => import('@/pages/CommunityHub'));
const AIContentGenerator = lazy(() => import('@/pages/AIContentGenerator'));
const ViralCampaigns = lazy(() => import('@/pages/ViralCampaigns'));
const PlatformHub = lazy(() => import('@/pages/PlatformHub'));
const VRTourShowcase = lazy(() => import('@/pages/VRTourShowcase'));
const BlockchainVerification = lazy(() => import('@/pages/BlockchainVerification'));
const MediaHub = lazy(() => import('@/pages/MediaHub'));
const AgentDirectory = lazy(() => import('@/pages/AgentDirectory'));
const AgentRegistration = lazy(() => import('@/pages/AgentRegistration'));
const PropertyComparison = lazy(() => import('@/pages/PropertyComparison'));
const PreQualificationPage = lazy(() => import('@/pages/PreQualificationPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotificationsHub = lazy(() => import('@/pages/NotificationsHub'));
const DocumentManagement = lazy(() => import('@/pages/DocumentManagement'));
const UserRentalDashboard = lazy(() => import('@/pages/UserRentalDashboard'));
const AIPriceEstimator = lazy(() => import('@/pages/AIPriceEstimator'));
const KprCalculatorPage = lazy(() => import('@/pages/KprCalculatorPage'));
const MarketIntelligence = lazy(() => import('@/pages/MarketIntelligence'));
const EarlyInvestment = lazy(() => import('@/pages/EarlyInvestment'));
const PortfolioDashboard = lazy(() => import('@/pages/PortfolioDashboard'));
const InvestorDashboard = lazy(() => import('@/pages/InvestorDashboard'));
const PortfolioCommandCenter = lazy(() => import('@/pages/PortfolioCommandCenter'));
const InvestorIntelligenceTerminal = lazy(() => import('@/pages/InvestorIntelligenceTerminal'));
const PortfolioROITrackerPage = lazy(() => import('@/pages/PortfolioROITrackerPage'));
const MarketIntelligenceFeedPage = lazy(() => import('@/pages/MarketIntelligenceFeedPage'));
const AuctionFlashDealsPage = lazy(() => import('@/pages/AuctionFlashDealsPage'));
const InvestmentMapExplorerPage = lazy(() => import('@/pages/InvestmentMapExplorerPage'));
const DealFinderPage = lazy(() => import('@/pages/DealFinderPage'));
const PricePredictionPage = lazy(() => import('@/pages/PricePredictionPage'));
const NegotiationAssistantPage = lazy(() => import('@/pages/NegotiationAssistantPage'));
const SellerIntelligencePage = lazy(() => import('@/pages/SellerIntelligencePage'));
const ListingOptimizerPage = lazy(() => import('@/pages/ListingOptimizerPage'));
const PropertyMarketDashboard = lazy(() => import('@/pages/PropertyMarketDashboard'));
const LocationIntelligencePage = lazy(() => import('@/pages/LocationIntelligencePage'));
const InvestorAlertsPage = lazy(() => import('@/pages/InvestorAlertsPage'));
const PortfolioBuilderPage = lazy(() => import('@/pages/PortfolioBuilderPage'));
const FundIntelligencePage = lazy(() => import('@/pages/FundIntelligencePage'));
const PriceIntelligencePage = lazy(() => import('@/pages/PriceIntelligencePage'));
const OffMarketDealsPage = lazy(() => import('@/pages/OffMarketDealsPage'));
const ProjectLaunchPage = lazy(() => import('@/pages/ProjectLaunchPage'));
const LaunchRadarPage = lazy(() => import('@/pages/LaunchRadarPage'));
const SmartCityPage = lazy(() => import('@/pages/SmartCityPage'));
const LiquidityEnginePage = lazy(() => import('@/pages/LiquidityEnginePage'));
const HedgingEnginePage = lazy(() => import('@/pages/HedgingEnginePage'));
const StressTestEnginePage = lazy(() => import('@/pages/StressTestEnginePage'));
const PortfolioOptimizerPage = lazy(() => import('@/pages/PortfolioOptimizerPage'));
const InvestorFeedPage = lazy(() => import('@/pages/InvestorFeedPage'));
const TourPlannerPage = lazy(() => import('@/pages/TourPlannerPage'));
const InvestmentAssistantPage = lazy(() => import('@/pages/InvestmentAssistantPage'));
const InvestmentAdvisorPage = lazy(() => import('@/pages/InvestmentAdvisorPage'));
const AISearchAssistantPage = lazy(() => import('@/pages/AISearchAssistantPage'));
const InvestmentLeaderboardPage = lazy(() => import('@/pages/InvestmentLeaderboardPage'));
const VisualSearchPage = lazy(() => import('@/pages/VisualSearchPage'));
const ListingPredictorPage = lazy(() => import('@/pages/ListingPredictorPage'));
const MarketTrendsPage = lazy(() => import('@/pages/MarketTrendsPage'));
const AutonomousAgentPage = lazy(() => import('@/pages/AutonomousAgentPage'));
const AIAutopilotPage = lazy(() => import('@/pages/AIAutopilotPage'));
const PriceDropDealsPage = lazy(() => import('@/pages/PriceDropDealsPage'));
const AgentCRMDashboard = lazy(() => import('@/pages/AgentCRMDashboard'));
const OfferNegotiationPage = lazy(() => import('@/pages/OfferNegotiationPage'));
const MyOffersPage = lazy(() => import('@/pages/MyOffersPage'));
const MortgageFinancingPage = lazy(() => import('@/pages/MortgageFinancingPage'));
const PropertyAnalyticsReportPage = lazy(() => import('@/pages/PropertyAnalyticsReportPage'));
const InvestmentReportPage = lazy(() => import('@/pages/InvestmentReportPage'));
const MobileHomeFeed = lazy(() => import('@/pages/mobile/MobileHomeFeed'));
const MobilePropertyDetail = lazy(() => import('@/pages/mobile/MobilePropertyDetail'));
const MobileInvestorDashboard = lazy(() => import('@/pages/mobile/MobileInvestorDashboard'));
const MobileAIChat = lazy(() => import('@/pages/mobile/MobileAIChat'));
const MobileAlerts = lazy(() => import('@/pages/mobile/MobileAlerts'));
const FractionalInvestmentPage = lazy(() => import('@/pages/FractionalInvestmentPage'));
const DeveloperDemandForecastPage = lazy(() => import('@/pages/DeveloperDemandForecastPage'));
const CrossBorderDiscoveryPage = lazy(() => import('@/pages/CrossBorderDiscoveryPage'));
const DealHunterBotPage = lazy(() => import('@/pages/DealHunterBotPage'));
const DeveloperCampaignPage = lazy(() => import('@/pages/DeveloperCampaignPage'));
const OwnershipLifecyclePage = lazy(() => import('@/pages/OwnershipLifecyclePage'));
const MacroPredictionTerminal = lazy(() => import('@/pages/MacroPredictionTerminal'));
const GlobalPredictiveAnalyticsPage = lazy(() => import('@/pages/GlobalPredictiveAnalyticsPage'));
const InvestorSocialNetwork = lazy(() => import('@/pages/InvestorSocialNetwork'));
const VirtualPropertyExplorer = lazy(() => import('@/pages/VirtualPropertyExplorer'));
const ProductArchitecturePage = lazy(() => import('@/pages/ProductArchitecturePage'));
const SuperappBlueprintPage = lazy(() => import('@/pages/SuperappBlueprintPage'));
const DevelopmentRoadmapPage = lazy(() => import('@/pages/DevelopmentRoadmapPage'));
const SchemaArchitecturePage = lazy(() => import('@/pages/SchemaArchitecturePage'));
const ApiArchitecturePage = lazy(() => import('@/pages/ApiArchitecturePage'));
const IndexingStrategyPage = lazy(() => import('@/pages/IndexingStrategyPage'));
const RealtimeArchitecturePage = lazy(() => import('@/pages/RealtimeArchitecturePage'));
const CronSchedulePage = lazy(() => import('@/pages/CronSchedulePage'));
const SecurityHardeningPage = lazy(() => import('@/pages/SecurityHardeningPage'));
const CloudInfrastructurePage = lazy(() => import('@/pages/CloudInfrastructurePage'));
const DisasterRecoveryPage = lazy(() => import('@/pages/DisasterRecoveryPage'));
const BehaviorAnalyticsPage = lazy(() => import('@/pages/BehaviorAnalyticsPage'));
const UserActivationDashboard = lazy(() => import('@/pages/UserActivationDashboard'));
const AILearningFrameworkPage = lazy(() => import('@/pages/AILearningFrameworkPage'));
const ABTestingFrameworkPage = lazy(() => import('@/pages/ABTestingFrameworkPage'));
const GoToMarketStrategyPage = lazy(() => import('@/pages/GoToMarketStrategyPage'));
const First1000UsersPage = lazy(() => import('@/pages/First1000UsersPage'));
const DealConversionPipelinePage = lazy(() => import('@/pages/DealConversionPipelinePage'));
const SalesScriptsPage = lazy(() => import('@/pages/SalesScriptsPage'));
const AgentOnboardingScriptsPage = lazy(() => import('@/pages/AgentOnboardingScriptsPage'));
const LiveDemoPresentationPage = lazy(() => import('@/pages/LiveDemoPresentationPage'));
const DailyLeadGenPlanPage = lazy(() => import('@/pages/DailyLeadGenPlanPage'));
const SocialMediaStrategyPage = lazy(() => import('@/pages/SocialMediaStrategyPage'));
const FundraisingChecklistPage = lazy(() => import('@/pages/FundraisingChecklistPage'));
const DailyGrowthMonitorPage = lazy(() => import('@/pages/DailyGrowthMonitorPage'));
const NegotiationPsychologyPage = lazy(() => import('@/pages/NegotiationPsychologyPage'));
const HNWInvestorStrategyPage = lazy(() => import('@/pages/HNWInvestorStrategyPage'));
const BrandTrustStrategyPage = lazy(() => import('@/pages/BrandTrustStrategyPage'));
const RevenueOptimizationPage = lazy(() => import('@/pages/RevenueOptimizationPage'));
const GeographicExpansionPage = lazy(() => import('@/pages/GeographicExpansionPage'));
const UnicornPositioningPage = lazy(() => import('@/pages/UnicornPositioningPage'));
const SevenDaySprintPage = lazy(() => import('@/pages/SevenDaySprintPage'));
const LocalDominancePage = lazy(() => import('@/pages/LocalDominancePage'));
const RevenueActivationPage = lazy(() => import('@/pages/RevenueActivationPage'));
const FirstDealClosurePage = lazy(() => import('@/pages/FirstDealClosurePage'));
const InvestorPresentationScript = lazy(() => import('@/pages/InvestorPresentationScript'));
const AgentIncentivesPage = lazy(() => import('@/pages/AgentIncentivesPage'));
const LaunchDayPage = lazy(() => import('@/pages/LaunchDayPage'));
const DealPipelinePage = lazy(() => import('@/pages/DealPipelinePage'));
const ContentStrategyPage = lazy(() => import('@/pages/ContentStrategyPage'));
const DealCRMPage = lazy(() => import('@/pages/DealCRMPage'));
const FollowUpTemplatesPage = lazy(() => import('@/pages/FollowUpTemplatesPage'));
const AgentRetentionPage = lazy(() => import('@/pages/AgentRetentionPage'));
const SuccessStoryPage = lazy(() => import('@/pages/SuccessStoryPage'));
const ROICalculatorPage = lazy(() => import('@/pages/ROICalculatorPage'));
const AgentEffectivenessPage = lazy(() => import('@/pages/AgentEffectivenessPage'));
const ViralGrowthPage = lazy(() => import('@/pages/ViralGrowthPage'));
const InvestorClubPage = lazy(() => import('@/pages/InvestorClubPage'));
const DataMoatPage = lazy(() => import('@/pages/DataMoatPage'));
const RevenueScalingPage = lazy(() => import('@/pages/RevenueScalingPage'));
const CityExpansionPage = lazy(() => import('@/pages/CityExpansionPage'));
const EcosystemPartnershipsPage = lazy(() => import('@/pages/EcosystemPartnershipsPage'));
const MarketingPerformancePage = lazy(() => import('@/pages/MarketingPerformancePage'));
const CompanyDashboardPage = lazy(() => import('@/pages/CompanyDashboardPage'));
const ExecutiveKPIsPage = lazy(() => import('@/pages/ExecutiveKPIsPage'));
const ScalingRoadmapPage = lazy(() => import('@/pages/ScalingRoadmapPage'));
const ExecutionRoadmapPage = lazy(() => import('@/pages/ExecutionRoadmapPage'));
const FeaturePrioritizationPage = lazy(() => import('@/pages/FeaturePrioritizationPage'));
const LaunchReadinessPage = lazy(() => import('@/pages/LaunchReadinessPage'));
const First30DaysPage = lazy(() => import('@/pages/First30DaysPage'));
const First10DealsPage = lazy(() => import('@/pages/First10DealsPage'));
const MarketDominancePage = lazy(() => import('@/pages/MarketDominancePage'));
const KPICommandCenterPage = lazy(() => import('@/pages/KPICommandCenterPage'));
const SeriesAReadinessPage = lazy(() => import('@/pages/SeriesAReadinessPage'));
const CityExpansionMasterPlanPage = lazy(() => import('@/pages/CityExpansionMasterPlanPage'));
const NetworkEffectAccelerationPage = lazy(() => import('@/pages/NetworkEffectAccelerationPage'));
const FounderExitWealthPage = lazy(() => import('@/pages/FounderExitWealthPage'));
const NationalDominationBlueprintPage = lazy(() => import('@/pages/NationalDominationBlueprintPage'));
const GlobalInvestorTerminalPage = lazy(() => import('@/pages/GlobalInvestorTerminalPage'));
const FounderPersonalOSPage = lazy(() => import('@/pages/FounderPersonalOSPage'));
const GlobalProptechEmpirePage = lazy(() => import('@/pages/GlobalProptechEmpirePage'));
const DailySalesWarCommandPage = lazy(() => import('@/pages/DailySalesWarCommandPage'));
const First500InvestorsPage = lazy(() => import('@/pages/First500InvestorsPage'));
const AutomationChecklistPage = lazy(() => import('@/pages/AutomationChecklistPage'));
const First30DaysCalendarPage = lazy(() => import('@/pages/First30DaysCalendarPage'));
const NegotiationScriptsPage = lazy(() => import('@/pages/NegotiationScriptsPage'));
const WeeklyRevenueTrackingPage = lazy(() => import('@/pages/WeeklyRevenueTrackingPage'));
const DealSprintExecutionPage = lazy(() => import('@/pages/DealSprintExecutionPage'));
const InvestorFollowUpPage = lazy(() => import('@/pages/InvestorFollowUpPage'));
const TrustSignalSystemPage = lazy(() => import('@/pages/TrustSignalSystemPage'));
const SixMonthSurvivalPlanPage = lazy(() => import('@/pages/SixMonthSurvivalPlanPage'));
const AgentProductivityIntelligencePage = lazy(() => import('@/pages/AgentProductivityIntelligencePage'));
const RevenueLeakDetectionPage = lazy(() => import('@/pages/RevenueLeakDetectionPage'));
const FirstProfitableMonthPage = lazy(() => import('@/pages/FirstProfitableMonthPage'));
const ListingDemandForecastPage = lazy(() => import('@/pages/ListingDemandForecastPage'));
const FounderFastDecisionPage = lazy(() => import('@/pages/FounderFastDecisionPage'));
const RevenueFlywheelStrategyPage = lazy(() => import('@/pages/RevenueFlywheelStrategyPage'));
const InvestorDealFlowAutomationPage = lazy(() => import('@/pages/InvestorDealFlowAutomationPage'));
const FounderResilienceSystemPage = lazy(() => import('@/pages/FounderResilienceSystemPage'));
const First10MRevenueScalingPage = lazy(() => import('@/pages/First10MRevenueScalingPage'));
const FounderSchedulePage = lazy(() => import('@/pages/FounderSchedulePage'));
const EnergyOptimizationPage = lazy(() => import('@/pages/EnergyOptimizationPage'));
const DecisionPrioritizationPage = lazy(() => import('@/pages/DecisionPrioritizationPage'));
const ResilienceFrameworkPage = lazy(() => import('@/pages/ResilienceFrameworkPage'));
const NegotiationMindsetPage = lazy(() => import('@/pages/NegotiationMindsetPage'));
const VisionFrameworkPage = lazy(() => import('@/pages/VisionFrameworkPage'));
const InvestorSentimentDashboardPage = lazy(() => import('@/pages/InvestorSentimentDashboardPage'));
const HedgeFundDefensePage = lazy(() => import('@/pages/HedgeFundDefensePage'));
const FounderPowerOSPage = lazy(() => import('@/pages/FounderPowerOSPage'));
const PlanetaryScaleRoadmapPage = lazy(() => import('@/pages/PlanetaryScaleRoadmapPage'));
const DataMoatIntelligencePage = lazy(() => import('@/pages/DataMoatIntelligencePage'));
const FundraisingArchitecturePage = lazy(() => import('@/pages/FundraisingArchitecturePage'));
const RevenueLayerArchitecturePage = lazy(() => import('@/pages/RevenueLayerArchitecturePage'));
const VendorMonetizationPyramidPage = lazy(() => import('@/pages/VendorMonetizationPyramidPage'));
const InstitutionalSaaSBlueprintPage = lazy(() => import('@/pages/InstitutionalSaaSBlueprintPage'));
const RevenueScalingBlueprintPage = lazy(() => import('@/pages/RevenueScalingBlueprintPage'));
const MonetizationPricingPage = lazy(() => import('@/pages/MonetizationPricingPage'));
const SprintExecutionRoadmapPage = lazy(() => import('@/pages/SprintExecutionRoadmapPage'));
const MarketplaceLaunchPlaybookPage = lazy(() => import('@/pages/MarketplaceLaunchPlaybookPage'));
const CityLaunchPlaybookPage = lazy(() => import('@/pages/CityLaunchPlaybookPage'));
const RevenueProjectionModelPage = lazy(() => import('@/pages/RevenueProjectionModelPage'));
const InvestorKPIFrameworkPage = lazy(() => import('@/pages/InvestorKPIFrameworkPage'));
const VendorAcquisitionScriptsPage = lazy(() => import('@/pages/VendorAcquisitionScriptsPage'));
const FeatureImpactMatrixPage = lazy(() => import('@/pages/FeatureImpactMatrixPage'));
const ProfitMaximizationDashboard = lazy(() => import('@/pages/ProfitMaximizationDashboard'));
const Founder90DayCalendarPage = lazy(() => import('@/pages/Founder90DayCalendarPage'));
const First50DealsPlaybookPage = lazy(() => import('@/pages/First50DealsPlaybookPage'));
const AgentRecruitmentSystemPage = lazy(() => import('@/pages/AgentRecruitmentSystemPage'));
const LiquidityScoringPage = lazy(() => import('@/pages/LiquidityScoringPage'));
const VendorJobRoutingPage = lazy(() => import('@/pages/VendorJobRoutingPage'));
const First10InvestorClosingPage = lazy(() => import('@/pages/First10InvestorClosingPage'));
const PricingPsychologyPage = lazy(() => import('@/pages/PricingPsychologyPage'));
const DealRiskDetectionPage = lazy(() => import('@/pages/DealRiskDetectionPage'));
const AgentLeaderboardPage = lazy(() => import('@/pages/AgentLeaderboardPage'));
const RevenueMilestonePage = lazy(() => import('@/pages/RevenueMilestonePage'));
// Minimal lazy loading fallback - just shows content area skeleton
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--gold-primary))]" />
  </div>
);

// Hook to check maintenance mode status from DB
const useMaintenanceMode = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['maintenanceMode', 'maintenanceMessage']);
        const map: Record<string, string> = {};
        data?.forEach((r) => { map[r.key] = String(r.value ?? ''); });
        setMaintenanceMode(map.maintenanceMode === 'true');
        setMaintenanceMessage(map.maintenanceMessage || '');
      } catch {
        // silent — don't block app on settings error
      }
    };
    check();
  }, []);

  return { maintenanceMode, maintenanceMessage };
};

const AppContent = () => {
  useCLSMonitor(process.env.NODE_ENV === 'development');
  useScrollRestore(true);
  useReferralTracking();
  
  const location = useLocation();
  const { language } = useTranslation();
  const isAdminRoute = ['/admin', '/admin-dashboard', '/settings', '/admin/ai-performance', '/admin/listing-review'].includes(location.pathname);
  const { isMobile } = useIsMobile();
  const { isAdmin } = useAdminCheck();
  const { maintenanceMode, maintenanceMessage } = useMaintenanceMode();

  // Block non-admins when maintenance mode is on (admin routes stay accessible)
  if (maintenanceMode && !isAdmin && !isAdminRoute) {
    return <MaintenancePage message={maintenanceMessage} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NetworkStatusIndicator />
      <Suspense fallback={null}><AuthenticatedHooks /></Suspense>
      <Suspense fallback={null}><GlobalLoadingIndicator /></Suspense>
      {!isAdminRoute && <Suspense fallback={null}><Navigation /></Suspense>}
      
      <main className={isAdminRoute ? '' : 'pt-10 md:pt-11 lg:pt-12 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0'}>
        <AnimatePresence mode="popLayout" initial={false}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/investor-landing" element={<InvestorLandingPage />} />
                <Route path="/onboarding/investor" element={<InvestorOnboarding />} />
                <Route path="/onboarding/investor-wizard" element={<InvestorOnboardingWizard />} />
                <Route path="/referral-engine" element={<InvestorReferralEngine />} />
                <Route path="/market-heatmap" element={<MarketIntelligenceHeatmap />} />
                <Route path="/smart-deal-matching" element={<SmartDealMatching />} />
                <Route path="/investor-reports" element={<InvestorIntelligenceReports />} />
                <Route path="/liquidity-forecast" element={<LiquidityForecastEngine />} />
                <Route path="/investor-deck" element={<InvestorIntelligenceDeck />} />
                <Route path="/developer-pipeline" element={<DeveloperPipelineCRM />} />
                <Route path="/pricing-inefficiency" element={<PricingInefficiencyDetector />} />
                <Route path="/investment-performance" element={<InvestmentPerformanceTracker />} />
                <Route path="/deal-alerts" element={<AutonomousDealAlerts />} />
                <Route path="/risk-intelligence" element={<InvestorRiskIntelligence />} />
                <Route path="/exit-strategy" element={<ExitStrategyPlanner />} />
                <Route path="/demand-sentiment" element={<DemandSentimentAnalyzer />} />
                <Route path="/capital-allocation" element={<CapitalAllocationOptimizer />} />
                <Route path="/deal-syndication" element={<DealSyndicationHub />} />
                <Route path="/growth-intelligence" element={<GrowthIntelligenceBrain />} />
                <Route path="/global-expansion" element={<GlobalExpansionSimulator />} />
                <Route path="/property-tokenization" element={<PropertyTokenizationHub />} />
                <Route path="/market-cycle" element={<MarketCyclePredictionEngine />} />
                <Route path="/cross-border-gateway" element={<CrossBorderInvestorGateway />} />
                <Route path="/autonomous-acquisition" element={<AutonomousAcquisitionEngine />} />
                <Route path="/global-deal-flow" element={<GlobalDealFlowNetwork />} />
                <Route path="/hedge-fund-mode" element={<HedgeFundMode />} />
                <Route path="/urban-growth-simulator" element={<UrbanGrowthSimulator />} />
                <Route path="/autonomous-closing" element={<AutonomousClosingSystem />} />
                <Route path="/macro-radar" element={<RealEstateMacroRadar />} />
                <Route path="/investor-behavior-prediction" element={<InvestorBehaviorPrediction />} />
                <Route path="/operations-brain" element={<MarketplaceOperationsBrain />} />
                <Route path="/valuation-core" element={<SelfLearningValuationCore />} />
                <Route path="/api-hub" element={<RealEstateIntelligenceAPIHub />} />
                <Route path="/wealth-advisor" element={<AIWealthAdvisor />} />
                <Route path="/global-exchange" element={<AutonomousGlobalPropertyExchange />} />
                <Route path="/intelligence-os" element={<RealEstateIntelligenceOS />} />
                <Route path="/wealth-universe" element={<WealthUniverseEngine />} />
                <Route path="/investor-network" element={<GlobalInvestorNetworkAI />} />
                <Route path="/self-optimizing-ecosystem" element={<SelfOptimizingEcosystem />} />
                <Route path="/investor-funnel" element={<InvestorAcquisitionFunnel />} />
                <Route path="/seo-traffic-engine" element={<ListingSEOTrafficEngine />} />
                <Route path="/content-engine" element={<PropertyContentEngine />} />
                <Route path="/marketplace-evolution" element={<MarketplaceEvolution />} />
                <Route path="/liquidity-intelligence" element={<LiquidityIntelligenceEngine />} />
                <Route path="/invest/:citySlug" element={<CityInvestmentPage />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search-advanced" element={<AdvancedSearchPage />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/favorites" element={<Saved />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/astra-tokens" element={<AstraTokensPage />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/category/:categoryId" element={<ServiceCategory />} />
                <Route path="/vendor/:vendorId" element={<ServiceProviderProfile />} />
                <Route path="/legal-services" element={<LegalServices />} />
                <Route path="/dijual" element={<Dijual />} />
                <Route path="/buy" element={<Dijual />} />
                <Route path="/disewa" element={<Disewa />} />
                <Route path="/rent" element={<Disewa />} />
                <Route path="/pre-launching" element={<PreLaunching />} />
                <Route path="/new-projects" element={<NewProjects />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/3d-showcase" element={<Navigate to="/vr-tour" replace />} />
                <Route path="/vr-tour" element={<VRTourShowcase />} />
                <Route path="/blockchain-verification" element={<BlockchainVerification />} />
                <Route path="/fractional-investment" element={<FractionalInvestmentPage />} />
                <Route path="/developer-demand-forecast" element={<DeveloperDemandForecastPage />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/post-property" element={<AddProperty />} />
                <Route path="/submit-listing" element={<SubmitPropertyListing />} />
                <Route path="/deal-room" element={<DealRoom />} />
                <Route path="/deal-room/:dealId" element={<DealRoom />} />
                <Route path="/launch-command" element={<LaunchCommandCenter />} />
                <Route path="/property-analysis" element={<PropertyDeepAnalysis />} />
                <Route path="/property-analysis/:id" element={<PropertyDeepAnalysis />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/location-analytics" element={<LocationAnalyticsDashboard />} />
                <Route path="/province-properties" element={<ProvinceProperties />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin/design-system" element={<DesignSystemSettings />} />
                <Route element={<AdminOnlyRoute />}>
                  <Route path="/admin/ai-performance" element={<AIPerformanceDashboard />} />
                  <Route path="/admin/listing-review" element={<AdminListingReview />} />
                </Route>
                <Route path="/agent-dashboard" element={<AgentDashboard />} />
                <Route path="/agent-crm" element={<ProtectedRoute />}>
                  <Route index element={<AgentCRMDashboard />} />
                </Route>
                <Route path="/agent" element={<Navigate to="/agent-dashboard" replace />} />
                <Route path="/listings" element={<Navigate to="/agent-dashboard" replace />} />
                <Route path="/agent-listings" element={<Navigate to="/agent-dashboard" replace />} />
                <Route path="/vendor/kyc" element={<VendorKYCDashboard />} />
                <Route element={<VendorOnlyRoute />}>
                  <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                  <Route path="/vendor" element={<VendorDashboard />} />
                </Route>
                <Route element={<AgentOnlyRoute />}>
                  <Route path="/dashboard/agent" element={<AgentDashboard />} />
                </Route>
                <Route element={<PropertyOwnerOnlyRoute />}>
                  <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboard />} />
                </Route>
                <Route path="/my-properties" element={<MyProperties />} />
                <Route path="/dashboard/customer-service" element={<CustomerServiceDashboardPage />} />
                <Route path="/dashboard/user" element={<UserDashboardPage />} />
                <Route path="/user-dashboard" element={<UserDashboardPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/booking/:propertyId" element={<BookingPage />} />
                <Route path="/booking-success" element={<BookingSuccessPage />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/users" element={<Users />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calculators/construction" element={<ConstructionCostCalculator />} />
                <Route path="/calculators/loan" element={<HomeLoanCalculator />} />
                <Route path="/calculators/area" element={<AreaUnitConverter />} />
                <Route path="/areas" element={<AreaGuides />} />
                <Route path="/investment" element={<Investment />} />
                <Route path="/early-investment" element={<EarlyInvestment />} />
                <Route path="/portfolio-dashboard" element={<ProtectedRoute />}>
                  <Route index element={<PortfolioDashboard />} />
                </Route>
                <Route path="/investor-dashboard" element={<ProtectedRoute />}>
                  <Route index element={<InvestorDashboard />} />
                </Route>
                <Route path="/portfolio-command-center" element={<ProtectedRoute />}>
                  <Route index element={<PortfolioCommandCenter />} />
                </Route>
                <Route path="/investor-intelligence-terminal" element={<ProtectedRoute />}>
                  <Route index element={<InvestorIntelligenceTerminal />} />
                </Route>
                <Route path="/ipo-roadshow" element={<ProtectedRoute />}>
                  <Route index element={<IPORoadshowPage />} />
                </Route>
                <Route path="/portfolio-roi-tracker" element={<ProtectedRoute />}>
                  <Route index element={<PortfolioROITrackerPage />} />
                </Route>
                <Route path="/market-intelligence-feed" element={<MarketIntelligenceFeedPage />} />
                <Route path="/flash-deals" element={<AuctionFlashDealsPage />} />
                <Route path="/investment-map-explorer" element={<InvestmentMapExplorerPage />} />
                <Route path="/ai-autopilot" element={<ProtectedRoute />}>
                  <Route index element={<AIAutopilotPage />} />
                </Route>
                <Route path="/portfolio-builder" element={<ProtectedRoute />}>
                  <Route index element={<PortfolioBuilderPage />} />
                </Route>
                <Route path="/fund-intelligence" element={<ProtectedRoute />}>
                  <Route index element={<FundIntelligencePage />} />
                </Route>
                <Route path="/price-intelligence" element={<ProtectedRoute />}>
                  <Route index element={<PriceIntelligencePage />} />
                </Route>
                <Route path="/off-market-deals" element={<ProtectedRoute />}>
                  <Route index element={<OffMarketDealsPage />} />
                </Route>
                <Route path="/project-launch" element={<ProtectedRoute />}>
                  <Route index element={<ProjectLaunchPage />} />
                </Route>
                <Route path="/launch-radar" element={<ProtectedRoute />}>
                  <Route index element={<LaunchRadarPage />} />
                </Route>
                <Route path="/smart-city" element={<ProtectedRoute />}>
                  <Route index element={<SmartCityPage />} />
                </Route>
                <Route path="/liquidity-engine" element={<ProtectedRoute />}>
                  <Route index element={<LiquidityEnginePage />} />
                </Route>
                <Route path="/hedging-engine" element={<ProtectedRoute />}>
                  <Route index element={<HedgingEnginePage />} />
                </Route>
                <Route path="/stress-test-engine" element={<ProtectedRoute />}>
                  <Route index element={<StressTestEnginePage />} />
                </Route>
                <Route path="/portfolio-optimizer" element={<ProtectedRoute />}>
                  <Route index element={<PortfolioOptimizerPage />} />
                </Route>
                <Route path="/investor-feed" element={<ProtectedRoute />}>
                  <Route index element={<InvestorFeedPage />} />
                </Route>
                <Route path="/tour-planner" element={<ProtectedRoute />}>
                  <Route index element={<TourPlannerPage />} />
                </Route>
                <Route path="/investment-assistant" element={<ProtectedRoute />}>
                  <Route index element={<InvestmentAssistantPage />} />
                </Route>
                <Route path="/investment-advisor" element={<ProtectedRoute />}>
                  <Route index element={<InvestmentAdvisorPage />} />
                </Route>
                <Route path="/visual-search" element={<VisualSearchPage />} />
                <Route path="/listing-predictor" element={<ProtectedRoute />}>
                  <Route index element={<ListingPredictorPage />} />
                </Route>
                <Route path="/market-trends" element={<MarketTrendsPage />} />
                <Route path="/autonomous-agent" element={<ProtectedRoute />}>
                  <Route index element={<AutonomousAgentPage />} />
                </Route>
                <Route path="/deal-finder" element={<ProtectedRoute />}>
                  <Route index element={<DealFinderPage />} />
                </Route>
                <Route path="/price-prediction" element={<ProtectedRoute />}>
                  <Route index element={<PricePredictionPage />} />
                </Route>
                <Route path="/negotiation-assistant" element={<ProtectedRoute />}>
                  <Route index element={<NegotiationAssistantPage />} />
                </Route>
                <Route path="/seller-intelligence" element={<ProtectedRoute />}>
                  <Route index element={<SellerIntelligencePage />} />
                </Route>
                <Route path="/listing-optimizer" element={<ProtectedRoute />}>
                  <Route index element={<ListingOptimizerPage />} />
                </Route>
                <Route path="/foreign-investment" element={<Navigate to="/investment" replace />} />
                <Route path="/kpr-calculator" element={<KprCalculatorPage />} />
                <Route path="/simulasi-kpr" element={<Navigate to="/kpr-calculator" replace />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/partners/network" element={<PartnerNetwork />} />
                <Route path="/partners/become" element={<BecomePartner />} />
                <Route path="/partners/benefits" element={<PartnerBenefits />} />
                <Route path="/partners/ventures" element={<JointVentures />} />
                <Route path="/mobile-demo" element={<MobileFirstDemo />} />
                <Route path="/investor-demo" element={<InvestorDemo />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community-hub" element={<CommunityHub />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/category/:categoryId" element={<MarketplaceCategory />} />
                <Route path="/vendor-registration" element={<VendorRegistration />} />
                <Route path="/shared-search/:shareId" element={<SharedSearch />} />
                <Route path="/development" element={<AstraDevelopment />} />
                <Route path="/astra-development" element={<AstraDevelopment />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/location" element={<LocationMap />} />
                <Route path="/location-map" element={<LocationMap />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<Help />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Contact />} />
                <Route path="/investor/wni" element={<Navigate to="/investment?section=wni" replace />} />
                <Route path="/investor/wna" element={<Navigate to="/investment?section=wna" replace />} />
                <Route path="/verification" element={<VerificationCenter />} />
                <Route path="/verification-center" element={<VerificationCenter />} />
                <Route path="/ai-content-generator" element={<AIContentGenerator />} />
                <Route path="/content-generator" element={<AIContentGenerator />} />
                <Route path="/ai-listing-generator" element={<AIListingGenerator />} />
                <Route path="/campaigns" element={<ViralCampaigns />} />
                <Route path="/viral-campaigns" element={<ViralCampaigns />} />
                <Route path="/marketing" element={<ViralCampaigns />} />
                <Route path="/media" element={<MediaHub />} />
                <Route path="/platform" element={<PlatformHub />} />
                <Route path="/infrastructure" element={<PlatformHub />} />
                <Route path="/agents" element={<AgentDirectory />} />
                <Route path="/cari-agen" element={<AgentDirectory />} />
                <Route path="/agent-registration" element={<AgentRegistration />} />
                <Route path="/daftar-agen" element={<AgentRegistration />} />
                <Route path="/property-comparison" element={<PropertyComparison />} />
                <Route path="/pre-qualification" element={<PreQualificationPage />} />
                <Route path="/mortgage-prequalification" element={<PreQualificationPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsHub />} />
                <Route path="/documents" element={<ProtectedRoute />}>
                  <Route index element={<DocumentManagement />} />
                </Route>
                <Route path="/my-rentals" element={<UserRentalDashboard />} />
                <Route path="/my-rental-inquiries" element={<MyRentalInquiries />} />
                <Route path="/investor-watchlist" element={<InvestorWatchlist />} />
                <Route path="/projects/:projectId" element={<ProjectShowcase />} />
                <Route path="/developer-dashboard" element={<ProtectedRoute />}>
                  <Route index element={<DeveloperDashboard />} />
                </Route>
                <Route path="/ai-pricing" element={<AIPriceEstimator />} />
                <Route path="/price-estimator" element={<AIPriceEstimator />} />
                <Route path="/market-intelligence" element={<MarketIntelligence />} />
                <Route path="/market-data" element={<MarketIntelligence />} />
                <Route path="/property-market-dashboard" element={<PropertyMarketDashboard />} />
                <Route path="/location-intelligence" element={<LocationIntelligencePage />} />
                <Route path="/investor-alerts" element={<ProtectedRoute />}>
                  <Route index element={<InvestorAlertsPage />} />
                </Route>
                <Route path="/ai-search" element={<AISearchAssistantPage />} />
                <Route path="/investment-leaderboard" element={<InvestmentLeaderboardPage />} />
                <Route path="/price-drop-deals" element={<PriceDropDealsPage />} />
                <Route path="/my-offers" element={<ProtectedRoute />}>
                  <Route index element={<MyOffersPage />} />
                </Route>
                <Route path="/offers/:offerId" element={<ProtectedRoute />}>
                  <Route index element={<OfferNegotiationPage />} />
                </Route>
                <Route path="/mortgage-financing" element={<ProtectedRoute />}>
                  <Route index element={<MortgageFinancingPage />} />
                </Route>
                <Route path="/investment-report" element={<ProtectedRoute />}>
                  <Route index element={<PropertyAnalyticsReportPage />} />
                </Route>
                <Route path="/investment-report/:propertyId" element={<ProtectedRoute />}>
                  <Route index element={<InvestmentReportPage />} />
                </Route>
                <Route path="/ai-map" element={<AIMapSearchPage />} />
                <Route path="/map-search" element={<AIMapSearchPage />} />
                <Route path="/property-map" element={<PropertyMapSearchPage />} />
                <Route path="/digital-twin/:id" element={<DigitalTwinPage />} />
                <Route path="/virtual-staging" element={<VirtualStagingPage />} />
                <Route path="/ai-image-enhance" element={<AIImageEnhancePage />} />
                <Route path="/property-video-tour" element={<PropertyVideoTourPage />} />
                <Route path="/referral" element={<ReferralAffiliatePage />} />
                <Route path="/market-report" element={<MarketReportPage />} />
                <Route path="/fraud-detector" element={<FraudDetectorPage />} />
                <Route path="/recommendations" element={<AIRecommendationsPage />} />
                <Route path="/image-quality" element={<ImageQualityAnalyzerPage />} />
                <Route path="/tenant-screening" element={<TenantScreeningPage />} />
                <Route path="/virtual-tour-generator" element={<VirtualTourGeneratorPage />} />
                <Route path="/comparative-market-analysis" element={<ComparativeMarketAnalysisPage />} />
                <Route path="/smart-notifications" element={<SmartNotificationsPage />} />
                <Route path="/neighborhood-insights" element={<NeighborhoodInsightsPage />} />
                <Route path="/contract-analyzer" element={<ContractAnalyzerPage />} />
                <Route path="/ai-lead-scoring" element={<AILeadScoringPage />} />
                <Route path="/ai-interior-design" element={<AIInteriorDesignPage />} />
                <Route path="/ai-social-copy" element={<AISocialCopyPage />} />
                <Route path="/ai-document-verifier" element={<AIDocumentVerifierPage />} />
                <Route path="/ai-rental-yield" element={<AIRentalYieldPage />} />
                <Route path="/ai-mortgage-advisor" element={<AIMortgageAdvisorPage />} />
                <Route path="/ai-property-valuation" element={<AIPropertyValuationPage />} />
                <Route path="/ai-tenant-matching" element={<AITenantMatchingPage />} />
                <Route path="/ai-smart-pricing" element={<AISmartPricingPage />} />
                <Route path="/ml-valuation-engine" element={<MLValuationEnginePage />} />
                <Route path="/investment-scenario-simulator" element={<InvestmentScenarioSimulatorPage />} />
                <Route path="/institutional-analytics" element={<InstitutionalAnalyticsPage />} />
                <Route path="/opportunity-discovery-engine" element={<ProtectedRoute />}>
                  <Route index element={<OpportunityDiscoveryEnginePage />} />
                </Route>
                <Route path="/ai-document-generator" element={<AIDocumentGeneratorPage />} />
                <Route path="/rental-yield-optimizer" element={<ProtectedRoute />}>
                  <Route index element={<RentalYieldOptimizerPage />} />
                </Route>
                <Route path="/wealth-simulator" element={<ProtectedRoute />}>
                  <Route index element={<WealthSimulatorPage />} />
                </Route>
                <Route path="/global-macro-intelligence" element={<ProtectedRoute />}>
                  <Route index element={<GlobalMacroIntelligencePage />} />
                </Route>
                <Route path="/cross-border-discovery" element={<CrossBorderDiscoveryPage />} />
                <Route path="/deal-hunter-bot" element={<DealHunterBotPage />} />
                <Route path="/developer-campaign" element={<DeveloperCampaignPage />} />
                <Route path="/ownership-lifecycle" element={<OwnershipLifecyclePage />} />
                <Route path="/macro-prediction" element={<MacroPredictionTerminal />} />
                <Route path="/investor-social" element={<InvestorSocialNetwork />} />
                <Route path="/global-predictive-analytics" element={<GlobalPredictiveAnalyticsPage />} />
                <Route path="/virtual-explorer" element={<VirtualPropertyExplorer />} />
                <Route path="/product-architecture" element={<ProductArchitecturePage />} />
                <Route path="/superapp-blueprint" element={<SuperappBlueprintPage />} />
                <Route path="/development-roadmap" element={<DevelopmentRoadmapPage />} />
                <Route path="/schema-architecture" element={<SchemaArchitecturePage />} />
                <Route path="/api-architecture" element={<ApiArchitecturePage />} />
                <Route path="/indexing-strategy" element={<IndexingStrategyPage />} />
                <Route path="/realtime-architecture" element={<RealtimeArchitecturePage />} />
                <Route path="/cron-schedule" element={<CronSchedulePage />} />
                <Route path="/security-hardening" element={<SecurityHardeningPage />} />
                <Route path="/cloud-infrastructure" element={<CloudInfrastructurePage />} />
                <Route path="/disaster-recovery" element={<DisasterRecoveryPage />} />
                <Route path="/behavior-analytics" element={<BehaviorAnalyticsPage />} />
                <Route path="/user-activation" element={<UserActivationDashboard />} />
                <Route path="/ai-learning-framework" element={<AILearningFrameworkPage />} />
                <Route path="/ab-testing" element={<ABTestingFrameworkPage />} />
                <Route path="/go-to-market" element={<GoToMarketStrategyPage />} />
                <Route path="/first-1000-users" element={<First1000UsersPage />} />
                <Route path="/deal-conversion-pipeline" element={<DealConversionPipelinePage />} />
                <Route path="/sales-scripts" element={<SalesScriptsPage />} />
                <Route path="/agent-onboarding-scripts" element={<AgentOnboardingScriptsPage />} />
                <Route path="/live-demo" element={<LiveDemoPresentationPage />} />
                <Route path="/daily-lead-gen" element={<DailyLeadGenPlanPage />} />
                <Route path="/social-media-strategy" element={<SocialMediaStrategyPage />} />
                <Route path="/fundraising-checklist" element={<FundraisingChecklistPage />} />
                <Route path="/daily-growth-monitor" element={<DailyGrowthMonitorPage />} />
                <Route path="/marketing-performance" element={<MarketingPerformancePage />} />
                <Route path="/company-dashboard" element={<CompanyDashboardPage />} />
                <Route path="/executive-kpis" element={<ExecutiveKPIsPage />} />
                <Route path="/scaling-roadmap" element={<ScalingRoadmapPage />} />
                <Route path="/execution-roadmap" element={<ExecutionRoadmapPage />} />
                <Route path="/feature-prioritization" element={<FeaturePrioritizationPage />} />
                <Route path="/launch-readiness" element={<LaunchReadinessPage />} />
                <Route path="/first-30-days" element={<First30DaysPage />} />
                <Route path="/first-10-deals" element={<First10DealsPage />} />
                <Route path="/market-dominance" element={<MarketDominancePage />} />
                <Route path="/kpi-command-center" element={<KPICommandCenterPage />} />
                <Route path="/series-a-readiness" element={<SeriesAReadinessPage />} />
                <Route path="/city-expansion-master-plan" element={<CityExpansionMasterPlanPage />} />
                <Route path="/network-effect-acceleration" element={<NetworkEffectAccelerationPage />} />
                <Route path="/founder-exit-wealth-strategy" element={<FounderExitWealthPage />} />
                <Route path="/national-domination-blueprint" element={<NationalDominationBlueprintPage />} />
                <Route path="/global-investor-terminal" element={<GlobalInvestorTerminalPage />} />
                <Route path="/founder-personal-os" element={<FounderPersonalOSPage />} />
                <Route path="/global-proptech-empire" element={<GlobalProptechEmpirePage />} />
                <Route path="/daily-sales-command" element={<DailySalesWarCommandPage />} />
                <Route path="/first-500-investors" element={<First500InvestorsPage />} />
                <Route path="/automation-checklist" element={<AutomationChecklistPage />} />
                <Route path="/first-30-days" element={<First30DaysCalendarPage />} />
                <Route path="/negotiation-scripts" element={<NegotiationScriptsPage />} />
                <Route path="/weekly-revenue" element={<WeeklyRevenueTrackingPage />} />
                <Route path="/deal-sprint-90" element={<DealSprintExecutionPage />} />
                <Route path="/investor-follow-up" element={<InvestorFollowUpPage />} />
                <Route path="/trust-signals" element={<TrustSignalSystemPage />} />
                <Route path="/6-month-survival" element={<SixMonthSurvivalPlanPage />} />
                <Route path="/agent-productivity" element={<AgentProductivityIntelligencePage />} />
                <Route path="/revenue-leak-detection" element={<RevenueLeakDetectionPage />} />
                <Route path="/first-profitable-month" element={<FirstProfitableMonthPage />} />
                <Route path="/listing-demand-forecast" element={<ListingDemandForecastPage />} />
                <Route path="/founder-fast-decision" element={<FounderFastDecisionPage />} />
                <Route path="/revenue-flywheel" element={<RevenueFlywheelStrategyPage />} />
                <Route path="/investor-deal-flow-automation" element={<InvestorDealFlowAutomationPage />} />
                <Route path="/founder-resilience" element={<FounderResilienceSystemPage />} />
                <Route path="/founder-schedule" element={<FounderSchedulePage />} />
                <Route path="/energy-optimization" element={<EnergyOptimizationPage />} />
                <Route path="/decision-prioritization" element={<DecisionPrioritizationPage />} />
                <Route path="/founder-resilience" element={<ResilienceFrameworkPage />} />
                <Route path="/negotiation-mindset" element={<NegotiationMindsetPage />} />
                <Route path="/vision-framework" element={<VisionFrameworkPage />} />
                <Route path="/negotiation-psychology" element={<NegotiationPsychologyPage />} />
                <Route path="/hnw-investor-strategy" element={<HNWInvestorStrategyPage />} />
                <Route path="/brand-trust-strategy" element={<BrandTrustStrategyPage />} />
                <Route path="/revenue-optimization" element={<RevenueOptimizationPage />} />
                <Route path="/profit-maximization" element={<ProfitMaximizationDashboard />} />
                <Route path="/geographic-expansion" element={<GeographicExpansionPage />} />
                <Route path="/unicorn-positioning" element={<UnicornPositioningPage />} />
                <Route path="/7-day-sprint" element={<SevenDaySprintPage />} />
                <Route path="/local-dominance" element={<LocalDominancePage />} />
                <Route path="/revenue-activation" element={<RevenueActivationPage />} />
                <Route path="/first-deal-closure" element={<FirstDealClosurePage />} />
                <Route path="/investor-script" element={<InvestorPresentationScript />} />
                <Route path="/agent-incentives" element={<AgentIncentivesPage />} />
                <Route path="/launch-day" element={<LaunchDayPage />} />
                <Route path="/deal-pipeline" element={<DealPipelinePage />} />
                <Route path="/content-strategy" element={<ContentStrategyPage />} />
                <Route path="/deal-crm" element={<DealCRMPage />} />
                <Route path="/follow-up-templates" element={<FollowUpTemplatesPage />} />
                <Route path="/agent-retention" element={<AgentRetentionPage />} />
                <Route path="/success-story" element={<SuccessStoryPage />} />
                <Route path="/roi-calculator" element={<ROICalculatorPage />} />
                <Route path="/agent-effectiveness" element={<AgentEffectivenessPage />} />
                <Route path="/viral-growth" element={<ViralGrowthPage />} />
                <Route path="/investor-club" element={<InvestorClubPage />} />
                <Route path="/data-moat" element={<DataMoatPage />} />
                <Route path="/revenue-scaling" element={<RevenueScalingPage />} />
                <Route path="/city-expansion" element={<CityExpansionPage />} />
                <Route path="/ecosystem-partnerships" element={<EcosystemPartnershipsPage />} />
                <Route path="/investor-sentiment-dashboard" element={<InvestorSentimentDashboardPage />} />
                <Route path="/hedge-fund-defense" element={<HedgeFundDefensePage />} />
                <Route path="/founder-power-os" element={<FounderPowerOSPage />} />
                <Route path="/planetary-scale-roadmap" element={<PlanetaryScaleRoadmapPage />} />
                <Route path="/data-moat-intelligence" element={<DataMoatIntelligencePage />} />
                <Route path="/fundraising-architecture" element={<FundraisingArchitecturePage />} />
                <Route path="/revenue-layer-architecture" element={<RevenueLayerArchitecturePage />} />
                <Route path="/vendor-monetization-pyramid" element={<VendorMonetizationPyramidPage />} />
                <Route path="/institutional-saas-blueprint" element={<InstitutionalSaaSBlueprintPage />} />
                <Route path="/revenue-scaling-blueprint" element={<RevenueScalingBlueprintPage />} />
                <Route path="/monetization-pricing" element={<MonetizationPricingPage />} />
                <Route path="/sprint-execution-roadmap" element={<SprintExecutionRoadmapPage />} />
                <Route path="/marketplace-launch-playbook" element={<MarketplaceLaunchPlaybookPage />} />
                <Route path="/city-launch-playbook" element={<CityLaunchPlaybookPage />} />
                <Route path="/revenue-projection-model" element={<RevenueProjectionModelPage />} />
                <Route path="/investor-kpi-framework" element={<InvestorKPIFrameworkPage />} />
                <Route path="/vendor-acquisition-scripts" element={<VendorAcquisitionScriptsPage />} />
                <Route path="/feature-impact-matrix" element={<FeatureImpactMatrixPage />} />
                <Route path="/founder-90-day-calendar" element={<Founder90DayCalendarPage />} />
                <Route path="/first-50-deals-playbook" element={<First50DealsPlaybookPage />} />
                <Route path="/agent-recruitment-system" element={<AgentRecruitmentSystemPage />} />
                <Route path="/liquidity-scoring" element={<LiquidityScoringPage />} />
                <Route path="/vendor-job-routing" element={<VendorJobRoutingPage />} />
                <Route path="/first-10-investor-closing" element={<First10InvestorClosingPage />} />
                <Route path="/pricing-psychology" element={<PricingPsychologyPage />} />
                <Route path="/deal-risk-detection" element={<DealRiskDetectionPage />} />
                <Route path="/agent-leaderboard" element={<AgentLeaderboardPage />} />
                <Route path="/revenue-milestone" element={<RevenueMilestonePage />} />
                {/* Mobile investor screens */}
                <Route path="/mobile/feed" element={<MobileHomeFeed />} />
                <Route path="/mobile/property/:id" element={<MobilePropertyDetail />} />
                <Route path="/mobile/investor" element={<ProtectedRoute />}>
                  <Route index element={<MobileInvestorDashboard />} />
                </Route>
                <Route path="/mobile/ai-chat" element={<MobileAIChat />} />
                <Route path="/mobile/alerts" element={<ProtectedRoute />}>
                  <Route index element={<MobileAlerts />} />
                </Route>
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      {!isAdminRoute && (
        <Suspense fallback={<div style={{ minHeight: isMobile ? '64px' : '180px' }} />}>
          {isMobile ? <MobileFooter /> : <ProfessionalFooter language={language} />}
        </Suspense>
      )}
      {/* Mobile bottom tab bar */}
      <Suspense fallback={null}><MobileBottomTabBar /></Suspense>
    </div>
  );
};

// Create QueryClient instance outside component to avoid recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,      // 10 min - reduce unnecessary refetches
      gcTime: 30 * 60 * 1000,          // 30 min - keep cache longer
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
  },
});

function App() {
  // Only show initial loading on first app load (not on navigation)
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);

  useEffect(() => {
    const checkWelcomeScreen = async () => {
      try {
        const { safeSessionStorage, storageSupport } = await import('@/lib/safeStorage');

        // If sessionStorage is not persistent (private/restricted mode), fail-closed.
        // Otherwise the welcome screen would reappear on every refresh.
        if (!storageSupport.session) {
          setWelcomeEnabled(false);
          setIsLoading(false);
          return;
        }

        // FIRST: Check if welcome screen was already shown this session
        const hasLoaded = safeSessionStorage.getItem('astra_app_loaded');
        if (hasLoaded === 'true') {
          // Already shown this session - skip immediately
          setIsLoading(false);
          return;
        }

        // Import supabase client
        const { supabase } = await import('@/integrations/supabase/client');

        // Fetch welcome screen settings from the correct category
        const { data: settingsData } = await supabase
          .from('system_settings')
          .select('key, value')
          .eq('category', 'loading_page')
          .in('key', ['welcomeScreenEnabled', 'welcomeSkipOnReturn', 'welcomeLoadingDuration']);

        // Parse settings
        const settings: Record<string, any> = {};
        settingsData?.forEach((row) => {
          settings[row.key] = row.value;
        });

        // Default to enabled if not set
        const isEnabled =
          settings.welcomeScreenEnabled === undefined ||
          settings.welcomeScreenEnabled === null ||
          settings.welcomeScreenEnabled === true ||
          settings.welcomeScreenEnabled === 'true';

        const loadingDuration =
          typeof settings.welcomeLoadingDuration === 'number'
            ? settings.welcomeLoadingDuration
            : parseInt(settings.welcomeLoadingDuration) || 2000;

        setWelcomeEnabled(isEnabled);

        if (!isEnabled) {
          setIsLoading(false);
          safeSessionStorage.setItem('astra_app_loaded', 'true');
          return;
        }

        // Show welcome screen for configured duration, then mark as loaded
        const timer = setTimeout(() => {
          setIsLoading(false);
          safeSessionStorage.setItem('astra_app_loaded', 'true');
        }, loadingDuration);

        return () => clearTimeout(timer);
      } catch (error) {
        // On error, show welcome screen briefly then proceed
        const timer = setTimeout(async () => {
          setIsLoading(false);
          try {
            const { safeSessionStorage } = await import('@/lib/safeStorage');
            safeSessionStorage.setItem('astra_app_loaded', 'true');
          } catch {
            // ignore
          }
        }, 1500);

        return () => clearTimeout(timer);
      }
    };

    checkWelcomeScreen();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {isLoading && welcomeEnabled ? (
            <InitialLoadingScreen key="loading" />
          ) : (
            <Router key="app" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
                <DesignSystemProvider>
                  <LanguageProvider>
                    <CurrencyProvider>
                    <AlertProvider>
                      <AuthProvider>
                        <NotificationProvider>
                          <DataSaverProvider>
                          <PropertyComparisonProvider>
                            <AppContent />
                            <Suspense fallback={null}>
                              {React.createElement(lazy(() => import('@/components/property/PropertyComparisonPanel')))}
                            </Suspense>
                            <Toaster />
                            <Sonner />
                            <CookieSystem />
                            <Suspense fallback={null}>
                              <ResponsiveAIChatWidget />
                              
                              <WhatsAppInquiryButton variant="floating" defaultType="general" />
                              
                              <SessionExpirationHandler />
                              <AuthNotificationHandler />
                            </Suspense>
                          </PropertyComparisonProvider>
                          </DataSaverProvider>
                        </NotificationProvider>
                      </AuthProvider>
                    </AlertProvider>
                    </CurrencyProvider>
                  </LanguageProvider>
                </DesignSystemProvider>
              </ThemeProvider>
            </Router>
          )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
