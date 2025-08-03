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
  MessageSquare,
  Clock
} from "lucide-react";

interface RoleDashboardProps {
  language: "en" | "id";
}

const RoleDashboard = ({ language }: RoleDashboardProps) => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect agents to their dedicated dashboard
  useEffect(() => {
    if (profile?.role === 'agent') {
      navigate('/dashboard/agent');
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
          { label: "Search Properties", icon: Home },
          { label: "Saved Properties", icon: Building },
          { label: "View Preferences", icon: Settings }
        ]
      },
      propertyOwner: {
        title: "Property Owner Dashboard",
        description: "Manage your properties and listings",
        actions: [
          { label: "Add New Property", icon: PlusCircle },
          { label: "My Properties", icon: Building },
          { label: "View Analytics", icon: BarChart3 },
          { label: "Manage Listings", icon: FileText }
        ]
      },
      agent: {
        title: "Agent Dashboard",
        description: "Manage clients and property listings",
        actions: [
          { label: "Create Listing", icon: PlusCircle },
          { label: "My Listings", icon: Building },
          { label: "Client Management", icon: Users },
          { label: "Sales Report", icon: BarChart3 }
        ]
      },
      vendor: {
        title: "Vendor Dashboard",
        description: "Manage your services and bookings",
        actions: [
          { label: "Add Service", icon: PlusCircle },
          { label: "My Services", icon: Wrench },
          { label: "Bookings", icon: FileText },
          { label: "Service Analytics", icon: BarChart3 }
        ]
      },
      admin: {
        title: "Admin Dashboard",
        description: "Full system administration",
        actions: [
          { label: "User Management", icon: Users, path: "/admin", tab: "users" },
          { label: "System Analytics", icon: BarChart3, path: "/admin", tab: "analytics" },
          { label: "Verification Requests", icon: UserCheck, path: "/admin" },
          { label: "Manage Tickets", icon: LifeBuoy, path: "/admin", tab: "support" },
          { label: "Manage Feedback", icon: MessageSquare, path: "/admin", tab: "feedback" },
          { label: "System Settings", icon: Settings, path: "/admin" }
        ]
      },
      customer_service: {
        title: "Customer Service Dashboard",
        description: "Manage support tickets and customer inquiries.",
        actions: [
          { label: "Dashboard", icon: BarChart3, path: "/dashboard" },
          { label: "My Tickets", icon: LifeBuoy, path: "/dashboard" },
          { label: "Customer Inquiries", icon: MessageSquare, path: "/dashboard" },
          { label: "Available Tickets", icon: Clock, path: "/dashboard" }
        ]
      }
    },
    id: {
      welcome: "Selamat Datang",
      yourRole: "Peran Anda",
      quickActions: "Aksi Cepat",
      recentActivity: "Aktivitas Terbaru",
      refreshProfile: "Segarkan Profil",
      generalUser: {
        title: "Dashboard Pengguna Umum",
        description: "Jelajahi dan cari properti",
        actions: [
          { label: "Cari Properti", icon: Home },
          { label: "Properti Tersimpan", icon: Building },
          { label: "Lihat Preferensi", icon: Settings }
        ]
      },
      propertyOwner: {
        title: "Dashboard Pemilik Properti",
        description: "Kelola properti dan listing Anda",
        actions: [
          { label: "Tambah Properti Baru", icon: PlusCircle },
          { label: "Properti Saya", icon: Building },
          { label: "Lihat Analitik", icon: BarChart3 },
          { label: "Kelola Listing", icon: FileText }
        ]
      },
      agent: {
        title: "Dashboard Agen",
        description: "Kelola klien dan listing properti",
        actions: [
          { label: "Buat Listing", icon: PlusCircle },
          { label: "Listing Saya", icon: Building },
          { label: "Manajemen Klien", icon: Users },
          { label: "Laporan Penjualan", icon: BarChart3 }
        ]
      },
      vendor: {
        title: "Dashboard Vendor",
        description: "Kelola layanan dan booking Anda",
        actions: [
          { label: "Tambah Layanan", icon: PlusCircle },
          { label: "Layanan Saya", icon: Wrench },
          { label: "Booking", icon: FileText },
          { label: "Analitik Layanan", icon: BarChart3 }
        ]
      },
      admin: {
        title: "Dashboard Admin",
        description: "Administrasi sistem penuh",
        actions: [
          { label: "Manajemen Pengguna", icon: Users, path: "/admin", tab: "users" },
          { label: "Analitik Sistem", icon: BarChart3, path: "/admin", tab: "analytics" },
          { label: "Permintaan Verifikasi", icon: UserCheck, path: "/admin" },
          { label: "Kelola Tiket", icon: LifeBuoy, path: "/admin", tab: "support" },
          { label: "Kelola Umpan Balik", icon: MessageSquare, path: "/admin", tab: "feedback" },
          { label: "Pengaturan Sistem", icon: Settings, path: "/admin" }
        ]
      },
      customer_service: {
        title: "Dashboard Layanan Pelanggan",
        description: "Kelola tiket dukungan dan umpan balik pengguna.",
        actions: [
          { label: "Kelola Tiket", icon: LifeBuoy, path: "/admin", tab: "support" },
          { label: "Kelola Umpan Balik", icon: MessageSquare, path: "/admin", tab: "feedback" }
        ]
      }
    }
  };

  const currentText = text[language];

  // Show loading if no user data at all
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleConfig = () => {
    // Use profile role if available, otherwise default to general user
    const userRole = profile?.role || 'general_user';
    
    switch (userRole) {
      case 'property_owner':
        return currentText.propertyOwner;
      case 'agent':
        return currentText.agent;
      case 'vendor':
        return currentText.vendor;
      case 'admin':
        return currentText.admin;
      case 'customer_service':
        return currentText.customer_service;
      case 'general_user':
      default:
        return currentText.generalUser;
    }
  };

  const getRoleIcon = () => {
    const userRole = profile?.role || 'general_user';
    
    switch (userRole) {
      case 'property_owner':
        return Building;
      case 'agent':
        return Users;
      case 'vendor':
        return Wrench;
      case 'admin':
        return Crown;
      case 'customer_service':
        return LifeBuoy;
      case 'general_user':
      default:
        return Home;
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = getRoleIcon();

  const getRoleBadgeColor = () => {
    const userRole = profile?.role || 'general_user';
    
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'customer_service':
        return 'bg-cyan-100 text-cyan-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'property_owner':
        return 'bg-green-100 text-green-800';
      case 'vendor':
        return 'bg-orange-100 text-orange-800';
      case 'general_user':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get display name and email
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const userRole = profile?.role || 'general_user';

  return (
    <div className="space-y-6">
      {/* Debug Info for Super Admin Email */}
      {isSuperAdminEmail && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info for mycode103@gmail.com:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Email: {user?.email}</div>
            <div>Profile Role: {profile?.role || 'Not loaded'}</div>
            <div>Verification Status: {profile?.verification_status || 'Not loaded'}</div>
            <div>Profile Updated: {profile?.updated_at || 'Not loaded'}</div>
            <div>Is Super Admin Email: {isSuperAdminEmail ? 'Yes' : 'No'}</div>
          </div>
          <Button 
            onClick={handleRefreshProfile}
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Refresh Profile
          </Button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {currentText.welcome}, {displayName}!
            </h1>
            <p className="text-blue-100 mt-2">{roleConfig.description}</p>
            {isSuperAdminEmail && (
              <p className="text-yellow-200 text-sm mt-1">
                Super Admin Email Detected
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <RoleIcon className="h-8 w-8" />
            <Badge className={`${getRoleBadgeColor()} border-0`}>
              {userRole.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Role-specific Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusCircle className="h-5 w-5" />
                <span>{currentText.quickActions}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleConfig.actions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50"
                      onClick={() => {
                        if ('path' in action && action.path) {
                          const navState = ('tab' in action && action.tab) ? { state: { defaultTab: action.tab } } : {};
                          navigate(action.path, navState);
                        } else if (action.label.includes("Properties") || action.label.includes("Properti")) {
                          navigate('/dijual');
                        } else {
                          // Fallback for actions without a path, you might want to handle this.
                          // For now, we are navigating to admin for some of them.
                          if(action.label.includes("User Management")) navigate("/admin", { state: { defaultTab: 'users' } });
                          if(action.label.includes("System Settings")) navigate("/admin", { state: { defaultTab: 'system' } });
                          console.log(`Navigate to ${action.label}`);
                        }
                      }}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentText.yourRole}</CardTitle>
                <Button 
                  onClick={handleRefreshProfile}
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <RoleIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{roleConfig.title}</h3>
                  <p className="text-sm text-gray-600">{roleConfig.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{displayEmail}</span>
                </div>
                {profile?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.company_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span>{profile.company_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={profile?.verification_status === 'approved' ? 'default' : 'secondary'}>
                    {profile?.verification_status || 'pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{currentText.recentActivity}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Welcome to your dashboard! Start exploring the available features.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
