import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSavedScenarios } from '../useSavedScenarios';

const STORAGE_KEY = 'kpr-saved-scenarios';

const makeScenario = (label: string) => ({
  label,
  propertyPrice: 1000000,
  downPaymentPercent: 20,
  downPayment: 200000,
  loanAmount: 800000,
  loanTermYears: 20,
  interestRate: 5,
  monthlyPayment: 5000,
  totalPayment: 1200000,
  totalInterest: 400000,
});

describe('useSavedScenarios', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty when no stored data', () => {
    const { result } = renderHook(() => useSavedScenarios());
    expect(result.current.scenarios).toEqual([]);
  });

  it('loads scenarios from localStorage', () => {
    const existing = [{ ...makeScenario('Old'), id: '1', savedAt: '2024-01-01' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    const { result } = renderHook(() => useSavedScenarios());
    expect(result.current.scenarios).toHaveLength(1);
    expect(result.current.scenarios[0].label).toBe('Old');
  });

  it('adds a scenario with generated id and savedAt', () => {
    const { result } = renderHook(() => useSavedScenarios());
    let added: any;
    act(() => { added = result.current.addScenario(makeScenario('Test')); });
    expect(result.current.scenarios).toHaveLength(1);
    expect(added.id).toMatch(/^scenario_/);
    expect(added.savedAt).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
  });

  it('limits to 10 scenarios max', () => {
    const { result } = renderHook(() => useSavedScenarios());
    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addScenario(makeScenario(`S${i}`));
      }
    });
    expect(result.current.scenarios).toHaveLength(10);
  });

  it('removes a scenario by id', () => {
    const { result } = renderHook(() => useSavedScenarios());
    let s1: any;
    act(() => {
      s1 = result.current.addScenario(makeScenario('A'));
      result.current.addScenario(makeScenario('B'));
    });
    act(() => result.current.removeScenario(s1.id));
    expect(result.current.scenarios).toHaveLength(1);
    expect(result.current.scenarios[0].label).toBe('B');
  });

  it('clears all scenarios', () => {
    const { result } = renderHook(() => useSavedScenarios());
    act(() => {
      result.current.addScenario(makeScenario('A'));
      result.current.addScenario(makeScenario('B'));
    });
    act(() => result.current.clearAll());
    expect(result.current.scenarios).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
  });

  it('updates label for a scenario', () => {
    const { result } = renderHook(() => useSavedScenarios());
    let s: any;
    act(() => { s = result.current.addScenario(makeScenario('Old')); });
    act(() => result.current.updateLabel(s.id, 'New'));
    expect(result.current.scenarios[0].label).toBe('New');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const { result } = renderHook(() => useSavedScenarios());
    expect(result.current.scenarios).toEqual([]);
  });
});
