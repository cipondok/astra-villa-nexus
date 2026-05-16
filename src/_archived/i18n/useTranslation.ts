import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations, loadTranslations, type TranslationMap, type Language } from './translations';

// Track missing keys globally to avoid duplicate warnings
const missingKeyLog = new Set<string>();

/** Pages where silent fallback is NOT acceptable — must have real translations */
const CRITICAL_PATH_PREFIXES = [
  '/property',
  '/checkout',
  '/investment',
  '/onboarding',
  '/wallet',
  '/escrow',
  '/auth',
];

/**
 * Self-healing translation hook with:
 * - Lazy loading for non-primary locales
 * - Missing key detection & console warnings (dev mode)
 * - STRICT mode for critical money/trust pages — logs errors instead of silent fallback
 * - Cascading fallback: current lang → English → Indonesian → raw key
 * - Nested key resolution via dot notation
 */
export const useTranslation = () => {
  const { language, setLanguage } = useLanguage();
  const [, setLoaded] = useState(0);

  // Detect if current page is critical
  let isCriticalPage = false;
  try {
    const location = useLocation();
    isCriticalPage = CRITICAL_PATH_PREFIXES.some((p) => location.pathname.startsWith(p));
  } catch {
    // Outside Router context (e.g. tests) — treat as non-critical
  }

  useEffect(() => {
    loadTranslations(language).then(() => setLoaded((n) => n + 1));
  }, [language]);

  const resolve = useCallback((map: TranslationMap, keys: string[]): string | undefined => {
    let result: any = map;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return undefined;
      }
    }
    return typeof result === 'string' ? result : undefined;
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.');
    
    // 1. Try current language
    const current = getTranslations(language);
    const value = resolve(current, keys);
    if (value !== undefined) return value;

    // 2. Fallback to English
    if (language !== 'en') {
      const en = getTranslations('en');
      const enValue = resolve(en, keys);
      if (enValue !== undefined) {
        if (import.meta.env.DEV) {
          const logKey = `${language}:${key}`;
          if (!missingKeyLog.has(logKey)) {
            missingKeyLog.add(logKey);
            if (isCriticalPage) {
              console.error(`[i18n CRITICAL] ${language}.${key} missing on critical page — falling back to English`);
            } else {
              console.warn(`[i18n missing] ${language}.${key} — falling back to English`);
            }
          }
        }
        return enValue;
      }
    }

    // 3. Fallback to Indonesian
    if (language !== 'id') {
      const id = getTranslations('id');
      const idValue = resolve(id, keys);
      if (idValue !== undefined) {
        if (import.meta.env.DEV) {
          const logKey = `missing:${key}`;
          if (!missingKeyLog.has(logKey)) {
            missingKeyLog.add(logKey);
            console.error(`[i18n CRITICAL] Key "${key}" not found in EN or ${language} — using ID fallback`);
          }
        }
        return idValue;
      }
    }

    // 4. Use provided fallback or raw key
    if (import.meta.env.DEV) {
      const logKey = `notfound:${key}`;
      if (!missingKeyLog.has(logKey)) {
        missingKeyLog.add(logKey);
        console.error(`[i18n MISSING] Key "${key}" not found in any locale`);
      }
    }
    return fallback ?? key;
  }, [language, resolve, isCriticalPage]);

  const tArray = useCallback((key: string): string[] => {
    const keys = key.split('.');
    const resolveArr = (map: TranslationMap): string[] => {
      let result: any = map;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return [];
        }
      }
      return Array.isArray(result) ? result : [];
    };

    const current = getTranslations(language);
    const arr = resolveArr(current);
    if (arr.length > 0) return arr;
    
    // Fallback chain: en → id
    const enArr = resolveArr(getTranslations('en'));
    if (enArr.length > 0) return enArr;
    return resolveArr(getTranslations('id'));
  }, [language]);

  return { t, tArray, language, setLanguage };
};

export default useTranslation;
