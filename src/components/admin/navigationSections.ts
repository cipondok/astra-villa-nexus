
import { 
  BarChart3, 
  Users, 
  Building2, 
  Settings, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  Database,
  FileText,
  Briefcase,
  UserCheck,
  Search,
  Wrench
} from "lucide-react";

export const navigationSections = {
  "Core Management": [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard overview and analytics"
    },
    {
      id: "user-management", 
      label: "User Management",
      icon: Users,
      description: "Manage users, roles and permissions"
    },
    {
      id: "property-management-hub",
      label: "Property Management",
      icon: Building2,
      description: "Complete property management system"
    }
  ],
  "Customer Service": [
    {
      id: "customer-service",
      label: "Support Tickets",
      icon: MessageSquare,
      description: "Customer service and support"
    },
    {
      id: "contact-management",
      label: "Contact Management", 
      icon: UserCheck,
      description: "Manage customer contacts"
    }
  ],
  "AI & Vendor Management": [
    {
      id: "ai-vendor-management",
      label: "Vendor Hub",
      icon: Briefcase,
      description: "Comprehensive vendor management"
    },
    {
      id: "vendor-management",
      label: "Vendor Directory",
      icon: Users,
      description: "Manage vendor profiles"
    },
    {
      id: "vendor-service-categories",
      label: "Service Categories",
      icon: Settings,
      description: "Manage service categories"
    },
    {
      id: "vendor-services",
      label: "Vendor Services",
      icon: Wrench,
      description: "Manage vendor services"
    },
    {
      id: "kyc-management",
      label: "KYC Management",
      icon: Shield,
      description: "Know Your Customer verification"
    },
    {
      id: "membership-management",
      label: "Membership Plans",
      icon: UserCheck,
      description: "Manage membership levels"
    }
  ],
  "Analytics & Monitoring": [
    {
      id: "analytics",
      label: "Web Analytics",
      icon: BarChart3,
      description: "Website traffic and analytics"
    },
    {
      id: "ai-bot-management",
      label: "AI Bot Management",
      icon: MessageSquare,
      description: "Manage AI chatbot settings"
    },
    {
      id: "feedback-management",
      label: "Feedback Management",
      icon: TrendingUp,
      description: "User feedback and reviews"
    },
    {
      id: "daily-checkin",
      label: "Daily Check-in",
      icon: UserCheck,
      description: "Daily user activity tracking"
    }
  ],
  "Content & Settings": [
    {
      id: "content-management",
      label: "Content Management",
      icon: FileText,
      description: "Manage website content"
    },
    {
      id: "search-filters",
      label: "Search Filters",
      icon: Search,
      description: "Configure search filters"
    }
  ],
  "System Settings": [
    {
      id: "tools-management",
      label: "Tools Management",
      icon: Wrench,
      description: "Manage system tools"
    },
    {
      id: "seo-settings",
      label: "SEO Settings",
      icon: TrendingUp,
      description: "Search engine optimization"
    },
    {
      id: "system-settings",
      label: "System Settings",
      icon: Settings,
      description: "Core system configuration"
    },
    {
      id: "billing-management",
      label: "Billing Management",
      icon: Database,
      description: "Manage billing and subscriptions"
    }
  ],
  "Technical": [
    {
      id: "database-management",
      label: "Database Management",
      icon: Database,
      description: "Database administration"
    },
    {
      id: "security-monitoring",
      label: "Security Monitoring",
      icon: Shield,
      description: "Security alerts and monitoring"
    },
    {
      id: "system-reports",
      label: "System Reports",
      icon: BarChart3,
      description: "Generate system reports"
    }
  ]
};

export const categories = Object.keys(navigationSections);
