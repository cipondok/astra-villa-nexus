import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  MapPin,
  Key,
  Brain,
  Cookie
} from "lucide-react";
import { navigationSections } from "./navigationSections";

interface CompactAdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
}

interface TabGroup {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  items: TabItem[];
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
}

const CompactAdminNavigation = ({ activeTab, onTabChange, isAdmin }: CompactAdminNavigationProps) => {
  const quickAccess: TabItem[] = [
    { id: "overview", label: "Overview", icon: Activity, description: "Main dashboard overview and quick stats" },
    { id: "ai-assistant", label: "AI Assistant", icon: Activity, badge: "New", description: "AI-powered admin assistant" },
    { id: "algorithm-dashboard", label: "Algorithm", icon: Brain, badge: "New", description: "AI algorithm monitoring and analytics" },
    { id: "diagnostic", label: "Diagnostic", icon: Wrench, badge: "New", description: "System diagnostics and testing" },
    { id: "astra-token-hub", label: "ASTRA Hub", icon: Coins, description: "ASTRA token management and analytics" },
  ];

  // Get description from navigationSections
  const getItemDescription = (itemId: string) => {
    for (const category of Object.values(navigationSections)) {
      const found = category.find((section: any) => section.key === itemId);
      if (found) return found.description;
    }
    return `Manage ${itemId.replace(/[-_]/g, ' ')}`;
  };

  const tabGroups: TabGroup[] = [
    {
      id: "management",
      label: "Management",
      icon: Users,
      items: [
        { id: "user-management", label: "Users", icon: Users },
        { id: "user-auth-mfa", label: "User Auth & MFA", icon: Shield, badge: "New" },
        { id: "property-management-hub", label: "Properties", icon: Building },
        { id: "vendors-hub", label: "Vendors", icon: ShoppingBag },
        { id: "admin-kyc-review", label: "KYC Review", icon: Shield, badge: "New" },
        { id: "location-management", label: "Locations", icon: MapPin },
        { id: "tools-management", label: "Tools", icon: Settings },
      ]
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      items: [
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "system-reports", label: "Reports", icon: FileText },
        { id: "daily-checkin", label: "Check-in", icon: Calendar },
      ]
    },
    {
      id: "service",
      label: "Service",
      icon: Headphones,
      items: [
        { id: "customer-service", label: "Support", icon: Headphones },
        { id: "contact-management", label: "Contacts", icon: MessageSquare },
        { id: "chat-management", label: "Chats", icon: MessageSquare },
        { id: "feedback-management", label: "Feedback", icon: MessageSquare },
      ]
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      items: [
        { id: "system-settings", label: "System", icon: Settings },
        { id: "cookie-settings", label: "Cookie Consent", icon: Cookie, badge: "New" },
        { id: "api-settings", label: "API Keys", icon: Key },
        { id: "bpjs-api-settings", label: "BPJS API", icon: Shield, badge: "New" },
        { id: "smtp-settings", label: "Email Settings", icon: Mail, badge: "Updated" },
        { id: "seo-settings", label: "SEO", icon: Globe },
        { id: "booking-payment-settings", label: "Booking & Payments", icon: CreditCard, badge: "New" },
        { id: "property-3d-settings", label: "3D View", icon: Blocks, badge: "New" },
        { id: "website-design", label: "Design", icon: Paintbrush, badge: "New" },
      ]
    },
    {
      id: "technical",
      label: "Technical",
      icon: Database,
      items: [
        { id: "database-management", label: "Database", icon: Database },
        { id: "database-errors", label: "DB Errors", icon: AlertTriangle },
        { id: "security-monitoring", label: "Security", icon: Shield },
        { id: "indonesian-payment-config", label: "ID Payment", icon: CreditCard },
      ]
    }
  ];

  const getCurrentGroupLabel = () => {
    for (const group of tabGroups) {
      if (group.items.some(item => item.id === activeTab)) {
        return group.label;
      }
    }
    return "Management";
  };

  const isTabActive = (tabId: string) => activeTab === tabId;

  return (
    <div className="flex items-center gap-2 sm:gap-1 p-3 sm:p-2 border-b border-border min-h-14 sm:h-12 bg-card/50 overflow-x-auto">
      {/* Quick Access Tabs */}
      <div className="flex items-center gap-2 sm:gap-1 mr-4 sm:mr-2 flex-shrink-0">
        {quickAccess.map((tab) => (
          <Button
            key={tab.id}
            variant={isTabActive(tab.id) ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            title={tab.description} // Simple tooltip using title attribute
            className="relative h-8 sm:h-7 px-3 sm:px-2 text-sm sm:text-xs font-medium touch-manipulation flex-shrink-0 hover:scale-105 transition-transform"
          >
            <tab.icon className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {tab.badge && (
              <Badge 
                variant="secondary"
                className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 min-w-4 bg-green-600/10 text-green-600 border-green-600/20"
              >
                {tab.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Grouped Dropdowns */}
      <div className="flex items-center gap-2 sm:gap-1 flex-1 overflow-x-auto">
        {tabGroups.map((group) => (
          <DropdownMenu key={group.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={group.items.some(item => isTabActive(item.id)) ? "default" : "ghost"}
                size="sm"
                title={`${group.label} - Click to see all options`} // Simple tooltip
                className="h-8 sm:h-7 px-3 sm:px-2 text-sm sm:text-xs font-medium touch-manipulation flex-shrink-0 hover:scale-105 transition-transform"
              >
                <group.icon className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                <span className="hidden md:inline">{group.label}</span>
                <span className="md:hidden text-xs">{group.label.slice(0, 3)}</span>
                <ChevronDown className="h-4 w-4 sm:h-3 sm:w-3 ml-2 sm:ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 sm:w-48 border shadow-lg z-50 bg-card/95 backdrop-blur-sm">
              <DropdownMenuLabel className="text-sm sm:text-xs font-semibold text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {group.items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={getItemDescription(item.id)} // Simple tooltip
                  className={`flex items-center gap-2 px-4 sm:px-3 py-3 sm:py-2 text-sm sm:text-xs cursor-pointer transition-colors touch-manipulation hover:scale-[1.02] ${
                    isTabActive(item.id) 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary"
                      className="text-xs px-1 py-0 h-4 bg-green-600/10 text-green-600 border-green-600/20"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
};

export default CompactAdminNavigation;