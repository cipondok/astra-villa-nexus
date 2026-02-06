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
import ProfileEditLockBanner from '@/components/profile/ProfileEditLockBanner';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import CompanyVerificationField from '@/components/profile/CompanyVerificationField';
import { useProfileEditCooldown } from '@/hooks/useProfileEditCooldown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Settings, LogOut, Home, Edit2, Save, X, ArrowLeft, 
  Mail, Phone, Building2, MapPin, FileText, Shield, Crown,
  CheckCircle, Clock, Sparkles, AlertCircle
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
  
  // Profile edit cooldown hook
  const cooldown = useProfileEditCooldown();

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
    company_registration_number: '',
  });
  const [originalData, setOriginalData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    company_name: '',
    business_address: '',
    company_registration_number: '',
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
      locked: 'Locked',
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
      locked: 'Terkunci',
    }
  };

  const t = text[language];

  // Initialize form data when profile loads or edit mode starts
  React.useEffect(() => {
    if (profile && isEditing) {
      const data = {
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        business_address: profile.business_address || '',
        company_registration_number: (profile as any).company_registration_number || '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [profile, isEditing]);

  // Identify which fields changed
  const getChangedFields = (): string[] => {
    const changedFields: string[] = [];
    if (formData.full_name !== originalData.full_name) changedFields.push('full_name');
    if (formData.phone !== originalData.phone) changedFields.push('phone');
    if (formData.company_name !== originalData.company_name) changedFields.push('company_name');
    if (formData.bio !== originalData.bio) changedFields.push('bio');
    if (formData.business_address !== originalData.business_address) changedFields.push('business_address');
    return changedFields;
  };

  // Check if restricted fields changed (name, phone, company)
  const hasRestrictedFieldChanges = (): boolean => {
    return (
      formData.full_name !== originalData.full_name ||
      formData.phone !== originalData.phone ||
      formData.company_name !== originalData.company_name
    );
  };

  const handleSave = async () => {
    const changedFields = getChangedFields();
    
    // If no changes, just close edit mode
    if (changedFields.length === 0) {
      setIsEditing(false);
      return;
    }

    // Check if restricted fields are being changed
    const restrictedChanges = hasRestrictedFieldChanges();
    
    // If restricted fields changed and cooldown applies, record the change
    if (restrictedChanges && !cooldown.canEdit) {
      toast({
        title: "Profile Locked",
        description: cooldown.message || "You cannot edit your profile right now.",
        variant: "destructive",
      });
      return;
    }

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

      // Record restricted field changes for cooldown tracking
      if (restrictedChanges) {
        const restrictedFields = changedFields.filter(f => 
          ['full_name', 'phone', 'company_name'].includes(f)
        );
        
        const result = await cooldown.recordProfileChange(restrictedFields);
        
        if (result.mustContactSupport) {
          toast({
            title: "Profile Updated",
            description: "This was your last allowed edit. Contact support for future changes.",
            variant: "default",
          });
        } else if (result.cooldownDays) {
          toast({
            title: "Profile Updated",
            description: `Next edit available in ${result.cooldownDays} days.`,
          });
        } else {
          toast({
            title: "Success",
            description: "Profile updated successfully",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }

      await refreshProfile();
      setIsEditing(false);
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

  const handleStartEdit = () => {
    if (!cooldown.canEdit && cooldown.changeCount >= 3) {
      toast({
        title: "Editing Locked",
        description: "Maximum profile changes reached. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleContactSupport = () => {
    navigate('/support?subject=Profile Change Request');
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
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
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
                  verificationStatus === 'verified' ? 'text-primary' : 'text-muted-foreground'
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
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                    className={cn(
                      "h-8 text-xs gap-1.5",
                      !cooldown.canEdit && cooldown.mustContactSupport && "opacity-50"
                    )}
                    disabled={isSaving || cooldown.loading}
                  >
                    {cooldown.canEdit ? (
                      <>
                        <Edit2 className="h-3.5 w-3.5" />
                        {t.edit}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" />
                        {t.locked}
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Cooldown Banner */}
                {!cooldown.loading && (
                  <ProfileEditLockBanner
                    canEdit={cooldown.canEdit}
                    changeCount={cooldown.changeCount}
                    daysRemaining={cooldown.daysRemaining}
                    lockedUntil={cooldown.lockedUntil}
                    changesRemaining={cooldown.changesRemaining}
                    nextCooldownDays={cooldown.nextCooldownDays}
                    mustContactSupport={cooldown.mustContactSupport}
                    onContactSupport={handleContactSupport}
                  />
                )}

                {isEditing ? (
                  <div className="space-y-3">
                    {/* Avatar Upload */}
                    <div className="pb-3 border-b border-border">
                      <AvatarUpload
                        userId={user.id}
                        currentAvatarUrl={profile?.avatar_url}
                        onAvatarUpdate={() => refreshProfile()}
                        userEmail={user.email}
                        userPhone={profile?.phone}
                      />
                    </div>

                    <div className="grid gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-xs flex items-center gap-1.5">
                          {t.name}
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">Tracked</Badge>
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="h-9"
                          disabled={!cooldown.canEdit}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs flex items-center gap-1.5">
                          {t.phone}
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">Tracked</Badge>
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-9"
                          disabled={!cooldown.canEdit}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="company_name" className="text-xs flex items-center gap-1.5">
                          {t.company}
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">Tracked</Badge>
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="h-9"
                          disabled={!cooldown.canEdit}
                        />
                      </div>
                      
                      {/* Company Verification Field */}
                      {formData.company_name && (
                        <CompanyVerificationField
                          companyName={formData.company_name}
                          registrationNumber={formData.company_registration_number}
                          isVerified={(profile as any)?.company_verified}
                          onRegistrationChange={(value) => setFormData({ ...formData, company_registration_number: value })}
                          disabled={!cooldown.canEdit}
                        />
                      )}
                      
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
                  <ProfileInfoCard
                    email={user.email || ''}
                    fullName={profile?.full_name}
                    phone={profile?.phone}
                    companyName={profile?.company_name}
                    businessAddress={profile?.business_address}
                    bio={profile?.bio}
                    notSetText={t.notSet}
                    labels={{
                      email: t.email,
                      name: t.name,
                      phone: t.phone,
                      company: t.company,
                      address: t.address,
                      bio: t.bio,
                    }}
                  />
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

export default Profile;
