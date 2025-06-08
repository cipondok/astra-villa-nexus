
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
  Crown
} from "lucide-react";

interface RoleDashboardProps {
  language: "en" | "id";
}

const RoleDashboard = ({ language }: RoleDashboardProps) => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // Redirect agents to their dedicated dashboard
  useEffect(() => {
    if (profile?.role === 'agent') {
      navigate('/dashboard/agent');
    }
  }, [profile?.role, navigate]);

  const text = {
    en: {
      welcome: "Welcome",
      yourRole: "Your Role",
      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
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
          { label: "User Management", icon: Users },
          { label: "System Analytics", icon: BarChart3 },
          { label: "Verification Requests", icon: UserCheck },
          { label: "System Settings", icon: Settings }
        ]
      }
    },
    id: {
      welcome: "Selamat Datang",
      yourRole: "Peran Anda",
      quickActions: "Aksi Cepat",
      recentActivity: "Aktivitas Terbaru",
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
          { label: "Manajemen Pengguna", icon: Users },
          { label: "Analitik Sistem", icon: BarChart3 },
          { label: "Permintaan Verifikasi", icon: UserCheck },
          { label: "Pengaturan Sistem", icon: Settings }
        ]
      }
    }
  };

  const currentText = text[language];

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getRoleConfig = () => {
    switch (profile.role) {
      case 'property_owner':
        return currentText.propertyOwner;
      case 'agent':
        return currentText.agent;
      case 'vendor':
        return currentText.vendor;
      case 'admin':
        return currentText.admin;
      case 'general_user':
      default:
        return currentText.generalUser;
    }
  };

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'property_owner':
        return Building;
      case 'agent':
        return Users;
      case 'vendor':
        return Wrench;
      case 'admin':
        return Crown;
      case 'general_user':
      default:
        return Home;
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = getRoleIcon();

  const getRoleBadgeColor = () => {
    switch (profile.role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {currentText.welcome}, {profile.full_name || user?.email}!
            </h1>
            <p className="text-blue-100 mt-2">{roleConfig.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <RoleIcon className="h-8 w-8" />
            <Badge className={`${getRoleBadgeColor()} border-0`}>
              {profile.role.replace('_', ' ').toUpperCase()}
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
                        // Handle navigation based on action
                        if (action.label.includes("Properties") || action.label.includes("Properti")) {
                          navigate('/properties');
                        } else {
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
              <CardTitle>{currentText.yourRole}</CardTitle>
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
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.company_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span>{profile.company_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}>
                    {profile.verification_status}
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
              <p className="text-sm text-gray-600">No recent activity to display.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
