
import {
  BarChart3,
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Palette,
  Settings,
  Shield,
  ShoppingBag,
  User,
  UserPlus,
  Users,
} from "lucide-react";

export interface NavigationSection {
  id: string;
  title: string;
  description: string;
  component: string;
  icon: any;
  badge?: string;
  label?: string;
}

export const adminNavigationSections = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "LayoutDashboard",
    description: "Analytics and overview",
    items: [
      {
        id: "analytics",
        title: "Analytics Dashboard",
        description: "Overview of system performance",
        component: "AnalyticsDashboard",
        icon: "BarChart3",
      },
      {
        id: "alerts",
        title: "Alert Monitoring",
        description: "Real-time system alerts",
        component: "AlertMonitoring",
        icon: "Shield",
      },
    ],
  },
  {
    id: "users",
    title: "Users",
    icon: "Users",
    description: "Manage user accounts",
    items: [
      {
        id: "user-management",
        title: "User Management",
        description: "View, edit, and manage user accounts",
        component: "UserManagement",
        icon: "User",
      },
      {
        id: "roles-permissions",
        title: "Roles & Permissions",
        description: "Configure user roles and permissions",
        component: "RolesPermissions",
        icon: "ListChecks",
      },
      {
        id: "registration",
        title: "User Registration",
        description: "Add new user accounts",
        component: "UserRegistration",
        icon: "UserPlus",
      },
    ],
  },
  {
    id: "properties",
    title: "Properties",
    icon: "Building2",
    description: "Manage property listings",
    items: [
      {
        id: "property-management",
        title: "Property Management",
        description: "View, edit, and manage property listings",
        component: "PropertyManagement",
        icon: "Building2",
      },
      {
        id: "property-submission",
        title: "Property Submission",
        description: "Add new property listings",
        component: "PropertySubmission",
        icon: "FileText",
      },
      {
        id: "bookings-calendar",
        title: "Bookings Calendar",
        description: "View and manage property bookings",
        component: "BookingsCalendar",
        icon: "Calendar",
      },
    ],
  },
  {
    id: "customization",
    title: "Customization",
    icon: "Palette",
    description: "UI and branding customization",
    items: [
      {
        id: "web-settings",
        title: "Web Settings",
        description: "Global website settings",
        component: "WebSettingsControl",
        icon: "Settings",
      },
      {
        id: "loading-customization",
        title: "Loading Screens",
        description: "Customize loading animations and branding",
        component: "LoadingCustomization",
        icon: "Loader2",
      },
      {
        id: "theme-settings",
        title: "Theme Settings",
        description: "Colors, fonts, and UI themes",
        component: "ThemeSettings",
        icon: "Palette",
      },
    ],
  },
  {
    id: "system",
    title: "System",
    icon: "Settings",
    description: "System settings and configuration",
    items: [
      {
        id: "system-settings",
        title: "System Settings",
        description: "Configure system-wide settings",
        component: "SystemSettings",
        icon: "Settings",
      },
      {
        id: "backup-restore",
        title: "Backup & Restore",
        description: "Backup and restore system data",
        component: "BackupRestore",
        icon: "Shield",
      },
      {
        id: "logs",
        title: "System Logs",
        description: "View system logs and activity",
        component: "SystemLogs",
        icon: "FileText",
      },
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    icon: "ShoppingBag",
    description: "Manage e-commerce settings",
    items: [
      {
        id: "product-management",
        title: "Product Management",
        description: "Manage products and categories",
        component: "ProductManagement",
        icon: "ShoppingBag",
      },
      {
        id: "orders",
        title: "Orders",
        description: "View and manage customer orders",
        component: "Orders",
        icon: "ListChecks",
      },
      {
        id: "payments",
        title: "Payments",
        description: "Configure payment gateways",
        component: "Payments",
        icon: "Shield",
      },
    ],
  },
];

// Extract categories for navigation
export const categories = adminNavigationSections.map(section => section.id);

// Create section categories mapping
export const sectionCategories = adminNavigationSections.reduce((acc, section) => {
  acc[section.id] = section.items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: eval(item.icon), // Convert string to actual icon component
    component: item.component
  }));
  return acc;
}, {} as Record<string, NavigationSection[]>);
