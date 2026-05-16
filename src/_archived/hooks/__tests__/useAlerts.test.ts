import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlerts } from '../useAlerts';

describe('useAlerts', () => {
  it('starts with empty alerts', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alerts).toEqual([]);
  });

  it('adds alert via addAlert', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => {
      result.current.addAlert('success', 'Title', 'Message');
    });
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].type).toBe('success');
    expect(result.current.alerts[0].title).toBe('Title');
    expect(result.current.alerts[0].message).toBe('Message');
    expect(result.current.alerts[0].duration).toBe(5000);
  });

  it('adds alert with custom duration', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => {
      result.current.addAlert('error', 'Err', 'Msg', 3000);
    });
    expect(result.current.alerts[0].duration).toBe(3000);
  });

  it('returns unique id from addAlert', () => {
    const { result } = renderHook(() => useAlerts());
    let id1: string, id2: string;
    act(() => { id1 = result.current.addAlert('info', 'A', 'B'); });
    act(() => { id2 = result.current.addAlert('info', 'C', 'D'); });
    expect(id1!).not.toBe(id2!);
  });

  it('removes alert by id', () => {
    const { result } = renderHook(() => useAlerts());
    let id: string;
    act(() => { id = result.current.addAlert('warning', 'W', 'M'); });
    act(() => { result.current.addAlert('info', 'I', 'M2'); });
    expect(result.current.alerts).toHaveLength(2);
    act(() => { result.current.removeAlert(id!); });
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].type).toBe('info');
  });

  it('clears all alerts', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => {
      result.current.addAlert('success', 'A', 'B');
      result.current.addAlert('error', 'C', 'D');
      result.current.addAlert('info', 'E', 'F');
    });
    expect(result.current.alerts).toHaveLength(3);
    act(() => { result.current.clearAllAlerts(); });
    expect(result.current.alerts).toHaveLength(0);
  });

  it('showSuccess creates success alert', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.showSuccess('OK', 'Done'); });
    expect(result.current.alerts[0].type).toBe('success');
  });

  it('showError creates error alert', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.showError('Fail', 'Bad'); });
    expect(result.current.alerts[0].type).toBe('error');
  });

  it('showWarning creates warning alert', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.showWarning('Warn', 'Careful'); });
    expect(result.current.alerts[0].type).toBe('warning');
  });

  it('showInfo creates info alert', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.showInfo('FYI', 'Note'); });
    expect(result.current.alerts[0].type).toBe('info');
  });
});
