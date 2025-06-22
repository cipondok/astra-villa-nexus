
import { 
  LayoutDashboard,
  Users, 
  Building2, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield, 
  FileText, 
  Mail,
  Globe,
  Database,
  Zap,
  Brain,
  TrendingUp,
  Search,
  List,
  Store,
  Bot,
  CreditCard,
  UserCheck,
  Award,
  Calendar,
  LifeBuoy,
  Phone,
  Crown,
  Monitor,
  Home,
  Headphones,
  UserPlus
} from "lucide-react";

export interface NavigationSection {
  id: string;
  label: string;
  icon: any;
  description: string;
  category: string;
  badge?: string;
}

export const navigationSections: NavigationSection[] = [
  // Core Admin
  {
    id: 'overview',
    label: 'Dashboard Overview',
    icon: LayoutDashboard,
    description: 'System overview and key metrics',
    category: 'Core'
  },

  // Users Management - Consolidated Section
  {
    id: 'user-management',
    label: 'Complete User Management',
    icon: Users,
    description: 'All user management features in one place',
    category: 'Users',
    badge: 'ALL-IN-ONE'
  },

  // Core Property Management
  {
    id: 'property-management',
    label: 'Property Management',
    icon: Building2,
    description: 'Property listings and approvals',
    category: 'Core'
  },

  // Customer Service
  {
    id: 'customer-service',
    label: 'Customer Service',
    icon: LifeBuoy,
    description: 'Support tickets and live chat management',
    category: 'Customer Service',
    badge: 'NEW'
  },
  {
    id: 'contact-management',
    label: 'Contact Management',
    icon: Phone,
    description: 'Contact us inquiries and responses',
    category: 'Customer Service'
  },
  
  // AI & Vendor Management
  {
    id: 'ai-vendor-management',
    label: 'AI Vendor Management',
    icon: Brain,
    description: 'Complete AI-powered vendor system',
    category: 'AI & Vendors',
    badge: 'AI'
  },
  {
    id: 'vendor-management',
    label: 'Vendor Requests',
    icon: Store,
    description: 'Vendor registration and approval',
    category: 'AI & Vendors'
  },
  {
    id: 'vendor-service-categories',
    label: 'Service Categories',
    icon: List,
    description: 'Manage vendor service categories',
    category: 'AI & Vendors'
  },
  {
    id: 'vendor-services',
    label: 'Vendor Services',
    icon: Settings,
    description: 'Service management and pricing',
    category: 'AI & Vendors'
  },
  {
    id: 'kyc-management',
    label: 'KYC Verification',
    icon: UserCheck,
    description: 'Identity verification management',
    category: 'AI & Vendors'
  },
  {
    id: 'membership-management',
    label: 'Membership Levels',
    icon: Award,
    description: 'Vendor membership system',
    category: 'AI & Vendors'
  },

  // Analytics & Monitoring
  {
    id: 'analytics',
    label: 'Web Analytics',
    icon: BarChart3,
    description: 'Traffic and user behavior analytics',
    category: 'Analytics'
  },
  {
    id: 'ai-bot-management',
    label: 'AI Bot Management',
    icon: Bot,
    description: 'AI assistant configuration',
    category: 'Analytics'
  },
  {
    id: 'feedback-management',
    label: 'Feedback Management',
    icon: MessageSquare,
    description: 'User feedback and reviews',
    category: 'Analytics'
  },
  {
    id: 'daily-checkin',
    label: 'Daily Check-in',
    icon: Calendar,
    description: 'User engagement tracking',
    category: 'Analytics'
  },

  // Content & Settings
  {
    id: 'content-management',
    label: 'Content Management',
    icon: FileText,
    description: 'CMS and content editing',
    category: 'Content'
  },
  {
    id: 'search-filters',
    label: 'Search Filters',
    icon: Search,
    description: 'Property search configuration',
    category: 'Content'
  },
  {
    id: 'seo-settings',
    label: 'SEO Settings',
    icon: Search,
    description: 'Search engine optimization settings',
    category: 'Content',
    badge: 'NEW'
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: Settings,
    description: 'Application configuration',
    category: 'Settings'
  },
  {
    id: 'billing-management',
    label: 'Billing Management',
    icon: CreditCard,
    description: 'Subscription and payment management',
    category: 'Settings'
  },
  {
    id: 'astra-tokens',
    label: 'ASTRA Tokens',
    icon: Zap,
    description: 'Token system management',
    category: 'Settings'
  },

  // Technical
  {
    id: 'database-management',
    label: 'Database Management',
    icon: Database,
    description: 'Database tables and data',
    category: 'Technical'
  },
  {
    id: 'security-monitoring',
    label: 'Security Monitoring',
    icon: Shield,
    description: 'Security logs and monitoring',
    category: 'Technical'
  },
  {
    id: 'system-reports',
    label: 'System Reports',
    icon: TrendingUp,
    description: 'System health and reports',
    category: 'Technical'
  }
];

export const categories = ['Core', 'Users', 'Customer Service', 'AI & Vendors', 'Analytics', 'Content', 'Settings', 'Technical'];
