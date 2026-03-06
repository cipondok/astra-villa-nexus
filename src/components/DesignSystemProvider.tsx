import React, { useEffect } from 'react';
import { useDesignSystem, type DesignSystemConfig } from '@/stores/designSystemStore';

function ApplyDesignSystem({ config }: { config: DesignSystemConfig }) {
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

  return null;
}

export const DesignSystemProvider = ({ children }: { children: React.ReactNode }) => {
  let config: DesignSystemConfig | null = null;
  try {
    const store = useDesignSystem();
    config = store.config;
  } catch {
    // Fallback if zustand hook fails (dual React instance edge case)
  }

  return (
    <>
      {config && <ApplyDesignSystem config={config} />}
      {children}
    </>
  );
};
