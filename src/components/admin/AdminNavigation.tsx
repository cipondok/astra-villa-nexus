
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface AdminNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminNavigation = ({ activeSection, onSectionChange }: AdminNavigationProps) => {
  const navigationSections = [
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

  const categories = ['Core', 'Users', 'Customer Service', 'AI & Vendors', 'Analytics', 'Content', 'Settings', 'Technical'];

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className={`text-lg font-semibold mb-3 ${
            category === 'Users' ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {category === 'Users' ? '👥 Users Management' : category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navigationSections
              .filter(section => section.category === category)
              .map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isUsersCategory = category === 'Users';
                
                return (
                  <Card 
                    key={section.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isActive 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : isUsersCategory
                        ? 'hover:bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSectionChange(section.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Icon className={`h-4 w-4 ${
                          isActive 
                            ? 'text-blue-600' 
                            : isUsersCategory 
                            ? 'text-blue-500' 
                            : 'text-gray-600'
                        }`} />
                        <span className="flex-1">{section.label}</span>
                        {section.badge && (
                          <Badge variant={isUsersCategory ? "default" : "secondary"} className="text-xs">
                            {section.badge}
                          </Badge>
                        )}
                        {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                      {isUsersCategory && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Enhanced</Badge>
                          <Badge variant="outline" className="text-xs">Vendors</Badge>
                          <Badge variant="outline" className="text-xs">Agents</Badge>
                          <Badge variant="outline" className="text-xs">Owners</Badge>
                          <Badge variant="outline" className="text-xs">Support</Badge>
                          <Badge variant="outline" className="text-xs">Levels</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminNavigation;
