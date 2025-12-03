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
    percentage: profile?.profile_completion_percentage || 0,
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
        key: 'npwp_number',
        label: 'NPWP (Tax ID)',
        icon: FileText,
        completed: !!((profile as any)?.npwp_number && (profile as any).npwp_number.replace(/\D/g, '').length === 15),
        weight: 15,
        description: 'Indonesian Tax ID Number for commission payouts',
        benefit: 'Enable automated tax-compliant payouts'
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
        key: 'business_address',
        label: 'Business Address',
        icon: MapPin,
        completed: !!(profile?.business_address && profile.business_address.length > 5),
        weight: 10,
        description: 'Your office or business location',
        benefit: 'Local market expertise credibility'
      },
      {
        key: 'years_experience',
        label: 'Experience Details',
        icon: Clock,
        completed: !!(profile?.years_experience),
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
      case 'Platinum': return 'bg-gradient-to-r from-accent to-primary';
      case 'Gold': return 'bg-gradient-to-r from-primary to-accent';
      case 'Silver': return 'bg-gradient-to-r from-muted-foreground to-secondary';
      default: return 'bg-gradient-to-r from-destructive to-primary';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-accent';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 50) return 'bg-muted-foreground';
    return 'bg-destructive';
  };

  const incompleteFields = completionData.fields.filter(field => !field.completed);

  return (
    <div className="space-y-2">
      {/* Profile Completion Header - Compact */}
      <Card className={`border-l-2 ${completionData.percentage < 70 ? 'border-l-destructive' : 'border-l-primary'} bg-card/80`}>
        <CardHeader className="p-2 pb-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${getLevelColor(completionData.level)} flex items-center justify-center shadow-sm`}>
                <Award className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xs">
                  Profile: {completionData.percentage}%
                </CardTitle>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge className={`${getLevelColor(completionData.level)} text-primary-foreground text-[8px] px-1 py-0`}>
                    {completionData.level}
                  </Badge>
                  {completionData.percentage < 70 && (
                    <Badge variant="destructive" className="text-[8px] px-1 py-0">Action</Badge>
                  )}
                </div>
              </div>
            </div>
            {completionData.percentage < 100 && (
              <Button 
                onClick={onEditProfile} 
                size="sm"
                className="bg-primary hover:bg-primary/90 h-6 text-[9px] px-2"
              >
                Complete
                <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="space-y-1.5">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[9px] mb-0.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-primary">{completionData.percentage}%</span>
              </div>
              <Progress value={completionData.percentage} className="h-1" />
            </div>

            {/* Completion Alert - Compact */}
            {completionData.percentage < 70 && (
              <Alert className="py-1.5 px-2 bg-primary/10 border-primary/30">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <AlertDescription className="text-[9px]">
                    Complete profile for 3x more leads!
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Level Benefits - Compact */}
            <div className="flex flex-wrap gap-0.5">
              {completionData.benefits.slice(0, 2).map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-[8px] px-1 py-0 border-primary/30">
                  <Star className="h-2 w-2 mr-0.5 text-primary" />
                  {benefit}
                </Badge>
              ))}
              {completionData.benefits.length > 2 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 text-muted-foreground">
                  +{completionData.benefits.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Fields Status - Compact Grid */}
      <Card className="bg-card/80">
        <CardHeader className="p-2 pb-1.5">
          <CardTitle className="flex items-center gap-1 text-xs">
            <User className="h-3 w-3 text-primary" />
            Profile Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="grid grid-cols-2 gap-1">
            {completionData.fields.map((field) => (
              <div key={field.key} className={`p-1.5 rounded-md border transition-all duration-200 ${
                field.completed ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/50'
              }`}>
                <div className="flex items-center gap-1">
                  {field.completed ? (
                    <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-[9px] font-medium truncate">{field.label}</span>
                </div>
              </div>
            ))}
          </div>

          {incompleteFields.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <Button 
                onClick={onEditProfile} 
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 h-6 text-[9px]"
              >
                Complete {incompleteFields.length} Fields → Get 3x Leads!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Card for 100% completion - Compact */}
      {completionData.percentage === 100 && (
        <Card className="border border-primary bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-2 text-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-1.5">
              <Award className="h-4 w-4 text-primary-foreground" />
            </div>
            <h3 className="text-xs font-bold text-primary mb-1">
              🎉 Platinum Agent!
            </h3>
            <Badge className="bg-primary text-primary-foreground text-[8px] px-2 py-0">
              Elite Status
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentProfileProgress;