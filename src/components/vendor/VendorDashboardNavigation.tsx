
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2,
  Wrench, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Shield, 
  Headphones,
  BarChart3
} from "lucide-react";

interface VendorDashboardNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const VendorDashboardNavigation = ({ activeSection, onSectionChange }: VendorDashboardNavigationProps) => {
  const navigationItems = [
    {
      id: 'business-profile',
      label: 'Business Profile',
      icon: Building2,
      description: 'Manage your business information'
    },
    {
      id: 'services',
      label: 'Services & Items',
      icon: Wrench,
      description: 'Manage your service offerings'
    },
    {
      id: 'customers',
      label: 'Customer Management',
      icon: Users,
      description: 'Manage customer relationships'
    },
    {
      id: 'billing',
      label: 'Billing & Invoices',
      icon: DollarSign,
      description: 'Manage invoices and payments'
    },
    {
      id: 'progress',
      label: 'Progress Tracking',
      icon: TrendingUp,
      description: 'Track project progress'
    },
    {
      id: 'feedback',
      label: 'Feedback & Reviews',
      icon: MessageSquare,
      description: 'Manage customer feedback'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: Shield,
      description: 'Manage licenses & certifications'
    },
    {
      id: 'customer-service',
      label: 'Customer Service',
      icon: Headphones,
      description: 'Handle support tickets'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Business insights & reports'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-70 mt-1">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorDashboardNavigation;
