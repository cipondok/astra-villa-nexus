
import { lazy } from "react";
import { 
  BarChart3, 
  Users, 
  Building2, 
  MessageSquare, 
  Settings, 
  Shield,
  Store,
  FileText,
  Bell,
  Activity,
  Database,
  Wifi,
  Mail,
  Phone
} from "lucide-react";

// Lazy load components for better performance
const AdminOverview = lazy(() => import("./AdminOverview"));
const UserManagement = lazy(() => import("./UserManagement"));
const PropertyManagement = lazy(() => import("./PropertyManagement"));
const VendorManagementHub = lazy(() => import("./VendorManagementHub"));
const CommunicationHub = lazy(() => import("./CommunicationHub"));
const CustomerServiceTicketManagement = lazy(() => import("./CustomerServiceTicketManagement"));
const SystemSettings = lazy(() => import("./SystemSettings"));
const SecurityMonitoring = lazy(() => import("./SecurityMonitoring"));
const SystemReports = lazy(() => import("./SystemReports"));
const AdminAlertSystem = lazy(() => import("./AdminAlertSystem"));

export const tabCategories = {
  overview: {
    label: "Dashboard Overview",
    items: [
      {
        value: "overview",
        label: "Dashboard",
        icon: BarChart3,
        component: AdminOverview,
        adminOnly: false
      }
    ]
  },
  alerts: {
    label: "Alert Management",
    items: [
      {
        value: "alerts",
        label: "Admin Alerts",
        icon: Bell,
        component: AdminAlertSystem,
        adminOnly: false,
        description: "Monitor system alerts and notifications"
      }
    ]
  },
  management: {
    label: "Core Management",
    items: [
      {
        value: "users",
        label: "User Management", 
        icon: Users,
        component: UserManagement,
        adminOnly: true
      },
      {
        value: "properties",
        label: "Property Management",
        icon: Building2, 
        component: PropertyManagement,
        adminOnly: false
      },
      {
        value: "vendors",
        label: "Vendor Hub",
        icon: Store,
        component: VendorManagementHub,
        adminOnly: false
      }
    ]
  },
  communication: {
    label: "Communication & Support",
    items: [
      {
        value: "communication",
        label: "Communication Hub",
        icon: MessageSquare,
        component: CommunicationHub,
        adminOnly: false,
        description: "WhatsApp, SMS, email communication"
      },
      {
        value: "support",
        label: "Support Tickets",
        icon: Mail,
        component: CustomerServiceTicketManagement,
        adminOnly: false,
        description: "Customer support and ticket management"
      }
    ]
  },
  system: {
    label: "System & Security",
    items: [
      {
        value: "system",
        label: "System Settings",
        icon: Settings,
        component: SystemSettings,
        adminOnly: true
      },
      {
        value: "security",
        label: "Security Monitor",
        icon: Shield,
        component: SecurityMonitoring,
        adminOnly: true
      },
      {
        value: "reports",
        label: "System Reports",
        icon: FileText,
        component: SystemReports,
        adminOnly: true
      }
    ]
  }
};
