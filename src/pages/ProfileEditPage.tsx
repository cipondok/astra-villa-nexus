import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Save, Crown, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { useUserMembership } from '@/hooks/useUserMembership';
import { useVIPLimits } from '@/hooks/useVIPLimits';
import { UserMembershipBadge, VerificationBadge } from '@/components/user/UserMembershipBadge';
import { MEMBERSHIP_LEVELS } from '@/types/membership';
import { Progress } from '@/components/ui/progress';

const ProfileEditPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    business_address: '',
    years_experience: '',
    specializations: '',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
        business_address: profile.business_address || '',
        years_experience: profile.years_experience?.toString() || '',
        specializations: Array.isArray(profile.specializations) 
          ? profile.specializations.join(', ') 
          : profile.specializations || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name,
        business_address: formData.business_address,
        years_experience: formData.years_experience,
        specializations: formData.specializations,
        bio: formData.bio
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      // Navigate back to appropriate dashboard
      switch (profile?.role) {
        case 'vendor':
          navigate('/vendor');
          break;
        case 'agent':
          navigate('/agent-dashboard');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'customer_service':
          navigate('/dashboard/customer-service');
          break;
        default:
          navigate('/dashboard/user');
      }
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

  if (!user) {
    navigate('/?auth=true');
    return null;
  }

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Update your personal information and preferences
            </p>
          </div>
        </div>

        {/* VIP Membership Card */}
        <VIPMembershipCard />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', e.target.value)}
                  placeholder="Enter years of experience"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">Address</Label>
              <Textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => handleInputChange('business_address', e.target.value)}
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                value={formData.specializations}
                onChange={(e) => handleInputChange('specializations', e.target.value)}
                placeholder="Enter specializations (comma separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
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
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
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
    <Card className={`mb-6 overflow-hidden ${isHighTier ? config.borderColor : ''}`}>
      {isHighTier && (
        <div className={`h-1 ${config.bgColor}`} />
      )}
      <CardHeader className={isHighTier ? config.bgColor : ''}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Crown className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Membership Status
                {isHighTier && <Sparkles className="h-4 w-4 text-yellow-500" />}
              </CardTitle>
              <CardDescription>Your current membership level and benefits</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/membership')}
            className="shrink-0"
          >
            Upgrade
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Membership Level & Verification */}
        <div className="flex items-center gap-4 flex-wrap">
          <UserMembershipBadge 
            membershipLevel={membershipLevel}
            size="md"
            variant="badge"
            showLabel={true}
            showIcon={true}
          />
          <VerificationBadge status={verificationStatus as any} size="sm" />
          {userLevelName && (
            <span className="text-sm text-muted-foreground">
              Level: {userLevelName}
            </span>
          )}
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Properties</span>
              <span className="font-medium">{currentProperties} / {maxProperties}</span>
            </div>
            <Progress value={propertiesPercent} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Listings</span>
              <span className="font-medium">{currentListings} / {maxListings}</span>
            </div>
            <Progress value={listingsPercent} className="h-2" />
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {canFeatureListings && (
            <div className="flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
              <Sparkles className="h-3 w-3" />
              Featured Listings
            </div>
          )}
          {prioritySupport && (
            <div className="flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
              <Shield className="h-3 w-3" />
              Priority Support
            </div>
          )}
          {verificationStatus === 'verified' && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
              <Shield className="h-3 w-3" />
              Verified Account
            </div>
          )}
        </div>

        {/* Benefits List */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Your Benefits:</p>
          <div className="flex flex-wrap gap-1">
            {config.benefits.map((benefit, index) => (
              <span 
                key={index}
                className="text-xs bg-muted px-2 py-0.5 rounded"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditPage;