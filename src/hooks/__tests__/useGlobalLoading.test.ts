import { describe, it, expect, beforeEach } from 'vitest';
import { useGlobalLoading } from '../useGlobalLoading';

describe('useGlobalLoading store', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    // Reset store state
    useGlobalLoading.setState({
      isLoading: false,
      progress: 0,
      message: 'Loading...',
      showPopup: false,
    });
  });

  it('starts in idle state', () => {
    const state = useGlobalLoading.getState();
    expect(state.isLoading).toBe(false);
    expect(state.progress).toBe(0);
  });

  it('startLoading sets loading state', () => {
    useGlobalLoading.getState().startLoading('Processing...');
    const state = useGlobalLoading.getState();
    expect(state.isLoading).toBe(true);
    expect(state.message).toBe('Processing...');
    expect(state.progress).toBe(0);
  });

  it('updateProgress clamps to 100', () => {
    useGlobalLoading.getState().startLoading();
    useGlobalLoading.getState().updateProgress(150);
    expect(useGlobalLoading.getState().progress).toBe(100);
  });

  it('updateProgress updates message', () => {
    useGlobalLoading.getState().startLoading();
    useGlobalLoading.getState().updateProgress(50, 'Halfway');
    const state = useGlobalLoading.getState();
    expect(state.progress).toBe(50);
    expect(state.message).toBe('Halfway');
  });

  it('finishLoading resets state', () => {
    useGlobalLoading.getState().startLoading();
    useGlobalLoading.getState().finishLoading();
    const state = useGlobalLoading.getState();
    expect(state.isLoading).toBe(false);
    expect(state.progress).toBe(100);
    expect(state.showPopup).toBe(false);
  });

  it('setShowPopup(false) marks dismissed in storage', () => {
    useGlobalLoading.getState().setShowPopup(false);
    expect(sessionStorage.getItem('__global_loading_popup_dismissed__')).toBe('true');
  });

  it('popup only shows once per session', () => {
    useGlobalLoading.getState().startLoading();
    const first = useGlobalLoading.getState().showPopup;
    
    useGlobalLoading.getState().finishLoading();
    useGlobalLoading.getState().startLoading();
    const second = useGlobalLoading.getState().showPopup;
    
    // Second call should not show popup since already shown this session
    expect(second).toBe(false);
  });
});
