import { create } from 'zustand';

export type PopupPriority = 'critical' | 'high' | 'medium' | 'low';

export interface QueuedPopup {
  id: string;
  priority: PopupPriority;
  show: () => void;
  hide: () => void;
  isVisible: boolean;
  delay?: number; // Initial delay before eligible to show
  minDisplayTime?: number; // Minimum time to stay visible
}

interface PopupQueueState {
  queue: Map<string, QueuedPopup>;
  activePopupId: string | null;
  isProcessing: boolean;
  
  // Actions
  register: (popup: Omit<QueuedPopup, 'isVisible'>) => void;
  unregister: (id: string) => void;
  requestShow: (id: string) => void;
  notifyHidden: (id: string) => void;
  getCanShow: (id: string) => boolean;
}

// Priority order (lower = higher priority)
const priorityOrder: Record<PopupPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// Stagger delays based on priority (ms)
const staggerDelays: Record<PopupPriority, number> = {
  critical: 500,
  high: 2000,
  medium: 4000,
  low: 6000,
};

export const usePopupQueueStore = create<PopupQueueState>((set, get) => ({
  queue: new Map(),
  activePopupId: null,
  isProcessing: false,

  register: (popup) => {
    set((state) => {
      const newQueue = new Map(state.queue);
      newQueue.set(popup.id, { ...popup, isVisible: false });
      return { queue: newQueue };
    });
  },

  unregister: (id) => {
    set((state) => {
      const newQueue = new Map(state.queue);
      newQueue.delete(id);
      return { 
        queue: newQueue,
        activePopupId: state.activePopupId === id ? null : state.activePopupId
      };
    });
  },

  requestShow: (id) => {
    const state = get();
    const popup = state.queue.get(id);
    
    if (!popup) return;
    
    // If no active popup, show immediately
    if (!state.activePopupId) {
      popup.show();
      set((s) => {
        const newQueue = new Map(s.queue);
        const p = newQueue.get(id);
        if (p) {
          newQueue.set(id, { ...p, isVisible: true });
        }
        return { queue: newQueue, activePopupId: id };
      });
      return;
    }
    
    // If there's an active popup, check priority
    const activePopup = state.queue.get(state.activePopupId);
    if (activePopup) {
      const activePriority = priorityOrder[activePopup.priority];
      const requestedPriority = priorityOrder[popup.priority];
      
      // Only interrupt if new popup has higher priority (lower number)
      if (requestedPriority < activePriority) {
        // Hide current, show new
        activePopup.hide();
        set((s) => {
          const newQueue = new Map(s.queue);
          const oldP = newQueue.get(s.activePopupId!);
          if (oldP) {
            newQueue.set(s.activePopupId!, { ...oldP, isVisible: false });
          }
          return { queue: newQueue };
        });
        
        // Show new popup after brief delay
        setTimeout(() => {
          popup.show();
          set((s) => {
            const newQueue = new Map(s.queue);
            const p = newQueue.get(id);
            if (p) {
              newQueue.set(id, { ...p, isVisible: true });
            }
            return { queue: newQueue, activePopupId: id };
          });
        }, 300);
      }
      // Otherwise, wait for current to close
    }
  },

  notifyHidden: (id) => {
    const state = get();
    
    set((s) => {
      const newQueue = new Map(s.queue);
      const popup = newQueue.get(id);
      if (popup) {
        newQueue.set(id, { ...popup, isVisible: false });
      }
      return { 
        queue: newQueue,
        activePopupId: s.activePopupId === id ? null : s.activePopupId
      };
    });
    
    // Process next in queue after a brief pause
    setTimeout(() => {
      const currentState = get();
      if (currentState.activePopupId) return; // Something else already showing
      
      // Find next highest priority popup that wants to show
      const pending = Array.from(currentState.queue.values())
        .filter(p => !p.isVisible && p.id !== id)
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      if (pending.length > 0) {
        const next = pending[0];
        next.show();
        set((s) => {
          const newQueue = new Map(s.queue);
          const p = newQueue.get(next.id);
          if (p) {
            newQueue.set(next.id, { ...p, isVisible: true });
          }
          return { queue: newQueue, activePopupId: next.id };
        });
      }
    }, 500);
  },

  getCanShow: (id) => {
    const state = get();
    return state.activePopupId === null || state.activePopupId === id;
  },
}));

// Hook for components to use
export const usePopupQueue = (
  id: string,
  priority: PopupPriority,
  options?: { delay?: number; minDisplayTime?: number }
) => {
  const store = usePopupQueueStore();
  
  const register = (show: () => void, hide: () => void) => {
    store.register({
      id,
      priority,
      show,
      hide,
      delay: options?.delay ?? staggerDelays[priority],
      minDisplayTime: options?.minDisplayTime,
    });
  };
  
  const unregister = () => store.unregister(id);
  const requestShow = () => store.requestShow(id);
  const notifyHidden = () => store.notifyHidden(id);
  const canShow = store.getCanShow(id);
  const activePopupId = store.activePopupId;
  
  return {
    register,
    unregister,
    requestShow,
    notifyHidden,
    canShow,
    activePopupId,
    isMyTurn: activePopupId === null || activePopupId === id,
  };
};

export default usePopupQueue;
