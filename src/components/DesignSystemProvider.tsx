import React, { useEffect, Component, type ReactNode } from 'react';
import { useDesignSystem, type DesignSystemConfig } from '@/stores/designSystemStore';

// ErrorBoundary to catch zustand dual-React crashes
class DesignSystemErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <>{this.props.children}</>;
    return this.props.children;
  }
}

function DesignSystemApplier({ children }: { children: ReactNode }) {
  const { config } = useDesignSystem();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--font-heading', config.fontFamily.heading);
    root.style.setProperty('--font-body', config.fontFamily.body);
    root.style.setProperty('--font-mono', config.fontFamily.mono);

    Object.entries(config.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    Object.entries(config.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    Object.entries(config.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    Object.entries(config.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    Object.entries(config.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });
    root.style.setProperty('--easing', config.animations.easing);
  }, [config]);

  return <>{children}</>;
}

export const DesignSystemProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DesignSystemErrorBoundary>
      <DesignSystemApplier>{children}</DesignSystemApplier>
    </DesignSystemErrorBoundary>
  );
};
