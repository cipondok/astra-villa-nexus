import { create } from 'zustand';

const DISMISSED_SESSION_KEY = '__global_loading_popup_dismissed__';
const DISMISSED_DATE_KEY = '__global_loading_popup_dismissed_date__';

const getLocalDayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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
    const today = getLocalDayKey();

    const dismissedThisSession =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(DISMISSED_SESSION_KEY) === 'true';

    const dismissedDate =
      typeof window !== 'undefined' ? localStorage.getItem(DISMISSED_DATE_KEY) : null;

    const dismissedToday = dismissedDate === today;

    set({
      isLoading: true,
      progress: 0,
      message,
      // Once per day (and also once per session) after the user dismisses it.
      showPopup: dismissedThisSession || dismissedToday ? false : true,
    });
  },

  updateProgress: (progress, message) =>
    set((state) => ({
      progress: Math.min(100, progress),
      message: message || state.message,
    })),

  finishLoading: () => set({ isLoading: false, progress: 100, showPopup: false }),

  setShowPopup: (show) => {
    if (typeof window !== 'undefined' && show === false) {
      sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
      localStorage.setItem(DISMISSED_DATE_KEY, getLocalDayKey());
    }
    set({ showPopup: show });
  },
}));
