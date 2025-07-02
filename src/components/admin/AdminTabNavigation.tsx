
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Settings, 
  BarChart3, 
  Shield, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  Database,
  Palette,
  Share2,
  Wrench,
  Globe,
  HelpCircle,
  Calendar,
  MapPin,
  CreditCard,
  Zap,
  Brain,
  Star,
  TrendingUp,
  UserCheck,
  Home,
  Search,
  Filter,
  Image,
  Eye,
  Bell,
  Package,
  Mail,
  PhoneCall,
  Headphones,
  Bug,
  Activity,
  Lock,
  Smartphone,
  Cloud,
  Code,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  DollarSign,
  Target,
  Briefcase,
  Award,
  BookOpen,
  Calculator,
  Camera,
  CheckCircle,
  Circle,
  Clipboard,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Play,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Twitter,
  Upload,
  Youtube,
  Zap as ZapIcon,
  Heart
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertCounts: Record<string, number>;
}

const AdminTabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  alertCounts
}) => {
  const getAlertBadge = (tabKey: string) => {
    const count = alertCounts[tabKey] || 0;
    return count > 0 ? (
      <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
        {count > 99 ? '99+' : count}
      </Badge>
    ) : null;
  };

  const tabGroups = [
    {
      title: "Dashboard & Analytics",
      tabs: [
        { key: 'overview', label: 'Overview', icon: Home },
        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        { key: 'real-time-stats', label: 'Real-Time Stats', icon: Activity },
        { key: 'business-intelligence', label: 'Business Intelligence', icon: Brain },
        { key: 'performance-analytics', label: 'Performance Analytics', icon: TrendingUp },
        { key: 'web-traffic', label: 'Web Traffic', icon: Globe }
      ]
    },
    {
      title: "User Management",
      tabs: [
        { key: 'users', label: 'User Management', icon: Users },
        { key: 'user-roles', label: 'User Roles', icon: UserCheck },
        { key: 'user-levels', label: 'User Levels', icon: Star },
        { key: 'user-departments', label: 'User Departments', icon: Building2 },
        { key: 'agent-users', label: 'Agent Users', icon: Briefcase },
        { key: 'property-owner-users', label: 'Property Owner Users', icon: Home },
        { key: 'vendor-users', label: 'Vendor Users', icon: Wrench },
        { key: 'database-users', label: 'Database Users', icon: Database }
      ]
    },
    {
      title: "Property Management",
      tabs: [
        { key: 'properties', label: 'Properties', icon: Building2 },
        { key: 'property-management', label: 'Property Management', icon: Home },
        { key: 'property-categories', label: 'Property Categories', icon: Layers },
        { key: 'property-filters', label: 'Property Filters', icon: Filter },
        { key: 'property-display', label: 'Property Display', icon: Eye },
        { key: 'property-3d', label: '3D View Settings', icon: Camera },
        { key: 'property-slideshow', label: 'Slideshow Settings', icon: Image },
        { key: 'property-watermark', label: 'Watermark Settings', icon: Shield },
        { key: 'search-filters', label: 'Search Filters', icon: Search }
      ]
    },
    {
      title: "Vendor Management",
      tabs: [
        { key: 'vendors', label: 'Vendor Management', icon: Wrench },
        { key: 'vendor-services', label: 'Vendor Services', icon: Settings },
        { key: 'vendor-categories', label: 'Service Categories', icon: Package },
        { key: 'vendor-performance', label: 'Vendor Performance', icon: BarChart },
        { key: 'vendor-verification', label: 'Vendor Verification', icon: CheckCircle },
        { key: 'vendor-fraud', label: 'Fraud Detection', icon: Shield },
        { key: 'vendor-matching', label: 'AI Matching', icon: Brain }
      ]
    },
    {
      title: "Communication & Support",
      tabs: [
        { key: 'communications', label: 'Communications', icon: MessageSquare },
        { key: 'chat-management', label: 'Chat Management', icon: MessageSquare },
        { key: 'live-chat', label: 'Live Chat', icon: PhoneCall },
        { key: 'customer-service', label: 'Customer Service', icon: Headphones },
        { key: 'help-desk', label: 'Help Desk', icon: HelpCircle },
        { key: 'contact-management', label: 'Contact Management', icon: Mail },
        { key: 'social-media', label: 'Social Media', icon: Share2 }
      ]
    },
    {
      title: "Content & Design",
      tabs: [
        { key: 'content', label: 'Content Management', icon: FileText },
        { key: 'website-design', label: 'Website Design', icon: Palette },
        { key: 'seo-management', label: 'SEO Management', icon: Search },
        { key: 'loading-page', label: 'Loading Page', icon: RefreshCw }
      ]
    },
    {
      title: "System & Security",
      tabs: [
        { key: 'system-settings', label: 'System Settings', icon: Settings },
        { key: 'security', label: 'Security', icon: Shield },
        { key: 'security-monitoring', label: 'Security Monitoring', icon: Eye },
        { key: 'system-monitor', label: 'System Monitor', icon: Activity },
        { key: 'database-management', label: 'Database Management', icon: Database },
        { key: 'maintenance', label: 'Maintenance', icon: Wrench },
        { key: 'diagnostics', label: 'Diagnostics', icon: Bug },
        { key: 'system-health', label: 'System Health', icon: Heart },
        { key: 'alerts', label: 'Alert Management', icon: Bell },
        { key: 'error-management', label: 'Error Management', icon: AlertTriangle },
        { key: 'system-reports', label: 'System Reports', icon: FileText }
      ]
    },
    {
      title: "AI & Automation",
      tabs: [
        { key: 'ai-management', label: 'AI Bot Management', icon: Brain },
        { key: 'ai-insights', label: 'AI Insights', icon: Zap },
        { key: 'automation', label: 'Automation Features', icon: ZapIcon }
      ]
    },
    {
      title: "Financial & Billing",
      tabs: [
        { key: 'billing', label: 'Billing Management', icon: CreditCard },
        { key: 'membership-management', label: 'Membership Management', icon: Award },
        { key: 'astra-token', label: 'ASTRA Token', icon: DollarSign },
        { key: 'astra-analytics', label: 'ASTRA Analytics', icon: PieChart }
      ]
    },
    {
      title: "Tools & Integrations",
      tabs: [
        { key: 'tools-management', label: 'Tools Management', icon: Wrench },
        { key: 'api-config', label: 'API Configuration', icon: Code },
        { key: 'smtp-settings', label: 'SMTP Settings', icon: Mail },
        { key: 'office-management', label: 'Office Management', icon: Building2 },
        { key: 'location-database', label: 'Location Database', icon: MapPin },
        { key: 'market-trends', label: 'Market Trends', icon: TrendingUp },
        { key: 'trending-topics', label: 'Trending Topics', icon: Star },
        { key: 'major-topics', label: 'Major Topics Dashboard', icon: BookOpen }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {tabGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
            {group.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {group.tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "ghost"}
                  className={`justify-start h-auto p-3 text-left ${
                    activeTab === tab.key 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {getAlertBadge(tab.key)}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminTabNavigation;
