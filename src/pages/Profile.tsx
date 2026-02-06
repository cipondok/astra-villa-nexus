import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import RoleUpgradeSection from '@/components/profile/RoleUpgradeSection';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Settings, LogOut, Home, Edit2, Save, X, ArrowLeft, 
  Mail, Phone, Building2, MapPin, FileText, Shield, Crown,
  CheckCircle, Clock, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserMembership } from '@/hooks/useUserMembership';
import { MEMBERSHIP_LEVELS } from '@/types/membership';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { membershipLevel, verificationStatus } = useUserMembership();
  const levelConfig = MEMBERSHIP_LEVELS[membershipLevel];

  // Read initial tab from URL query param
  const initialTab = searchParams.get('tab') === 'roles' ? 'roles' : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    company_name: '',
    business_address: '',
  });

  const text = {
    en: {
      profile: 'Profile',
      roles: 'Roles',
      signIn: 'Sign In',
      signInPrompt: 'Sign in to view your profile',
      edit: 'Edit',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      signOut: 'Sign Out',
      settings: 'Settings',
      home: 'Home',
      email: 'Email',
      name: 'Full Name',
      phone: 'Phone',
      company: 'Company',
      address: 'Address',
      bio: 'Bio',
      membership: 'Membership',
      verification: 'Verification',
      notSet: 'Not set',
      verified: 'Verified',
      pending: 'Pending',
      editProfile: 'Edit Profile',
      viewMembership: 'View Membership',
    },
    id: {
      profile: 'Profil',
      roles: 'Role',
      signIn: 'Masuk',
      signInPrompt: 'Masuk untuk melihat profil Anda',
      edit: 'Edit',
      save: 'Simpan',
      saving: 'Menyimpan...',
      cancel: 'Batal',
      signOut: 'Keluar',
      settings: 'Pengaturan',
      home: 'Beranda',
      email: 'Email',
      name: 'Nama Lengkap',
      phone: 'Telepon',
      company: 'Perusahaan',
      address: 'Alamat',
      bio: 'Bio',
      membership: 'Keanggotaan',
      verification: 'Verifikasi',
      notSet: 'Belum diisi',
      verified: 'Terverifikasi',
      pending: 'Menunggu',
      editProfile: 'Edit Profil',
      viewMembership: 'Lihat Keanggotaan',
    }
  };

  const t = text[language];

  // Initialize form data when profile loads or edit mode starts
  React.useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        business_address: profile.business_address || '',
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
        return;
      }

      await refreshProfile();
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-sm border-border">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">{t.profile}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t.signInPrompt}</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              {t.signIn}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{t.profile}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t.signOut}
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-4 border-border overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20"></div>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="flex items-end gap-4 -mt-10">
              {/* Avatar */}
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="w-20 h-20 rounded-xl object-cover border-4 border-background shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-background shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                )}
                {verificationStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-lg font-bold truncate">{profile?.full_name || 'User'}</h2>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>

              {/* Membership Badge */}
              <Badge 
                className={cn(
                  "shrink-0 gap-1.5 py-1 px-2.5",
                  levelConfig.color,
                  levelConfig.bgColor,
                  levelConfig.borderColor
                )}
              >
                <Crown className="h-3.5 w-3.5" />
                {levelConfig.shortLabel}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button 
                onClick={() => navigate('/membership')}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground mb-0.5">{t.membership}</p>
                <p className={cn("text-sm font-semibold", levelConfig.color)}>
                  {levelConfig.shortLabel}
                </p>
              </button>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-0.5">{t.verification}</p>
                <p className={cn(
                  "text-sm font-semibold flex items-center gap-1",
                  verificationStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'
                )}>
                  {verificationStatus === 'verified' ? (
                    <><CheckCircle className="h-3.5 w-3.5" /> {t.verified}</>
                  ) : (
                    <><Clock className="h-3.5 w-3.5" /> {t.pending}</>
                  )}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('roles')}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground mb-0.5">{t.roles}</p>
                <p className="text-sm font-semibold text-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Upgrade
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-10 mb-4">
            <TabsTrigger value="profile" className="text-sm gap-1.5">
              <User className="h-4 w-4" />
              {t.profile}
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-sm gap-1.5">
              <Shield className="h-4 w-4" />
              {t.roles}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-0">
            <Card className="border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{t.editProfile}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 text-xs gap-1.5"
                  disabled={isSaving}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {t.edit}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <div className="space-y-3">
                    {/* Avatar Upload */}
                    <div className="pb-3 border-b border-border">
                      <AvatarUpload
                        userId={user.id}
                        currentAvatarUrl={profile?.avatar_url}
                        onAvatarUpdate={() => refreshProfile()}
                      />
                    </div>

                    <div className="grid gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-xs">{t.name}</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs">{t.phone}</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="company_name" className="text-xs">{t.company}</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="business_address" className="text-xs">{t.address}</Label>
                        <Input
                          id="business_address"
                          value={formData.business_address}
                          onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-xs">{t.bio}</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-9">
                        <Save className="h-4 w-4 mr-1.5" />
                        {isSaving ? t.saving : t.save}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 h-9">
                        <X className="h-4 w-4 mr-1.5" />
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <InfoRow icon={<Mail className="h-4 w-4" />} label={t.email} value={user.email} />
                    <InfoRow icon={<User className="h-4 w-4" />} label={t.name} value={profile?.full_name || t.notSet} />
                    <InfoRow icon={<Phone className="h-4 w-4" />} label={t.phone} value={profile?.phone || t.notSet} />
                    <InfoRow icon={<Building2 className="h-4 w-4" />} label={t.company} value={profile?.company_name || t.notSet} />
                    <InfoRow icon={<MapPin className="h-4 w-4" />} label={t.address} value={profile?.business_address || t.notSet} />
                    {profile?.bio && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">{t.bio}</p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 h-10 gap-2"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
                {t.settings}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-10 gap-2"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4" />
                {t.home}
              </Button>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="mt-0">
            <RoleUpgradeSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper component for info rows
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);

export default Profile;
