import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlert } from '@/contexts/AlertContext';
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
import ProfileAvatarWithBadge from '@/components/profile/ProfileAvatarWithBadge';
import ProfileCompletionStatus from '@/components/profile/ProfileCompletionStatus';
import ProfileLocationSelector from '@/components/profile/ProfileLocationSelector';
import { useProfileEditCooldown } from '@/hooks/useProfileEditCooldown';
import { useAccountNotifications } from '@/hooks/useAccountNotifications';
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

// Bio character limit
const BIO_MAX_LENGTH = 160;

const Profile = () => {
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { showSuccess, showError } = useAlert();
  const { membershipLevel, verificationStatus } = useUserMembership();
  const levelConfig = MEMBERSHIP_LEVELS[membershipLevel];
  
  // Profile edit cooldown hook
  const cooldown = useProfileEditCooldown();
  const { sendProfileUpdatedNotification } = useAccountNotifications();

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
  
  // Location selection state
  const [locationData, setLocationData] = useState({
    province_code: '',
    province_name: '',
    city_code: '',
    city_name: '',
    district_code: '',
    district_name: '',
    subdistrict_code: '',
    subdistrict_name: '',
    building_address: '',
  });
  const [originalLocationData, setOriginalLocationData] = useState({
    province_code: '',
    province_name: '',
    city_code: '',
    city_name: '',
    district_code: '',
    district_name: '',
    subdistrict_code: '',
    subdistrict_name: '',
    building_address: '',
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
      
      // Parse location data from business_address JSON if available
      const addressData = profile.business_address ? (() => {
        try {
          return JSON.parse(profile.business_address);
        } catch {
          return null;
        }
      })() : null;
      
      const locData = {
        province_code: addressData?.province_code || '',
        province_name: addressData?.province_name || '',
        city_code: addressData?.city_code || '',
        city_name: addressData?.city_name || '',
        district_code: addressData?.district_code || '',
        district_name: addressData?.district_name || '',
        subdistrict_code: addressData?.subdistrict_code || '',
        subdistrict_name: addressData?.subdistrict_name || '',
        building_address: addressData?.building_address || profile.business_address || '',
      };
      setLocationData(locData);
      setOriginalLocationData(locData);
    }
  }, [profile, isEditing]);

  // Identify which fields changed
  // Check if location data changed
  const hasLocationChanges = (): boolean => {
    return (
      locationData.province_code !== originalLocationData.province_code ||
      locationData.city_code !== originalLocationData.city_code ||
      locationData.district_code !== originalLocationData.district_code ||
      locationData.subdistrict_code !== originalLocationData.subdistrict_code ||
      locationData.building_address !== originalLocationData.building_address
    );
  };

  const getChangedFields = (): string[] => {
    const changedFields: string[] = [];
    if (formData.full_name !== originalData.full_name) changedFields.push('full_name');
    if (formData.phone !== originalData.phone) changedFields.push('phone');
    if (formData.company_name !== originalData.company_name) changedFields.push('company_name');
    if (formData.bio !== originalData.bio) changedFields.push('bio');
    if (hasLocationChanges()) changedFields.push('business_address');
    return changedFields;
  };

  // Check if restricted fields changed (name, phone - identity fields only)
  const hasRestrictedFieldChanges = (): boolean => {
    return (
      formData.full_name !== originalData.full_name ||
      formData.phone !== originalData.phone
    );
  };
  
  // Check if ONLY non-restricted fields changed (company, bio, address)
  const hasOnlyUnrestrictedChanges = (): boolean => {
    const restrictedChanged = hasRestrictedFieldChanges();
    const anyChange = getChangedFields().length > 0;
    return anyChange && !restrictedChanged;
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
      showError(
        language === 'en' ? "Profile Locked" : "Profil Terkunci",
        cooldown.message || (language === 'en' ? "You cannot edit your profile right now." : "Anda tidak dapat mengedit profil sekarang.")
      );
      return;
    }

    setIsSaving(true);
    try {
      // Build the address JSON from location data
      const addressJson = JSON.stringify({
        province_code: locationData.province_code,
        province_name: locationData.province_name,
        city_code: locationData.city_code,
        city_name: locationData.city_name,
        district_code: locationData.district_code,
        district_name: locationData.district_name,
        subdistrict_code: locationData.subdistrict_code,
        subdistrict_name: locationData.subdistrict_name,
        building_address: locationData.building_address,
      });

      const updateData = {
        ...formData,
        business_address: addressJson,
      };

      const { error } = await updateProfile(updateData);
      
      if (error) {
        showError(
          language === 'en' ? "Update Failed" : "Gagal Memperbarui",
          error.message || (language === 'en' ? "Failed to update profile" : "Gagal memperbarui profil")
        );
        return;
      }

      // Record restricted field changes for cooldown tracking (name & phone only)
      if (restrictedChanges) {
        const restrictedFields = changedFields.filter(f => 
          ['full_name', 'phone'].includes(f)
        );
        
        const result = await cooldown.recordProfileChange(restrictedFields);
        
        if (result.mustContactSupport) {
          showSuccess(
            language === 'en' ? "🎉 Profile Updated!" : "🎉 Profil Diperbarui!",
            language === 'en' 
              ? "This was your last allowed edit. Contact support for future changes."
              : "Ini adalah edit terakhir yang diizinkan. Hubungi support untuk perubahan selanjutnya."
          );
        } else if (result.cooldownDays) {
          showSuccess(
            language === 'en' ? "🎉 Congratulations!" : "🎉 Selamat!",
            language === 'en'
              ? `Profile updated successfully! Next edit available in ${result.cooldownDays} days.`
              : `Profil berhasil diperbarui! Edit selanjutnya tersedia dalam ${result.cooldownDays} hari.`
          );
        } else {
          showSuccess(
            language === 'en' ? "🎉 Congratulations!" : "🎉 Selamat!",
            language === 'en' ? "Your profile has been updated successfully!" : "Profil Anda berhasil diperbarui!"
          );
        }
      } else {
        showSuccess(
          language === 'en' ? "🎉 Congratulations!" : "🎉 Selamat!",
          language === 'en' ? "Your profile has been updated successfully!" : "Profil Anda berhasil diperbarui!"
        );
      }
      
      // Send in-app notification for profile update
      await sendProfileUpdatedNotification(changedFields);

      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      showError(
        language === 'en' ? "Update Failed" : "Gagal Memperbarui",
        error.message || (language === 'en' ? "Failed to update profile" : "Gagal memperbarui profil")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = () => {
    // Always allow editing - some fields are always editable
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
              {/* Avatar with TikTok/FB style badge */}
              <ProfileAvatarWithBadge
                avatarUrl={profile?.avatar_url}
                fullName={profile?.full_name}
                membershipLevel={membershipLevel}
                verificationStatus={verificationStatus}
                size="lg"
              />

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
                    className="h-8 text-xs gap-1.5"
                    disabled={isSaving || cooldown.loading}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {t.edit}
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
                      {/* Restricted Fields - Name & Phone (locked after save) */}
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-xs flex items-center gap-1.5">
                          {t.name}
                          {!cooldown.canEdit && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 text-destructive border-destructive/30">Locked</Badge>
                          )}
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
                          {!cooldown.canEdit && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 text-destructive border-destructive/30">Locked</Badge>
                          )}
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-9"
                          disabled={!cooldown.canEdit}
                        />
                      </div>
                      
                      {/* Unrestricted Fields - Always Editable */}
                      <div className="space-y-1.5">
                        <Label htmlFor="company_name" className="text-xs">
                          {t.company}
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      
                      {/* Company Verification Field */}
                      {formData.company_name && (
                        <CompanyVerificationField
                          companyName={formData.company_name}
                          registrationNumber={formData.company_registration_number}
                          isVerified={(profile as any)?.company_verified}
                          onRegistrationChange={(value) => setFormData({ ...formData, company_registration_number: value })}
                        />
                      )}
                      
                      {/* Location & Address Section */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <Label className="text-xs font-medium">{t.address}</Label>
                        </div>
                        <ProfileLocationSelector
                          selectedProvinceCode={locationData.province_code}
                          selectedCityCode={locationData.city_code}
                          selectedDistrictCode={locationData.district_code}
                          selectedSubdistrictCode={locationData.subdistrict_code}
                          buildingAddress={locationData.building_address}
                          onProvinceChange={(code, name) => setLocationData(prev => ({ ...prev, province_code: code, province_name: name }))}
                          onCityChange={(code, name) => setLocationData(prev => ({ ...prev, city_code: code, city_name: name }))}
                          onDistrictChange={(code, name) => setLocationData(prev => ({ ...prev, district_code: code, district_name: name }))}
                          onSubdistrictChange={(code, name) => setLocationData(prev => ({ ...prev, subdistrict_code: code, subdistrict_name: name }))}
                          onBuildingAddressChange={(address) => setLocationData(prev => ({ ...prev, building_address: address }))}
                          language={language}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bio" className="text-xs">{t.bio}</Label>
                          <span className={cn(
                            "text-[10px]",
                            formData.bio.length > BIO_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {formData.bio.length}/{BIO_MAX_LENGTH}
                          </span>
                        </div>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => {
                            if (e.target.value.length <= BIO_MAX_LENGTH) {
                              setFormData({ ...formData, bio: e.target.value });
                            }
                          }}
                          placeholder={language === 'en' ? "Write a short bio about yourself..." : "Tulis bio singkat tentang diri Anda..."}
                          rows={2}
                          maxLength={BIO_MAX_LENGTH}
                          className="resize-none text-sm"
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

            {/* Profile Completion Status */}
            <ProfileCompletionStatus
              profile={profile}
              membershipLevel={membershipLevel}
              verificationStatus={verificationStatus}
              language={language}
            />

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
