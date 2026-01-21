import { create } from 'zustand';

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
  
  startLoading: (message = 'Loading...') => 
    set({ isLoading: true, progress: 0, message, showPopup: true }),
  
  updateProgress: (progress, message) => 
    set((state) => ({ 
      progress: Math.min(100, progress), 
      message: message || state.message 
    })),
  
  finishLoading: () => 
    set({ isLoading: false, progress: 100, showPopup: false }),
  
  setShowPopup: (show) => 
    set({ showPopup: show }),
}));
