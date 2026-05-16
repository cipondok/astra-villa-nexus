import React, { useEffect, Component, type ReactNode } from 'react';
import { DESIGN_SYSTEM_STORAGE_KEY, DESIGN_SYSTEM_VERSION, useDesignSystem } from '@/stores/designSystemStore';

// ErrorBoundary to catch zustand dual-React crashes
class DesignSystemErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <>{this.props.children}</>;
    return this.props.children;
  }
}

type PersistedDesignSystemValue = {
  state?: {
    config?: unknown;
  };
  version?: number;
};

const hasValidPersistedConfig = (value: PersistedDesignSystemValue) => {
  return Boolean(value.state?.config && typeof value.state.config === 'object');
};

function DesignSystemApplier({ children }: { children: ReactNode }) {
  const { config, resetConfig } = useDesignSystem();

  useEffect(() => {
    const stored = localStorage.getItem(DESIGN_SYSTEM_STORAGE_KEY);

    if (!stored) return;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PersistedDesignSystemValue;

        if (parsed.version !== DESIGN_SYSTEM_VERSION || !hasValidPersistedConfig(parsed)) {
          localStorage.removeItem(DESIGN_SYSTEM_STORAGE_KEY);
          resetConfig();
        }
      } catch {
        localStorage.removeItem(DESIGN_SYSTEM_STORAGE_KEY);
        resetConfig();
      }
    }
  }, [resetConfig]);

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
