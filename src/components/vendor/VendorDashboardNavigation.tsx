
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard,
  Building2, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  DollarSign,
  Settings,
  Plus,
  FileText,
  Clock,
  MessageSquare,
  Shield,
  HeadphonesIcon,
  CreditCard,
  Award,
  Eye,
  Edit
} from "lucide-react";

interface VendorDashboardNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const VendorDashboardNavigation = ({ activeSection, onSectionChange }: VendorDashboardNavigationProps) => {
  const navigate = useNavigate();

  const handleToolClick = (toolId: string) => {
    console.log('Tool clicked:', toolId);
    onSectionChange(toolId);
  };

  const navigationSections = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      description: 'Main dashboard with stats and overview',
      isImplemented: true
    },
    {
      id: 'profile',
      label: 'Business Profile',
      icon: Building2,
      description: 'Manage your business information',
      isImplemented: true
    },
    {
      id: 'services',
      label: 'Service Management',
      icon: Settings,
      description: 'Create and manage your services',
      isImplemented: true
    },
    {
      id: 'bookings',
      label: 'Booking Management',
      icon: Calendar,
      description: 'View and manage customer bookings',
      isImplemented: true
    },
    {
      id: 'customers',
      label: 'Customer Management',
      icon: Users,
      description: 'Manage your customer relationships',
      isImplemented: false,
      badge: 'Coming Soon'
    },
    {
      id: 'billing',
      label: 'Billing & Payments',
      icon: DollarSign,
      description: 'Invoice management and payment tracking',
      isImplemented: false,
      badge: 'Coming Soon'
    },
    {
      id: 'progress',
      label: 'Project Progress',
      icon: TrendingUp,
      description: 'Track project milestones and completion',
      isImplemented: false,
      badge: 'Coming Soon'
    },
    {
      id: 'holidays',
      label: 'Holiday Management',
      icon: Clock,
      description: 'Set service availability and holidays',
      isImplemented: false,
      badge: 'Coming Soon'
    },
    {
      id: 'change-requests',
      label: 'Change Requests',
      icon: FileText,
      description: 'Request profile and service changes',
      isImplemented: false,
      badge: 'Coming Soon'
    },
    {
      id: 'kyc-verification',
      label: 'KYC Verification',
      icon: CreditCard,
      description: 'Identity and business verification',
      isImplemented: false,
      badge: 'Required'
    },
    {
      id: 'membership-progress',
      label: 'Membership Level',
      icon: Award,
      description: 'Track your membership progress',
      isImplemented: false,
      badge: 'New'
    },
    {
      id: 'reviews',
      label: 'Reviews & Feedback',
      icon: Star,
      description: 'Customer reviews and ratings',
      isImplemented: true
    },
    {
      id: 'compliance',
      label: 'Compliance & Licenses',
      icon: Shield,
      description: 'Manage licenses and certifications',
      isImplemented: false,
      badge: 'Coming Soon'
    },
    {
      id: 'support',
      label: 'Customer Support',
      icon: HeadphonesIcon,
      description: 'Support tickets and help center',
      isImplemented: true
    },
    {
      id: 'analytics',
      label: 'Business Analytics',
      icon: TrendingUp,
      description: 'Performance insights and metrics',
      isImplemented: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {navigationSections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        
        return (
          <Card 
            key={section.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isActive 
                ? 'ring-2 ring-samsung-blue bg-samsung-blue/5 dark:bg-samsung-blue/10' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            } ${!section.isImplemented ? 'opacity-60' : ''}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 ${
                  isActive 
                    ? 'text-samsung-blue' 
                    : section.isImplemented 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : 'text-gray-400'
                }`} />
                <span className="flex-1">{section.label}</span>
                {section.badge && (
                  <Badge 
                    variant={section.badge === 'Required' ? 'destructive' : 'secondary'} 
                    className="text-xs"
                  >
                    {section.badge}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {section.description}
              </p>
              <Button 
                size="sm" 
                variant={isActive ? "default" : "outline"}
                className={`w-full ${
                  isActive 
                    ? 'bg-samsung-blue hover:bg-samsung-blue-dark' 
                    : section.isImplemented 
                      ? '' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => section.isImplemented && handleToolClick(section.id)}
                disabled={!section.isImplemented}
              >
                {isActive ? 'Active' : section.isImplemented ? 'Open' : 'Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VendorDashboardNavigation;
