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
  Key
} from "lucide-react";

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
}

const CompactAdminNavigation = ({ activeTab, onTabChange, isAdmin }: CompactAdminNavigationProps) => {
  const quickAccess: TabItem[] = [
    { id: "overview", label: "Overview & Analytics", icon: Activity },
    { id: "ai-assistant", label: "AI Assistant", icon: Activity, badge: "New" },
    { id: "diagnostic", label: "Diagnostic", icon: Wrench, badge: "New" },
    { id: "astra-token-hub", label: "ASTRA Hub", icon: Coins },
  ];

  const tabGroups: TabGroup[] = [
    {
      id: "management",
      label: "Management",
      icon: Users,
      items: [
        { id: "user-management", label: "Users", icon: Users },
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
        { id: "api-settings", label: "API Keys", icon: Key },
        { id: "bpjs-api-settings", label: "BPJS API", icon: Shield, badge: "New" },
        { id: "smtp-settings", label: "SMTP", icon: Mail },
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
    <div className="flex items-center gap-2 sm:gap-1 p-3 sm:p-2 hud-border border-b border-border min-h-14 sm:h-12 bg-gradient-to-r from-card/50 to-muted/30 overflow-x-auto">
      {/* Quick Access Tabs with smooth transitions */}
      <div className="flex items-center gap-2 sm:gap-1 mr-4 sm:mr-2 flex-shrink-0">
        {quickAccess.map((tab) => (
          <Button
            key={tab.id}
            variant={isTabActive(tab.id) ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={`relative h-8 sm:h-7 px-3 sm:px-2 text-sm sm:text-xs font-medium touch-manipulation flex-shrink-0 transition-all duration-300 ease-in-out transform hover:scale-105 ${
              isTabActive(tab.id) 
                ? 'bg-primary/20 text-primary shadow-lg border-primary/30' 
                : 'hover:bg-muted/80 hover:text-foreground'
            }`}
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
                className={`h-8 sm:h-7 px-3 sm:px-2 text-sm sm:text-xs font-medium touch-manipulation flex-shrink-0 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  group.items.some(item => isTabActive(item.id))
                    ? 'bg-primary/20 text-primary shadow-lg border-primary/30'
                    : 'hud-border bg-gradient-to-r from-primary/10 to-accent/10 hover:bg-muted/80'
                }`}
              >
                <group.icon className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                <span className="hidden md:inline">{group.label}</span>
                <span className="md:hidden text-xs">{group.label.slice(0, 3)}</span>
                <ChevronDown className="h-4 w-4 sm:h-3 sm:w-3 ml-2 sm:ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 sm:w-48 hud-border border shadow-lg z-50 bg-card/95 backdrop-blur-sm">
              <DropdownMenuLabel className="text-sm sm:text-xs font-semibold text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {group.items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 sm:px-3 py-3 sm:py-2 text-sm sm:text-xs cursor-pointer transition-colors touch-manipulation ${
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