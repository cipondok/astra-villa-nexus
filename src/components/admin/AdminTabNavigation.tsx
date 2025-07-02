
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
  Headphones
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
      id: "user-management", 
      label: "Users", 
      icon: Users, 
      category: "management" 
    },
    { 
      id: "property-management", 
      label: "Properties", 
      icon: Building, 
      category: "management" 
    },
    { 
      id: "property-management-hub", 
      label: "Property Hub", 
      icon: Building, 
      category: "management",
      badge: "Updated"
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
      id: "ai-vendor-management", 
      label: "AI Vendors", 
      icon: Zap, 
      category: "vendor" 
    },
    { 
      id: "vendor-management", 
      label: "Vendors", 
      icon: Users, 
      category: "vendor" 
    },
    { 
      id: "vendor-service-categories", 
      label: "Categories", 
      icon: Settings, 
      category: "vendor" 
    },
    { 
      id: "vendor-services", 
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
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1 h-auto p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex flex-col items-center gap-1 p-2 text-xs font-medium rounded-md transition-all duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:block">{tab.label}</span>
            {tab.badge && (
              <Badge 
                variant={tab.badge === "New" ? "default" : "secondary"} 
                className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 min-w-4"
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
