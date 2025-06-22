
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Building, 
  Users, 
  Settings, 
  PlusCircle, 
  BarChart3, 
  FileText, 
  Wrench,
  UserCheck,
  Crown,
  RefreshCw,
  LifeBuoy,
  MessageSquare
} from "lucide-react";

interface RoleDashboardProps {
  language: "en" | "id";
}

const RoleDashboard = ({ language }: RoleDashboardProps) => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Handle vendor role navigation
  useEffect(() => {
    if (profile?.role === 'vendor') {
      console.log('RoleDashboard - Redirecting vendor to vendor dashboard');
      navigate('/dashboard/vendor');
    }
  }, [profile?.role, navigate]);

  const handleRefreshProfile = async () => {
    console.log('Manual profile refresh requested');
    await refreshProfile();
  };

  // Debug info for super admin email
  const isSuperAdminEmail = user?.email === 'mycode103@gmail.com';
  
  console.log('RoleDashboard Debug:', {
    userEmail: user?.email,
    isSuperAdminEmail,
    profileRole: profile?.role,
    verificationStatus: profile?.verification_status,
    profileUpdatedAt: profile?.updated_at
  });

  const text = {
    en: {
      welcome: "Welcome",
      yourRole: "Your Role",
      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
      refreshProfile: "Refresh Profile",
      generalUser: {
        title: "General User Dashboard",
        description: "Browse and search properties",
        actions: [
          { label: "Search Properties", icon: Home, route: "/properties" },
          { label: "Browse Listings", icon: Building, route: "/property-listings" },
          { label: "View Preferences", icon: Settings, route: "/dashboard/user/preferences" }
        ]
      },
      propertyOwner: {
        title: "Property Owner Dashboard",
        description: "Manage your properties and listings",
        actions: [
          { label: "Add New Property", icon: PlusCircle, route: "/add-property" },
          { label: "My Properties", icon: Building, route: "/dashboard/owner/properties" },
          { label: "View Analytics", icon: BarChart3, route: "/dashboard/owner/analytics" },
          { label: "Manage Listings", icon: FileText, route: "/dashboard/owner/listings" }
        ]
      },
      agent: {
        title: "Agent Dashboard",
        description: "Manage clients and property listings",
        actions: [
          { label: "Create Listing", icon: PlusCircle, route: "/dashboard/agent/create-listing" },
          { label: "My Listings", icon: FileText, route: "/dashboard/agent/listings" },
          { label: "Client Management", icon: Users, route: "/dashboard/agent/clients" },
          { label: "Performance", icon: BarChart3, route: "/dashboard/agent/analytics" }
        ]
      },
      vendor: {
        title: "Vendor Dashboard", 
        description: "Manage your services and bookings",
        actions: [
          { label: "My Services", icon: Wrench, route: "/dashboard/vendor" },
          { label: "Bookings", icon: FileText, route: "/dashboard/vendor" },
          { label: "Analytics", icon: BarChart3, route: "/dashboard/vendor" },
          { label: "Settings", icon: Settings, route: "/dashboard/vendor" }
        ]
      },
      admin: {
        title: "Admin Dashboard",
        description: "System administration and management",
        actions: [
          { label: "User Management", icon: Users, route: "/dashboard/admin/users" },
          { label: "Property Management", icon: Building, route: "/dashboard/admin/properties" },
          { label: "System Settings", icon: Settings, route: "/dashboard/admin/settings" },
          { label: "Analytics", icon: BarChart3, route: "/dashboard/admin/analytics" }
        ]
      }
    },
    id: {
      welcome: "Selamat Datang",
      yourRole: "Peran Anda",
      quickActions: "Aksi Cepat",
      recentActivity: "Aktivitas Terbaru",
      refreshProfile: "Refresh Profil",
      generalUser: {
        title: "Dashboard Pengguna Umum",
        description: "Jelajahi dan cari properti",
        actions: [
          { label: "Cari Properti", icon: Home, route: "/properties" },
          { label: "Jelajahi Listing", icon: Building, route: "/property-listings" },
          { label: "Lihat Preferensi", icon: Settings, route: "/dashboard/user/preferences" }
        ]
      },
      propertyOwner: {
        title: "Dashboard Pemilik Properti",
        description: "Kelola properti dan listing Anda",
        actions: [
          { label: "Tambah Properti Baru", icon: PlusCircle, route: "/add-property" },
          { label: "Properti Saya", icon: Building, route: "/dashboard/owner/properties" },
          { label: "Lihat Analytics", icon: BarChart3, route: "/dashboard/owner/analytics" },
          { label: "Kelola Listing", icon: FileText, route: "/dashboard/owner/listings" }
        ]
      },
      agent: {
        title: "Dashboard Agen",
        description: "Kelola klien dan listing properti",
        actions: [
          { label: "Buat Listing", icon: PlusCircle, route: "/dashboard/agent/create-listing" },
          { label: "Listing Saya", icon: FileText, route: "/dashboard/agent/listings" },
          { label: "Manajemen Klien", icon: Users, route: "/dashboard/agent/clients" },
          { label: "Performa", icon: BarChart3, route: "/dashboard/agent/analytics" }
        ]
      },
      vendor: {
        title: "Dashboard Vendor",
        description: "Kelola layanan dan booking Anda",
        actions: [
          { label: "Layanan Saya", icon: Wrench, route: "/dashboard/vendor" },
          { label: "Booking", icon: FileText, route: "/dashboard/vendor" },
          { label: "Analytics", icon: BarChart3, route: "/dashboard/vendor" },
          { label: "Pengaturan", icon: Settings, route: "/dashboard/vendor" }
        ]
      },
      admin: {
        title: "Dashboard Admin",
        description: "Administrasi dan manajemen sistem",
        actions: [
          { label: "Manajemen Pengguna", icon: Users, route: "/dashboard/admin/users" },
          { label: "Manajemen Properti", icon: Building, route: "/dashboard/admin/properties" },
          { label: "Pengaturan Sistem", icon: Settings, route: "/dashboard/admin/settings" },
          { label: "Analytics", icon: BarChart3, route: "/dashboard/admin/analytics" }
        ]
      }
    }
  };

  const currentText = text[language];
  
  // Don't render anything for vendor role since it will redirect
  if (profile?.role === 'vendor') {
    return null;
  }

  const getRoleConfig = () => {
    switch (profile?.role) {
      case 'property_owner':
        return currentText.propertyOwner;
      case 'agent':
        return currentText.agent;
      case 'admin':
        return currentText.admin;
      case 'general_user':
      default:
        return currentText.generalUser;
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{currentText.welcome}, {profile?.full_name || user?.email}!</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">{currentText.yourRole}:</span>
                <Badge variant="outline" className="capitalize">
                  {profile?.role?.replace('_', ' ') || 'General User'}
                </Badge>
                {isSuperAdminEmail && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Crown className="h-3 w-3 mr-1" />
                    Super Admin
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshProfile}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {currentText.refreshProfile}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{roleConfig.description}</p>
        </CardContent>
      </Card>

      {/* Role-specific Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>{roleConfig.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleConfig.actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-muted/50"
                  onClick={() => navigate(action.route)}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-sm text-center">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" className="justify-start">
              <UserCheck className="h-4 w-4 mr-2" />
              User Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleDashboard;
