import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  FileText,
  CreditCard,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Building2,
  Upload,
  Loader2,
} from 'lucide-react';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';
import { cn } from '@/lib/utils';

interface UpgradeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isRequired: boolean;
}

interface MembershipUpgradeFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: MembershipLevel;
  targetLevel: MembershipLevel;
  onComplete?: () => void;
}

// Define upgrade requirements per tier
const UPGRADE_REQUIREMENTS: Record<MembershipLevel, UpgradeStep[]> = {
  basic: [],
  verified: [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Fill in all required profile information',
      icon: <User className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Upload valid ID (KTP/Passport)',
      icon: <FileText className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'review',
      title: 'Admin Review',
      description: 'Wait for verification approval (1-3 days)',
      icon: <Clock className="h-5 w-5" />,
      isRequired: true,
    },
  ],
  vip: [
    {
      id: 'verified_status',
      title: 'Verified Status Required',
      description: 'You must be a Verified Member first',
      icon: <Shield className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'subscription',
      title: 'Subscribe to VIP',
      description: 'Choose monthly or yearly subscription',
      icon: <CreditCard className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'activation',
      title: 'Instant Activation',
      description: 'Benefits activated immediately after payment',
      icon: <Sparkles className="h-5 w-5" />,
      isRequired: true,
    },
  ],
  gold: [
    {
      id: 'verified_status',
      title: 'Verified Status Required',
      description: 'You must be a Verified Member first',
      icon: <Shield className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'business_profile',
      title: 'Business Profile',
      description: 'Complete business or agent profile',
      icon: <Building2 className="h-5 w-5" />,
      isRequired: false,
    },
    {
      id: 'subscription',
      title: 'Subscribe to Gold',
      description: 'Premium subscription with enhanced features',
      icon: <CreditCard className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'activation',
      title: 'Instant Activation',
      description: 'Gold benefits activated immediately',
      icon: <Sparkles className="h-5 w-5" />,
      isRequired: true,
    },
  ],
  platinum: [
    {
      id: 'verified_status',
      title: 'Verified Status Required',
      description: 'You must be a Verified Member first',
      icon: <Shield className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'business_docs',
      title: 'Business Documents',
      description: 'Submit business license or professional credentials',
      icon: <Upload className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'subscription',
      title: 'Subscribe to Platinum',
      description: 'Elite subscription with priority access',
      icon: <CreditCard className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'onboarding',
      title: 'VIP Onboarding Call',
      description: 'Schedule onboarding with account manager',
      icon: <User className="h-5 w-5" />,
      isRequired: false,
    },
  ],
  diamond: [
    {
      id: 'verified_status',
      title: 'Verified Status Required',
      description: 'You must be a Verified Member first',
      icon: <Shield className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'video_verification',
      title: 'Video Verification',
      description: 'Complete live video verification call',
      icon: <User className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'business_docs',
      title: 'Premium Documents',
      description: 'Submit comprehensive business documentation',
      icon: <Upload className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'subscription',
      title: 'Subscribe to Diamond',
      description: 'Ultimate subscription with exclusive access',
      icon: <CreditCard className="h-5 w-5" />,
      isRequired: true,
    },
    {
      id: 'concierge',
      title: 'Personal Concierge',
      description: 'Dedicated concierge assignment',
      icon: <Sparkles className="h-5 w-5" />,
      isRequired: true,
    },
  ],
};

const TIER_ORDER: MembershipLevel[] = ['basic', 'verified', 'vip', 'gold', 'platinum', 'diamond'];

