import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Building2, 
  Users, 
  Search, 
  Key,
  ChevronRight,
  Gift,
  Sparkles,
  Check
} from "lucide-react";

import UserTypeSelector from "./UserTypeSelector";
import HomeownerOnboarding from "./flows/HomeownerOnboarding";
import LandlordOnboarding from "./flows/LandlordOnboarding";
import AgentOnboarding from "./flows/AgentOnboarding";
import BuyerOnboarding from "./flows/BuyerOnboarding";
import RenterOnboarding from "./flows/RenterOnboarding";
import OnboardingComplete from "./OnboardingComplete";

export type UserType = "homeowner" | "landlord" | "agent" | "buyer" | "renter" | null;

export interface OnboardingData {
  userType: UserType;
  step: number;
  totalSteps: number;
  formData: Record<string, any>;
  completedActions: string[];
  rewards: string[];
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserType?: UserType;
}

const OnboardingWizard = ({ isOpen, onClose, initialUserType }: OnboardingWizardProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: initialUserType || null,
    step: 0,
    totalSteps: 3,
    formData: {},
    completedActions: [],
    rewards: []
  });

  const [isComplete, setIsComplete] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`onboarding_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.completedAt) {
            setOnboardingData(parsed);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [user?.id]);

  // Save progress
  useEffect(() => {
    if (user?.id && onboardingData.userType) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(onboardingData));
    }
  }, [onboardingData, user?.id]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const updateFormData = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  };

  const nextStep = () => {
    if (onboardingData.step < onboardingData.totalSteps - 1) {
      updateData({ step: onboardingData.step + 1 });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (onboardingData.step > 0) {
      updateData({ step: onboardingData.step - 1 });
    }
  };

  const completeOnboarding = () => {
    const rewards = getRewardsForUserType(onboardingData.userType);
    updateData({ rewards, completedActions: [...onboardingData.completedActions, 'completed'] });
    
    if (user?.id) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify({
        ...onboardingData,
        rewards,
        completedAt: new Date().toISOString()
      }));
    }
    
    setIsComplete(true);
  };

  const getRewardsForUserType = (type: UserType): string[] => {
    switch (type) {
      case "homeowner":
        return ["24h Featured Boost", "50 ASTRA Tokens", "Market Analysis Report"];
      case "landlord":
        return ["50 ASTRA Tokens", "Tenant Screening Tool", "Rental Agreement Template"];
      case "agent":
        return ["100 ASTRA Tokens", "1 Free Featured Listing", "Verified Badge"];
      case "buyer":
        return ["25 ASTRA Tokens", "KPR Calculator Access", "AI Property Assistant"];
      case "renter":
        return ["25 ASTRA Tokens", "Priority Viewing", "Quick Apply Profile"];
      default:
        return [];
    }
  };

  const handleComplete = (action: string) => {
    switch (action) {
      case "dashboard":
        onClose();
        navigate("/dashboard");
        break;
      case "explore":
        onClose();
        navigate("/search");
        break;
      case "add-property":
        onClose();
        navigate("/add-property");
        break;
      default:
        onClose();
    }
  };

  const progress = onboardingData.userType 
    ? ((onboardingData.step + 1) / onboardingData.totalSteps) * 100 
    : 0;

  const renderCurrentFlow = () => {
    if (isComplete) {
      return (
        <OnboardingComplete 
          userType={onboardingData.userType}
          rewards={onboardingData.rewards}
          onAction={handleComplete}
        />
      );
    }

    if (!onboardingData.userType) {
      return (
        <UserTypeSelector 
          onSelect={(type) => updateData({ userType: type, step: 0 })}
        />
      );
    }

    const flowProps = {
      step: onboardingData.step,
      formData: onboardingData.formData,
      updateFormData,
      nextStep,
      prevStep,
      onComplete: completeOnboarding
    };

    switch (onboardingData.userType) {
      case "homeowner":
        return <HomeownerOnboarding {...flowProps} />;
      case "landlord":
        return <LandlordOnboarding {...flowProps} />;
      case "agent":
        return <AgentOnboarding {...flowProps} />;
      case "buyer":
        return <BuyerOnboarding {...flowProps} />;
      case "renter":
        return <RenterOnboarding {...flowProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 bg-gradient-to-br from-background via-background to-primary/5 border-border/50 overflow-hidden">
        {/* Header with Progress */}
        {onboardingData.userType && !isComplete && (
          <div className="p-4 pb-2 border-b border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-2">
                  Step {onboardingData.step + 1} of {onboardingData.totalSteps}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">
                  {onboardingData.userType}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gift className="h-3 w-3 text-primary" />
                <span>Rewards await!</span>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${onboardingData.userType}-${onboardingData.step}-${isComplete}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentFlow()}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
