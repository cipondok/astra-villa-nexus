import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Bell, Shield, LogOut } from "lucide-react";

interface UserDashboardProps {
  language: "en" | "id";
}

const UserDashboard = ({ language }: UserDashboardProps) => {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    company_name: profile?.company_name || ""
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome to Astra Villa", message: "Your account has been created successfully!", read: false, date: new Date() },
    { id: 2, title: "Profile Update", message: "Please complete your profile for better experience.", read: false, date: new Date() }
  ]);

  const text = {
    en: {
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      notifications: "Notifications",
      security: "Security",
      welcome: "Welcome back",
      accountInfo: "Account Information",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      company: "Company Name",
      role: "Role",
      status: "Status",
      memberSince: "Member Since",
      edit: "Edit",
      save: "Save Changes",
      cancel: "Cancel",
      updating: "Updating...",
      notificationSettings: "Notification Settings",
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      securitySettings: "Security Settings",
      changePassword: "Change Password",
      twoFactor: "Two-Factor Authentication",
      signOut: "Sign Out",
      markAllRead: "Mark All Read",
      noNotifications: "No notifications",
      unread: "Unread",
      generalUser: "General User",
      propertyOwner: "Property Owner",
      agent: "Agent",
      vendor: "Vendor",
      admin: "Administrator",
      verified: "Verified",
      pending: "Pending",
      rejected: "Rejected"
    },
    id: {
      dashboard: "Dashboard",
      profile: "Profil",
      settings: "Pengaturan",
      notifications: "Notifikasi",
      security: "Keamanan",
      welcome: "Selamat datang kembali",
      accountInfo: "Informasi Akun",
      personalInfo: "Informasi Pribadi",
      fullName: "Nama Lengkap",
      email: "Alamat Email",
      phone: "Nomor Telepon",
      company: "Nama Perusahaan",
      role: "Peran",
      status: "Status",
      memberSince: "Anggota Sejak",
      edit: "Edit",
      save: "Simpan Perubahan",
      cancel: "Batal",
      updating: "Memperbarui...",
      notificationSettings: "Pengaturan Notifikasi",
      emailNotifications: "Notifikasi Email",
      pushNotifications: "Notifikasi Push",
      securitySettings: "Pengaturan Keamanan",
      changePassword: "Ubah Kata Sandi",
      twoFactor: "Autentikasi Dua Faktor",
      signOut: "Keluar",
      markAllRead: "Tandai Semua Dibaca",
      noNotifications: "Tidak ada notifikasi",
      unread: "Belum dibaca",
      generalUser: "Pengguna Umum",
      propertyOwner: "Pemilik Properti",
      agent: "Agen",
      vendor: "Vendor",
      admin: "Administrator",
      verified: "Terverifikasi",
      pending: "Menunggu",
      rejected: "Ditolak"
    }
  };

  const currentText = text[language];

  const getRoleText = (role: string) => {
    const roleMap = {
      general_user: currentText.generalUser,
      property_owner: currentText.propertyOwner,
      agent: currentText.agent,
      vendor: currentText.vendor,
      admin: currentText.admin
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      verified: currentText.verified,
      pending: currentText.pending,
      rejected: currentText.rejected
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      company_name: profile?.company_name || ""
    });
    setEditMode(false);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get creation date from user or fallback to current date
  const getCreationDate = () => {
    if (profile?.created_at) {
      return new Date(profile.created_at);
    }
    if (user?.created_at) {
      return new Date(user.created_at);
    }
    return new Date(); // Fallback to current date
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentText.welcome}, {profile.full_name || user.email}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {currentText.memberSince} {formatDate(getCreationDate())}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-lg font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{currentText.profile}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>{currentText.notifications}</span>
              {notifications.some(n => !n.read) && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>{currentText.settings}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{currentText.security}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentText.accountInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{currentText.email}</Label>
                    <Input value={user.email || ""} disabled />
                  </div>
                  <div>
                    <Label>{currentText.role}</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{getRoleText(profile.role)}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>{currentText.status}</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusVariant(profile.verification_status || 'pending')}>
                        {getStatusText(profile.verification_status || 'pending')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{currentText.personalInfo}</CardTitle>
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} variant="outline">
                    {currentText.edit}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? currentText.updating : currentText.save}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      {currentText.cancel}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">{currentText.fullName}</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{currentText.phone}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="company">{currentText.company}</Label>
                    <Input
                      id="company"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{currentText.notifications}</CardTitle>
                {notifications.some(n => !n.read) && (
                  <Button onClick={markAllNotificationsRead} variant="outline">
                    {currentText.markAllRead}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{currentText.noNotifications}</p>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <Alert key={notification.id} className={!notification.read ? "border-blue-200 bg-blue-50" : ""}>
                        <Bell className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{formatDate(notification.date)}</p>
                            </div>
                            {!notification.read && (
                              <Badge variant="secondary" className="ml-2">
                                {currentText.unread}
                              </Badge>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentText.notificationSettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{currentText.emailNotifications}</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{currentText.pushNotifications}</Label>
                    <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentText.securitySettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{currentText.changePassword}</Label>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{currentText.twoFactor}</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                <hr className="my-6" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-red-600">{currentText.signOut}</Label>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                  <Button onClick={signOut} variant="destructive" className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>{currentText.signOut}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