export const MembershipUpgradeFlow: React.FC<MembershipUpgradeFlowProps> = ({
  open,
  onOpenChange,
  currentLevel,
  targetLevel,
  onComplete,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const targetConfig = MEMBERSHIP_LEVELS[targetLevel];
  const currentConfig = MEMBERSHIP_LEVELS[currentLevel];
  const steps = UPGRADE_REQUIREMENTS[targetLevel] || [];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const currentTierIndex = TIER_ORDER.indexOf(currentLevel);
  const targetTierIndex = TIER_ORDER.indexOf(targetLevel);
  const skipVerification = currentLevel !== 'basic' && targetLevel !== 'verified';

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartUpgrade = () => {
    const step = steps[currentStep];
    setIsProcessing(true);

    // Simulate processing then navigate to appropriate action
    setTimeout(() => {
      setIsProcessing(false);
      
      switch (step?.id) {
        case 'profile':
          navigate('/profile/edit');
          onOpenChange(false);
          break;
        case 'identity':
        case 'video_verification':
        case 'business_docs':
          navigate('/verification-center');
          onOpenChange(false);
          break;
        case 'subscription':
          navigate(`/contact?subject=membership-upgrade&tier=${targetLevel}`);
          onOpenChange(false);
          break;
        case 'business_profile':
          navigate('/profile?tab=roles');
          onOpenChange(false);
          break;
        case 'onboarding':
        case 'concierge':
          navigate('/contact?subject=vip-onboarding');
          onOpenChange(false);
          break;
        case 'review':
        case 'activation':
          // These are waiting steps
          handleNext();
          break;
        default:
          handleNext();
      }
    }, 500);
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getActionButton = (step: UpgradeStep) => {
    switch (step.id) {
      case 'profile':
        return 'Complete Profile';
      case 'identity':
        return 'Verify Identity';
      case 'video_verification':
        return 'Schedule Video Call';
      case 'business_docs':
        return 'Upload Documents';
      case 'subscription':
        return 'Subscribe Now';
      case 'business_profile':
        return 'Setup Business';
      case 'onboarding':
        return 'Schedule Call';
      case 'concierge':
        return 'Get Assigned';
      case 'review':
        return 'Submit for Review';
      case 'activation':
        return 'Continue';
      default:
        return 'Continue';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Slim Header */}
        <div className={cn("px-4 py-3", targetConfig.bgColor)}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xl",
                "bg-background/50 border",
                targetConfig.borderColor
              )}>
                {targetConfig.icon}
              </div>
              <div>
                <DialogTitle className={cn("text-sm font-semibold", targetConfig.color)}>
                  Upgrade ke {targetConfig.shortLabel}
                </DialogTitle>
                <p className="text-[10px] text-muted-foreground">
                  {steps.length} langkah
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Step {currentStep + 1}/{steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </div>

        {/* Slim Step indicators */}
        <div className="px-4 py-2.5 bg-muted/30">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all",
                      status === 'completed' && "bg-primary text-primary-foreground",
                      status === 'current' && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                      status === 'pending' && "bg-muted text-muted-foreground"
                    )}>
                      {status === 'completed' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-[8px] mt-0.5 max-w-[50px] text-center truncate",
                      status === 'current' ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {step.title.split(' ')[0]}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-px mx-1",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Current step content - Slim */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="px-4 py-3"
          >
            {steps[currentStep] && (
              <Card className="border-dashed bg-card/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      targetConfig.bgColor,
                      targetConfig.color
                    )}>
                      {React.cloneElement(steps[currentStep].icon as React.ReactElement, { className: 'h-4 w-4' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-xs font-semibold">{steps[currentStep].title}</h3>
                        {steps[currentStep].isRequired ? (
                          <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4">
                            Wajib
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                            Opsional
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {steps[currentStep].description}
                      </p>

                      {/* Step-specific info - Compact */}
                      {steps[currentStep].id === 'review' && (
                        <div className="mt-2 p-2 rounded-md bg-accent/10 border border-accent/30">
                          <div className="flex items-center gap-1.5 text-accent-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Estimasi: 1-3 hari kerja</span>
                          </div>
                        </div>
                      )}

                      {steps[currentStep].id === 'activation' && (
                        <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/30">
                          <div className="flex items-center gap-1.5 text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Aktivasi Instan</span>
                          </div>
                        </div>
                      )}

                      {steps[currentStep].id === 'verified_status' && currentLevel === 'basic' && (
                        <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/30">
                          <div className="flex items-center gap-1.5 text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Wajib Verified dulu</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <Separator />

        {/* Navigation buttons - Slim */}
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="h-7 text-[10px] gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Back
          </Button>

          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 text-[10px]"
            >
              Batal
            </Button>
            
            <Button
              size="sm"
              onClick={handleStartUpgrade}
              disabled={isProcessing}
              className="h-7 text-[10px] gap-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {steps[currentStep] && getActionButton(steps[currentStep])}
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipUpgradeFlow;
