import {
  BarChart3,
  Building2,
  Calendar,
  Coins,
  HelpCircle,
  MessageSquare,
  Settings,
  ShieldAlert,
  User,
  Users,
  LayoutDashboard,
  Search,
} from "lucide-react";

export const tabCategories = [
  {
    id: "core",
    label: "Core Management", 
    icon: LayoutDashboard,
    description: "Essential system management",
    tabs: [
      { 
        id: "overview", 
        label: "Overview", 
        icon: LayoutDashboard,
        description: "System dashboard and quick actions",
        isImplemented: true
      },
      { 
        id: "tools-management", 
        label: "Tools Management", 
        icon: Settings,
        description: "Enable/disable and monitor system tools",
        isImplemented: true,
        badge: "NEW"
      },
      { 
        id: "seo-settings", 
        label: "SEO Settings", 
        icon: Search,
        description: "Search engine optimization",
        isImplemented: true,
        badge: "NEW"
      },
      { 
        id: "user-management", 
        label: "User Management", 
        icon: Users,
        description: "Manage users and permissions",
        isImplemented: true
      },
      { 
        id: "property-management", 
        label: "Property Management", 
        icon: Building2,
        description: "Property listings and approvals",
        isImplemented: true
      }
    ]
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      {
        value: "overview",
        label: "Overview",
        icon: BarChart3,
        component: null,
        adminOnly: false
      },
      {
        value: "astra-tokens", 
        label: "ASTRA Tokens",
        icon: Coins,
        component: null,
        adminOnly: true
      },
      {
        value: "users",
        label: "Users",
        icon: Users,
        component: null,
        adminOnly: false
      },
      {
        value: "properties",
        label: "Properties",
        icon: Building2,
        component: null,
        adminOnly: false
      },
      {
        value: "system",
        label: "System",
        icon: Settings,
        component: null,
        adminOnly: true
      },
      {
        value: "alerts",
        label: "Alerts",
        icon: ShieldAlert,
        component: null,
        adminOnly: false
      },
    ]
  },
  {
    id: "support",
    label: "Support",
    items: [
      {
        value: "support",
        label: "Support Tickets",
        icon: MessageSquare,
        component: null,
        adminOnly: false
      },
      {
        value: "knowledge",
        label: "Knowledge Base",
        icon: HelpCircle,
        component: null,
        adminOnly: false
      },
      {
        value: "users",
        label: "Users",
        icon: User,
        component: null,
        adminOnly: false
      },
      {
        value: "calendar",
        label: "Calendar",
        icon: Calendar,
        component: null,
        adminOnly: false
      },
    ]
  }
];
