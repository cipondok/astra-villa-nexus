
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
    
    switch (toolId) {
      case 'dashboard':
        onSectionChange('overview');
        break;
      case 'business-profile':
        onSectionChange('profile');
        break;
      case 'services':
        onSectionChange('services');
        break;
      case 'bookings':
        onSectionChange('bookings');
        break;
      case 'customers':
        onSectionChange('customers');
        break;
      case 'billing':
        onSectionChange('billing');
        break;
      case 'progress':
        onSectionChange('progress');
        break;
      case 'holidays':
        onSectionChange('holidays');
        break;
      case 'change-requests':
        onSectionChange('change-requests');
        break;
      case 'kyc-verification':
        onSectionChange('kyc-verification');
        break;
      case 'membership-progress':
        onSectionChange('membership-progress');
        break;
      case 'feedback':
        onSectionChange('reviews');
        break;
      case 'compliance':
        onSectionChange('compliance');
        break;
      case 'customer-service':
        onSectionChange('support');
        break;
      case 'analytics':
        onSectionChange('analytics');
        break;
      default:
        console.log('Unknown tool:', toolId);
    }
  };

  const navigationSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and quick stats'
    },
    {
      id: 'business-profile',
      label: 'Business Profile',
      icon: Building2,
      description: 'Manage business information'
    },
    {
      id: 'services',
      label: 'Services',
      icon: Settings,
      description: 'Create and manage services'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      description: 'View and manage bookings'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Customer management'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: DollarSign,
      description: 'Invoices and payments (IDR)'
    },
    {
      id: 'progress',
      label: 'Project Progress',
      icon: TrendingUp,
      description: 'Track project milestones'
    },
    {
      id: 'holidays',
      label: 'Holiday Management',
      icon: Clock,
      description: 'Set service holidays'
    },
    {
      id: 'change-requests',
      label: 'Change Requests',
      icon: FileText,
      description: 'Request profile changes'
    },
    {
      id: 'kyc-verification',
      label: 'KYC Verification',
      icon: CreditCard,
      description: 'Identity verification',
      badge: 'Required'
    },
    {
      id: 'membership-progress',
      label: 'Membership Level',
      icon: Award,
      description: 'Track membership progress',
      badge: 'New'
    },
    {
      id: 'feedback',
      label: 'Reviews & Feedback',
      icon: Star,
      description: 'Customer reviews and ratings'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: Shield,
      description: 'Licenses and certifications'
    },
    {
      id: 'customer-service',
      label: 'Customer Service',
      icon: HeadphonesIcon,
      description: 'Support tickets'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Business insights'
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
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="flex-1">{section.label}</span>
                {section.badge && (
                  <Badge variant="secondary" className="text-xs">
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
                className="w-full"
                onClick={() => handleToolClick(section.id)}
              >
                {isActive ? 'Active' : 'Open'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VendorDashboardNavigation;
