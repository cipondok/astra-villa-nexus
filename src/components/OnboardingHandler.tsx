import { OnboardingWizard } from "@/components/onboarding";
import { useOnboarding } from "@/hooks/useOnboarding";

/**
 * Global onboarding handler that auto-shows wizard for new authenticated users
 * Place this component inside AuthProvider to access auth state
 */
const OnboardingHandler = () => {
  const { isWizardOpen, closeWizard } = useOnboarding();

  return (
    <OnboardingWizard 
      isOpen={isWizardOpen} 
      onClose={closeWizard} 
    />
  );
};

export default OnboardingHandler;
