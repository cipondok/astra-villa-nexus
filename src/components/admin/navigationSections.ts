
import {
  BarChart3,
  Building,
  Calendar,
  CheckCircle2,
  FileText,
  Gauge,
  Globe,
  HelpCircle,
  Home,
  ListChecks,
  MessageSquare,
  Plus,
  Settings,
  ShoppingBag,
  Sliders,
  SquareKanban,
  TrendingUp,
  User,
  Users,
  Wifi,
  Activity,
  Database,
  SlidersHorizontal,
  BellAlert,
  Rocket,
  Book,
  LayoutDashboard,
} from 'lucide-react';

export const mainNavigation = [
  {
    id: 'home',
    title: 'Home',
    icon: Home,
    href: '/dashboard',
  },
  {
    id: 'properties',
    title: 'Properties',
    icon: Building,
    href: '/properties',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    href: '/calendar',
  },
  {
    id: 'messages',
    title: 'Messages',
    icon: MessageSquare,
    href: '/messages',
  },
];

export const secondaryNavigation = [
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'help',
    title: 'Help',
    icon: HelpCircle,
    href: '/help',
  },
];

export const adminNavigation = [
  {
    id: 'admin-overview',
    title: 'Overview',
    icon: Home,
    href: '/admin',
  },
  {
    id: 'user-management',
    title: 'User Management',
    icon: Users,
    href: '/admin/users',
  },
  {
    id: 'property-management',
    title: 'Property Management',
    icon: Building,
    href: '/admin/properties',
  },
  {
    id: 'vendor-management',
    title: 'Vendor Management',
    icon: ShoppingBag,
    href: '/admin/vendors',
  },
  {
    id: 'system-monitor',
    title: 'System Monitor',
    icon: Gauge,
    href: '/admin/system-monitor',
  },
];

export const propertyOwnerNavigation = [
  {
    id: 'owner-overview',
    title: 'Overview',
    icon: Home,
    href: '/owner',
  },
  {
    id: 'owner-properties',
    title: 'My Properties',
    icon: Building,
    href: '/owner/properties',
  },
  {
    id: 'add-property',
    title: 'Add Property',
    icon: Plus,
    href: '/add-property',
  },
  {
    id: 'owner-calendar',
    title: 'Calendar',
    icon: Calendar,
    href: '/owner/calendar',
  },
  {
    id: 'owner-messages',
    title: 'Messages',
    icon: MessageSquare,
    href: '/owner/messages',
  },
  {
    id: 'owner-settings',
    title: 'Settings',
    icon: Settings,
    href: '/owner/settings',
  },
];

export const superAdminNavigation = [
  {
    id: 'super-admin-overview',
    title: 'Overview',
    icon: Home,
    href: '/super-admin',
  },
  {
    id: 'database-management',
    title: 'Database Management',
    icon: Wifi,
    href: '/super-admin/database',
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    icon: Sliders,
    href: '/super-admin/settings',
  },
  {
    id: 'audit-logs',
    title: 'Audit Logs',
    icon: ListChecks,
    href: '/super-admin/audit-logs',
  },
  {
    id: 'queue-management',
    title: 'Queue Management',
    icon: SquareKanban,
    href: '/super-admin/queues',
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    icon: CheckCircle2,
    href: '/super-admin/developer-tools',
  },
];

export interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  badge?: string;
}

