
import {
  Home,
  Building,
  Users,
  Settings,
  PlusCircle,
  BarChart3,
  FileText,
  Wrench,
  UserCheck,
  Crown,
  RefreshCw,
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  User,
  Coins,
  Monitor,
  Globe,
  LayoutDashboard,
  ShoppingBag,
  Contact2,
  TrendingUp,
  ListChecks,
  LucideIcon,
  Headphones,
  CheckCircle,
  Database,
  Shield,
  CreditCard,
  Calendar,
  CalendarDays,
  Mail,
  Activity,
  Download,
  ArrowLeftRight,
  Search,
  HelpCircle,
  Bell,
  ImageIcon,
  Map,
  Cloud,
  ShieldCheck,
  Bug,
  FileWarning,
  ClipboardList,
  DatabaseZap,
  Cpu,
  TestTube2,
  Gem,
  DollarSign,
  Plane,
  Building2,
  Landmark,
  Sparkles,
  Palette,
  Video,
  Calculator,
  Link2,
  Smartphone,
  FlaskConical,
  Zap,
  Rocket,
  Newspaper,
  Sliders,
  Target,
  Layers,
  Megaphone,
  Flame,
  Heart,
  Star,
  Store,
  FileCheck,
  Share2,
  Camera,
  Trophy,
  Package,
  BookOpen,
  Clock,
  Receipt,
  Gift,
  Languages,
  Leaf,
  FileSignature,
  BellRing,
  Terminal,
  Lock,
  UserPlus,
  Bot,
  Gauge,
  ShieldAlert,
  Home as HomeIcon,
  Banknote,
  MessagesSquare,
  Compass,
  PenTool,
  Gavel,
  ScanEye,
  Handshake
} from "lucide-react";

