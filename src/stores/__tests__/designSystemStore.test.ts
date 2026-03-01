import { describe, it, expect, beforeEach } from 'vitest';
import { useDesignSystem } from '../designSystemStore';

describe('useDesignSystem', () => {
  beforeEach(() => {
    useDesignSystem.getState().resetConfig();
  });

  it('has default config values', () => {
    const { config } = useDesignSystem.getState();
    expect(config.fontFamily.heading).toContain('Playfair');
    expect(config.toastSettings.position).toBe('top-right');
    expect(config.buttonSettings.defaultSize).toBe('md');
  });

  it('updateConfig merges partial updates', () => {
    useDesignSystem.getState().updateConfig({
      toastSettings: {
        position: 'bottom-center',
        duration: 3000,
        showProgress: false,
        maxVisible: 5,
      },
    });
    const { config } = useDesignSystem.getState();
    expect(config.toastSettings.position).toBe('bottom-center');
    expect(config.toastSettings.duration).toBe(3000);
    // Other config should remain
    expect(config.fontFamily.heading).toContain('Playfair');
  });

  it('resetConfig restores defaults', () => {
    useDesignSystem.getState().updateConfig({
      buttonSettings: { defaultSize: 'lg', defaultVariant: 'ghost' },
    });
    useDesignSystem.getState().resetConfig();
    const { config } = useDesignSystem.getState();
    expect(config.buttonSettings.defaultSize).toBe('md');
    expect(config.buttonSettings.defaultVariant).toBe('default');
  });

  it('preserves unmodified sections during update', () => {
    const originalShadows = { ...useDesignSystem.getState().config.shadows };
    useDesignSystem.getState().updateConfig({
      modalSettings: {
        backdropBlur: false,
        closeOnOutsideClick: false,
        showCloseButton: false,
        animation: 'fade',
      },
    });
    expect(useDesignSystem.getState().config.shadows).toEqual(originalShadows);
  });
});