export interface NavigationSection {
  id: string;
  title: string;
  label: string;
  description: string;
  icon: any;
  href?: string;
  badge?: string;
  items?: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    label: 'Getting Started',
    description: 'Start here for dashboard overview and guides',
    icon: Rocket,
    items: [
      {
        id: 'admin-overview',
        title: 'Admin Overview',
        description: 'Dashboard overview and key metrics',
        icon: LayoutDashboard,
        href: '/admin',
      },
      {
        id: 'user-guide',
        title: 'User Guide',
        description: 'Learn how to use the admin dashboard',
        icon: Book,
        href: '/admin/guide',
      },
    ],
  },
  {
    id: 'data-management',
    title: 'Data Management',
    label: 'Data Management',
    description: 'Manage users, properties, and vendors',
    icon: Database,
    items: [
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Manage user accounts and roles',
        icon: Users,
        href: '/admin/users',
      },
      {
        id: 'property-management',
        title: 'Property Management',
        description: 'Manage property listings and details',
        icon: Building,
        href: '/admin/properties',
      },
      {
        id: 'vendor-management',
        title: 'Vendor Management',
        description: 'Manage vendors and service providers',
        icon: ShoppingBag,
        href: '/admin/vendors',
      },
    ],
  },
  {
    id: 'system-configuration',
    title: 'System Configuration',
    label: 'System Configuration',
    description: 'Configure system settings and alerts',
    icon: SlidersHorizontal,
    items: [
      {
        id: 'system-settings',
        title: 'System Settings',
        description: 'Configure system-wide settings',
        icon: Sliders,
        href: '/admin/settings',
      },
      {
        id: 'alert-rules',
        title: 'Alert Rules',
        description: 'Define rules for system alerts',
        icon: BellAlert,
        href: '/admin/alert-rules',
      },
      {
        id: 'queue-management',
        title: 'Queue Management',
        description: 'Manage background task queues',
        icon: SquareKanban,
        href: '/admin/queues',
      },
    ],
  },
  {
    id: 'monitoring-logs',
    title: 'Monitoring & Logs',
    label: 'Monitoring & Logs',
    description: 'Monitor system health and view logs',
    icon: Activity,
    items: [
      {
        id: 'system-monitor',
        title: 'System Monitor',
        description: 'Real-time system health monitoring',
        icon: Gauge,
        href: '/admin/system-monitor',
      },
      {
        id: 'audit-logs',
        title: 'Audit Logs',
        description: 'Track user actions and system events',
        icon: ListChecks,
        href: '/admin/audit-logs',
      },
    ],
  },
  {
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    label: 'Analytics & Reports',
    description: 'View analytics and generate reports',
    icon: BarChart3,
    items: [
      {
        id: 'system-analytics',
        title: 'System Analytics',
        description: 'View system performance metrics',
        icon: Activity,
        href: '/admin/analytics',
      },
      {
        id: 'performance-analytics',
        title: 'Performance Analytics',
        description: 'Detailed system performance and trends',
        icon: TrendingUp,
        href: '/admin/performance-analytics',
      },
      {
        id: 'web-traffic',
        title: 'Web Traffic Analytics',
        description: 'Website traffic and user behavior',
        icon: Globe,
        href: '/admin/web-traffic',
      },
      {
        id: 'vendor-analytics',
        title: 'Vendor Performance',
        description: 'AI-powered vendor analytics',
        icon: Users,
        href: '/admin/vendor-performance',
      },
      {
        id: 'system-reports',
        title: 'System Reports',
        description: 'Generate comprehensive reports',
        icon: FileText,
        href: '/admin/reports',
      },
    ],
  },
];

// Create section categories mapping for NavigationCategory component
export const sectionCategories = {
  'getting-started': [
    {
      id: 'admin-overview',
      label: 'Admin Overview',
      description: 'Dashboard overview and key metrics',
      icon: LayoutDashboard,
    },
    {
      id: 'user-guide',
      label: 'User Guide',
      description: 'Learn how to use the admin dashboard',
      icon: Book,
    },
  ],
  'data-management': [
    {
      id: 'user-management',
      label: 'User Management',
      description: 'Manage user accounts and roles',
      icon: Users,
    },
    {
      id: 'property-management',
      label: 'Property Management',
      description: 'Manage property listings and details',
      icon: Building,
    },
    {
      id: 'vendor-management',
      label: 'Vendor Management',
      description: 'Manage vendors and service providers',
      icon: ShoppingBag,
    },
  ],
  'system-configuration': [
    {
      id: 'system-settings',
      label: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Sliders,
    },
    {
      id: 'alert-rules',
      label: 'Alert Rules',
      description: 'Define rules for system alerts',
      icon: BellAlert,
    },
    {
      id: 'queue-management',
      label: 'Queue Management',
      description: 'Manage background task queues',
      icon: SquareKanban,
    },
  ],
  'monitoring-logs': [
    {
      id: 'system-monitor',
      label: 'System Monitor',
      description: 'Real-time system health monitoring',
      icon: Gauge,
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      description: 'Track user actions and system events',
      icon: ListChecks,
    },
  ],
  'analytics-reports': [
    {
      id: 'system-analytics',
      label: 'System Analytics',
      description: 'View system performance metrics',
      icon: Activity,
    },
    {
      id: 'performance-analytics',
      label: 'Performance Analytics',
      description: 'Detailed system performance and trends',
      icon: TrendingUp,
    },
    {
      id: 'web-traffic',
      label: 'Web Traffic Analytics',
      description: 'Website traffic and user behavior',
      icon: Globe,
    },
    {
      id: 'vendor-analytics',
      label: 'Vendor Performance',
      description: 'AI-powered vendor analytics',
      icon: Users,
    },
    {
      id: 'system-reports',
      label: 'System Reports',
      description: 'Generate comprehensive reports',
      icon: FileText,
    },
  ],
};

// Export categories for backward compatibility
export const categories = Object.keys(sectionCategories);
