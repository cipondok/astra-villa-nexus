import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePopupQueueStore } from '../usePopupQueue';

describe('usePopupQueueStore', () => {
  beforeEach(() => {
    // Reset store
    usePopupQueueStore.setState({
      queue: new Map(),
      activePopupId: null,
      isProcessing: false,
    });
  });

  it('starts with empty queue', () => {
    const state = usePopupQueueStore.getState();
    expect(state.queue.size).toBe(0);
    expect(state.activePopupId).toBeNull();
  });

  it('registers a popup', () => {
    const show = vi.fn();
    const hide = vi.fn();
    usePopupQueueStore.getState().register({ id: 'p1', priority: 'medium', show, hide });
    expect(usePopupQueueStore.getState().queue.size).toBe(1);
    expect(usePopupQueueStore.getState().queue.get('p1')?.priority).toBe('medium');
  });

  it('unregisters a popup', () => {
    const show = vi.fn();
    const hide = vi.fn();
    usePopupQueueStore.getState().register({ id: 'p1', priority: 'low', show, hide });
    usePopupQueueStore.getState().unregister('p1');
    expect(usePopupQueueStore.getState().queue.size).toBe(0);
  });

  it('shows popup when no active popup', () => {
    const show = vi.fn();
    const hide = vi.fn();
    usePopupQueueStore.getState().register({ id: 'p1', priority: 'medium', show, hide });
    usePopupQueueStore.getState().requestShow('p1');
    expect(show).toHaveBeenCalledOnce();
    expect(usePopupQueueStore.getState().activePopupId).toBe('p1');
  });

  it('does not interrupt lower priority popup with same or lower', () => {
    const show1 = vi.fn();
    const hide1 = vi.fn();
    const show2 = vi.fn();
    const hide2 = vi.fn();

    usePopupQueueStore.getState().register({ id: 'p1', priority: 'medium', show: show1, hide: hide1 });
    usePopupQueueStore.getState().register({ id: 'p2', priority: 'low', show: show2, hide: hide2 });
    
    usePopupQueueStore.getState().requestShow('p1');
    usePopupQueueStore.getState().requestShow('p2');
    
    expect(show2).not.toHaveBeenCalled();
    expect(usePopupQueueStore.getState().activePopupId).toBe('p1');
  });

  it('interrupts with higher priority popup', () => {
    vi.useFakeTimers();
    const show1 = vi.fn();
    const hide1 = vi.fn();
    const show2 = vi.fn();
    const hide2 = vi.fn();

    usePopupQueueStore.getState().register({ id: 'p1', priority: 'low', show: show1, hide: hide1 });
    usePopupQueueStore.getState().register({ id: 'p2', priority: 'critical', show: show2, hide: hide2 });
    
    usePopupQueueStore.getState().requestShow('p1');
    usePopupQueueStore.getState().requestShow('p2');
    
    expect(hide1).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(300);
    expect(show2).toHaveBeenCalledOnce();
    expect(usePopupQueueStore.getState().activePopupId).toBe('p2');
    vi.useRealTimers();
  });

  it('notifyHidden clears active popup', () => {
    vi.useFakeTimers();
    const show = vi.fn();
    const hide = vi.fn();
    usePopupQueueStore.getState().register({ id: 'p1', priority: 'medium', show, hide });
    usePopupQueueStore.getState().requestShow('p1');
    usePopupQueueStore.getState().notifyHidden('p1');
    expect(usePopupQueueStore.getState().activePopupId).toBeNull();
    vi.useRealTimers();
  });

  it('getCanShow returns true when no active popup', () => {
    expect(usePopupQueueStore.getState().getCanShow('any')).toBe(true);
  });

  it('getCanShow returns false for non-active popup', () => {
    const show = vi.fn();
    const hide = vi.fn();
    usePopupQueueStore.getState().register({ id: 'p1', priority: 'high', show, hide });
    usePopupQueueStore.getState().requestShow('p1');
    expect(usePopupQueueStore.getState().getCanShow('other')).toBe(false);
  });
});
