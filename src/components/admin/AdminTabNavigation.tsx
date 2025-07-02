
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
      title: "Main Dashboard",
      tabs: [
        { key: 'overview', label: 'Overview', icon: Home, color: 'bg-blue-500' },
        { key: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-green-500' },
        { key: 'alerts', label: 'Alerts', icon: Bell, color: 'bg-red-500' }
      ]
    },
    {
      title: "User & Property Management",
      tabs: [
        { key: 'users', label: 'Users', icon: Users, color: 'bg-purple-500' },
        { key: 'properties', label: 'Properties', icon: Building2, color: 'bg-orange-500' },
        { key: 'vendors', label: 'Vendors', icon: Wrench, color: 'bg-yellow-500' }
      ]
    },
    {
      title: "Content & Design",
      tabs: [
        { key: 'content', label: 'Content', icon: FileText, color: 'bg-indigo-500' },
        { key: 'website-design', label: 'Website Design', icon: Palette, color: 'bg-pink-500' },
        { key: 'social-media', label: 'Social Media', icon: Share2, color: 'bg-cyan-500' }
      ]
    },
    {
      title: "System & Security",
      tabs: [
        { key: 'system-settings', label: 'System Settings', icon: Settings, color: 'bg-gray-500' },
        { key: 'security', label: 'Security', icon: Shield, color: 'bg-red-600' },
        { key: 'database-management', label: 'Database', icon: Database, color: 'bg-blue-600' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {tabGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
            {group.title}
          </h3>
          <div className="space-y-2">
            {group.tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <Button
                  key={tab.key}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-12 px-4 text-left font-medium transition-all ${
                    isActive 
                      ? `${tab.color} text-white shadow-lg hover:opacity-90` 
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                  {getAlertBadge(tab.key)}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Quick Access Tools */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
          Quick Tools
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'real-time-stats', label: 'Live Stats', icon: Activity },
            { key: 'system-monitor', label: 'Monitor', icon: Eye },
            { key: 'error-management', label: 'Errors', icon: AlertTriangle },
            { key: 'maintenance', label: 'Maintenance', icon: Wrench }
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.key;
            
            return (
              <Button
                key={tool.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-10 text-xs ${
                  isActive 
                    ? "bg-white/20 text-white border-white/30" 
                    : "border-white/20 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab(tool.key)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {tool.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminTabNavigation;
