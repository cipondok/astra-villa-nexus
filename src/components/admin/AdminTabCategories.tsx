
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
} from "lucide-react";

export const tabCategories = {
  admin: {
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
  support: {
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
};
