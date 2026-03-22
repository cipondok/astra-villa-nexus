
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
  Hourglass
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
