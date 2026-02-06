import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Save, Crown, Sparkles, Shield, ChevronRight, Lock, Info, MapPin, Camera } from 'lucide-react';
import { useUserMembership } from '@/hooks/useUserMembership';
import { useVIPLimits } from '@/hooks/useVIPLimits';
import { UserMembershipBadge, VerificationBadge } from '@/components/user/UserMembershipBadge';
import { MEMBERSHIP_LEVELS } from '@/types/membership';
import { Progress } from '@/components/ui/progress';
import { useProfileEditCooldown } from '@/hooks/useProfileEditCooldown';
import ProfileEditLockBanner from '@/components/profile/ProfileEditLockBanner';
import ProfileLocationSelector from '@/components/profile/ProfileLocationSelector';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Location data interface
interface LocationData {
  province_code: string;
  province_name: string;
  city_code: string;
  city_name: string;
  district_code: string;
  district_name: string;
  subdistrict_code: string;
  subdistrict_name: string;
  building_address: string;
}

// Sensitive fields that trigger cooldown
const SENSITIVE_FIELDS = ['full_name', 'phone', 'company_name'];

const ProfileEditPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Cooldown hook
  const {
    canEdit,
    changeCount,
    daysRemaining,
    lockedUntil,
    changesRemaining,
    nextCooldownDays,
    mustContactSupport,
    loading: cooldownLoading,
    recordProfileChange,
  } = useProfileEditCooldown();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    years_experience: '',
    specializations: '',
    bio: ''
  });

  // Location state
  const [locationData, setLocationData] = useState<LocationData>({
    province_code: '',
    province_name: '',
    city_code: '',
    city_name: '',
    district_code: '',
    district_name: '',
    subdistrict_code: '',
    subdistrict_name: '',
    building_address: ''
  });

  // Track original values to detect changes
  const [originalData, setOriginalData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
  });

  // Parse location data from JSON string
  const parseLocationData = (addressStr: string): LocationData => {
    try {
      if (addressStr && addressStr.startsWith('{')) {
        return JSON.parse(addressStr);
      }
    } catch (e) {
      console.error('Error parsing location data:', e);
    }
    return {
      province_code: '',
      province_name: '',
      city_code: '',
      city_name: '',
      district_code: '',
      district_name: '',
      subdistrict_code: '',
      subdistrict_name: '',
      building_address: addressStr || ''
    };
  };

  useEffect(() => {
    if (profile) {
      const data = {
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
        years_experience: profile.years_experience?.toString() || '',
        specializations: Array.isArray(profile.specializations) 
          ? profile.specializations.join(', ') 
          : profile.specializations || '',
        bio: profile.bio || ''
      };
      setFormData(data);
      setOriginalData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
      });
      
      // Parse location data
      const parsedLocation = parseLocationData(profile.business_address || '');
      setLocationData(parsedLocation);
    }
  }, [profile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      navigate('/?auth=true');
    }
  }, [user, navigate]);

  // Check which sensitive fields have been changed
  const changedSensitiveFields = useMemo(() => {
    const changed: string[] = [];
    SENSITIVE_FIELDS.forEach(field => {
      if (formData[field as keyof typeof formData] !== originalData[field as keyof typeof originalData]) {
        changed.push(field);
      }
    });
    return changed;
  }, [formData, originalData]);

  const hasSensitiveChanges = changedSensitiveFields.length > 0;

  const handleSave = async () => {
    if (!user) return;

    // Check if trying to change sensitive fields while locked
    if (!canEdit && hasSensitiveChanges) {
      toast({
        title: "Editing Locked",
        description: `Name, phone & company are locked for ${daysRemaining} more days. Only address and bio can be edited.`,
        variant: "destructive"
      });
      return;
    }

    // Check if must contact support
    if (mustContactSupport && hasSensitiveChanges) {
      toast({
        title: "Maximum Changes Reached",
        description: "Please contact customer support to change identity fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Serialize location data to JSON
      const serializedAddress = JSON.stringify(locationData);
      
      // Build update data - only include sensitive fields if allowed
      const updateData: Record<string, any> = {
        business_address: serializedAddress,
        years_experience: formData.years_experience,
        specializations: formData.specializations,
        bio: formData.bio
      };

      // Only include sensitive fields if they can be edited
      if (canEdit && !mustContactSupport) {
        updateData.full_name = formData.full_name;
        updateData.phone = formData.phone;
        updateData.company_name = formData.company_name;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Record the change if sensitive fields were modified
      if (hasSensitiveChanges && canEdit && !mustContactSupport) {
        const result = await recordProfileChange(changedSensitiveFields);
        
        if (result.success) {
          if (result.lockedUntil) {
            toast({
              title: "Profile Updated",
              description: `Changes saved. Identity fields are now locked for ${result.cooldownDays} days.`,
            });
          } else {
            toast({
              title: "Success",
              description: "Profile updated successfully"
            });
          }
        }
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }

      await refreshProfile();
      
      // Navigate back to profile
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSupport = () => {
    navigate('/help');
  };

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if a specific field is locked
  const isFieldLocked = (fieldName: string) => {
    if (!SENSITIVE_FIELDS.includes(fieldName)) return false;
    return !canEdit || mustContactSupport;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your personal information
            </p>
          </div>
        </div>

        {/* VIP Membership Card */}
        <VIPMembershipCard />

        {/* Cooldown Lock Banner */}
        {!cooldownLoading && (
          <ProfileEditLockBanner
            canEdit={canEdit}
            changeCount={changeCount}
            daysRemaining={daysRemaining}
            lockedUntil={lockedUntil}
            changesRemaining={changesRemaining}
            nextCooldownDays={nextCooldownDays}
            mustContactSupport={mustContactSupport}
            onContactSupport={handleContactSupport}
            className="mb-4"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Manage your account details and professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center pb-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <Camera className="h-3 w-3" />
                <span>Profile Photo</span>
              </div>
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={profile?.avatar_url}
                onAvatarUpdate={(url) => {
                  refreshProfile();
                }}
                userEmail={user.email}
                userPhone={formData.phone || profile?.phone}
              />
            </div>

            {/* Sensitive Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isFieldLocked('full_name') ? (
                  <>
                    <Lock className="h-3 w-3" />
                    <span>Identity fields (locked)</span>
                  </>
                ) : (
                  <>
                    <Info className="h-3 w-3 text-primary" />
                    <span>Identity fields (30-day lock after change)</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="flex items-center gap-1.5 text-xs">
                    Full Name
                    {isFieldLocked('full_name') && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        <Lock className="h-2.5 w-2.5 mr-0.5" />
                        Locked
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isFieldLocked('full_name')}
                    className={cn(
                      "h-9 text-sm",
                      isFieldLocked('full_name') && "bg-muted cursor-not-allowed opacity-60"
                    )}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
                    Phone Number
                    {isFieldLocked('phone') && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        <Lock className="h-2.5 w-2.5 mr-0.5" />
                        Locked
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={isFieldLocked('phone')}
                    className={cn(
                      "h-9 text-sm",
                      isFieldLocked('phone') && "bg-muted cursor-not-allowed opacity-60"
                    )}
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="company_name" className="flex items-center gap-1.5 text-xs">
                    Company Name
                    {isFieldLocked('company_name') && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        <Lock className="h-2.5 w-2.5 mr-0.5" />
                        Locked
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value.toUpperCase())}
                    placeholder="Enter your company name"
                    disabled={isFieldLocked('company_name')}
                    className={cn(
                      "h-9 text-sm uppercase",
                      isFieldLocked('company_name') && "bg-muted cursor-not-allowed opacity-60"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-border" />

            {/* Freely Editable Fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Always editable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="years_experience" className="text-xs">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', e.target.value)}
                    placeholder="Enter years of experience"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="specializations" className="text-xs">Specializations</Label>
                  <Input
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => handleInputChange('specializations', e.target.value)}
                    placeholder="E.g. Apartments, Commercial"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </Label>
                <ProfileLocationSelector
                  selectedProvinceCode={locationData.province_code}
                  selectedCityCode={locationData.city_code}
                  selectedDistrictCode={locationData.district_code}
                  selectedSubdistrictCode={locationData.subdistrict_code}
                  buildingAddress={locationData.building_address}
                  onProvinceChange={(code, name) => setLocationData(prev => ({ 
                    ...prev, 
                    province_code: code, 
                    province_name: name,
                    city_code: '',
                    city_name: '',
                    district_code: '',
                    district_name: '',
                    subdistrict_code: '',
                    subdistrict_name: ''
                  }))}
                  onCityChange={(code, name) => setLocationData(prev => ({ 
                    ...prev, 
                    city_code: code, 
                    city_name: name,
                    district_code: '',
                    district_name: '',
                    subdistrict_code: '',
                    subdistrict_name: ''
                  }))}
                  onDistrictChange={(code, name) => setLocationData(prev => ({ 
                    ...prev, 
                    district_code: code, 
                    district_name: name,
                    subdistrict_code: '',
                    subdistrict_name: ''
                  }))}
                  onSubdistrictChange={(code, name) => setLocationData(prev => ({ 
                    ...prev, 
                    subdistrict_code: code, 
                    subdistrict_name: name 
                  }))}
                  onBuildingAddressChange={(address) => setLocationData(prev => ({ 
                    ...prev, 
                    building_address: address 
                  }))}
                  language="id"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs">
                  Bio <span className="text-muted-foreground">({formData.bio.length}/160)</span>
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 160))}
                  placeholder="Tell us about yourself"
                  rows={3}
                  maxLength={160}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || cooldownLoading}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// VIP Membership Card Component
const VIPMembershipCard: React.FC = () => {
  const navigate = useNavigate();
  const { membershipLevel, verificationStatus, userLevelName, isLoading } = useUserMembership();
  const { 
    currentProperties, 
    maxProperties, 
    currentListings, 
    maxListings,
    canFeatureListings,
    prioritySupport
  } = useVIPLimits();

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = MEMBERSHIP_LEVELS[membershipLevel];
  const isHighTier = ['gold', 'platinum', 'diamond'].includes(membershipLevel);
  const propertiesPercent = maxProperties > 0 ? (currentProperties / maxProperties) * 100 : 0;
  const listingsPercent = maxListings > 0 ? (currentListings / maxListings) * 100 : 0;

  return (
    <Card className={`mb-4 overflow-hidden ${isHighTier ? config.borderColor : ''}`}>
      {isHighTier && (
        <div className={`h-1 ${config.bgColor}`} />
      )}
      <CardHeader className={`py-3 ${isHighTier ? config.bgColor : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${config.bgColor}`}>
              <Crown className={`h-4 w-4 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-sm flex items-center gap-1.5">
                Membership
                {isHighTier && <Sparkles className="h-3 w-3 text-yellow-500" />}
              </CardTitle>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/membership')}
            className="h-7 text-xs"
          >
            Upgrade
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Membership Level & Verification */}
        <div className="flex items-center gap-2 flex-wrap">
          <UserMembershipBadge 
            membershipLevel={membershipLevel}
            size="sm"
            variant="badge"
            showLabel={true}
            showIcon={true}
          />
          <VerificationBadge status={verificationStatus as any} size="sm" />
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Properties</span>
              <span className="font-medium">{currentProperties}/{maxProperties}</span>
            </div>
            <Progress value={propertiesPercent} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Listings</span>
              <span className="font-medium">{currentListings}/{maxListings}</span>
            </div>
            <Progress value={listingsPercent} className="h-1.5" />
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {canFeatureListings && (
            <div className="flex items-center gap-1 text-[9px] bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
              <Sparkles className="h-2.5 w-2.5" />
              Featured
            </div>
          )}
          {prioritySupport && (
            <div className="flex items-center gap-1 text-[9px] bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">
              <Shield className="h-2.5 w-2.5" />
              Priority
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditPage;
