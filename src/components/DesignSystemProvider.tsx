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

const DESIGN_SYSTEM_VERSION = 2;

function DesignSystemApplier({ children }: { children: ReactNode }) {
  const { config, resetConfig } = useDesignSystem();

  useEffect(() => {
    const stored = localStorage.getItem('design-system-config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.state?._version || parsed.state._version < DESIGN_SYSTEM_VERSION) {
          localStorage.removeItem('design-system-config');
          resetConfig();
        }
      } catch { /* corrupted — clear it */ localStorage.removeItem('design-system-config'); }
    }
  }, [resetConfig])

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
