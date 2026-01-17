
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
  AlertTriangle,
  Blocks,
  Mail,
  ShoppingBag,
  Coins,
  Brain
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
  badgeType?: 'new' | 'updating' | 'beta' | 'critical';
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

  const getBadgeColor = (badgeText: string, badgeType?: string) => {
    // badgeType first for specific styling
    if (badgeType === "critical") {
      return "bg-destructive/15 text-destructive border-destructive/30 animate-pulse";
    }

    switch (badgeText) {
      case "New":
        return "bg-accent/15 text-accent-foreground border-accent/30";
      case "Updated":
        return "bg-primary/10 text-primary border-primary/20";
      case "Beta":
        return "bg-secondary/15 text-secondary-foreground border-secondary/30";
      default:
        return "bg-muted/40 text-muted-foreground border-border/40";
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
      updatedDate: new Date().toISOString()
    },
    { 
      id: "project-progress", 
      label: "Project Progress", 
      icon: TrendingUp, 
      category: "dashboard",
      addedDate: new Date().toISOString()
    },
    { 
      id: "algorithm-dashboard", 
      label: "Algorithms", 
      icon: Brain, 
      category: "analytics",
      addedDate: new Date().toISOString()
    },
    { 
      id: "astra-token-hub", 
      label: "ASTRA Hub", 
      icon: Coins, 
      category: "analytics" 
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
      id: "property-3d-settings", 
      label: "3D View", 
      icon: Blocks, 
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
      id: "vendors-hub", 
      label: "Vendors Hub", 
      icon: ShoppingBag, 
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
      id: "error-logs", 
      label: "🚨 Error Logs", 
      icon: AlertTriangle, 
      category: "technical",
      badge: "404 & System Errors",
      badgeType: "critical",
      addedDate: new Date().toISOString()
    },
    { 
      id: "database-errors", 
      label: "DB Manager", 
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
      id: "smtp-settings", 
      label: "SMTP", 
      icon: Mail, 
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
    },
    { 
      id: "admin-guide", 
      label: "Admin Guide", 
      icon: Star, 
      category: "help",
      addedDate: new Date().toISOString()
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
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1 h-auto p-2 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl shadow-lg border">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex flex-col items-center gap-1 p-3 text-xs font-medium rounded-lg transition-all duration-300 
              text-muted-foreground 
              hover:bg-card 
              hover:text-foreground 
              hover:shadow-md 
              data-[state=active]:bg-primary 
              data-[state=active]:text-primary-foreground 
              data-[state=active]:shadow-lg 
              data-[state=active]:scale-105 
              border border-transparent 
              hover:border-border 
              data-[state=active]:border-primary
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
