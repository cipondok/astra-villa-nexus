import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePopupQueue } from "@/hooks/usePopupQueue";

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

  // Popup queue integration - high priority (onboarding is important)
  const popupQueue = usePopupQueue('onboarding-wizard', 'high', { delay: 2000 });

  const showWizard = useCallback(() => setIsWizardOpen(true), []);
  const hideWizard = useCallback(() => setIsWizardOpen(false), []);

  // Register with popup queue
  useEffect(() => {
    popupQueue.register(showWizard, hideWizard);
    return () => popupQueue.unregister();
  }, [showWizard, hideWizard]);

  // Notify queue when wizard closes
  useEffect(() => {
    if (!isWizardOpen && state.shouldShowOnboarding) {
      popupQueue.notifyHidden();
    }
  }, [isWizardOpen, state.shouldShowOnboarding]);

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

  // Auto-open wizard for new authenticated users via queue
  useEffect(() => {
    if (isAuthenticated && state.shouldShowOnboarding && !state.hasCompletedOnboarding) {
      // Request to show via queue with stagger delay
      const timer = setTimeout(() => {
        popupQueue.requestShow();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, state.shouldShowOnboarding, state.hasCompletedOnboarding]);

  const openWizard = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsWizardOpen(false);
    popupQueue.notifyHidden();
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
