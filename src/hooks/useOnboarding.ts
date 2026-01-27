import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  shouldShowOnboarding: boolean;
  userType: string | null;
  completedAt: string | null;
}

export const useOnboarding = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    hasCompletedOnboarding: false,
    shouldShowOnboarding: false,
    userType: null,
    completedAt: null
  });
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    if (!user?.id) {
      setState({
        hasCompletedOnboarding: false,
        shouldShowOnboarding: false,
        userType: null,
        completedAt: null
      });
      return;
    }

    const savedData = localStorage.getItem(`onboarding_${user.id}`);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState({
          hasCompletedOnboarding: !!parsed.completedAt,
          shouldShowOnboarding: !parsed.completedAt,
          userType: parsed.userType,
          completedAt: parsed.completedAt
        });
      } catch (e) {
        // If parse fails, show onboarding
        setState({
          hasCompletedOnboarding: false,
          shouldShowOnboarding: true,
          userType: null,
          completedAt: null
        });
      }
    } else {
      // No saved data = new user, show onboarding
      setState({
        hasCompletedOnboarding: false,
        shouldShowOnboarding: true,
        userType: null,
        completedAt: null
      });
    }
  }, [user?.id]);

  // Auto-open wizard for new authenticated users
  useEffect(() => {
    if (isAuthenticated && state.shouldShowOnboarding && !state.hasCompletedOnboarding) {
      // Delay to let the page load first
      const timer = setTimeout(() => {
        setIsWizardOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, state.shouldShowOnboarding, state.hasCompletedOnboarding]);

  const openWizard = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsWizardOpen(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    if (user?.id) {
      localStorage.removeItem(`onboarding_${user.id}`);
      setState({
        hasCompletedOnboarding: false,
        shouldShowOnboarding: true,
        userType: null,
        completedAt: null
      });
    }
  }, [user?.id]);

  return {
    ...state,
    isWizardOpen,
    openWizard,
    closeWizard,
    resetOnboarding
  };
};

export default useOnboarding;
