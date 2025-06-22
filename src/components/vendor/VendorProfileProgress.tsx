
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Building, 
  FileText, 
  Award
} from 'lucide-react';

interface ProfileSection {
  name: string;
  completed: boolean;
  weight: number;
  icon: React.ReactNode;
}

const VendorProfileProgress = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [profileData, setProfileData] = useState<any>(null);
  const [sections, setSections] = useState<ProfileSection[]>([]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data: businessProfile, error: businessError } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user?.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') throw businessError;

      setProfileData({ profile, businessProfile });
      calculateProgress(profile, businessProfile);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const calculateProgress = (profile: any, businessProfile: any) => {
    const profileSections: ProfileSection[] = [
      {
        name: 'Basic Information',
        completed: !!(profile?.full_name && profile?.email && profile?.phone),
        weight: 20,
        icon: <User className="h-4 w-4" />
      },
      {
        name: 'Business Details',
        completed: !!(businessProfile?.business_name && businessProfile?.business_type && businessProfile?.business_description),
        weight: 25,
        icon: <Building className="h-4 w-4" />
      },
      {
        name: 'Contact Information',
        completed: !!(businessProfile?.business_phone && businessProfile?.business_email && businessProfile?.business_address),
        weight: 20,
        icon: <FileText className="h-4 w-4" />
      },
      {
        name: 'Business Hours',
        completed: !!(businessProfile?.business_hours && Object.keys(businessProfile.business_hours).length > 0),
        weight: 15,
        icon: <Clock className="h-4 w-4" />
      },
      {
        name: 'Service Areas',
        completed: !!(businessProfile?.service_areas && Array.isArray(businessProfile.service_areas) && businessProfile.service_areas.length > 0),
        weight: 20,
        icon: <Award className="h-4 w-4" />
      }
    ];

    setSections(profileSections);

    // Calculate overall completion
    const totalWeight = profileSections.reduce((sum, section) => sum + section.weight, 0);
    const completedWeight = profileSections
      .filter(section => section.completed)
      .reduce((sum, section) => sum + section.weight, 0);
    
    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

    // Update completion percentage in user activity logs
    updateCompletionPercentage(completionPercentage);
  };

  const updateCompletionPercentage = async (percentage: number) => {
    try {
      // Log the completion percentage update
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user?.id,
          activity_type: 'profile_completion_update',
          description: `Profile completion updated to ${percentage}%`
        });

      if (error) throw error;

      // Also update the vendor business profile with completion percentage
      if (profileData?.businessProfile) {
        const { error: updateError } = await supabase
          .from('vendor_business_profiles')
          .update({ profile_completion_percentage: percentage })
          .eq('vendor_id', user?.id);

        if (updateError) console.error('Error updating profile completion:', updateError);
      }
    } catch (error) {
      console.error('Error updating completion percentage:', error);
    }
  };

  const completedSections = sections.filter(section => section.completed).length;
  const totalSections = sections.length;
  const overallProgress = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completion Progress
          </CardTitle>
          <CardDescription>
            Complete your profile to unlock all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <div className="text-sm text-muted-foreground">
                  {completedSections} of {totalSections} sections completed
                </div>
              </div>
            </div>
            
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Sections</CardTitle>
          <CardDescription>
            Complete each section to improve your profile score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Weight: {section.weight}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.completed ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {overallProgress < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Complete these sections to reach 100% profile completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections
                .filter(section => !section.completed)
                .map((section, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Complete
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorProfileProgress;
