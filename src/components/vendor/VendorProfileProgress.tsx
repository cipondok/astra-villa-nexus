
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
  Award,
  Hash,
  TrendingUp,
  Settings,
  Eye
} from 'lucide-react';

interface ProfileSection {
  name: string;
  completed: boolean;
  weight: number;
  icon: React.ReactNode;
}

const VendorProfileProgress = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [profileData, setProfileData] = useState<any>(null);
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [userLevel, setUserLevel] = useState<string>('Beginner');
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

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
    setCompletionPercentage(completionPercentage);

    // Determine user level based on completion
    if (completionPercentage >= 90) {
      setUserLevel('Expert');
    } else if (completionPercentage >= 70) {
      setUserLevel('Advanced');
    } else if (completionPercentage >= 50) {
      setUserLevel('Intermediate');
    } else if (completionPercentage >= 25) {
      setUserLevel('Beginner');
    } else {
      setUserLevel('Newcomer');
    }

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

  const formatUserIdHash = (userId: string) => {
    if (!userId) return 'No ID';
    return `#${userId.slice(0, 8).toUpperCase()}`;
  };

  const getNextLevel = () => {
    switch (userLevel) {
      case 'Newcomer': return 'Beginner';
      case 'Beginner': return 'Intermediate';
      case 'Intermediate': return 'Advanced';
      case 'Advanced': return 'Expert';
      case 'Expert': return 'Master';
      default: return 'Next Level';
    }
  };

  const getProgressToNextLevel = () => {
    const currentPercentage = completionPercentage;
    switch (userLevel) {
      case 'Newcomer': return Math.max(0, 25 - currentPercentage);
      case 'Beginner': return Math.max(0, 50 - currentPercentage);
      case 'Intermediate': return Math.max(0, 70 - currentPercentage);
      case 'Advanced': return Math.max(0, 90 - currentPercentage);
      case 'Expert': return 0;
      default: return 0;
    }
  };

  const completedSections = sections.filter(section => section.completed).length;
  const totalSections = sections.length;

  return (
    <div className="space-y-6">
      {/* User Level & ID Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Vendor Profile</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {formatUserIdHash(user?.id || '')}
                  </span>
                </div>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`px-3 py-1 text-sm font-medium ${
                userLevel === 'Expert' ? 'bg-green-100 text-green-800 border-green-300' :
                userLevel === 'Advanced' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                userLevel === 'Intermediate' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                userLevel === 'Beginner' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                'bg-gray-100 text-gray-800 border-gray-300'
              }`}
            >
              {userLevel} Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Profile Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completedSections}/{totalSections}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sections Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{getProgressToNextLevel()}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">To {getNextLevel()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>
            Track your profile completion and level progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Current Level: {userLevel}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {userLevel === 'Expert' ? 'Maximum level reached!' : `${getProgressToNextLevel()}% needed for ${getNextLevel()}`}
                </div>
              </div>
            </div>
            
            <Progress value={completionPercentage} className="h-3" />
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>70%</span>
              <span>90%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections */}
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
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Weight: {section.weight}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.completed ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
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

      {/* Quick Actions */}
      {completionPercentage < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Tools to help complete your profile faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="justify-start">
                <Building className="h-4 w-4 mr-2" />
                Business Setup
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Add Services
              </Button>
              <Button variant="outline" className="justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Preview Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Progress</CardTitle>
          <CardDescription>
            Your next achievements and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userLevel !== 'Expert' && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Reach {getNextLevel()} Level</span>
                </div>
                <Badge variant="outline">
                  {getProgressToNextLevel()}% needed
                </Badge>
              </div>
            )}
            
            {completionPercentage < 100 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Complete Profile</span>
                </div>
                <Badge variant="outline">
                  {100 - completionPercentage}% remaining
                </Badge>
              </div>
            )}
            
            {completionPercentage >= 100 && userLevel === 'Expert' && (
              <div className="text-center py-4">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  🎉 Congratulations!
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  You've completed your vendor profile and reached Expert level!
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfileProgress;