export interface NavigationSection {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export const categories = [
  "overview",
  "investor-management",
  "transactions",
  "astra-token", 
  "tools",
  "core-management",
  "customer-service",
  "user-management",
  "vendor-management",
  "analytics-monitoring",
  "content-settings",
  "system-settings",
  "technical",
  "features",
  "help"
];

export const navigationSections = {
  overview: [
    { 
      key: "overview", 
      label: "Dashboard Overview", 
      icon: Home,
      description: "Main dashboard overview and quick stats"
    },
    {
      key: "project-map",
      label: "Project Map",
      icon: Map,
      description: "Complete visualization of project structure, database, and code analysis",
      badge: "New"
    }
  ],

  "investor-management": [
    {
      key: "wna-investment-settings",
      label: "WNA Investment Settings",
      icon: Plane,
      description: "Manage Foreign Investor (WNA) program settings, eligible countries, facilities, and regulations",
      badge: "New"
    },
    {
      key: "wni-mortgage-settings",
      label: "WNI KPR/Mortgage Settings",
      icon: Landmark,
      description: "Manage Overseas Indonesian (WNI) KPR program, eligible countries tiers, and requirements",
      badge: "New"
    },
    {
      key: "investor-analytics",
      label: "Investor Analytics",
      icon: TrendingUp,
      description: "Track investor inquiries, eligibility checks, and conversion metrics",
      badge: "New"
    },
    {
      key: "investor-dna-admin",
      label: "Investor DNA Intelligence",
      icon: Sparkles,
      description: "View all investor DNA profiles with persona, risk, and churn filtering for behavioral oversight",
      badge: "New"
    },
    {
      key: "global-macro-intelligence",
      label: "Global Macro Intelligence",
      icon: Globe,
      description: "Capital flow prediction, regional heatmaps, cross-border strategy, and infrastructure impact analysis",
      badge: "New"
    },
    {
      key: "deal-hunter-admin",
      label: "Deal Hunter Engine",
      icon: Target,
      description: "AI deal detection engine — scan history, opportunity breakdown by classification/tier, and manual scan trigger",
      badge: "New"
    }
  ],

  transactions: [
    {
      key: "transaction-hub",
      label: "Transaction Management",
      icon: DollarSign,
      description: "Complete transaction management with tabs: Transactions, Tax Config, Live Monitor, Audit Trail, and Feedback",
      badge: "New"
    },
    {
      key: "mortgage-management",
      label: "Mortgage (KPR) Management",
      icon: Calculator,
      description: "Manage partner banks, interest rates, and KPR customer inquiries",
      badge: "New"
    },
    {
      key: "blockchain-management",
      label: "Blockchain Management",
      icon: Link2,
      description: "Manage smart contracts, escrow, property tokens, digital deeds, and blockchain transactions",
      badge: "New"
    },
    {
      key: "b2b-marketplace",
      label: "B2B Data Marketplace",
      icon: Building2,
      description: "Manage B2B clients, leads, API access, custom reports, and white-label configurations",
      badge: "New"
    },
    {
      key: "data-exchange",
      label: "Data Exchange Platform",
      icon: Database,
      description: "Listing syndication, buyer demand API, off-market deals, and research data licensing",
      badge: "New"
    },
    {
      key: "partnership-programs",
      label: "Partnership Programs",
      icon: Users,
      description: "Manage mortgage brokers, home inspectors, moving companies, and other partners with referral tracking and payouts",
      badge: "New"
    }
  ],

  "astra-token": [
    {
      key: "astra-token-hub",
      label: "ASTRA Token Hub",
      icon: Coins,
      description: "Comprehensive ASTRA token management including analytics, settings, user activity, transactions, and webhook configuration"
    }
  ],

  tools: [
    {
      key: "tools-management",
      label: "Tools Management",
      icon: Wrench,
      description: "Manage various tools and utilities"
    },
    {
      key: "rate-limiting",
      label: "API Rate Limiting",
      icon: Shield,
      description: "Configure rate limits, manage blocked IPs, partner API keys, and monitor abuse",
      badge: "New"
    },
    {
      key: "data-backup",
      label: "Data Backup & Export",
      icon: Download,
      description: "Export database tables as CSV or JSON with row counts and multi-table selection",
      badge: "New"
    },
    {
      key: "api-usage",
      label: "API Usage Analytics",
      icon: Activity,
      description: "Track edge function calls, error rates, peak hours, and latency metrics",
      badge: "New"
    },
    {
      key: "scheduled-reports",
      label: "Scheduled Reports",
      icon: Calendar,
      description: "Automated report generation with email delivery: daily, weekly, monthly, quarterly",
      badge: "New"
    }
  ],

  "core-management": [
    {
      key: "property-management-hub",
      label: "Property Management Hub",
      icon: Building2,
      description: "Centralized property management dashboard"
    },
    {
      key: "property-seo-checker",
      label: "Property SEO Checker",
      icon: Search,
      description: "Analyze and optimize property listing SEO scores with AI-powered suggestions",
      badge: "New"
    },
    {
      key: "video-tours",
      label: "Video Tours (360°)",
      icon: Video,
      description: "Manage 360° virtual tours, panoramas, hotspots, and VR experiences",
      badge: "New"
    },
    {
      key: "vr-tour-settings",
      label: "VR Tour Settings",
      icon: Video,
      description: "Configure VR tour page, panorama images, and feature toggles",
      badge: "New"
    },
    {
      key: "property-survey-management",
      label: "Property Survey Booking",
      icon: Calendar,
      description: "Manage property viewing and survey appointments"
    },
    {
      key: "booking-management",
      label: "Booking Management",
      icon: CalendarDays,
      description: "Manage all property bookings, viewings, and booking settings",
      badge: "New"
    },
    {
      key: "rental-management",
      label: "Rental Management",
      icon: CalendarDays,
      description: "Overview rental bookings, refund requests, and rental analytics",
      badge: "New"
    },
    {
      key: "notifications-center",
      label: "Notifications Center",
      icon: Bell,
      description: "View and manage all system notifications and alerts"
    },
    {
      key: "notification-templates",
      label: "Notification Templates",
      icon: Mail,
      description: "Manage email, push, SMS, and in-app notification templates with variables and preview",
      badge: "New"
    },
    {
      key: "sample-property-generator",
      label: "Sample Property Generator",
      icon: Sparkles,
      description: "Generate sample properties with AI images for each kelurahan/desa",
      badge: "New"
    },
    {
      key: "off-plan-manager",
      label: "Off-Plan Project Manager",
      icon: Building2,
      description: "Manage construction milestones, completion %, and off-plan project progress",
      badge: "New"
    },
    {
      key: "bulk-property-actions",
      label: "Bulk Property Actions",
      icon: Layers,
      description: "Mass update status, feature/unfeature, and export properties in bulk",
      badge: "New"
    },
    {
      key: "listing-optimization-center",
      label: "Listing Optimization Center",
      icon: Sparkles,
      description: "AI-powered listing performance optimization with bulk actions and impact previews",
      badge: "New"
    },
    {
      key: "content-moderation",
      label: "Content Moderation",
      icon: Shield,
      description: "Review flagged listings, reviews, images, and messages with approve/reject/escalate workflow",
      badge: "New"
    },
    {
      key: "property-quality",
      label: "Property Quality Score",
      icon: Star,
      description: "Listing quality assessment: photo quality, descriptions, pricing accuracy, and completeness",
      badge: "New"
    },
    {
      key: "tenant-leases",
      label: "Tenant & Lease Tracker",
      icon: FileText,
      description: "Monitor lease agreements, payments, renewals, and tenant management",
      badge: "New"
    },
    {
      key: "property-valuation",
      label: "Property Valuation",
      icon: Gauge,
      description: "AI-powered property appraisal, market value estimation, and price index tracking",
      badge: "New"
    },
    {
      key: "maintenance-requests",
      label: "Maintenance Requests",
      icon: Wrench,
      description: "Property maintenance tracking, vendor assignment, and resolution monitoring",
      badge: "New"
    },
    {
      key: "insurance-partners",
      label: "Insurance Partners",
      icon: Shield,
      description: "Insurance partner management, policy tracking, and claims analytics",
      badge: "New"
    },
    {
      key: "escrow-management",
      label: "Escrow Management",
      icon: Lock,
      description: "Property transaction escrow accounts, fund holds, and release management",
      badge: "New"
    },
    {
      key: "smart-home",
      label: "Smart Home Integration",
      icon: HomeIcon,
      description: "IoT device management, energy monitoring, and property automation controls",
      badge: "New"
    },
    {
      key: "neighborhood-insights",
      label: "Neighborhood Insights",
      icon: Compass,
      description: "Livability scores, nearby facilities, safety ratings, and area analytics",
      badge: "New"
    },
    {
      key: "document-signing",
      label: "Document Signing Hub",
      icon: PenTool,
      description: "Digital document signing, notary coordination, and contract lifecycle tracking",
      badge: "New"
    },
    {
      key: "property-auctions",
      label: "Property Auctions",
      icon: Gavel,
      description: "Live auction management, bid tracking, and auction performance analytics",
      badge: "New"
    },
    {
      key: "tenant-screening",
      label: "Tenant Screening",
      icon: ScanEye,
      description: "Background checks, credit scoring, employment verification, and application management",
      badge: "New"
    }
  ],

  "customer-service": [
    {
      key: "customer-service",
      label: "Customer Service",
      icon: Headphones,
      description: "Manage customer service tickets and inquiries"
    },
    {
      key: "contact-management",
      label: "Contact Management",
      icon: Contact2,
      description: "Manage contact forms and submissions"
    },
    {
      key: "chat-management",
      label: "Chat Management",
      icon: MessageSquare,
      description: "Manage live chat and messaging",
      badge: "Coming Soon"
    }
  ],

  "user-management": [
    {
      key: "user-management",
      label: "User Management",
      icon: Users,
      description: "Manage user accounts, roles, and authentication"
    },
    {
      key: "user-levels",
      label: "User Levels & Membership",
      icon: Crown,
      description: "Manage user membership levels (Basic, Verified, VIP, Gold, Platinum, Diamond)",
      badge: "New"
    },
    {
      key: "upgrade-applications",
      label: "Upgrade Applications",
      icon: UserCheck,
      description: "Review and approve user role upgrade requests (Property Owner, Vendor, Agent)",
      badge: "New"
    },
    {
      key: "verification-management",
      label: "Verification Management",
      icon: ShieldCheck,
      description: "Approve and manage owner, agent, and agency verifications",
      badge: "New"
    },
    {
      key: "video-verification-review",
      label: "Video Verification Review",
      icon: Video,
      description: "Review Level 4 video verification sessions for premium user identity verification",
      badge: "New"
    },
    {
      key: "kyc-analytics",
      label: "KYC Analytics Dashboard",
      icon: BarChart3,
      description: "View KYC submission metrics, approval rates, and performance analytics"
    },
    {
      key: "bulk-kyc-operations",
      label: "Bulk KYC Operations",
      icon: ListChecks,
      description: "Batch approve/reject KYC applications and manage bulk operations"
    },
    {
      key: "document-ocr",
      label: "Document OCR Scanner",
      icon: FileText,
      description: "Automatically extract data from uploaded KYC documents using OCR"
    },
    {
      key: "ahu-company-checker",
      label: "AHU Company Checker",
      icon: Building,
      description: "Verify PT company registration status via AHU (Administrasi Hukum Umum) system",
      badge: "New"
    }
  ],

  "vendor-management": [
    {
      key: "vendors-hub",
      label: "Vendors Hub",
      icon: ShoppingBag,
      description: "Comprehensive vendor management platform with all vendor-related functionality including services, categories, KYC, analytics, and control panel"
    }
  ],

  "analytics-monitoring": [
    {
      key: "vip-analytics",
      label: "VIP Analytics",
      icon: Gem,
      description: "View VIP member distribution, upgrade trends, and membership analytics",
      badge: "New"
    },
    {
      key: "visitor-analytics",
      label: "Visitor Analytics & Access",
      icon: Globe,
      description: "Monitor visitor traffic, IP addresses, countries, devices and manage access control",
      badge: "New"
    },
    {
      key: "project-progress",
      label: "Project Progress Monitor",
      icon: TrendingUp,
      description: "Track development progress, features, and project milestones",
      badge: "New"
    },
    {
      key: "algorithm-dashboard",
      label: "Algorithm Dashboard",
      icon: Activity,
      description: "Monitor recommendation algorithms, search analytics, and user behavior patterns",
      badge: "New"
    },
    {
      key: "ai-feedback-analytics",
      label: "AI Feedback Analytics",
      icon: TrendingUp,
      description: "Track user reactions to AI responses and measure AI assistant quality",
      badge: "New"
    },
    {
      key: "analytics",
      label: "Web Traffic Analytics",
      icon: BarChart3,
      description: "Monitor website traffic and user behavior"
    },
    {
      key: "ai-bot-management",
      label: "AI Bot Management",
      icon: Monitor,
      description: "Manage AI bot interactions and performance"
    },
    {
      key: "chatbot-training",
      label: "Chatbot Training",
      icon: Bot,
      description: "Train AI intents, manage conversation flows, and monitor resolution rates",
      badge: "New"
    },
    {
      key: "feedback-management",
      label: "Feedback Management",
      icon: MessageSquare,
      description: "Manage user feedback and reviews"
    },
    {
      key: "daily-checkin",
      label: "Daily Check-in",
      icon: CheckCircle,
      description: "Monitor daily check-in activity"
    },
    {
      key: "ai-performance",
      label: "AI Performance",
      icon: Activity,
      description: "Monitor AI recommendation effectiveness, CTR, and engagement metrics",
      badge: "New"
    },
    {
      key: "ai-model-weights",
      label: "AI Model Weights",
      icon: Sliders,
      description: "View and auto-tune AI scoring weights, correlations, and model health",
      badge: "New"
    },
    {
      key: "dom-accuracy",
      label: "DOM Prediction Accuracy",
      icon: Target,
      description: "Compare predicted vs actual days-on-market for sold properties",
      badge: "New"
    },
    {
      key: "weight-tuning-history",
      label: "Weight Tuning History",
      icon: CalendarDays,
      description: "Track AI model weight changes across auto-tune cycles with visual diff",
      badge: "New"
    },
    {
      key: "revenue-analytics",
      label: "Revenue Analytics",
      icon: DollarSign,
      description: "Track revenue, transactions, commissions, and payment method trends",
      badge: "New"
    },
    {
      key: "user-engagement",
      label: "User Engagement",
      icon: Activity,
      description: "DAU/MAU, session duration, retention, peak hours, and device analytics",
      badge: "New"
    },
    {
      key: "sla-compliance",
      label: "SLA Compliance",
      icon: CheckCircle,
      description: "Track SLA metrics, breach rates, and compliance across all operations",
      badge: "New"
    },
    {
      key: "competitor-analysis",
      label: "Competitor Analysis",
      icon: Globe,
      description: "Indonesian property portal competitive landscape and feature comparison",
      badge: "New"
    },
    {
      key: "feedback-sentiment",
      label: "Feedback Sentiment",
      icon: MessageSquare,
      description: "AI-powered sentiment analysis of user feedback with keyword trends",
      badge: "New"
    },
    {
      key: "geo-analytics",
      label: "Geo Analytics",
      icon: Map,
      description: "Regional performance by Indonesian city: listings, views, inquiries, and growth rates",
      badge: "New"
    },
    {
      key: "ab-test-results",
      label: "A/B Test Results",
      icon: FlaskConical,
      description: "Experiment outcomes with statistical significance, conversion trends, and variant comparison",
      badge: "New"
    },
    {
      key: "property-heatmap",
      label: "Property Heatmap",
      icon: Flame,
      description: "User engagement intensity across page sections with click and view heatmaps",
      badge: "New"
    },
    {
      key: "user-funnel",
      label: "User Funnel Analysis",
      icon: TrendingUp,
      description: "Conversion pipeline from visit to transaction with drop-off analysis by source",
      badge: "New"
    },
    {
      key: "user-segmentation",
      label: "User Segmentation",
      icon: Target,
      description: "Behavioral cohorts: Active Searchers, Serious Buyers, VIP Power Users, and Dormant analysis",
      badge: "New"
    },
    {
      key: "revenue-forecasting",
      label: "Revenue Forecasting",
      icon: DollarSign,
      description: "Projected MRR/ARR by revenue stream with quarterly targets and growth tracking",
      badge: "New"
    },
    {
      key: "email-campaigns",
      label: "Email Campaigns",
      icon: Mail,
      description: "Create, schedule, and track email campaigns with open/click rate analytics",
      badge: "New"
    },
    {
      key: "notification-center",
      label: "Notification Center",
      icon: Bell,
      description: "Manage push, email, in-app, and SMS notifications with delivery analytics",
      badge: "New"
    },
    {
      key: "support-analytics",
      label: "Support Analytics",
      icon: MessageSquare,
      description: "Ticket volume, response times, resolution rates, and agent performance",
      badge: "New"
    },
    {
      key: "api-usage",
      label: "API Usage Monitor",
      icon: Activity,
      description: "Edge function performance, traffic patterns, latency, and error rates",
      badge: "New"
    },
    {
      key: "vendor-performance",
      label: "Vendor Performance",
      icon: Store,
      description: "Service provider metrics, quality scores, and category performance",
      badge: "New"
    },
    {
      key: "commission-tracker",
      label: "Commission Tracker",
      icon: DollarSign,
      description: "Agent commissions, payouts, and revenue splits with trend analysis",
      badge: "New"
    },
    {
      key: "property-comparison",
      label: "Property Comparison",
      icon: ArrowLeftRight,
      description: "Side-by-side property analysis with radar charts and detail tables",
      badge: "New"
    },
    {
      key: "system-audit-trail",
      label: "System Audit Trail",
      icon: Shield,
      description: "Complete record of administrative actions, security events, and system changes",
      badge: "New"
    },
    {
      key: "subscription-plans",
      label: "Subscription Plans",
      icon: Crown,
      description: "Plan performance, MRR tracking, churn rates, and conversion funnels",
      badge: "New"
    },
    {
      key: "commission-tracker",
      label: "Commission Tracker",
      icon: DollarSign,
      description: "Agent commissions, payouts, and revenue splits with trend analysis",
      badge: "New"
    },
    {
      key: "market-trends",
      label: "Market Trends",
      icon: TrendingUp,
      description: "Price indices, supply/demand, hot areas, and property type performance",
      badge: "New"
    },
    {
      key: "document-verification",
      label: "Document Verification",
      icon: FileCheck,
      description: "KTP, NPWP, SIUP, and license verification queue with approve/reject actions",
      badge: "New"
    },
    {
      key: "platform-feedback",
      label: "Platform Feedback",
      icon: MessageSquare,
      description: "User feedback, sentiment trends, feature ratings, and review management",
      badge: "New"
    },
    {
      key: "referral-program",
      label: "Referral Program",
      icon: Share2,
      description: "Referral tracking, conversion rates, reward payouts, and top referrer rankings",
      badge: "New"
    },
    {
      key: "payment-transactions",
      label: "Payment Transactions",
      icon: CreditCard,
      description: "Transaction log, payment methods, success rates, and daily volume tracking",
      badge: "New"
    },
    {
      key: "property-staging",
      label: "Property Staging",
      icon: Camera,
      description: "Photo review queue, AI staging pipeline, and quality assessment scores",
      badge: "New"
    },
    {
      key: "agent-leaderboard",
      label: "Agent Leaderboard",
      icon: Trophy,
      description: "Top agents by sales, ratings, response rates, and conversion efficiency",
      badge: "New"
    },
    {
      key: "inventory-analytics",
      label: "Inventory Analytics",
      icon: Package,
      description: "Property stock levels, turnover rates, stale listings, and availability tracking",
      badge: "New"
    },
    {
      key: "lead-scoring",
      label: "Lead Scoring",
      icon: Target,
      description: "AI-powered lead quality assessment, conversion pipeline, and follow-up tracking",
      badge: "New"
    },
    {
      key: "compliance-reporting",
      label: "Compliance Reporting",
      icon: Shield,
      description: "Regulatory compliance status, audit results, KYC/AML, and finding management",
      badge: "New"
    },
    {
      key: "customer-journey",
      label: "Customer Journey",
      icon: Users,
      description: "End-to-end user journey funnel, touchpoint satisfaction, and drop-off analysis",
      badge: "New"
    },
    {
      key: "ad-campaigns",
      label: "Ad Campaigns",
      icon: Megaphone,
      description: "Paid advertising campaigns, budget tracking, ROAS, and platform performance",
      badge: "New"
    },
    {
      key: "workforce-scheduler",
      label: "Workforce Scheduler",
      icon: Clock,
      description: "Staff scheduling, shift management, and team utilization tracking",
      badge: "New"
    },
    {
      key: "loyalty-program",
      label: "Loyalty Program",
      icon: Gift,
      description: "Points, tiers, rewards catalog, and member engagement tracking",
      badge: "New"
    },
    {
      key: "price-alerts",
      label: "Price Alerts",
      icon: BellRing,
      description: "User price drop watchlists, notification triggers, and conversion tracking",
      badge: "New"
    },
    {
      key: "affiliate-dashboard",
      label: "Affiliate Program",
      icon: UserPlus,
      description: "Manage affiliates, referral codes, commission tiers, and payout tracking",
      badge: "New"
    }
  ],

  "content-settings": [
    {
      key: "carousel-settings",
      label: "Featured Properties Carousel",
      icon: ImageIcon,
      description: "Configure auto-scrolling carousel for featured properties",
      badge: "New"
    },
    {
      key: "homepage-slider",
      label: "Homepage Slider",
      icon: ImageIcon,
      description: "Manage main page slider images and settings for different devices",
      badge: "New"
    },
    {
      key: "social-media-settings",
      label: "Social Media Settings",
      icon: Globe,
      description: "Configure social media accounts and sharing settings",
      badge: "New"
    },
    {
      key: "content-management",
      label: "Content Management",
      icon: FileText,
      description: "Manage website content and pages"
    },
    {
      key: "search-filters",
      label: "Search Filters",
      icon: Settings,
      description: "Configure search filters and options"
    }
  ],

  "system-settings": [
    {
      key: "system-settings",
      label: "System Settings",
      icon: Settings,
      description: "Configure global system settings"
    },
    {
      key: "auth-registration-settings",
      label: "Auth & Registration",
      icon: Shield,
      description: "Login methods, signup rewards, promotions, affiliate & social login settings",
      badge: "New"
    },
    {
      key: "seo-settings",
      label: "SEO Hub",
      icon: Globe,
      description: "Centralized website SEO hub"
    },
    {
      key: "design-system",
      label: "Design System",
      icon: ImageIcon,
      description: "Configure global design styles, colors, typography, and UI components",
      badge: "New"
    },
    {
      key: "captcha-settings",
      label: "Captcha Security",
      icon: Shield,
      description: "Configure reCAPTCHA v3 protection for forms",
      badge: "New"
    },
    {
      key: "smtp-settings",
      label: "SMTP Settings",
      icon: Mail,
      description: "Configure SMTP email server settings"
    },
    {
      key: "indonesian-payment-config",
      label: "Indonesian Payment Config",
      icon: CreditCard,
      description: "Configure Indonesian payment merchant APIs"
    },
    {
      key: "billing-management",
      label: "Billing Management",
      icon: ShoppingBag,
      description: "Manage billing and subscription settings"
    },
    {
      key: "verification-system-settings",
      label: "Verification System",
      icon: Shield,
      description: "Configure verification steps, tier requirements, and auto-approve rules for all roles",
      badge: "New"
    },
    {
      key: "tax-config",
      label: "Tax Configuration",
      icon: Receipt,
      description: "Indonesian property tax rates, collections, and compliance reporting",
      badge: "New"
    },
    {
      key: "multi-language",
      label: "Multi-Language",
      icon: Languages,
      description: "Translation management, language coverage, and localization tracking",
      badge: "New"
    },
    {
      key: "environmental-sustainability",
      label: "Environmental Sustainability",
      icon: Leaf,
      description: "Green certifications, energy efficiency, carbon footprint, and water usage tracking",
      badge: "New"
    },
    {
      key: "contract-templates",
      label: "Contract Templates",
      icon: FileSignature,
      description: "Indonesian property legal document templates with variable substitution and versioning",
      badge: "New"
    },
    {
      key: "currency-exchange",
      label: "Currency Exchange",
      icon: Banknote,
      description: "Live FX rates, conversion tracking, and foreign buyer transaction volumes",
      badge: "New"
    }
  ],

  technical: [
    {
      key: "bug-error-detection",
      label: "Bug & Error Detection",
      icon: Bug,
      description: "Comprehensive bug tracking, security findings, and error monitoring dashboard",
      badge: "New"
    },
    {
      key: "error-logs",
      label: "Error Logs",
      icon: FileWarning,
      description: "Monitor 404 errors and other page errors with IP tracking"
    },
    {
      key: "database-errors",
      label: "Database Errors",
      icon: DatabaseZap,
      description: "Monitor and fix database errors automatically"
    },
    {
      key: "system-reports",
      label: "System Reports",
      icon: ClipboardList,
      description: "Generate system reports and logs"
    },
    {
      key: "security-monitoring",
      label: "Security Monitoring",
      icon: Shield,
      description: "Monitor system security and threats"
    },
    {
      key: "performance-monitor",
      label: "Performance Monitor",
      icon: Cpu,
      description: "Monitor app performance, cache usage, and optimizations"
    },
    {
      key: "database-management",
      label: "Database Management",
      icon: Database,
      description: "Manage database tables and entries"
    },
    {
      key: "cloudflare-settings",
      label: "Cloudflare CDN",
      icon: Cloud,
      description: "Configure Cloudflare CDN, caching, security, and performance optimization",
      badge: "New"
    },
    {
      key: "report-export",
      label: "Report Export",
      icon: Download,
      description: "Export and download comprehensive reports"
    },
    {
      key: "testing-dashboard",
      label: "Testing Dashboard",
      icon: TestTube2,
      description: "Unit tests, E2E tests, cross-browser testing, mobile testing, and load testing",
      badge: "New"
    },
    {
      key: "expansion-planning",
      label: "City Expansion Planning",
      icon: Globe,
      description: "Manage city-by-city expansion strategy with phases, competitors, and marketing budgets",
      badge: "New"
    },
    {
      key: "cron-monitor",
      label: "Cron Job Monitor",
      icon: CalendarDays,
      description: "View and monitor all scheduled pg_cron jobs with run history",
      badge: "New"
    },
    {
      key: "system-health",
      label: "System Health",
      icon: Activity,
      description: "Real-time infrastructure monitoring: DB, Auth, Storage, Edge Functions",
      badge: "New"
    },
    {
      key: "audit-trail",
      label: "Audit Trail",
      icon: Shield,
      description: "View all admin and user activity logs with search, filters, and CSV export",
      badge: "New"
    },
    {
      key: "admin-activity-log",
      label: "Admin Activity Log",
      icon: Activity,
      description: "Real-time admin actions from activity_logs with type filtering and user tracking",
      badge: "New"
    },
    {
      key: "platform-health-score",
      label: "Platform Health Score",
      icon: Heart,
      description: "Comprehensive wellness assessment: DB, API, security, UX, revenue, and infrastructure",
      badge: "New"
    },
    {
      key: "developer-portal",
      label: "Developer Portal",
      icon: Terminal,
      description: "API keys, webhooks, endpoint analytics, and developer documentation",
      badge: "New"
    },
    {
      key: "fraud-detection",
      label: "Fraud Detection",
      icon: ShieldAlert,
      description: "Real-time fraud monitoring, risk scoring, duplicate detection, and case management",
      badge: "New"
    }
  ],

  features: [
    {
      key: "innovation-lab",
      label: "Innovation Lab",
      icon: TestTube2,
      description: "A/B testing engine, feature flags, user feedback, and experimentation platform",
      badge: "New"
    },
    {
      key: "mobile-enhancements",
      label: "Mobile Enhancements",
      icon: Smartphone,
      description: "AR Preview, Live Auctions, Community Chat, Property Journey, and Offline Mode",
      badge: "New"
    },
    {
      key: "social-commerce",
      label: "Social Commerce",
      icon: ShoppingBag,
      description: "Instagram, TikTok, Pinterest, Facebook storefronts with WhatsApp automation",
      badge: "New"
    },
    {
      key: "automation-platform",
      label: "Automation Platform",
      icon: Zap,
      description: "High-volume automation for onboarding, listings, messaging, reports & partners",
      badge: "New"
    },
    {
      key: "property-comparison",
      label: "Property Comparison",
      icon: ArrowLeftRight,
      description: "Compare properties side by side"
    },
    {
      key: "enhanced-search",
      label: "Enhanced Search Filters",
      icon: Search,
      description: "Advanced property search with multiple filter options"
    },
    {
      key: "user-experience-tips",
      label: "User Experience Tips",
      icon: HelpCircle,
      description: "Performance tips and user engagement guidelines"
    },
    {
      key: "media-network",
      label: "Media Network",
      icon: Video,
      description: "Manage YouTube, Podcast, Newsletter, Research Reports, and Events",
      badge: "New"
    },
    {
      key: "user-acquisition",
      label: "User Acquisition",
      icon: TrendingUp,
      description: "Referral 2.0, Bank Partnerships, SEO Factory, Influencers, Corporate & University Programs",
      badge: "New"
    },
    {
      key: "team-management",
      label: "Team Management",
      icon: Users,
      description: "Remote-first team: Core Team, Moderators, Local Experts, AI Specialists, Partnership Managers",
      badge: "New"
    },
    {
      key: "viral-growth-campaigns",
      label: "Viral Growth Campaigns",
      icon: Rocket,
      description: "Quick wins: Referral 3x, Listing Competitions, Photo Contests, Agent Leaderboard, $50 Bonus",
      badge: "🔥 Hot"
    },
    {
      key: "media-coverage-pr",
      label: "Media Coverage & PR",
      icon: Newspaper,
      description: "Press coverage, HARO outreach, podcast appearances, and PR agency management",
      badge: "New"
    },
    {
      key: "concierge-service",
      label: "Concierge Service",
      icon: Crown,
      description: "White-glove property service at 2% vs traditional 5-6% - photography, legal, moving, setup",
      badge: "Premium"
    },
    {
      key: "community-forum",
      label: "Community Forum",
      icon: MessagesSquare,
      description: "Forum moderation, category management, and member engagement analytics",
      badge: "New"
    },
    {
      key: "launch-roadmap",
      label: "Launch Roadmap",
      icon: Rocket,
      description: "6-month national launch execution plan with phased task tracking and progress monitoring",
      badge: "🚀 Launch"
    },
    {
      key: "growth-execution",
      label: "90-Day Growth Plan",
      icon: Zap,
      description: "Weekly execution priorities for listing seeding, marketing funnels, agent onboarding, and monetization",
      badge: "📈 Growth"
    },
    {
      key: "agent-acquisition",
      label: "Agent Acquisition",
      icon: UserPlus,
      description: "Agent pipeline management — identify, contact, onboard, and activate agents across key cities",
      badge: "🎯 Agents"
    },
    {
      key: "supply-expansion",
      label: "Supply Expansion",
      icon: Building,
      description: "National property supply growth strategy — city prioritization, listing sourcing, and quality control",
      badge: "📦 Supply"
    },
    {
      key: "investor-funnel",
      label: "Investor Growth Funnel",
      icon: TrendingUp,
      description: "Marketing & conversion funnel strategy to attract and retain property investors",
      badge: "📈 Investors"
    },
    {
      key: "viral-content",
      label: "Viral Content Strategy",
      icon: Video,
      description: "Social media content engine — formats, distribution, engagement triggers, and conversion flows",
      badge: "🎬 Content"
    },
    {
      key: "partnership-expansion",
      label: "Partnership Expansion",
      icon: Handshake,
      description: "Strategic ecosystem partnerships — developers, agencies, banks, media, and long-term alliances",
      badge: "🤝 Partnerships"
    },
    {
      key: "brand-authority",
      label: "Brand Authority Strategy",
      icon: Crown,
      description: "National thought leadership positioning — content pillars, visibility, trust signals, and brand moat",
      badge: "👑 Authority"
    }
  ],

  help: [
    {
      key: "admin-guide",
      label: "Admin Guide & Documentation",
      icon: HelpCircle,
      description: "Complete admin panel user guide and feature documentation",
      badge: "New"
    },
    {
      key: "platform-changelog",
      label: "Platform Changelog",
      icon: Newspaper,
      description: "Version history, release notes, and feature changelog with timeline view",
      badge: "New"
    },
    {
      key: "system-announcements",
      label: "System Announcements",
      icon: Megaphone,
      description: "Broadcast messages and alerts to platform users by audience segment",
      badge: "New"
    },
    {
      key: "knowledge-base",
      label: "Knowledge Base",
      icon: BookOpen,
      description: "Help articles, FAQs, and video tutorials for platform users and admins",
      badge: "New"
    }
  ]
};

export const sectionCategories = navigationSections;

export const sectionTitles = {
  overview: "Dashboard",
  "investor-management": "Investor Management",
  transactions: "Transaction Management",
  "astra-token": "ASTRA Token",
  tools: "Tools & Management",
  "core-management": "Core Management",
  "customer-service": "Customer Service",
  "user-management": "User Management",
  "vendor-management": "Vendor Management", 
  "analytics-monitoring": "Analytics & Monitoring",
  "content-settings": "Content & Settings",
  "system-settings": "System Settings",
  technical: "Technical",
  features: "Feature Enhancements",
  help: "Help & Documentation"
};
