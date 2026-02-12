import React, { Component, ErrorInfo, ReactNode } from "react";
import { OnboardingWizard } from "@/components/onboarding";
import { useOnboarding } from "@/hooks/useOnboarding";

/** Silently catches errors so onboarding never crashes the app */
class OnboardingSafeBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("OnboardingHandler error (non-fatal):", error.message);
  }
  render() { return this.state.hasError ? null : this.props.children; }
}

const OnboardingInner = () => {
  const { isWizardOpen, closeWizard } = useOnboarding();
  return <OnboardingWizard isOpen={isWizardOpen} onClose={closeWizard} />;
};

const OnboardingHandler = () => (
  <OnboardingSafeBoundary>
    <OnboardingInner />
  </OnboardingSafeBoundary>
);

export default OnboardingHandler;
