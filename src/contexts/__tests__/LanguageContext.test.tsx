import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageContext', () => {
  it('provides default language', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(['en', 'id', 'zh', 'ja', 'ko']).toContain(result.current.language);
  });

  it('setLanguage updates language', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => result.current.setLanguage('id'));
    expect(result.current.language).toBe('id');
  });

  it('persists language to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => result.current.setLanguage('zh'));
    expect(localStorage.getItem('language')).toBe('zh');
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useLanguage());
    }).toThrow('useLanguage must be used within a LanguageProvider');
  });
});
