
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
  Wallet,
  ThumbsUp,
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
  Paintbrush,
  Layout,
  Eye,
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
  Handshake,
  Send,
  Presentation,
  MapPin,
  Droplets,
  GraduationCap,


  Brain,
  Scale,
  PieChart,
  CalendarClock,
  Sunrise,
  Orbit,
  Network,
  Award,
  Radio,
  Mic,
  GitBranch,
  Siren,
  ClipboardCheck,
  Swords,
  Hourglass,
  Timer,
  Crosshair,
  Upload,
  PartyPopper,
  Briefcase,
  Hammer
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
  "execution-command",
  "marketplace-growth",
  "market-intelligence",
  "monetization",
  "operations",
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
  "execution-command": [
    {
      key: "founder-daily-execution",
      label: "Founder Daily KPI Dashboard",
      icon: Sunrise,
      description: "Daily execution metrics, priority tasks, and founder productivity scoring",
      badge: "Command"
    },
    {
      key: "first-city-domination",
      label: "First City Domination",
      icon: Crosshair,
      description: "Tactical operations for city domination — supply, agents, buyers, closing",
      badge: "Tactical"
    },
    {
      key: "deal-priority-revenue",
      label: "Deal Priority & Revenue",
      icon: BarChart3,
      description: "AI deal ranking, supply tracker, investor reports, and revenue projection engine",
      badge: "Intel"
    },
    {
      key: "deal-pipeline-crm",
      label: "Deal Pipeline CRM",
      icon: Target,
      description: "Kanban deal tracking from inquiry to closing with drag-drop and AI insights",
      badge: "CRM"
    },
    {
      key: "deal-closing-automation",
      label: "Viewing Scheduler Panel",
      icon: CalendarClock,
      description: "Schedule, track, and optimize property viewings with conversion analytics"
    },
    {
      key: "first-100k-revenue",
      label: "Revenue Trigger Monitor",
      icon: Zap,
      description: "Real-time revenue triggers, milestone tracking, and growth acceleration signals",
      badge: "Live"
    },
    {
      key: "founder-mobile-warroom",
      label: "Mobile War-Room",
      icon: Smartphone,
      description: "Mobile-first executive control dashboard for real-time marketplace monitoring",
      badge: "New"
    }
  ],

  "marketplace-growth": [
    {
      key: "listing-management",
      label: "Listings Supply Dashboard",
      icon: Building,
      description: "Monitor listing inventory, activation rates, and supply health across regions"
    },
    {
      key: "market-heat-intelligence",
      label: "Buyer Demand Analytics",
      icon: Flame,
      description: "Buyer intent signals, demand heatmaps, and conversion funnel analysis"
    },
    {
      key: "agent-network-growth",
      label: "Agent Network Growth",
      icon: Users,
      description: "Agent ecosystem KPIs, leaderboard, activation funnel, and recruitment pipeline",
      badge: "New"
    },
    {
      key: "referral-management",
      label: "Referral Engine Monitor",
      icon: Share2,
      description: "Referral program performance, viral coefficients, and reward tracking"
    },
    {
      key: "behavioral-growth-engine",
      label: "Behavioral Growth Engine",
      icon: Activity,
      description: "Agent gamification, seller urgency psychology, marketing ROI, and network effect tracking",
      badge: "Growth"
    },
    {
      key: "trust-safety-intelligence",
      label: "Trust & Safety Intelligence",
      icon: Shield,
      description: "Risk monitoring, fraud detection AI, reputation signals, and secure escrow deal flow",
      badge: "🛡️ Trust"
    },
    {
      key: "compliance-valuation-institutional",
      label: "Compliance & Institutional",
      icon: Scale,
      description: "Regulatory readiness, property valuation index, institutional deal flow, and luxury segment intelligence",
      badge: "⚖️ Institutional"
    },
    {
      key: "founder-ai-copilot-global-intel",
      label: "AI Copilot & Global Intel",
      icon: Brain,
      description: "Strategic decision AI, city launch simulator, global capital flow dynamics, and infrastructure evolution narrative",
      badge: "🧠 AI"
    },
    {
      key: "planetary-intelligence-civilization-os",
      label: "Planetary Intelligence & Civilization OS",
      icon: Globe,
      description: "Global liquidity grid, wealth infrastructure engine, intergenerational legacy, and civilization-scale coordination",
      badge: "🌍 Planetary"
    },
    {
      key: "first-traction-execution",
      label: "First Traction Execution",
      icon: Target,
      description: "30-day traction tracker, agent outreach scripts, buyer conversion assistant, and $100K revenue milestone tracker",
      badge: "🚀 Execution"
    },
    {
      key: "deal-ops-closing",
      label: "Deal Ops & Closing",
      icon: ClipboardList,
      description: "Agent follow-ups, viewing calendar, negotiation CRM, and closing checklist automation",
      badge: "⚡ Ops"
    },
    {
      key: "performance-deal-warroom",
      label: "Performance & War-Room",
      icon: Trophy,
      description: "Agent incentives, buyer qualification scoring, listing quality optimization, and daily deal war-room",
      badge: "🎯 Intel"
    },
    {
      key: "supply-growth-deal-acceleration",
      label: "Supply & Deal Acceleration",
      icon: TrendingUp,
      description: "Listing acquisition tracker, buyer matchmaking, bottleneck detection, and weekly revenue sprint planner",
      badge: "📈 Growth"
    }
  ],

  "market-intelligence": [
    {
      key: "city-liquidity-heatmap",
      label: "City Liquidity Heatmap",
      icon: Map,
      description: "Interactive heatmap with demand, supply, velocity, and price growth layers",
      badge: "Intel"
    },
    {
      key: "opportunity-scoring-engine",
      label: "District Performance Ranking",
      icon: BarChart3,
      description: "AI-powered district scoring with liquidity, yield, and growth metrics"
    },
    {
      key: "price-prediction-engine",
      label: "Price Trend Analytics",
      icon: TrendingUp,
      description: "Predictive pricing models, FMV analysis, and price elasticity signals"
    },
    {
      key: "global-macro-intelligence",
      label: "Market Momentum Index",
      icon: Activity,
      description: "Composite market momentum scoring with capital flow and cycle detection"
    },
    {
      key: "investor-growth-intelligence",
      label: "Investor Growth Intelligence",
      icon: BarChart3,
      description: "Investor perception signals, AI pricing engine, seller funnel, and unicorn growth metrics",
      badge: "Premium"
    },
    {
      key: "global-expansion-intelligence",
      label: "Global Expansion Intelligence",
      icon: Globe,
      description: "Expansion simulator, AI autonomous growth engine, and planet-scale liquidity vision",
      badge: "Strategic"
    }
  ],

  monetization: [
    {
      key: "premium-listings-monetization",
      label: "Premium Listings Control",
      icon: Crown,
      description: "Premium package sales, upsell pipeline, and listing upgrade analytics",
      badge: "Revenue"
    },
    {
      key: "subscription-management",
      label: "Vendor Subscription Manager",
      icon: RefreshCw,
      description: "Active subscriptions, MRR tracking, churn alerts, and renewal probability"
    },
    {
      key: "commission-management",
      label: "Commission Tracking Panel",
      icon: Coins,
      description: "Agent and platform commission calculations, payouts, and reconciliation"
    },
    {
      key: "revenue-flywheel-optimizer",
      label: "Revenue Analytics Overview",
      icon: DollarSign,
      description: "Holistic revenue analytics with flywheel metrics and growth projections"
    }
  ],

  overview: [
    { 
      key: "overview", 
      label: "Dashboard Overview", 
      icon: Home,
      description: "Main dashboard overview and quick stats"
    },
    {
      key: "revenue-flywheel-optimizer",
      label: "Revenue Flywheel Optimizer",
      icon: DollarSign,
      description: "Pricing experiments, upsell signals, commission controls & velocity forecasting",
      badge: "New"
    },
    {
      key: "data-moat-governance",
      label: "Data Moat Governance",
      icon: Shield,
      description: "Proprietary intelligence depth, competitive advantage scoring & monetization readiness",
      badge: "New"
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
      key: "investor-management-overview",
      label: "📊 Investor Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all investor management modules"
    },
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
    },
    {
      key: "market-heat-intelligence",
      label: "Market Heat Intelligence",
      icon: Flame,
      description: "Geo-cluster analysis — zone heat scoring, demand distribution, and emerging market detection",
      badge: "New"
    },
    {
      key: "opportunity-scoring-engine",
      label: "AI Scoring Engine",
      icon: Zap,
      description: "Core opportunity scoring brain — weighted composite model with ROI, demand, undervaluation, velocity, yield, and luxury",
      badge: "New"
    },
    {
      key: "price-prediction-engine",
      label: "Price Prediction Engine",
      icon: Brain,
      description: "Autonomous AI valuation, price forecasting, undervaluation detection, and investor decision signals",
      badge: "New"
    }
  ],

  transactions: [
    {
      key: "transactions-overview",
      label: "📊 Transactions Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all transaction and payment modules"
    },
    {
      key: "transaction-hub",
      label: "Transaction Management",
      icon: DollarSign,
      description: "Complete transaction management with tabs: Transactions, Tax Config, Live Monitor, Audit Trail, and Feedback",
      badge: "New"
    },
    {
      key: "deal-closing-automation",
      label: "Deal Closing Automation",
      icon: Zap,
      description: "7-stage deal state machine with automated tasks, stall detection & orchestration",
      badge: "AI"
    },
    {
      key: "ai-negotiation-agent",
      label: "AI Negotiation Agent",
      icon: Handshake,
      description: "Autonomous deal negotiation assistant — offer strategies, counter-offer tactics, risk alerts & closure probability",
      badge: "🤖 AI Agent"
    },
    {
      key: "network-effect-simulator",
      label: "Network Effect Simulator",
      icon: Network,
      description: "Scenario-test marketplace feedback loops, dominance thresholds & revenue trajectories",
      badge: "AI"
    },
    {
      key: "global-expansion-war",
      label: "Global Expansion War Strategy",
      icon: Globe,
      description: "City domination scoring, launch war plans & regional scaling roadmap",
      badge: "AI"
    },
    {
      key: "marketplace-optimization-ai",
      label: "Marketplace Optimization AI",
      icon: Bot,
      description: "Self-optimizing AI layer for liquidity, revenue & satisfaction with safety controls",
      badge: "AI"
    },
    {
      key: "unicorn-narrative",
      label: "$1B Valuation Narrative",
      icon: Crown,
      description: "Unicorn positioning framework, valuation milestones & investor pitch storyline",
      badge: "Strategy"
    },
    {
      key: "liquidity-index-branding",
      label: "Liquidity Index Branding",
      icon: Activity,
      description: "Public branding strategy for ASTRA Liquidity Index — data products, authority building & monetization",
      badge: "Strategy"
    },
    {
      key: "global-brand-authority",
      label: "Global Brand Authority",
      icon: Award,
      description: "Brand positioning, thought leadership, credibility milestones & market trust strategy",
      badge: "🏆 Brand"
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
      key: "astra-token-overview",
      label: "📊 Token Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — ASTRA token management overview"
    },
    {
      key: "astra-token-hub",
      label: "ASTRA Token Hub",
      icon: Coins,
      description: "Comprehensive ASTRA token management including analytics, settings, user activity, transactions, and webhook configuration"
    }
  ],

  tools: [
    {
      key: "tools-overview",
      label: "📊 Tools Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all tools and utilities"
    },
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
      key: "core-management-overview",
      label: "📊 Core Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all property and core management modules"
    },
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
      key: "bulk-image-generator",
      label: "Bulk AI Image Generator",
      icon: ImageIcon,
      description: "Generate AI images for all 313K+ properties that have no photos",
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
      key: "customer-service-overview",
      label: "📊 Support Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all customer service modules"
    },
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
      key: "user-management-overview",
      label: "📊 Users Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all user management and KYC modules"
    },
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

  operations: [
    {
      key: "operations-overview",
      label: "📊 Operations Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of command, vendor intelligence, workforce, and supply operations"
    },
    {
      key: "founder-daily-command",
      label: "Founder Command Center",
      icon: Radio,
      description: "Daily operational command dashboard — Bloomberg-style market control center",
      badge: "New"
    },
    {
      key: "admin-command-center",
      label: "Admin Command Center",
      icon: Settings,
      description: "Mission control for liquidity, revenue, growth, deal routing & system diagnostics",
      badge: "New"
    },
    {
      key: "city-launch-growth-engine",
      label: "City Launch Growth Engine",
      icon: Rocket,
      description: "Multi-city launch automation — liquidity seeding, demand generation, balance optimization & success metrics",
      badge: "New"
    },
    {
      key: "monetization-engine-control",
      label: "Monetization Engine",
      icon: DollarSign,
      description: "Pricing tiers, boost revenue, vendor subscriptions, investor monetization & automated optimization",
      badge: "New"
    },
    {
      key: "first-1m-revenue-system",
      label: "First $1M Revenue",
      icon: DollarSign,
      description: "Tactical revenue execution — boost sales, vendor subs, investor unlocks, momentum alerts & founder actions",
      badge: "🎯 Revenue"
    },
    {
      key: "decacorn-valuation",
      label: "Decacorn Valuation",
      icon: Shield,
      description: "Market dominance, intelligence moat, network effects & revenue scale trajectory — investor confidence interface",
      badge: "🦄 Valuation"
    },
    {
      key: "ai-growth-brain",
      label: "AI Growth Brain",
      icon: Brain,
      description: "Autonomous intelligence engine — signal ingestion, processing, action recommendations & self-learning loop",
      badge: "🧠 AI"
    },
    {
      key: "global-expansion-control",
      label: "Global Expansion Control",
      icon: Globe,
      description: "Multi-market performance grid, readiness scoring, capital deployment & network effect visualization",
      badge: "🌍 Global"
    },
    {
      key: "ipo-readiness-metrics",
      label: "IPO Readiness Metrics",
      icon: BarChart3,
      description: "Financial maturity, marketplace scale, operational efficiency & profitability pathway for public-market readiness",
      badge: "📊 IPO"
    },
    {
      key: "founder-war-room",
      label: "Founder War Room",
      icon: Shield,
      description: "Unified command screen — liquidity, revenue, marketplace force, AI brain, expansion radar & alert skyline",
      badge: "⚔️ Command"
    },
    {
      key: "execution-command-center",
      label: "Execution Command Center",
      icon: Rocket,
      description: "Real-time operating cockpit — liquidity, pipeline, vendor, revenue & campaign controls",
      badge: "New"
    },
    {
      key: "founder-daily-priority",
      label: "Founder Priority Command",
      icon: Target,
      description: "Daily top-5 deals, supply gaps, high-intent buyers, expiring revenue & agent tasks",
      badge: "🎯 Daily"
    },
    {
      key: "agent-territory-coverage",
      label: "Agent Territory Map",
      icon: MapPin,
      description: "District coverage strength, agent density, territory gaps & expansion priorities",
      badge: "🗺️ Geo"
    },
    {
      key: "buyer-viewing-feedback",
      label: "Viewing Feedback",
      icon: Eye,
      description: "Buyer satisfaction scores, agent ratings, feedback tags & improvement suggestions",
      badge: "👁️ Quality"
    },
    {
      key: "monthly-liquidity-domination",
      label: "Liquidity Domination",
      icon: Droplets,
      description: "Monthly traction curves, district liquidity index & strategic milestone tracker",
      badge: "💧 Liquidity"
    },
    {
      key: "district-price-competitiveness",
      label: "Price Competitiveness",
      icon: DollarSign,
      description: "District pricing intelligence, overpriced alerts, underpriced opportunities & inquiry correlation",
      badge: "💲 Pricing"
    },
    {
      key: "urgent-deal-rescue",
      label: "Deal Rescue Panel",
      icon: AlertTriangle,
      description: "At-risk deals, mediation steps, urgency templates & financing delay tracking",
      badge: "🚨 Rescue"
    },
    {
      key: "agent-training-coaching",
      label: "Agent Training & Coaching",
      icon: GraduationCap,
      description: "Performance scorecards, training modules, growth trends & coaching sessions",
      badge: "🎓 Training"
    },
    {
      key: "quarterly-expansion-readiness",
      label: "Expansion Readiness",
      icon: Compass,
      description: "Composite readiness radar, district maturity ranking & next city candidates",
      badge: "🧭 Expand"
    },
    {
      key: "realtime-buyer-demand-pulse",
      label: "Buyer Demand Pulse",
      icon: Activity,
      description: "Live buyer activity ticker, hourly demand trends, district heatmap & surge alerts",
      badge: "📡 Live"
    },
    {
      key: "high-value-spotlight-promotion",
      label: "Spotlight Promotion",
      icon: Sparkles,
      description: "Featured listing management, promotion ROI tracking & AI placement suggestions",
      badge: "✨ Promote"
    },
    {
      key: "agent-referral-growth-flywheel",
      label: "Referral Flywheel",
      icon: Share2,
      description: "Referral network growth, bonus tiers, top referrer leaderboard & conversion tracking",
      badge: "🔄 Growth"
    },
    {
      key: "annual-market-leadership",
      label: "Market Leadership",
      icon: Crown,
      description: "Yearly growth trajectory, district leadership ranking & competitive positioning index",
      badge: "👑 Strategy"
    },
    {
      key: "ai-dynamic-pricing-engine",
      label: "Dynamic Pricing AI",
      icon: DollarSign,
      description: "Price elasticity simulation, auto-adjust engine, scenario comparison & demand sensitivity",
      badge: "🤖 Pricing"
    },
    {
      key: "buyer-seller-matching",
      label: "Buyer-Seller Matching",
      icon: Zap,
      description: "Real-time match alerts, compatibility scoring, instant notification triggers & conversion tracking",
      badge: "⚡ Matching"
    },
    {
      key: "competitive-market-intelligence",
      label: "Competitive Intelligence",
      icon: Crosshair,
      description: "Rival platform tracking, market share trends, strength radar & strategic positioning insights",
      badge: "🎯 Intel"
    },
    {
      key: "ultimate-founder-one-screen",
      label: "Founder One-Screen",
      icon: Target,
      description: "Entire business health in 10 seconds — deals, supply, demand, revenue, agents & liquidity",
      badge: "🎯 Command"
    },
    {
      key: "ai-autonomous-operator",
      label: "Autonomous Operator",
      icon: Bot,
      description: "Self-optimizing marketplace systems — pricing, matching, ranking, referrals & marketing automation",
      badge: "🤖 Auto"
    },
    {
      key: "global-expansion-capital-simulator",
      label: "Expansion Simulator",
      icon: Globe,
      description: "Model city expansion scenarios — marketing budget, agent targets, deal projections & break-even",
      badge: "🌍 Expand"
    },
    {
      key: "platform-integration-architecture",
      label: "Platform Architecture",
      icon: Layers,
      description: "End-to-end system connectivity — 5 architecture layers, module health & scalability readiness",
      badge: "🏗️ Infra"
    },
    {
      key: "user-onboarding-flow",
      label: "User Onboarding Flow",
      icon: Users,
      description: "High-conversion onboarding — role selection, profile setup, preference capture & completion tracking",
      badge: "👤 UX"
    },
    {
      key: "listing-submission-ux",
      label: "Listing Submission UX",
      icon: Upload,
      description: "Optimized listing upload — quality scoring, photo uploads, price guidance & premium boost prompts",
      badge: "📋 UX"
    },
    {
      key: "buyer-search-conversion",
      label: "Buyer Search Conversion",
      icon: Search,
      description: "Search-to-inquiry optimization — filters, results grid, conversion funnel & recently viewed tracking",
      badge: "🔍 UX"
    },
    {
      key: "agent-training-portal",
      label: "Agent Training Portal",
      icon: GraduationCap,
      description: "New agent onboarding — training modules, certification badges, success stories & performance tips",
      badge: "🎓 Training"
    },
    {
      key: "buyer-viewing-booking",
      label: "Viewing Booking Flow",
      icon: Calendar,
      description: "Step-by-step viewing scheduling — date/time selection, contact confirmation & booking status tracker",
      badge: "📅 Booking"
    },
    {
      key: "seller-performance-insight",
      label: "Seller Performance",
      icon: BarChart3,
      description: "Listing analytics for sellers — views, inquiries, market benchmarks & improvement suggestions",
      badge: "📊 Insights"
    },
    {
      key: "agent-mobile-home",
      label: "Agent Mobile Home",
      icon: Smartphone,
      description: "Mobile-optimized agent dashboard — schedule, inquiries, listings, deals & commission tracking",
      badge: "📱 Mobile"
    },
    {
      key: "deal-offer-submission",
      label: "Offer Submission Flow",
      icon: Send,
      description: "Streamlined purchase offer — pricing, financing, seller message & negotiation stage tracking",
      badge: "💰 Offers"
    },
    {
      key: "negotiation-chat",
      label: "Negotiation Chat",
      icon: MessageSquare,
      description: "Deal-specific communication — offer adjustments, price gap visualization & smart message templates",
      badge: "💬 Chat"
    },
    {
      key: "deal-progress-timeline",
      label: "Deal Progress Timeline",
      icon: Target,
      description: "Visual transaction journey — stage tracking, pending actions & closing estimates",
      badge: "📍 Timeline"
    },
    {
      key: "secure-payment-escrow",
      label: "Payment & Escrow",
      icon: Shield,
      description: "Protected payment flow — milestones, document verification & escrow deposit tracking",
      badge: "🔒 Escrow"
    },
    {
      key: "closing-celebration",
      label: "Closing Celebration",
      icon: PartyPopper,
      description: "Deal completion — celebration, agent rating, referral triggers & success sharing",
      badge: "🎉 Closing"
    },
    {
      key: "post-closing-ownership",
      label: "Ownership Dashboard",
      icon: Home,
      description: "Post-closing property management — appreciation tracking, documents, maintenance & resale timing",
      badge: "🏠 Ownership"
    },
    {
      key: "investor-portfolio-tracking",
      label: "Portfolio Tracking",
      icon: Briefcase,
      description: "Multi-property portfolio analytics — ROI, diversification, growth momentum & risk exposure",
      badge: "📊 Portfolio"
    },
    {
      key: "rental-yield-monitoring",
      label: "Rental Yield Monitor",
      icon: Wallet,
      description: "Rental income intelligence — occupancy, yield benchmarks, tenant payments & vacancy alerts",
      badge: "💰 Yield"
    },
    {
      key: "smart-property-recommendations",
      label: "Smart Recommendations",
      icon: Sparkles,
      description: "AI-powered opportunity discovery — ROI projections, liquidity scores & growth alerts",
      badge: "✨ AI Recs"
    },
    {
      key: "renovation-roi-calculator",
      label: "Renovation ROI Calculator",
      icon: Hammer,
      description: "Estimate value uplift from renovation improvements — cost vs value, payback period & market demand",
      badge: "🔨 ROI"
    },
    {
      key: "insurance-comparison",
      label: "Insurance Comparison",
      icon: Shield,
      description: "Compare property insurance options — coverage scope, premiums, claim reliability & risk exposure",
      badge: "🛡️ Insurance"
    },
    {
      key: "resale-opportunity",
      label: "Resale Opportunity",
      icon: TrendingUp,
      description: "Identify optimal resale timing — market demand, appreciation trends & profit scenarios",
      badge: "📈 Resale"
    },
    {
      key: "wealth-transfer-planner",
      label: "Wealth Transfer Planner",
      icon: Crown,
      description: "Plan generational wealth transfer — beneficiary allocation, tax implications & legal readiness",
      badge: "👨‍👩‍👧‍👦 Legacy"
    },
    {
      key: "global-diversification-strategy",
      label: "Global Diversification",
      icon: Globe,
      description: "Geographic portfolio diversification — regional allocation, yield comparison & cross-border opportunities",
      badge: "🌍 Global"
    },
    {
      key: "economic-trend-forecasting",
      label: "Economic Forecasting",
      icon: Activity,
      description: "Macroeconomic cycle intelligence — price trends, supply pipeline, demand projection & factor correlation",
      badge: "📊 Macro"
    },
    {
      key: "smart-financing-optimization",
      label: "Financing Optimizer",
      icon: Calculator,
      description: "Mortgage & loan optimization — amortization, DSCR, rate sensitivity & cashflow analysis",
      badge: "💳 Finance"
    },
    {
      key: "institutional-syndication",
      label: "Portfolio Syndication",
      icon: Users,
      description: "Institutional investment coordination — portfolio bundles, due diligence & capital participation tracking",
      badge: "🏦 Institutional"
    },
    {
      key: "ai-copilot",
      label: "AI Co-Pilot",
      icon: Brain,
      description: "Intelligent operations assistant — recommendations, risk radar, NL commands & automation governance",
      badge: "🤖 AI"
    },
    {
      key: "founder-daily-execution",
      label: "Founder Daily Execution",
      icon: Clock,
      description: "Hour-by-hour operational schedule — growth decisions, vendor acquisition, investor activation & war-room reflection",
      badge: "📋 Daily"
    },
    {
      key: "first-100k-revenue",
      label: "First $100K Revenue",
      icon: DollarSign,
      description: "14-week tactical plan — liquidity foundation, revenue levers, weekly tactics, checklists & risk mitigation",
      badge: "💰 Revenue"
    },
    {
      key: "investor-narrative-coaching",
      label: "Investor Narrative Coaching",
      icon: Mic,
      description: "6-phase meeting flow — power scripts, delivery technique, pacing strategy & language control",
      badge: "🎙️ Pitch"
    },
    {
      key: "vendor-outreach-scripts",
      label: "Vendor Outreach Scripts",
      icon: MessageSquare,
      description: "Cold outreach templates for WhatsApp, Email, LinkedIn with follow-ups and urgency closers",
      badge: "📨 Outreach"
    },
    {
      key: "listing-copy-generator",
      label: "Listing Copy Generator",
      icon: FileText,
      description: "High-conversion property descriptions in mobile, luxury & investor analytical tones",
      badge: "✍️ Copy"
    },
    {
      key: "growth-experiment-backlog",
      label: "Growth Experiment Backlog",
      icon: FlaskConical,
      description: "12 structured experiments across demand, pricing, urgency, AI ranking & referral mechanics",
      badge: "🧪 Growth"
    },
    {
      key: "investor-nurturing-sequence",
      label: "Investor Nurturing Sequence",
      icon: Users,
      description: "6-step lifecycle flow from inquiry to paid unlock across WhatsApp, Email & Push",
      badge: "🎯 Nurture"
    },
    {
      key: "vendor-retention-scripts",
      label: "Vendor Retention & Upsell",
      icon: Shield,
      description: "5-step lifecycle scripts — onboarding, performance nudge, premium upsell, urgency & churn prevention",
      badge: "🛡️ Retain"
    },
    {
      key: "liquidity-crisis-recovery",
      label: "Liquidity Crisis Recovery",
      icon: AlertTriangle,
      description: "3-phase emergency framework — 48h stabilization, liquidity rebuild & growth restoration",
      badge: "🚨 Crisis"
    },
    {
      key: "city-launch-pr-plan",
      label: "City Launch PR Plan",
      icon: Globe,
      description: "Full PR kit — press headlines, founder quotes, social posts, journalist pitch & event copy",
      badge: "📰 PR"
    },
    {
      key: "closing-conversation-sim",
      label: "Closing Conversation Simulator",
      icon: MessageSquare,
      description: "Dialogue scripts, call frameworks & voice-note templates for converting inquiries into viewings",
      badge: "🎯 Sales"
    },
    {
      key: "pricing-experiment-backlog",
      label: "Pricing Experiment Backlog",
      icon: FlaskConical,
      description: "Behavioral economics experiments for boost, subscription & premium access monetization",
      badge: "🧪 Pricing"
    },
    {
      key: "national-expansion-sim",
      label: "National Expansion Simulator",
      icon: Map,
      description: "City-level readiness scoring, scenario simulation & phased rollout blueprint for 12 cities",
      badge: "🗺️ Expansion"
    },
    {
      key: "investor-fomo-pitch",
      label: "Investor FOMO Pitch Content",
      icon: Sparkles,
      description: "7-slide pitch content with speaker notes, persuasion techniques & storytelling sequence",
      badge: "🔥 Pitch"
    },
    {
      key: "kpi-anomaly-detector",
      label: "KPI Anomaly Detector",
      icon: Bell,
      description: "8 anomaly frameworks with detection thresholds, root causes, actions & deviation charts",
      badge: "🚨 Alerts"
    },
    {
      key: "competitive-threat-response",
      label: "Competitive Threat Response",
      icon: Shield,
      description: "4-scenario defense playbooks with phased timelines, severity scoring & moat-building actions",
      badge: "⚔️ Defense"
    },
    {
      key: "viral-growth-loops",
      label: "Viral Growth Loops",
      icon: Share2,
      description: "8 viral mechanics with psychology triggers, execution steps, KPIs & priority scoring",
      badge: "🔄 Viral"
    },
    {
      key: "super-app-ecosystem-plan",
      label: "Super-App Ecosystem Plan",
      icon: Layers,
      description: "4-phase blueprint: marketplace → transactions → financial services → lifestyle lock-in with LTV modeling",
      badge: "🏗️ Blueprint"
    },
    {
      key: "category-leadership-narrative",
      label: "Category Leadership Narrative",
      icon: Crown,
      description: "Category creation framework — manifesto, investor pitch, media soundbites & persuasion playbook",
      badge: "👑 Category"
    },
    {
      key: "strategic-decision-simulator",
      label: "Strategic Decision Simulator",
      icon: GitBranch,
      description: "4 decision scenarios with best/expected/downside modeling, second-order effects & pivot triggers",
      badge: "🧠 Decisions"
    },
    {
      key: "autonomous-pricing-intelligence",
      label: "Autonomous Pricing Intelligence",
      icon: Cpu,
      description: "Dynamic surge/drought/upgrade/urgency pricing with confidence gating, governance tiers & learning loops",
      badge: "🤖 AI Pricing"
    },
    {
      key: "global-investor-roadshow",
      label: "Global Investor Roadshow",
      icon: Globe,
      description: "International investor meeting narrative — stage points, conversational scripts, media soundbites & persuasion playbooks",
      badge: "🌍 Roadshow"
    },
    {
      key: "domination-kpi-control",
      label: "Domination KPI Control",
      icon: Gauge,
      description: "Liquidity, demand, monetization & defensibility indices with alert thresholds and automated control actions",
      badge: "⚡ Command"
    },
    {
      key: "ma-acquisition-strategy",
      label: "M&A Acquisition Strategy",
      icon: Handshake,
      description: "Listing portal, tech startup, brokerage & data platform acquisition simulations with evaluation scoring",
      badge: "🏗️ M&A"
    },
    {
      key: "fundraising-milestone-roadmap",
      label: "Fundraising Milestone Roadmap",
      icon: Rocket,
      description: "Seed → Series B milestone gates with KPI thresholds, capital allocation & investor positioning per round",
      badge: "🚀 Fundraising"
    },
    {
      key: "crisis-war-room",
      label: "Crisis War Room",
      icon: Siren,
      description: "DEFCON severity scoring, 28-action checklist across 5 response modules, recovery KPIs & escalation triggers",
      badge: "🚨 War Room"
    },
    {
      key: "global-brand-authority-narrative",
      label: "Global Brand Authority Narrative",
      icon: Globe,
      description: "Keynote narratives, media positioning, website headlines & investor brand perception with persuasion playbooks",
      badge: "🌐 Authority"
    },
    {
      key: "decacorn-projection",
      label: "Decacorn Financial Projection",
      icon: TrendingUp,
      description: "3-5 year valuation simulation with adjustable inputs, 3 scenarios, ARR progression & risk factors",
      badge: "💎 Decacorn"
    },
    {
      key: "experiment-prioritization",
      label: "Experiment Prioritization Engine",
      icon: FlaskConical,
      description: "Ranked growth experiment backlog with impact scoring, weekly testing cycles & auto-learning feedback loops",
      badge: "🧪 Experiments"
    },
    {
      key: "partnership-strategy",
      label: "Global Partnership Strategy",
      icon: Handshake,
      description: "7-category alliance roadmap with liquidity/revenue scoring, phased execution & network effect reinforcement",
      badge: "🤝 Alliances"
    },
    {
      key: "flywheel-optimization",
      label: "Flywheel Optimization Engine",
      icon: RefreshCw,
      description: "6-stage marketplace flywheel health scoring, 24 optimization levers, bottleneck detection & phased execution",
      badge: "⚙️ Flywheel"
    },
    {
      key: "competitive-domination",
      label: "Competitive Domination Map",
      icon: Target,
      description: "Capability matrix vs 5 competitor types, 4 domination strategies, early warning signals & 3-phase roadmap",
      badge: "🎯 Domination"
    },
    {
      key: "founder-clarity-coach",
      label: "Founder Clarity Coach",
      icon: Brain,
      description: "Morning rituals, decision confidence checklist, burnout radar, mindset reframing & weekly self-assessment",
      badge: "🧠 Clarity"
    },
    {
      key: "ai-evolution-architecture",
      label: "AI Self-Evolution Architecture",
      icon: GitBranch,
      description: "Signal ingestion, predictive modeling, self-learning loops, governance framework & maturity roadmap",
      badge: "🧬 Evolution"
    },
    {
      key: "investor-narrative-dominance",
      label: "Investor Narrative Dominance",
      icon: Mic,
      description: "4 positioning scenarios with psychology, pitch framing, risk mitigation & valuation uplift simulation",
      badge: "🎯 Narrative"
    },
    {
      key: "platform-moat-strategy",
      label: "Platform Moat Reinforcement",
      icon: Shield,
      description: "5 defensibility pillars with compounding mechanisms, weakness signals & improvement roadmap",
      badge: "🏰 Moat"
    },
    {
      key: "global-os-master-blueprint",
      label: "Global OS Master Blueprint",
      icon: Globe,
      description: "Unified 5-layer OS architecture, founder vision narratives, automation command framework & maturity roadmap",
      badge: "🌍 Master OS"
    },
    {
      key: "reality-execution-audit",
      label: "Reality Execution Audit",
      icon: ClipboardCheck,
      description: "Daily execution checklist, technical architecture audit, investor due-diligence simulation & 60-day survival roadmap",
      badge: "⚡ Reality"
    },
    {
      key: "sixty-day-domination",
      label: "60-Day Market Domination",
      icon: Swords,
      description: "City domination plan, revenue engine activation & competitive war-simulation scenarios",
      badge: "🔥 War Plan"
    },
    {
      key: "ten-million-revenue",
      label: "$10M Revenue & Category Domination",
      icon: Rocket,
      description: "Revenue scaling engine, autonomous control tower & global category leadership strategy",
      badge: "🚀 $10M"
    },
    {
      key: "hundred-million-blueprint",
      label: "$100M Scale & Global IPO",
      icon: Globe,
      description: "Revenue scaling to $100M ARR, IPO readiness framework & self-driving marketplace civilization",
      badge: "🌍 $100M"
    },
    {
      key: "global-infra-legacy",
      label: "Global Infrastructure & Legacy",
      icon: Landmark,
      description: "Economic infrastructure domination, founder legacy narrative & post-IPO market control",
      badge: "🏛 Legacy"
    },
    {
      key: "century-vision",
      label: "100-Year Strategic Vision",
      icon: Hourglass,
      description: "Century-scale platform evolution, data power governance & founder leadership evolution",
      badge: "♾️ Century"
    },
    {
      key: "civilization-coordination",
      label: "Civilization Market Coordination",
      icon: Globe,
      description: "Civilization-scale AI coordination, behavioral intelligence universe & founder myth archetype",
      badge: "🌍 Civilization"
    },
    {
      key: "post-civilization",
      label: "Post-Civilization Intelligence",
      icon: Orbit,
      description: "Economic intelligence evolution, founder immortality legacy & global market consciousness",
      badge: "🔮 Post-Civ"
    },
    {
      key: "real-execution",
      label: "Real Marketplace Execution",
      icon: Rocket,
      description: "Feature priority, vendor acquisition scripts & first 1,000 listings strategy",
      badge: "🚀 Execution"
    },
    {
      key: "thirty-day-launch",
      label: "30-Day Hardcore Launch",
      icon: Flame,
      description: "Week-by-week execution, buyer traffic tactics & agent conversion psychology",
      badge: "🔥 30 Days"
    },
    {
      key: "first-revenue-closing",
      label: "First Revenue & Deal Closing",
      icon: DollarSign,
      description: "Revenue activation, daily KPI war-room & buyer conversion scripts",
      badge: "💰 Revenue"
    },
    {
      key: "first-50-deals",
      label: "First 50 Deals Acceleration",
      icon: Rocket,
      description: "Deal acceleration, vendor performance ranking & investor urgency funnels",
      badge: "🚀 Deals"
    },
    {
      key: "100k-revenue-stabilization",
      label: "$100K Revenue Stabilization",
      icon: TrendingUp,
      description: "Revenue consistency, market trust building & agent network expansion",
      badge: "📈 Scale"
    },
    {
      key: "500k-revenue-scale",
      label: "$500K Revenue Scale",
      icon: TrendingUp,
      description: "Revenue depth expansion, regional dominance & institutional partnerships",
      badge: "🚀 Scale"
    },
    {
      key: "1m-revenue-hyperscale",
      label: "$1M Monthly Hyper-Scale",
      icon: Rocket,
      description: "Revenue hyper-scaling, national brand domination & global capital integration",
      badge: "🌍 Hyper-Scale"
    },
    {
      key: "3m-continental-expansion",
      label: "$3M Continental Expansion",
      icon: Globe,
      description: "Multi-market revenue replication, continental leadership & global alliance command",
      badge: "🌏 Continental"
    },
    {
      key: "10m-global-scale",
      label: "$10M Global Scale",
      icon: Globe,
      description: "Worldwide category leadership, institutional capital dominance & $120M ARR infrastructure",
      badge: "🌐 Global"
    },
    {
      key: "50m-planetary-infrastructure",
      label: "$50M Planetary Infrastructure",
      icon: Globe,
      description: "Digital economy leadership, cross-asset intelligence & $600M ARR infrastructure",
      badge: "🪐 Planetary"
    },
    {
      key: "first-10-deals",
      label: "First 10 Deals",
      icon: Target,
      description: "Deal closing tactics, daily founder command & real agent persuasion scripts",
      badge: "🤝 Launch"
    },
    {
      key: "first-100-buyers",
      label: "First 100 Buyers & District",
      icon: Users,
      description: "Buyer acquisition, hyper-local district domination & vendor follow-up automation",
      badge: "📍 Growth"
    },
    {
      key: "first-500-listings",
      label: "First 500 Listings",
      icon: Building2,
      description: "Supply growth engine, inquiry conversion optimization & local brand authority PR",
      badge: "🏠 Supply"
    },
    {
      key: "1000-daily-visitors",
      label: "1,000 Daily Visitors",
      icon: Globe,
      description: "Traffic engine, listing presentation quality & agent loyalty retention systems",
      badge: "🚀 Traffic"
    },
    {
      key: "buyer-trust-blueprint",
      label: "Buyer Trust & Follow-Up",
      icon: Shield,
      description: "Trust assurance, local influencer campaigns & inquiry conversion scripts",
      badge: "🛡️ Trust"
    },
    {
      key: "viewing-conversion-blueprint",
      label: "Viewing Conversion & Dev Partners",
      icon: Calendar,
      description: "Viewing conversion optimization, developer partnerships & deal story marketing",
      badge: "🤝 Deals"
    },
    {
      key: "offer-negotiation-blueprint",
      label: "Offer Negotiation & Lead Distribution",
      icon: Scale,
      description: "Negotiation support, fair lead allocation & district leadership PR",
      badge: "⚖️ Fair"
    },
    {
      key: "buyer-financing-blueprint",
      label: "Buyer Financing & Premium Upsell",
      icon: Wallet,
      description: "Financing funnel, premium listing upsell psychology & local property events",
      badge: "💰 Revenue"
    },
    {
      key: "buyer-offer-confidence",
      label: "Buyer Offer Confidence & Price Intel",
      icon: ThumbsUp,
      description: "Offer confidence builders, vendor portfolio expansion & district price intelligence",
      badge: "👍 Confidence"
    },
    {
      key: "buyer-qualification-heatmap",
      label: "Buyer Qualification & Liquidity Heatmap",
      icon: UserCheck,
      description: "Serious buyer filtering, top agent partnerships & demand signal heatmap intelligence",
      badge: "🎯 Quality"
    },
    {
      key: "viewing-commitment-elite",
      label: "Viewing Commitment & Elite Circle",
      icon: CalendarClock,
      description: "Viewing attendance optimization, elite agent ecosystem & demand surge alert system",
      badge: "👁️ Viewing"
    },
    {
      key: "offer-acceptance-commission",
      label: "Offer Acceptance & Commission",
      icon: Handshake,
      description: "Offer acceleration, agent commission incentives & micro-district liquidity domination",
      badge: "🤝 Deals"
    },
    {
      key: "fast-deal-cycle-liquidity",
      label: "Fast Deal Cycle & Liquidity Score",
      icon: Activity,
      description: "Deal cycle optimization, ethical competition signals & district liquidity scoring system",
      badge: "⚡ Speed"
    },
    {
      key: "repeat-buyer-pipeline",
      label: "Repeat Buyer & Pipeline Forecast",
      icon: RefreshCw,
      description: "Buyer retention lifecycle, agent pipeline forecasting & supply shortage alert activation",
      badge: "🔄 Retention"
    },
    {
      key: "buyer-nurture-listing",
      label: "Buyer Nurture & Listing Performance",
      icon: Heart,
      description: "Long-term buyer engagement, listing optimization & price surge campaign activation",
      badge: "🌱 Lifecycle"
    },
    {
      key: "buyer-decision-district",
      label: "Decision Deadline & District Expansion",
      icon: Timer,
      description: "Buyer urgency acceleration, vendor multi-district scaling & high-demand category spotlight campaigns",
      badge: "⏰ Urgency"
    },
    {
      key: "second-viewing-leaderboard",
      label: "Second Viewing & Agent Leaderboard",
      icon: Trophy,
      description: "Second viewing conversion, territory performance gamification & urgent deal campaigns",
      badge: "🏆 Performance"
    },
    {
      key: "offer-closing-flash",
      label: "Offer Closing & Flash Promotions",
      icon: Brain,
      description: "Deal closing psychology, elite agent revenue share & high-velocity flash campaign activation",
      badge: "🧠 Closing"
    },
    {
      key: "post-deal-loyalty-mega",
      label: "Post-Deal Loyalty & Mega-Portfolio",
      icon: Heart,
      description: "Customer lifecycle retention, large-scale supply acquisition & hyper-liquidity weekend campaigns",
      badge: "❤️ Retention"
    },
    {
      key: "referral-mega-project-city",
      label: "Referral Flywheel & City Domination",
      icon: Share2,
      description: "Viral referral growth, mega developer project launches & city-wide liquidity leadership",
      badge: "🚀 Growth"
    },
    {
      key: "regional-institutional-profitability",
      label: "Regional Expansion & Profitability",
      icon: Map,
      description: "Multi-city scaling playbook, institutional deal pipeline & unit-economics optimization",
      badge: "📍 Scale"
    },
    {
      key: "national-data-series-a",
      label: "National Leadership & Series-A",
      icon: Crown,
      description: "National market dominance, data intelligence monetization & Series-A fundraising readiness",
      badge: "👑 National"
    },
    {
      key: "pre-unicorn-global-brand-os",
      label: "Pre-Unicorn Growth & Marketplace OS",
      icon: Rocket,
      description: "Hyper-growth acceleration, global brand authority & marketplace operating system architecture",
      badge: "🦄 Pre-Unicorn"
    },
    {
      key: "unicorn-category-ai-control",
      label: "Unicorn Valuation & AI Control",
      icon: Gem,
      description: "Unicorn valuation narrative, global category creation & autonomous AI marketplace control",
      badge: "💎 Unicorn"
    },
    {
      key: "decacorn-capital-intelligence",
      label: "Decacorn Financial Engine & Intelligence",
      icon: Crown,
      description: "Decacorn-scale financial engine, global capital dominance & self-evolving marketplace intelligence",
      badge: "👑 Decacorn"
    },
    {
      key: "global-infra-ecosystem-founder",
      label: "Global Infrastructure & Founder Command",
      icon: Globe,
      description: "Global economic infrastructure positioning, ecosystem expansion & founder strategic decision framework",
      badge: "🌍 Global"
    },
    {
      key: "daily-deal-weekly-war-sprint",
      label: "Daily Deal Closing & Revenue Sprint",
      icon: Swords,
      description: "Daily deal closing machine, weekly founder war plan & city revenue sprint campaigns",
      badge: "⚔️ War Mode"
    },
    {
      key: "first-10k-revenue-followup",
      label: "First $10K Revenue & Agent Follow-Up",
      icon: DollarSign,
      description: "First $10K weekly revenue plan, agent follow-up command scripts & buyer urgency closing dialogues",
      badge: "💰 $10K"
    },
    {
      key: "first-50k-revenue-incentive-pipeline",
      label: "First $50K Revenue & Pipeline Forecast",
      icon: TrendingUp,
      description: "$50K monthly revenue war strategy, top closing agent incentives & buyer pipeline forecasting",
      badge: "💰 $50K"
    },
    {
      key: "first-100k-revenue-city-replication",
      label: "$100K Revenue & City Replication",
      icon: TrendingUp,
      description: "$100K monthly revenue acceleration, city deal replication playbook & founder command dashboard",
      badge: "💰 $100K"
    },
    {
      key: "revenue-250k-regional-executive",
      label: "$250K Revenue & Regional Liquidity",
      icon: Globe,
      description: "$250K monthly revenue engine, regional liquidity network & executive KPI command center",
      badge: "💰 $250K"
    },
    {
      key: "revenue-500k-national-board",
      label: "$500K Revenue & National Liquidity Grid",
      icon: Globe,
      description: "$500K hyper-scale revenue engine, national liquidity grid & board-level strategic dashboard",
      badge: "🚀 $500K"
    },
    {
      key: "revenue-1m-national-ipo",
      label: "$1M National Domination & IPO Readiness",
      icon: Crown,
      description: "$1M monthly revenue engine, institutional capital control & pre-IPO metrics dashboard",
      badge: "👑 $1M"
    },
    {
      key: "global-leadership-valuation-grid",
      label: "Global Leadership & Autonomous Grid",
      icon: Globe,
      description: "Global market leadership, public valuation narrative & autonomous liquidity intelligence grid",
      badge: "🌍 Global"
    },
    {
      key: "global-ipo-alliance-intelligence",
      label: "Global IPO & Alliance Command",
      icon: Landmark,
      description: "IPO execution roadmap, worldwide strategic alliances & self-evolving economic intelligence",
      badge: "🏛️ IPO"
    },
    {
      key: "daily-global-revenue-sprint-clarity",
      label: "Daily Global Revenue & Founder Clarity",
      icon: Zap,
      description: "Daily revenue command, international deal sprint execution & founder strategic clarity system",
      badge: "⚡ Daily Ops"
    },
    {
      key: "global-founder-warroom-deal-expansion",
      label: "Global War-Room & Deal Expansion",
      icon: Globe,
      description: "Global founder war-room dashboard, cross-border deal engine & autonomous expansion radar",
      badge: "🌐 Command"
    },
    {
      key: "global-economic-intelligence-legacy",
      label: "Global Economic Intelligence & Legacy",
      icon: Globe,
      description: "Global economic intelligence network, planet-scale data coordination & founder legacy narrative",
      badge: "🌍 Civilization"
    },
    {
      key: "first-1000-deals-liquidity-founder",
      label: "First 1,000 Deals & Founder Rhythm",
      icon: Target,
      description: "1,000-deal execution roadmap, daily liquidity command & founder growth rhythm system",
      badge: "🎯 1K Deals"
    },
    {
      key: "first-10k-listings-buyer-pipeline-warroom",
      label: "10K Listings & Deal War-Room",
      icon: Home,
      description: "10,000-listing growth engine, serious buyer pipeline scaling & deal closure KPI war-room",
      badge: "🏠 10K Supply"
    },
    {
      key: "100k-traffic-vendor-flywheel-heatmap",
      label: "100K Traffic & Vendor Flywheel",
      icon: TrendingUp,
      description: "100K visitor traffic engine, vendor monetization flywheel & liquidity heatmap intelligence",
      badge: "📈 100K Traffic"
    },
    {
      key: "1m-visitor-network-effect-investor-narrative",
      label: "1M Visitor & Network Effects",
      icon: TrendingUp,
      description: "1M visitor scale engine, network effect acceleration & investor growth narrative KPIs",
      badge: "🚀 1M Scale"
    },
    {
      key: "national-category-domination-profitability-preipo",
      label: "National Domination & Pre-IPO",
      icon: Crown,
      description: "National category leadership, profitability inflection & pre-IPO growth discipline",
      badge: "👑 Domination"
    },
    {
      key: "ipo-roadshow-capital-allocation-autonomous-os",
      label: "IPO Roadshow & Autonomous OS",
      icon: Landmark,
      description: "IPO roadshow narrative, global capital allocation & autonomous marketplace OS architecture",
      badge: "🏛️ IPO Stage"
    },
    {
      key: "public-market-category-global-liquidity-century-vision",
      label: "Category Creation & Century Vision",
      icon: Sparkles,
      description: "Public market category creation, global liquidity infrastructure & founder century-scale vision",
      badge: "✨ Century Vision"
    },
    {
      key: "first-100-deals-cashflow-stress-proof",
      label: "First 100 Deals & Survival",
      icon: Swords,
      description: "First 100 deals war plan, cashflow survival discipline & founder stress-proof execution",
      badge: "⚔️ Survival"
    },
    {
      key: "first-20-buyers-agent-hustle-local-takeover",
      label: "First 20 Buyers & Local Takeover",
      icon: Users,
      description: "Grassroots buyer acquisition, agent daily hustle scripts & hyper-local district domination",
      badge: "🏘️ Street Level"
    },
    {
      key: "first-10-deals-viewing-psychology-agent-motivation",
      label: "First 10 Deals & Viewing Psychology",
      icon: Trophy,
      description: "Deal acceleration tactics, buyer viewing conversion psychology & agent motivation micro-system",
      badge: "🏆 First 10"
    },
    {
      key: "first-50-deals-negotiation-trust-domination",
      label: "First 50 Deals & Trust Domination",
      icon: Trophy,
      description: "Deal scaling tactics, buyer negotiation confidence scripts & local reputation trust-building",
      badge: "🎯 50 Deals"
    },
    {
      key: "first-100-deals-flywheel-agent-referral",
      label: "First 100 Deals Flywheel & Referral",
      icon: TrendingUp,
      description: "Self-reinforcing deal momentum, agent network expansion & buyer referral organic growth loops",
      badge: "🔄 Flywheel"
    },
    {
      key: "300-deals-brand-regional-liquidity",
      label: "300 Deals & Regional Liquidity",
      icon: TrendingUp,
      description: "Transaction scaling engine, brand authority acceleration & multi-district liquidity leadership",
      badge: "🗺️ Regional"
    },
    {
      key: "1000-deals-revenue-city-expansion",
      label: "1,000 Deals & Multi-City Expansion",
      icon: Crown,
      description: "Regional domination engine, revenue predictability systems & structured multi-city expansion playbook",
      badge: "👑 1K Deals"
    },
    {
      key: "national-liquidity-profit-series-a",
      label: "National Grid & Series-A",
      icon: Globe,
      description: "National liquidity coordination, profit optimization engine & Series-A fundraising narrative execution",
      badge: "🌐 Series-A"
    },
    {
      key: "series-b-institutional-category-leadership",
      label: "Series-B & Category Leadership",
      icon: Rocket,
      description: "Hyper-growth expansion, institutional capital integration & category leadership narrative engine",
      badge: "🚀 Series-B"
    },
    {
      key: "pre-unicorn-risk-developer-partnership",
      label: "Pre-Unicorn OS & Mega-Developer",
      icon: Zap,
      description: "Pre-unicorn operating system, global risk governance & mega-developer partnership engine",
      badge: "⚡ Pre-Unicorn"
    },
    {
      key: "unicorn-liquidity-institutional-authority",
      label: "Unicorn & Institutional Authority",
      icon: Crown,
      description: "Unicorn valuation acceleration, global liquidity synchronization & institutional brand authority",
      badge: "💎 Unicorn"
    },
    {
      key: "decacorn-intelligence-os-legacy",
      label: "Decacorn & Intelligence OS",
      icon: Globe,
      description: "Decacorn strategic simulation, autonomous marketplace intelligence OS & founder category-creator legacy",
      badge: "🌍 Decacorn"
    },
    {
      key: "vendor-intelligence-engine",
      label: "Vendor Intelligence Engine",
      icon: Store,
      description: "Smart routing, performance scoring, SLA monitoring & supply gap detection",
      badge: "New"
    },
    {
      key: "vendor-supply-expansion",
      label: "Vendor Supply Expansion",
      icon: ShoppingBag,
      description: "Detect category shortages, trigger recruitment campaigns, and forecast revenue impact",
      badge: "AI"
    },
    {
      key: "price-prediction-analytics",
      label: "Price Prediction Analytics",
      icon: Brain,
      description: "ML model metrics, market coverage, and batch prediction controls",
      badge: "AI"
    },
    {
      key: "market-forecasting-engine",
      label: "Market Forecasting Engine",
      icon: Brain,
      description: "AI-powered city-level price growth, rental yield, liquidity cycle, and risk forecasts",
      badge: "AI"
    },
    {
      key: "growth-experimentation",
      label: "Growth Experimentation Engine",
      icon: FlaskConical,
      description: "Autonomous A/B testing — acquisition, monetization, engagement & liquidity experiments with auto-scaling",
      badge: "🧪 AI Growth"
    },
    {
      key: "mega-city-domination",
      label: "Mega-City Domination",
      icon: MapPin,
      description: "District scoring, tactical execution blitz, KPI benchmarks & phased domination timeline",
      badge: "⚔️ War Plan"
    },
    {
      key: "rental-yield-optimization",
      label: "Rental Yield Optimization",
      icon: DollarSign,
      description: "AI rental pricing, occupancy forecasting, renovation ROI & seasonal demand intelligence",
      badge: "💰 AI Yield"
    },
    {
      key: "developer-supply-acquisition",
      label: "Developer Supply Acquisition",
      icon: Building2,
      description: "Developer scoring, outreach automation, partnership pipeline & multi-city inventory scaling",
      badge: "🏗️ Supply AI"
    },
    {
      key: "hyper-growth-kpi",
      label: "Hyper-Growth KPI Center",
      icon: Activity,
      description: "Real-time KPI command center — liquidity, revenue, user growth & operational efficiency with alerts",
      badge: "📊 Executive"
    },
    {
      key: "smart-recommendation-engine",
      label: "Smart Recommendation Engine",
      icon: Sparkles,
      description: "AI recommendation algorithm, personalization pipeline, feed widgets & accuracy tuning roadmap",
      badge: "🧠 AI Recs"
    },
    {
      key: "commission-optimization",
      label: "Commission Optimization",
      icon: ArrowLeftRight,
      description: "Dynamic commission tuning, elasticity modeling, incentive campaigns & rollout strategy",
      badge: "💰 Revenue AI"
    },
    {
      key: "listing-optimization-ai",
      label: "Listing Optimization AI",
      icon: Eye,
      description: "Autonomous listing performance analysis — visibility, pricing, content & conversion optimization",
      badge: "🤖 AI Engine"
    },
    {
      key: "workforce-scheduler",
      label: "Workforce Scheduler",
      icon: Clock,
      description: "Staff scheduling, shift management, and team utilization tracking",
      badge: "New"
    }
  ],

  "vendor-management": [
    {
      key: "vendor-management-overview",
      label: "📊 Vendors Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all vendor management modules"
    },
    {
      key: "vendors-hub",
      label: "Vendors Hub",
      icon: ShoppingBag,
      description: "Comprehensive vendor management platform with all vendor-related functionality including services, categories, KYC, analytics, and control panel"
    },
    {
      key: "vendor-revenue-optimization",
      label: "Revenue Optimization",
      icon: TrendingUp,
      description: "AI-driven vendor scoring, lead routing, pricing intelligence & upsell automation",
      badge: "AI"
    },
    {
      key: "vendor-performance",
      label: "Vendor Performance",
      icon: Store,
      description: "Service provider metrics, quality scores, and category performance",
      badge: "New"
    },
    {
      key: "vendor-marketplace-control",
      label: "Marketplace Control Engine",
      icon: Settings,
      description: "Vendor performance, listing quality, supply coverage, premium allocation & lead routing command center",
      badge: "New"
    }
  ],

  "analytics-monitoring": [
    {
      key: "analytics-monitoring-overview",
      label: "📊 Analytics Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all analytics and monitoring modules"
    },
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
      key: "commission-tracker",
      label: "Commission Tracker",
      icon: DollarSign,
      description: "Agent commissions, payouts, and revenue splits with trend analysis",
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
      key: "content-settings-overview",
      label: "📊 Content Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all content and settings modules"
    },
    {
      key: "carousel-settings",
      label: "Featured Properties Carousel",
      icon: ImageIcon,
      description: "Configure auto-scrolling carousel for featured properties",
      badge: "New"
    },
    {
      key: "homepage-slider",
      label: "Hero Slider Settings",
      icon: ImageIcon,
      description: "Open the current hero slider controls inside Website Settings",
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
      key: "system-settings-overview",
      label: "📊 Settings Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all system configuration modules"
    },
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
      label: "Website Settings",
      icon: ImageIcon,
      description: "Manage the current website design, color scheme, branding, and hero slider in one place",
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
      key: "technical-overview",
      label: "📊 Technical Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all technical and infrastructure modules"
    },
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
      key: "system-error-settings",
      label: "Error Settings",
      icon: Settings,
      description: "Configure error classification (404/5xx), alert thresholds, logging, and chat error linking",
      badge: "New"
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
      key: "city-expansion-command",
      label: "City Expansion Command",
      icon: Rocket,
      description: "Auto-deploy marketplace operations to new cities with AI readiness scoring",
      badge: "AI"
    },
    {
      key: "email-monitor",
      label: "Email Monitor",
      icon: Mail,
      description: "Track email delivery stats, failures, suppression, and queue performance",
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
      key: "features-overview",
      label: "📊 Features Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all feature enhancements and growth modules"
    },
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
    },
    {
      key: "monetization-strategy",
      label: "Monetization Strategy",
      icon: DollarSign,
      description: "Phased revenue rollout — listings, subscriptions, intelligence, transactions, and B2B ecosystem",
      badge: "💰 Revenue"
    },
    {
      key: "investor-pitch",
      label: "Investor Pitch Deck",
      icon: Presentation,
      description: "Seed round pitch narrative — 11 slides with speaker notes, visuals, FAQ, and deal terms",
      badge: "🎯 Fundraising"
    },
    {
      key: "series-b-pitch",
      label: "Series B Pitch Narrative",
      icon: Presentation,
      description: "12-slide Series B storyline with objection handling, valuation framework, and speaker notes",
      badge: "🚀 Series B"
    },
    {
      key: "100m-arr-model",
      label: "$100M ARR Operating Model",
      icon: Target,
      description: "5-year scaling roadmap with revenue engine, KPI pyramid, team structure, and unit economics",
      badge: "💎 Scale"
    },
    {
      key: "ipo-vision-strategy",
      label: "Global IPO Vision Strategy",
      icon: Globe,
      description: "7-year IPO roadmap with readiness pillars, valuation milestones, listing strategy, and public market defense",
      badge: "🌐 IPO"
    },
    {
      key: "superapp-ecosystem",
      label: "Super-App Ecosystem",
      icon: Layers,
      description: "Modular ecosystem architecture — modules, user journey, data layer, rollout roadmap, and monetization model",
      badge: "🚀 Ecosystem"
    },
    {
      key: "ai-deal-closing-agent",
      label: "AI Deal-Closing Agent",
      icon: Bot,
      description: "Semi-autonomous agents for lead qualification, deal matching, negotiation, and transaction orchestration",
      badge: "🤖 Agent AI"
    },
    {
      key: "production-system-organizer",
      label: "Production System Audit",
      icon: CheckCircle,
      description: "Launch readiness audit — role system, marketplace structure, vendor engine, monetization, admin controls",
      badge: "🏭 Production"
    },
    {
      key: "liquidity-ai-scoring",
      label: "Liquidity AI Scoring",
      icon: Activity,
      description: "Dynamic liquidity scoring engine — sell speed prediction, visibility boost, urgency alerts, district metrics",
      badge: "💧 Liquidity AI"
    },
    {
      key: "investor-deal-matching",
      label: "Investor Deal Matching AI",
      icon: Target,
      description: "AI matching engine — investor-property pairing with confidence scoring, offer ranges, and strategy tags",
      badge: "🎯 Deal Match"
    },
    {
      key: "institutional-capital-gateway",
      label: "Institutional Capital Gateway",
      icon: Landmark,
      description: "Enterprise capital allocation — portfolio builder, liquidity intelligence, deal execution & investor CRM",
      badge: "🏛️ Institutional"
    },
    {
      key: "investor-community",
      label: "Investor Community",
      icon: Users,
      description: "Full-funnel community growth — onboarding, engagement, trust, tiers, and execution roadmap",
      badge: "🏘️ Community"
    },
    {
      key: "geo-expansion",
      label: "Geographic Expansion",
      icon: MapPin,
      description: "City-by-city national expansion — 15 cities across 3 phases with activation milestones",
      badge: "🗺️ National"
    },
    {
      key: "founder-branding",
      label: "Founder Branding",
      icon: User,
      description: "CEO thought leadership strategy — content pillars, channel growth, trust stories, and authority roadmap",
      badge: "👤 Personal Brand"
    },
    {
      key: "hiring-roadmap",
      label: "Hiring Roadmap",
      icon: UserPlus,
      description: "Team scaling plan — 13 roles across 3 phases with ROI rationale, salary budgets, and culture framework",
      badge: "👥 Team"
    },
    {
      key: "partnership-manager-role",
      label: "Partnership Manager Role",
      icon: Handshake,
      description: "Complete role blueprint — responsibilities, KPIs, candidate profile, 90-day plan, and career path",
      badge: "🤝 Hiring"
    },
    {
      key: "digital-growth-role",
      label: "Digital Growth Lead Role",
      icon: TrendingUp,
      description: "Growth hire blueprint — SEO, social, paid ads, community, analytics with 90-day plan and career path",
      badge: "📈 Growth Hire"
    },
    {
      key: "property-supply-manager-role",
      label: "Property Supply Manager Role",
      icon: Building,
      description: "Supply hire blueprint — agent onboarding, developer sourcing, listing quality, marketplace liquidity, 90-day plan",
      badge: "🏗️ Supply Hire"
    },
    {
      key: "customer-success-role",
      label: "Customer Success Role",
      icon: Heart,
      description: "Agent support hire — onboarding guidance, re-engagement workflows, listing quality, retention KPIs, 90-day plan",
      badge: "💚 Success Hire"
    },
    {
      key: "org-chart",
      label: "Org Chart & Structure",
      icon: Users,
      description: "Lean startup org chart — 5 departments, phased hiring timeline, reporting structure, decision domains",
      badge: "🏛️ Org Design"
    },
    {
      key: "marketing-budget",
      label: "Marketing Budget Plan",
      icon: DollarSign,
      description: "6-month marketing budget — organic-first allocation, paid experiments, ROI reallocation rules",
      badge: "💰 Budget Plan"
    },
    {
      key: "fundraising-readiness",
      label: "Fundraising Readiness",
      icon: Rocket,
      description: "Investor readiness checklist — traction metrics, product signals, financial clarity, narrative, data room",
      badge: "🚀 Fundraise"
    },
    {
      key: "investor-kpi-framework",
      label: "Investor KPI Framework",
      icon: BarChart3,
      description: "Track marketplace supply, investor demand, AI effectiveness, revenue, and growth momentum KPIs",
      badge: "📈 Investors"
    },
    {
      key: "developer-partnership-framework",
      label: "Developer Partnership Framework",
      icon: Handshake,
      description: "Structured collaboration model — tiered partnerships, lead pipeline, revenue model, and performance metrics",
      badge: "🤝 Partnerships"
    },
    {
      key: "founder-weekly-routine",
      label: "Founder Weekly Routine",
      icon: Calendar,
      description: "Structured weekly operating framework — time blocks, energy management, anti-burnout rituals",
      badge: "⏱️ Routine"
    },
    {
      key: "pr-launch-strategy",
      label: "PR Launch Strategy",
      icon: Newspaper,
      description: "4-phase PR roadmap — narrative angles, media targets, press release template, influencer amplification",
      badge: "📰 PR Plan"
    },
    {
      key: "investor-outreach",
      label: "Investor Outreach Plan",
      icon: Send,
      description: "12-week outreach cadence — investor targeting, channel strategy, call scripts, follow-up templates",
      badge: "📧 Outreach"
    },
    {
      key: "founder-daily-system",
      label: "Founder Daily System",
      icon: Clock,
      description: "Structured daily execution — 7 time blocks, 34 tasks, energy mapping, accountability rules",
      badge: "⚡ Daily"
    },
    {
      key: "hyper-execution-plan",
      label: "30-Day Hyper Execution",
      icon: Flame,
      description: "4-week launch sprint — day-by-day tasks, KPI targets, growth trajectory, success criteria",
      badge: "🔥 30-Day Sprint"
    },
    {
      key: "ninety-day-master-plan",
      label: "90-Day Master Execution",
      icon: Layers,
      description: "3-phase growth roadmap — 12 weeks, 65+ tasks, KPI targets, founder focus allocation",
      badge: "🎯 90-Day Plan"
    },
    {
      key: "uiux-redesign-blueprint",
      label: "UI/UX Redesign Blueprint",
      icon: Paintbrush,
      description: "Complete design system upgrade — homepage, cards, detail page, search, brand identity, conversion UX, mobile",
      badge: "🎨 Design System"
    },
    {
      key: "homepage-blueprint",
      label: "Homepage Layout Blueprint",
      icon: Layout,
      description: "Premium homepage design — 7 sections, search-dominant hero, AI highlights, trust band, conversion CTAs",
      badge: "🏠 Homepage"
    },
    {
      key: "ui-audit-report",
      label: "UI/UX Audit Report",
      icon: Eye,
      description: "Codebase-grounded design audit — 25 findings with code evidence, fixes, and prioritized action plan",
      badge: "🔍 Audit"
    },
    {
      key: "legal-setup-roadmap",
      label: "Legal Setup & Licensing",
      icon: Scale,
      description: "PT company structure, KBLI codes, NIB/PSE licensing, legal documents, and compliance roadmap for Indonesian proptech operations",
      badge: "⚖️ Legal"
    },
    {
      key: "financial-projection",
      label: "24-Month Financial Projection",
      icon: Calculator,
      description: "Revenue streams, cost structure, break-even analysis, and 3-scenario comparison for investor readiness",
      badge: "💰 Finance"
    },
    {
      key: "fundraising-exit-roadmap",
      label: "Fundraising & Exit Roadmap",
      icon: Rocket,
      description: "Staged capital raising milestones, signal metrics, cap table evolution, and long-term exit positioning",
      badge: "🚀 Strategy"
    },
    {
      key: "series-a-data-room",
      label: "Series-A Data Room",
      icon: Shield,
      description: "Investor-grade data room — liquidity dominance, revenue traction, network effects, AI moat & expansion model",
      badge: "🎯 Fundraising"
    },
    {
      key: "founder-brand-strategy",
      label: "Founder Brand Strategy",
      icon: User,
      description: "Personal brand positioning, content pillars, visibility channels, execution calendar, and authority KPIs",
      badge: "👤 Brand"
    },
    {
      key: "equity-allocation-framework",
      label: "Equity Allocation Framework",
      icon: PieChart,
      description: "Cap table structure, vesting schedules, ESOP planning, dilution waterfall, and governance matrix",
      badge: "📊 Equity"
    },
    {
      key: "investor-qa-prep",
      label: "Investor Q&A Preparation",
      icon: MessageSquare,
      description: "Due diligence question bank with answer focus areas, key data points, and pitfalls to avoid",
      badge: "🎯 Fundraise"
    },
    {
      key: "hiring-roadmap-10",
      label: "Hiring Roadmap",
      icon: Users,
      description: "First 10 key hires phased across foundation, acceleration, and scale stages",
      badge: "👥 Team"
    },
    {
      key: "customer-support-framework",
      label: "Customer Support Framework",
      icon: Headphones,
      description: "Multi-channel support strategy with SLAs, escalation, and knowledge base planning",
      badge: "🎧 Support"
    },
    {
      key: "marketplace-integrity",
      label: "Marketplace Integrity & QC",
      icon: ShieldCheck,
      description: "Listing verification, provider monitoring, transaction integrity, and dispute resolution",
      badge: "🛡️ Trust"
    },
    {
      key: "team-kpi-framework",
      label: "Team KPI Framework",
      icon: Target,
      description: "Weighted performance metrics for Engineering, AI, Marketplace, Growth, and Customer Success",
      badge: "📊 KPIs"
    },
    {
      key: "weekly-leadership-review",
      label: "Weekly Leadership Review",
      icon: CalendarClock,
      description: "Structured 75-min cadence for marketplace health, product progress, growth pipeline, and financial snapshot",
      badge: "📅 Cadence"
    },
    {
      key: "company-culture-principles",
      label: "Culture & Workflow Principles",
      icon: Heart,
      description: "Core values, execution philosophy, and operational workflow practices for the startup team",
      badge: "💡 Culture"
    },
    {
      key: "founder-daily-routine",
      label: "Founder Daily Routine",
      icon: Sunrise,
      description: "Energy-mapped daily execution routine — deep work, outreach, growth execution, and strategic reflection",
      badge: "🔥 Founder"
    },
    {
      key: "founder-mental-framework",
      label: "Founder Mental Framework",
      icon: Brain,
      description: "Decision principles, stress management practices, and crisis response mindset for startup leadership",
      badge: "🧠 Mindset"
    },
    {
      key: "three-year-roadmap",
      label: "3-Year Strategic Roadmap",
      icon: Map,
      description: "High-level milestones for product evolution, market expansion, and capital strategy across 3 years",
      badge: "🗺️ Roadmap"
    },
    {
      key: "founder-life-os",
      label: "Founder Life OS",
      icon: Orbit,
      description: "Holistic personal operating system — execution, strategic thinking, energy, and identity alignment",
      badge: "⚡ Life OS"
    },
    {
      key: "success-probability-framework",
      label: "Success Probability Framework",
      icon: Activity,
      description: "Weighted leverage factors that maximize market traction, investor confidence, and startup survival",
      badge: "📈 Probability"
    },
    {
      key: "risk-mitigation-strategy",
      label: "Risk Mitigation Strategy",
      icon: ShieldAlert,
      description: "Structured risk identification and preventive operational safeguards for startup survival",
      badge: "🛡️ Risk Ops"
    },
    {
      key: "ultimate-master-plan",
      label: "Ultimate Master Plan",
      icon: Crown,
      description: "Complete AI real estate intelligence platform blueprint — vision, phases, revenue, and execution system",
      badge: "👑 Blueprint"
    },
    {
      key: "ninety-day-roadmap",
      label: "90-Day Execution Roadmap",
      icon: CalendarClock,
      description: "Structured 90-day launch plan balancing product development, marketplace supply, and investor acquisition",
      badge: "🚀 90 Days"
    },
    {
      key: "daily-execution-plan",
      label: "8-Hour Execution Plan",
      icon: Clock,
      description: "Focused daily sprint — product improvement, marketplace supply, investor demand, strategy, and quality",
      badge: "⏱️ Daily"
    },
    {
      key: "vendor-monetization-pyramid",
      label: "Vendor Monetization Pyramid",
      icon: DollarSign,
      description: "5-level vendor revenue flywheel — from free acquisition to enterprise contracts",
      badge: "💰 Revenue"
    },
    {
      key: "institutional-saas-blueprint",
      label: "Institutional SaaS Blueprint",
      icon: Building2,
      description: "Bloomberg Terminal for real estate — 5 modules for family offices, funds, and pension capital",
      badge: "🏛️ Institutional"
    },
    {
      key: "revenue-scaling-blueprint",
      label: "Revenue Scaling Blueprint",
      icon: TrendingUp,
      description: "4-stage path from $0 to $100M ARR with revenue mix evolution",
      badge: "📈 Scaling"
    },
    {
      key: "monetization-pricing-blueprint",
      label: "Monetization Pricing",
      icon: Coins,
      description: "Complete investor, vendor, and transaction fee pricing architecture",
      badge: "💲 Pricing"
    },
    {
      key: "sprint-execution-roadmap",
      label: "Sprint Execution Roadmap",
      icon: Layers,
      description: "12-week engineering roadmap — 5 sprints, 22 deliverables from decision UI to institutional features",
      badge: "🏗️ Sprints"
    },
    {
      key: "marketplace-launch-playbook",
      label: "Marketplace Launch Playbook",
      icon: Rocket,
      description: "5-phase go-to-market — supply seeding to marketplace lock-in with network effects",
      badge: "🚀 GTM"
    },
    {
      key: "city-launch-playbook",
      label: "City Launch Playbook",
      icon: MapPin,
      description: "6-step repeatable blueprint to transform any city into a self-sustaining liquidity hub",
      badge: "🏙️ Expansion"
    },
    {
      key: "revenue-projection-model",
      label: "12-Month Revenue Projection",
      icon: Calculator,
      description: "Interactive financial model — Rp0 to Rp18B+ ARR across subscriptions, vendor SaaS, and transaction fees",
      badge: "📊 Finance"
    },
    {
      key: "investor-kpi-framework-page",
      label: "Investor KPI Framework",
      icon: Target,
      description: "24 institutional-grade metrics across liquidity, depth, revenue, network effects, and AI advantage",
      badge: "📋 KPIs"
    },
    {
      key: "vendor-acquisition-scripts",
      label: "Vendor Acquisition Scripts",
      icon: MessageSquare,
      description: "WhatsApp outreach and follow-up scripts with persuasion psychology breakdowns",
      badge: "💬 Scripts"
    },
    {
      key: "feature-impact-matrix",
      label: "Feature Impact Matrix",
      icon: Flame,
      description: "3-tier prioritization — high valuation impact features first, growth multipliers second, polish last",
      badge: "🔥 Priority"
    },
    {
      key: "launch-execution-kit",
      label: "Launch Execution Kit",
      icon: Rocket,
      description: "Unified launch command center — checklist, playbook links, milestones, and progress tracking",
      badge: "🚀 Kit"
    },
    {
      key: "cac-ltv-model",
      label: "CAC vs LTV Model",
      icon: BarChart3,
      description: "Dual-sided unit economics — investor 67× and vendor 38× LTV/CAC with channel breakdown",
      badge: "📊 Economics"
    },
    {
      key: "superapp-journey",
      label: "Super-App Journey",
      icon: Layers,
      description: "Unified user experience architecture — discovery, transaction, services, and investment lifecycle",
      badge: "🧭 UX"
    }
  ],

  help: [
    {
      key: "help-overview",
      label: "📊 Help Overview",
      icon: LayoutDashboard,
      description: "Category dashboard — overview of all help and documentation modules"
    },
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
  "execution-command": "Execution Command",
  "marketplace-growth": "Marketplace Growth",
  "market-intelligence": "Market Intelligence",
  monetization: "Monetization",
  operations: "Operations",
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
