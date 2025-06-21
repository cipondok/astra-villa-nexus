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
  admin: [
    {
      value: "overview",
      label: "Overview",
      icon: "BarChart3",
      description: "System overview and quick stats"
    },
    {
      value: "astra-tokens", 
      label: "ASTRA Tokens",
      icon: "coins",
      description: "Manage ASTRA token system and settings"
    },
    {
      value: "users",
      label: "Users",
      icon: "Users",
      description: "Manage user accounts and roles"
    },
    {
      value: "properties",
      label: "Properties",
      icon: "Building2",
      description: "Manage property listings and details"
    },
    {
      value: "system",
      label: "System",
      icon: "Settings",
      description: "Configure system settings and integrations"
    },
    {
      value: "alerts",
      label: "Alerts",
      icon: "ShieldAlert",
      description: "View system alerts and notifications"
    },
  ],
  support: [
    {
      value: "support",
      label: "Support Tickets",
      icon: "MessageSquare",
      description: "Manage and respond to user support requests"
    },
    {
      value: "knowledge",
      label: "Knowledge Base",
      icon: "HelpCircle",
      description: "Access the knowledge base and help resources"
    },
    {
      value: "users",
      label: "Users",
      icon: "User",
      description: "View and manage user accounts"
    },
    {
      value: "calendar",
      label: "Calendar",
      icon: "Calendar",
      description: "View scheduled events and appointments"
    },
  ]
};
