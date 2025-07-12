import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Circle, 
  Star, 
  TrendingUp, 
  Award, 
  ChevronRight,
  Phone,
  User,
  Building,
  FileText,
  Camera,
  MapPin,
  Clock
} from "lucide-react";

interface ProfileField {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  weight: number;
  description: string;
  benefit: string;
}

interface ProfileProgressProps {
  onEditProfile: () => void;
}

const AgentProfileProgress = ({ onEditProfile }: ProfileProgressProps) => {
  const { profile } = useAuth();
  const [completionData, setCompletionData] = useState<{
    percentage: number;
    fields: ProfileField[];
    level: string;
    benefits: string[];
  }>({
    percentage: 0,
    fields: [],
    level: 'Bronze',
    benefits: []
  });

  useEffect(() => {
    if (profile) {
      calculateProfileCompletion();
    }
  }, [profile]);

  const calculateProfileCompletion = () => {
    const fields: ProfileField[] = [
      {
        key: 'full_name',
        label: 'Full Name',
        icon: User,
        completed: !!(profile?.full_name && profile.full_name.length > 2),
        weight: 15,
        description: 'Your professional name for client communication',
        benefit: '+5% trust score from clients'
      },
      {
        key: 'phone',
        label: 'Indonesian Phone Number',
        icon: Phone,
        completed: !!(profile?.phone && isValidIndonesianPhone(profile.phone)),
        weight: 20,
        description: 'Valid Indonesian mobile number for instant client contact',
        benefit: 'Instant lead notifications via SMS'
      },
      {
        key: 'company_name',
        label: 'Company/Agency Name',
        icon: Building,
        completed: !!(profile?.company_name && profile.company_name.length > 2),
        weight: 15,
        description: 'Your real estate agency or company affiliation',
        benefit: 'Professional credibility boost'
      },
      {
        key: 'license_number',
        label: 'Real Estate License',
        icon: FileText,
        completed: !!(profile?.license_number && profile.license_number.length > 5),
        weight: 25,
        description: 'Valid Indonesian real estate license number',
        benefit: 'Verified agent badge + 20% more leads'
      },
      {
        key: 'avatar_url',
        label: 'Professional Photo',
        icon: Camera,
        completed: !!(profile?.avatar_url),
        weight: 10,
        description: 'Professional headshot builds client trust',
        benefit: '30% higher client response rate'
      },
      {
        key: 'address',
        label: 'Business Address',
        icon: MapPin,
        completed: false, // This would need to be added to profile
        weight: 10,
        description: 'Your office or business location',
        benefit: 'Local market expertise credibility'
      },
      {
        key: 'experience',
        label: 'Experience Details',
        icon: Clock,
        completed: false, // This would need to be added to profile
        weight: 5,
        description: 'Years of experience and specializations',
        benefit: 'Expert agent ranking boost'
      }
    ];

    const completedFields = fields.filter(field => field.completed);
    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = completedFields.reduce((sum, field) => sum + field.weight, 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);

    // Determine level based on completion
    let level = 'Bronze';
    let benefits: string[] = ['Basic listing visibility', 'Standard support'];

    if (percentage >= 90) {
      level = 'Platinum';
      benefits = [
        'Premium listing placement',
        'Priority lead distribution',
        'Advanced analytics',
        'Dedicated account manager',
        '50% commission discount'
      ];
    } else if (percentage >= 70) {
      level = 'Gold';
      benefits = [
        'Enhanced listing visibility',
        'Lead priority boost',
        'Marketing tools access',
        '25% commission discount'
      ];
    } else if (percentage >= 50) {
      level = 'Silver';
      benefits = [
        'Improved listing ranking',
        'Basic marketing tools',
        '10% commission discount'
      ];
    }

    setCompletionData({
      percentage,
      fields,
      level,
      benefits
    });
  };

  const isValidIndonesianPhone = (phone: string): boolean => {
    // Indonesian mobile number formats: +62xxx, 08xxx, 62xxx
    const indonesianPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return indonesianPhoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const formatIndonesianPhone = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('628')) {
      return `+${digits}`;
    } else if (digits.startsWith('08')) {
      return `+62${digits.substring(1)}`;
    } else if (digits.startsWith('8')) {
      return `+62${digits}`;
    }
    return phone;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-gradient-to-r from-purple-500 to-purple-700';
      case 'Gold': return 'bg-gradient-to-r from-yellow-500 to-yellow-700';
      case 'Silver': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-amber-600 to-amber-800';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-purple-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-gray-400';
    return 'bg-amber-600';
  };

  const incompleteFields = completionData.fields.filter(field => !field.completed);

  return (
    <div className="space-y-6">
      {/* Profile Completion Header */}
      <Card className={`border-l-4 ${completionData.percentage < 70 ? 'border-l-red-500' : 'border-l-green-500'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${getLevelColor(completionData.level)} flex items-center justify-center shadow-lg`}>
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Profile Completion: {completionData.percentage}%
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${getLevelColor(completionData.level)} text-white`}>
                    {completionData.level} Agent
                  </Badge>
                  {completionData.percentage < 70 && (
                    <Badge variant="destructive">Action Required</Badge>
                  )}
                </div>
              </div>
            </div>
            {completionData.percentage < 100 && (
              <Button onClick={onEditProfile} className="bg-orange-600 hover:bg-orange-700">
                Complete Profile
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold">{completionData.percentage}%</span>
              </div>
              <Progress 
                value={completionData.percentage} 
                className="h-3"
                style={{
                  background: `linear-gradient(to right, ${getProgressColor(completionData.percentage)} 0%, ${getProgressColor(completionData.percentage)} ${completionData.percentage}%, #e5e7eb ${completionData.percentage}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Completion Alert */}
            {completionData.percentage < 70 && (
              <Alert className="border-orange-200 bg-orange-50">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Complete your profile to unlock premium benefits!</strong> 
                  Agents with complete profiles receive 3x more leads and higher client trust ratings.
                </AlertDescription>
              </Alert>
            )}

            {/* Level Benefits */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Current {completionData.level} Benefits:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {completionData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Fields Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completionData.fields.map((field) => (
              <div key={field.key} className={`p-4 rounded-lg border-2 ${
                field.completed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {field.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <field.icon className="h-4 w-4" />
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {field.weight}% weight
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {field.description}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium text-green-700">
                        {field.benefit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {incompleteFields.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-3 text-orange-700">
                Complete {incompleteFields.length} remaining field{incompleteFields.length > 1 ? 's' : ''} to unlock:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>3x more qualified leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span>Premium agent verification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span>Higher search ranking</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-purple-600" />
                  <span>Commission rate discounts</span>
                </div>
              </div>
              <Button 
                onClick={onEditProfile} 
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                Complete Profile Now - Get 3x More Leads!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Card for 100% completion */}
      {completionData.percentage === 100 && (
        <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              🎉 Profile Complete! You're a Platinum Agent!
            </h3>
            <p className="text-green-700 mb-4">
              Congratulations! You now receive priority leads, premium placement, and maximum commission discounts.
            </p>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2">
              Elite Agent Status Unlocked
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentProfileProgress;