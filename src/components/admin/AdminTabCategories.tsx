
import { Users, Home, Database, BarChart3, Building2, FileText, MessageSquare, Store, Mail, Wifi, LifeBuoy, Activity } from "lucide-react";
import { lazy } from "react";

// Lazy load heavy components
const SystemMonitor = lazy(() => import("@/components/admin/SystemMonitor"));
const WebTrafficAnalytics = lazy(() => import("@/components/admin/WebTrafficAnalytics"));
const SimpleUserManagement = lazy(() => import("@/components/admin/SimpleUserManagement"));
const PropertyManagement = lazy(() => import("@/components/admin/PropertyManagement"));
const ContentManagement = lazy(() => import("@/components/admin/ContentManagement"));
const FeedbackManagement = lazy(() => import("@/components/admin/FeedbackManagement"));
const ContactManagement = lazy(() => import("@/components/admin/ContactManagement"));
const LiveAgentStatusDashboard = lazy(() => import("@/components/admin/LiveAgentStatusDashboard"));
const OfficeManagement = lazy(() => import("@/components/admin/OfficeManagement"));
const CustomerServiceTicketManagement = lazy(() => import("@/components/admin/CustomerServiceTicketManagement"));
const VendorManagementHub = lazy(() => import("@/components/admin/VendorManagementHub"));
const CommunicationHub = lazy(() => import("@/components/admin/CommunicationHub"));
const EnhancedVendorDirectory = lazy(() => import("@/components/admin/EnhancedVendorDirectory"));

export const tabCategories = {
  core: {
    label: "Core",
    items: [
      { value: "overview", icon: Activity, label: "Overview", component: null, adminOnly: true },
      { value: "analytics", icon: BarChart3, label: "Analytics", component: WebTrafficAnalytics, adminOnly: true },
      { value: "system", icon: Database, label: "System", component: SystemMonitor, adminOnly: true },
    ]
  },
  management: {
    label: "Management",
    items: [
      { value: "users", icon: Users, label: "Users", component: SimpleUserManagement, adminOnly: true },
      { value: "properties", icon: Home, label: "Properties", component: PropertyManagement, adminOnly: true },
      { value: "offices", icon: Building2, label: "Offices", component: OfficeManagement, adminOnly: true },
      { value: "content", icon: FileText, label: "Content", component: ContentManagement, adminOnly: true },
    ]
  },
  communication: {
    label: "Communication",
    items: [
      { value: "communication", icon: MessageSquare, label: "Communication", component: CommunicationHub, adminOnly: false },
      { value: "vendor-directory", icon: Store, label: "Vendor Directory", component: EnhancedVendorDirectory, adminOnly: false },
      { value: "contact", icon: Mail, label: "Contacts", component: ContactManagement, adminOnly: false },
      { value: "live-status", icon: Wifi, label: "Live Status", component: LiveAgentStatusDashboard, adminOnly: false },
    ]
  },
  support: {
    label: "Support",
    items: [
      { value: "support", icon: LifeBuoy, label: "Support", component: CustomerServiceTicketManagement, adminOnly: false },
      { value: "feedback", icon: MessageSquare, label: "Feedback", component: FeedbackManagement, adminOnly: false },
      { value: "vendors", icon: Store, label: "Vendors", component: VendorManagementHub, adminOnly: true },
    ]
  }
};
