
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  HeadphonesIcon,
  CreditCard,
  Award,
  ChevronRight,
  Home,
  Briefcase,
  BarChart3,
  UserCheck
} from "lucide-react";

interface VendorDashboardNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  isImplemented: boolean;
  badge?: string;
}

interface NavigationGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard Overview',
        icon: LayoutDashboard,
        description: 'Main dashboard with stats and overview',
        isImplemented: true,
      },
      {
        id: 'analytics',
        label: 'Business Analytics',
        icon: TrendingUp,
        description: 'Performance insights and metrics',
        isImplemented: true,
      },
      {
        id: 'reviews',
        label: 'Reviews & Feedback',
        icon: Star,
        description: 'Customer reviews and ratings',
        isImplemented: true,
      }
    ]
  },
  {
    id: 'business',
    label: 'Business',
    icon: Briefcase,
    color: 'from-violet-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10',
    items: [
      {
        id: 'profile',
        label: 'Business Profile',
        icon: Building2,
        description: 'Manage your business information',
        isImplemented: true,
      },
      {
        id: 'services',
        label: 'Service Listings',
        icon: Settings,
        description: 'View your service offerings',
        isImplemented: true,
      },
      {
        id: 'service-management',
        label: 'Service Management',
        icon: Plus,
        description: 'Create, edit, and delete services',
        isImplemented: true,
        badge: 'Hot',
      }
    ]
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: Building2,
    color: 'from-emerald-500 to-teal-500',
    gradient: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
    items: [
      {
        id: 'properties',
        label: 'Property Management',
        icon: Building2,
        description: 'Manage your property listings',
        isImplemented: true,
      },
      {
        id: 'add-property',
        label: 'Add Property',
        icon: Plus,
        description: 'List a new property for rent or sale',
        isImplemented: true,
        badge: 'New',
      }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Calendar,
    color: 'from-orange-500 to-amber-500',
    gradient: 'bg-gradient-to-br from-orange-500/10 to-amber-500/10',
    items: [
      {
        id: 'bookings',
        label: 'Booking Management',
        icon: Calendar,
        description: 'View and manage customer bookings',
        isImplemented: true,
      },
      {
        id: 'customers',
        label: 'Customer Management',
        icon: Users,
        description: 'Manage your customer relationships',
        isImplemented: false,
        badge: 'Coming Soon',
      },
      {
        id: 'holidays',
        label: 'Holiday Management',
        icon: Clock,
        description: 'Set service availability and holidays',
        isImplemented: false,
        badge: 'Coming Soon',
      },
      {
        id: 'progress',
        label: 'Project Progress',
        icon: TrendingUp,
        description: 'Track project milestones and completion',
        isImplemented: false,
        badge: 'Coming Soon',
      }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
    items: [
      {
        id: 'billing',
        label: 'Billing & Payments',
        icon: DollarSign,
        description: 'Invoice management and payment tracking',
        isImplemented: false,
        badge: 'Coming Soon',
      },
      {
        id: 'membership-progress',
        label: 'Membership Level',
        icon: Award,
        description: 'Track your membership progress',
        isImplemented: false,
        badge: 'New',
      }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-red-500/10 to-rose-500/10',
    items: [
      {
        id: 'kyc-verification',
        label: 'KYC Verification',
        icon: CreditCard,
        description: 'Identity and business verification',
        isImplemented: false,
        badge: 'Required',
      },
      {
        id: 'compliance',
        label: 'Compliance & Licenses',
        icon: Shield,
        description: 'Manage licenses and certifications',
        isImplemented: false,
        badge: 'Coming Soon',
      },
      {
        id: 'change-requests',
        label: 'Change Requests',
        icon: FileText,
        description: 'Request profile and service changes',
        isImplemented: false,
        badge: 'Coming Soon',
      }
    ]
  },
  {
    id: 'support',
    label: 'Support',
    icon: HeadphonesIcon,
    color: 'from-pink-500 to-fuchsia-500',
    gradient: 'bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10',
    items: [
      {
        id: 'support',
        label: 'Customer Support',
        icon: HeadphonesIcon,
        description: 'Support tickets and help center',
        isImplemented: true,
      }
    ]
  }
];

const VendorDashboardNavigation = ({ activeSection, onSectionChange }: VendorDashboardNavigationProps) => {
  const [activeGroup, setActiveGroup] = useState<string>('overview');

  const handleGroupClick = (groupId: string) => {
    setActiveGroup(groupId);
    // Auto-select first implemented item in the group
    const group = navigationGroups.find(g => g.id === groupId);
    if (group) {
      const firstImplemented = group.items.find(item => item.isImplemented);
      if (firstImplemented) {
        onSectionChange(firstImplemented.id);
      }
    }
  };

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
  };

  const currentGroup = navigationGroups.find(g => g.id === activeGroup);

  return (
    <div className="space-y-6">
      {/* Main Group Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {navigationGroups.map((group) => {
          const Icon = group.icon;
          const isActive = activeGroup === group.id;
          const implementedCount = group.items.filter(i => i.isImplemented).length;
          
          return (
            <Card 
              key={group.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 ${
                isActive 
                  ? `bg-gradient-to-br ${group.color} shadow-lg` 
                  : `${group.gradient} hover:shadow-md`
              }`}
              onClick={() => handleGroupClick(group.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                  isActive ? 'bg-white/20' : 'bg-white/50'
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-foreground'}`} />
                </div>
                <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-foreground'}`}>
                  {group.label}
                </p>
                <p className={`text-[10px] mt-1 ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {implementedCount}/{group.items.length} active
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Group Details with Tabs */}
      {currentGroup && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className={`bg-gradient-to-r ${currentGroup.color} text-white py-4`}>
            <CardTitle className="flex items-center gap-3 text-lg">
              <currentGroup.icon className="h-5 w-5" />
              {currentGroup.label}
              <Badge variant="secondary" className="bg-white/20 text-white border-0 ml-auto">
                {currentGroup.items.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeSection} onValueChange={handleItemClick} className="w-full">
              <div className="border-b bg-muted/30">
                <TabsList className="w-full h-auto p-1 bg-transparent flex-wrap justify-start gap-1">
                  {currentGroup.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        disabled={!item.isImplemented}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                          data-[state=active]:bg-gradient-to-r data-[state=active]:${currentGroup.color} data-[state=active]:text-white data-[state=active]:shadow-md
                          ${!item.isImplemented ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}
                        `}
                      >
                        <ItemIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'Required' ? 'destructive' : 'secondary'} 
                            className="text-[10px] px-1.5 py-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              
              {currentGroup.items.map((item) => (
                <TabsContent key={item.id} value={item.id} className="p-6 m-0">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentGroup.color}`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {item.label}
                        {item.badge && (
                          <Badge variant={item.badge === 'Required' ? 'destructive' : 'outline'}>
                            {item.badge}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-muted-foreground mt-1">{item.description}</p>
                      <Button 
                        className={`mt-4 bg-gradient-to-r ${currentGroup.color} text-white border-0 hover:opacity-90`}
                        disabled={!item.isImplemented}
                      >
                        {item.isImplemented ? 'View Section' : 'Coming Soon'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Access - All Links */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Quick Access - All Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {navigationGroups.flatMap(group => 
              group.items.map(item => {
                const ItemIcon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`justify-start text-xs h-auto py-2 ${
                      isActive 
                        ? `bg-gradient-to-r ${group.color} text-white border-0` 
                        : ''
                    } ${!item.isImplemented ? 'opacity-50' : ''}`}
                    disabled={!item.isImplemented}
                    onClick={() => {
                      setActiveGroup(group.id);
                      handleItemClick(item.id);
                    }}
                  >
                    <ItemIcon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboardNavigation;
