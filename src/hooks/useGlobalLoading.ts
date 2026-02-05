import { create } from 'zustand';

const DISMISSED_SESSION_KEY = '__global_loading_popup_dismissed__';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  showPopup: boolean;
  startLoading: (message?: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  finishLoading: () => void;
  setShowPopup: (show: boolean) => void;
}

export const useGlobalLoading = create<LoadingState>((set) => ({
  isLoading: false,
  progress: 0,
  message: 'Loading...',
  showPopup: false,

  startLoading: (message = 'Loading...') => {
    const dismissedThisSession =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(DISMISSED_SESSION_KEY) === 'true';

    set({
      isLoading: true,
      progress: 0,
      message,
      // If user dismissed it, don't keep reopening it every time a query runs
      showPopup: dismissedThisSession ? false : true,
    });
  },

  updateProgress: (progress, message) =>
    set((state) => ({
      progress: Math.min(100, progress),
      message: message || state.message,
    })),

  finishLoading: () => set({ isLoading: false, progress: 100, showPopup: false }),

  setShowPopup: (show) => {
    // If user manually closes the popup, remember for the rest of the session
    if (typeof window !== 'undefined' && show === false) {
      sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
    }
    set({ showPopup: show });
  },
}));
