import React, { useEffect } from 'react';
import { useDesignSystem } from '@/stores/designSystemStore';

export const DesignSystemProvider = ({ children }: { children: React.ReactNode }) => {
  let config;
  try {
    const store = useDesignSystem();
    config = store.config;
  } catch {
    // Fallback if zustand hook fails (dual React instance edge case)
    return <>{children}</>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!config) return;
    const root = document.documentElement;

    // Apply font families
    root.style.setProperty('--font-heading', config.fontFamily.heading);
    root.style.setProperty('--font-body', config.fontFamily.body);
    root.style.setProperty('--font-mono', config.fontFamily.mono);

    // Apply font sizes
    Object.entries(config.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Apply spacing
    Object.entries(config.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(config.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Apply shadows
    Object.entries(config.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply animation durations
    Object.entries(config.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    // Apply animation easing
    root.style.setProperty('--easing', config.animations.easing);
  }, [config]);

  return <>{children}</>;
};
