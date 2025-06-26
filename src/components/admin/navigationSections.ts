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
  LucideIcon
} from "lucide-react";

export const categories = [
  "overview",
  "astra-token", 
  "tools",
  "core-management",
  "customer-service", 
  "ai-vendor-management",
  "analytics-monitoring",
  "content-settings",
  "system-settings",
  "technical"
];

export const navigationSections = {
  overview: [
    { 
      key: "overview", 
      label: "Dashboard Overview", 
      icon: Home,
      description: "Main dashboard overview and quick stats"
    }
  ],

  "astra-token": [
    {
      key: "astra-token",
      label: "ASTRA Token Analytics",
      icon: Coins,
      description: "Monitor ASTRA token usage and transactions"
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
      key: "seo-settings",
      label: "SEO Settings",
      icon: Globe,
      description: "Configure SEO settings for the website"
    }
  ],

  "core-management": [
    {
      key: "user-management",
      label: "User Management",
      icon: Users,
      description: "Manage user accounts and roles"
    },
    {
      key: "property-management",
      label: "Property Management",
      icon: Building,
      description: "Manage property listings and details"
    },
    {
      key: "property-management-hub",
      label: "Property Management Hub",
      icon: LayoutDashboard,
      description: "Centralized property management dashboard"
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
    }
  ],

  "ai-vendor-management": [
    {
      key: "ai-vendor-management",
      label: "AI Vendor Management",
      icon: ShoppingBag,
      description: "Manage AI and vendor integrations"
    },
    {
      key: "vendor-management",
      label: "Vendor Management",
      icon: Users,
      description: "Manage vendor accounts and services"
    },
    {
      key: "vendor-service-categories",
      label: "Vendor Service Categories",
      icon: ListChecks,
      description: "Manage categories for vendor services"
    },
    {
      key: "vendor-services",
      label: "Vendor Services",
      icon: ShoppingBag,
      description: "Manage individual vendor services"
    }
  ],

  "analytics-monitoring": [
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
    }
  ],

  "content-settings": [
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
      key: "billing-management",
      label: "Billing Management",
      icon: ShoppingBag,
      description: "Manage billing and subscription settings"
    }
  ],

  technical: [
    {
      key: "database-management",
      label: "Database Management",
      icon: Database,
      description: "Manage database tables and entries"
    },
    {
      key: "security-monitoring",
      label: "Security Monitoring",
      icon: Shield,
      description: "Monitor system security and threats"
    },
    {
      key: "system-reports",
      label: "System Reports",
      icon: FileText,
      description: "Generate system reports and logs"
    }
  ]
};

export const sectionTitles = {
  overview: "Dashboard",
  "astra-token": "ASTRA Token",
  tools: "Tools & Management",
  "core-management": "Core Management",
  "customer-service": "Customer Service",
  "ai-vendor-management": "AI & Vendor Management", 
  "analytics-monitoring": "Analytics & Monitoring",
  "content-settings": "Content & Settings",
  "system-settings": "System Settings",
  technical: "Technical"
};
