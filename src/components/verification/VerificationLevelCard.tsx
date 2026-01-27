import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  Unlock,
  ChevronRight,
  Mail,
  Phone,
  Share2,
  FileText,
  Building2,
  CreditCard,
  Video,
  Users,
  Sparkles
} from 'lucide-react';

export interface VerificationStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  inProgress?: boolean;
  timeEstimate: string;
}

export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  trustIndicator: string;
  featuresUnlocked: string[];
  dropOffTip: string;
  steps: VerificationStep[];
}

interface VerificationLevelCardProps {
  config: LevelConfig;
  isCurrentLevel: boolean;
  isUnlocked: boolean;
  onStartVerification?: (stepId: string) => void;
  className?: string;
}

export const VerificationLevelCard: React.FC<VerificationLevelCardProps> = ({
  config,
  isCurrentLevel,
  isUnlocked,
  onStartVerification,
  className
}) => {
  const completedSteps = config.steps.filter(s => s.completed).length;
  const progress = (completedSteps / config.steps.length) * 100;
  const isComplete = progress === 100;

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isCurrentLevel && 'ring-2 ring-primary shadow-lg',
        !isUnlocked && 'opacity-60',
        isComplete && 'bg-gradient-to-br from-green-50/50 to-emerald-50/50',
        className
      )}
    >
      {isCurrentLevel && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg',
              isComplete ? 'bg-green-100 text-green-700' : 
              isCurrentLevel ? 'bg-primary/10 text-primary' : 
              'bg-muted text-muted-foreground'
            )}>
              {isComplete ? <CheckCircle2 className="h-5 w-5" /> : config.level}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {config.name}
                {isComplete && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          
          {!isUnlocked && (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        
        {/* Trust Indicator */}
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {config.trustIndicator}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        {isUnlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedSteps}/{config.steps.length} steps</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2">
          {config.steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                step.completed && 'bg-green-50',
                step.inProgress && 'bg-blue-50',
                !step.completed && !step.inProgress && isUnlocked && 'hover:bg-muted/50 cursor-pointer'
              )}
              onClick={() => !step.completed && isUnlocked && onStartVerification?.(step.id)}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                step.completed && 'bg-green-100',
                step.inProgress && 'bg-blue-100',
                !step.completed && !step.inProgress && 'bg-muted'
              )}>
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : step.inProgress ? (
                  <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                ) : (
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  step.completed && 'text-green-700',
                  step.inProgress && 'text-blue-700'
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{step.timeEstimate}</span>
                {!step.completed && isUnlocked && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features Unlocked */}
        <div className="pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Unlock className="h-3 w-3" />
            Features Unlocked
          </p>
          <div className="flex flex-wrap gap-1">
            {config.featuresUnlocked.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Drop-off Prevention Tip */}
        {isCurrentLevel && !isComplete && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">💡 Tip:</span> {config.dropOffTip}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Pre-configured level data
export const verificationLevels: LevelConfig[] = [
  {
    level: 1,
    name: 'Basic Verification',
    description: 'Quick email and phone verification',
    trustIndicator: 'Basic Trust',
    featuresUnlocked: ['Post Listings', 'Save Properties', 'Basic Messaging'],
    dropOffTip: 'Just 2 quick steps! Verify your email and phone to start listing.',
    steps: [
      {
        id: 'email',
        label: 'Verify Email',
        description: 'Confirm your email address',
        icon: Mail,
        completed: false,
        timeEstimate: '1 min'
      },
      {
        id: 'phone',
        label: 'Verify Phone',
        description: 'Add and verify your phone number',
        icon: Phone,
        completed: false,
        timeEstimate: '2 min'
      }
    ]
  },
  {
    level: 2,
    name: 'Enhanced Verification',
    description: 'Social media and document verification',
    trustIndicator: 'Enhanced Trust',
    featuresUnlocked: ['Priority Listing', 'Silver Badge', 'Enhanced Profile', 'Direct WhatsApp'],
    dropOffTip: 'Link your social media for instant verification - no waiting!',
    steps: [
      {
        id: 'social',
        label: 'Link Social Media',
        description: 'Connect Instagram, LinkedIn, or Facebook',
        icon: Share2,
        completed: false,
        timeEstimate: '2 min'
      },
      {
        id: 'document',
        label: 'Upload ID Document',
        description: 'KTP, SIM, or Passport',
        icon: FileText,
        completed: false,
        timeEstimate: '5 min'
      }
    ]
  },
  {
    level: 3,
    name: 'Professional Verification',
    description: 'License and financial verification',
    trustIndicator: 'Professional Trust',
    featuresUnlocked: ['Gold Badge', 'Featured Listings', 'Analytics Dashboard', 'API Access'],
    dropOffTip: 'Professional verification unlocks premium features and higher visibility!',
    steps: [
      {
        id: 'license',
        label: 'Verify License',
        description: 'Real estate agent license number',
        icon: Building2,
        completed: false,
        timeEstimate: '5 min'
      },
      {
        id: 'bank',
        label: 'Add Bank Details',
        description: 'For secure transactions',
        icon: CreditCard,
        completed: false,
        timeEstimate: '3 min'
      }
    ]
  },
  {
    level: 4,
    name: 'Premium Verification',
    description: 'Video verification and references',
    trustIndicator: 'Premium Trust',
    featuresUnlocked: ['Diamond Badge', 'Priority Support', 'Exclusive Deals', 'VIP Network'],
    dropOffTip: 'Video verification takes just 3 minutes and maximizes your trust score!',
    steps: [
      {
        id: 'video',
        label: 'Video Verification',
        description: 'Quick video call with our team',
        icon: Video,
        completed: false,
        timeEstimate: '5 min'
      },
      {
        id: 'references',
        label: 'Add References',
        description: 'At least 2 professional references',
        icon: Users,
        completed: false,
        timeEstimate: '10 min'
      }
    ]
  }
];

export default VerificationLevelCard;
