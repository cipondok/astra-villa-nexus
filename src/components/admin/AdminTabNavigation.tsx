
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  BarChart3, 
  Building, 
  Settings, 
  Users, 
  Shield, 
  FileText, 
  MessageSquare,
  Wrench,
  Database,
  Globe,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  Star,
  Headphones,
  Paintbrush,
  CreditCard,
  AlertTriangle
} from "lucide-react";

interface AdminTabNavigationProps {
  isAdmin: boolean;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  category: string;
  badge?: string;
  badgeType?: 'new' | 'updating' | 'beta';
  addedDate?: string; // ISO date string
  updatedDate?: string; // ISO date string
}

const AdminTabNavigation = ({ isAdmin }: AdminTabNavigationProps) => {
  // Helper function to check if badge should be shown (within 1 month)
  const shouldShowBadge = (tab: TabItem): string | null => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Check if added within last month
    if (tab.addedDate) {
      const addedDate = new Date(tab.addedDate);
      if (addedDate > oneMonthAgo) {
        return "New";
      }
    }
    
    // Check if updated within last month
    if (tab.updatedDate) {
      const updatedDate = new Date(tab.updatedDate);
      if (updatedDate > oneMonthAgo) {
        return "Updated";
      }
    }
    
    // Return existing badge if no date-based logic applies
    return tab.badge || null;
  };

  // Get badge color based on type
  const getBadgeColor = (badgeText: string, badgeType?: string) => {
    switch (badgeText) {
      case "New":
        return "bg-green-500 text-white dark:bg-green-600";
      case "Updated":
        return "bg-blue-500 text-white dark:bg-blue-600";
      case "Beta":
        return "bg-purple-500 text-white dark:bg-purple-600";
      default:
        return "bg-orange-500 text-white dark:bg-orange-600";
    }
  };
  const adminTabs: TabItem[] = [
    { 
      id: "overview", 
      label: "Overview", 
      icon: Activity, 
      category: "dashboard" 
    },
    { 
      id: "diagnostic", 
      label: "Diagnostic", 
      icon: Wrench, 
      category: "dashboard",
      badge: "New"
    },
    { 
      id: "astra-token", 
      label: "ASTRA Token", 
      icon: Crown, 
      category: "analytics" 
    },
    { 
      id: "astra-token-settings", 
      label: "ASTRA Settings", 
      icon: Zap, 
      category: "settings" 
    },
    { 
      id: "tools-management", 
      label: "Tools", 
      icon: Settings, 
      category: "management" 
    },
    { 
      id: "seo-settings", 
      label: "SEO", 
      icon: Globe, 
      category: "settings" 
    },
    { 
      id: "website-design", 
      label: "Design", 
      icon: Paintbrush, 
      category: "settings",
      badge: "New"
    },
    { 
      id: "user-management", 
      label: "Users", 
      icon: Users, 
      category: "management" 
    },
    { 
      id: "property-management-hub", 
      label: "Properties", 
      icon: Building, 
      category: "management"
    },
    { 
      id: "customer-service", 
      label: "Support", 
      icon: Headphones, 
      category: "service" 
    },
    { 
      id: "contact-management", 
      label: "Contacts", 
      icon: MessageSquare, 
      category: "service" 
    },
    { 
      id: "chat-management", 
      label: "Chats", 
      icon: MessageSquare, 
      category: "service" 
    },
    { 
      id: "vendor-management-hub", 
      label: "Vendors", 
      icon: Users, 
      category: "vendor" 
    },
    { 
      id: "vendor-service-management", 
      label: "Services", 
      icon: Star, 
      category: "vendor" 
    },
    { 
      id: "vendor-category-management", 
      label: "Categories", 
      icon: FileText, 
      category: "vendor" 
    },
    { 
      id: "kyc-management", 
      label: "KYC", 
      icon: Shield, 
      category: "compliance" 
    },
    { 
      id: "membership-management", 
      label: "Membership", 
      icon: Crown, 
      category: "management" 
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      icon: BarChart3, 
      category: "analytics" 
    },
    { 
      id: "ai-bot-management", 
      label: "AI Bot", 
      icon: Zap, 
      category: "ai" 
    },
    { 
      id: "feedback-management", 
      label: "Feedback", 
      icon: MessageSquare, 
      category: "service" 
    },
    { 
      id: "daily-checkin", 
      label: "Check-in", 
      icon: Calendar, 
      category: "management" 
    },
    { 
      id: "database-errors", 
      label: "DB Errors", 
      icon: AlertTriangle, 
      category: "technical" 
    },
    { 
      id: "content-management", 
      label: "Content", 
      icon: FileText, 
      category: "management" 
    },
    { 
      id: "search-filters", 
      label: "Filters", 
      icon: Settings, 
      category: "settings" 
    },
    { 
      id: "system-settings", 
      label: "System", 
      icon: Settings, 
      category: "settings" 
    },
    { 
      id: "billing-management", 
      label: "Billing", 
      icon: TrendingUp, 
      category: "finance" 
    },
    { 
      id: "indonesian-payment-config", 
      label: "ID Payment", 
      icon: CreditCard, 
      category: "finance",
      addedDate: new Date().toISOString() // Just added today
    },
    { 
      id: "database-management", 
      label: "Database", 
      icon: Database, 
      category: "technical" 
    },
    { 
      id: "security-monitoring", 
      label: "Security", 
      icon: Shield, 
      category: "technical" 
    },
    { 
      id: "system-reports", 
      label: "Reports", 
      icon: FileText, 
      category: "analytics" 
    },
    { 
      id: "vendor-agent-control", 
      label: "V&A Control", 
      icon: Users, 
      category: "management",
      badge: "New"
    },
    { 
      id: "authorization-monitoring", 
      label: "Auth Monitor", 
      icon: Shield, 
      category: "security",
      badge: "New"
    },
    { 
      id: "admin-alerts", 
      label: "Alerts", 
      icon: AlertTriangle, 
      category: "monitoring",
      badge: "New"
    },
    { 
      id: "customer-service-control", 
      label: "CS Control", 
      icon: Headphones, 
      category: "service",
      badge: "New"
    }
  ];

  const nonAdminTabs: TabItem[] = [
    { 
      id: "overview", 
      label: "Overview", 
      icon: Activity, 
      category: "dashboard" 
    },
    { 
      id: "support", 
      label: "Support", 
      icon: Headphones, 
      category: "service" 
    }
  ];

  const tabs = isAdmin ? adminTabs : nonAdminTabs;

  return (
    <div className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1 h-auto p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex flex-col items-center gap-1 p-3 text-xs font-medium rounded-lg transition-all duration-300 
              text-gray-700 dark:text-gray-300 
              hover:bg-white dark:hover:bg-gray-600 
              hover:text-gray-900 dark:hover:text-white 
              hover:shadow-md 
              data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-500 
              data-[state=active]:text-white dark:data-[state=active]:text-white 
              data-[state=active]:shadow-lg 
              data-[state=active]:scale-105 
              border border-transparent 
              hover:border-gray-200 dark:hover:border-gray-500 
              data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400
              relative"
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:block font-semibold">{tab.label}</span>
            {shouldShowBadge(tab) && (
              <Badge 
                variant="default"
                className={`absolute -top-1 -right-1 text-xs px-1 py-0 h-4 min-w-4 ${
                  getBadgeColor(shouldShowBadge(tab)!, tab.badgeType)
                }`}
              >
                {shouldShowBadge(tab)}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default AdminTabNavigation;
