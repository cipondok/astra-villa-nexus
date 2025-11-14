import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DesignSystemConfig {
  // Typography
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  
  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Border Radius
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Animations
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: string;
  };
  
  // Toast/Message Settings
  toastSettings: {
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    duration: number;
    showProgress: boolean;
    maxVisible: number;
  };
  
  // Popup/Modal Settings
  modalSettings: {
    backdropBlur: boolean;
    closeOnOutsideClick: boolean;
    showCloseButton: boolean;
    animation: 'fade' | 'scale' | 'slide';
  };
  
  // Button Settings
  buttonSettings: {
    defaultSize: 'sm' | 'md' | 'lg';
    defaultVariant: 'default' | 'outline' | 'ghost' | 'secondary';
  };
}

const defaultConfig: DesignSystemConfig = {
  fontFamily: {
    heading: 'Playfair Display, serif',
    body: 'Inter, sans-serif',
    mono: 'SF Mono, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  toastSettings: {
    position: 'top-right',
    duration: 5000,
    showProgress: true,
    maxVisible: 3,
  },
  modalSettings: {
    backdropBlur: true,
    closeOnOutsideClick: true,
    showCloseButton: true,
    animation: 'scale',
  },
  buttonSettings: {
    defaultSize: 'md',
    defaultVariant: 'default',
  },
};

interface DesignSystemStore {
  config: DesignSystemConfig;
  updateConfig: (updates: Partial<DesignSystemConfig>) => void;
  resetConfig: () => void;
}

export const useDesignSystem = create<DesignSystemStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'design-system-config',
    }
  )
);
