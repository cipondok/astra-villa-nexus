
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
  Paintbrush
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
}

const AdminTabNavigation = ({ isAdmin }: AdminTabNavigationProps) => {
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
      id: "error-management", 
      label: "Errors", 
      icon: Shield, 
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
            {tab.badge && (
              <Badge 
                variant={tab.badge === "New" ? "default" : "secondary"} 
                className={`absolute -top-1 -right-1 text-xs px-1 py-0 h-4 min-w-4 ${
                  tab.badge === "New" 
                    ? "bg-green-500 text-white dark:bg-green-600" 
                    : "bg-orange-500 text-white dark:bg-orange-600"
                }`}
              >
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default AdminTabNavigation;
