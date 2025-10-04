
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
  Mail,
  Activity,
  Download,
  ArrowLeftRight,
  Search,
  HelpCircle,
  Bell
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
  "astra-token", 
  "tools",
  "core-management",
  "customer-service", 
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
      key: "user-auth-mfa",
      label: "User Management & Authentication",
      icon: Shield,
      description: "MFA settings, email verification, and user authentication management"
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
    },
    {
      key: "property-survey-management",
      label: "Property Survey Booking",
      icon: Calendar,
      description: "Manage property viewing and survey appointments"
    },
    {
      key: "notifications-center",
      label: "Notifications Center",
      icon: Bell,
      description: "View and manage all system notifications and alerts"
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

  "vendor-management": [
    {
      key: "vendors-hub",
      label: "Vendors Hub",
      icon: ShoppingBag,
      description: "Comprehensive vendor management platform with all vendor-related functionality including services, categories, KYC, analytics, and control panel"
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
    }
  ],

  "analytics-monitoring": [
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
      key: "database-errors",
      label: "Database Errors",
      icon: AlertTriangle,
      description: "Monitor and fix database errors automatically"
    },
    {
      key: "error-logs",
      label: "Error Logs",
      icon: AlertTriangle,
      description: "Monitor 404 errors and other page errors with IP tracking"
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
      icon: Activity,
      description: "Monitor app performance, cache usage, and optimizations"
    },
    {
      key: "system-reports",
      label: "System Reports",
      icon: FileText,
      description: "Generate system reports and logs"
    },
    {
      key: "report-export",
      label: "Report Export",
      icon: Download,
      description: "Export and download comprehensive reports"
    }
  ],

  features: [
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
    }
  ],

  help: [
    {
      key: "admin-guide",
      label: "Admin Guide & Documentation",
      icon: HelpCircle,
      description: "Complete admin panel user guide and feature documentation",
      badge: "New"
    }
  ]
};

export const sectionCategories = navigationSections;

export const sectionTitles = {
  overview: "Dashboard",
  "astra-token": "ASTRA Token",
  tools: "Tools & Management",
  "core-management": "Core Management",
  "customer-service": "Customer Service",
  "vendor-management": "Vendor Management", 
  "analytics-monitoring": "Analytics & Monitoring",
  "content-settings": "Content & Settings",
  "system-settings": "System Settings",
  technical: "Technical",
  features: "Feature Enhancements",
  help: "Help & Documentation"
};
