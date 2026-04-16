import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations, loadTranslations, type TranslationMap, type Language } from './translations';

// Track missing keys globally to avoid duplicate warnings
const missingKeyLog = new Set<string>();

/**
 * Self-healing translation hook with:
 * - Lazy loading for non-primary locales
 * - Missing key detection & console warnings (dev mode)
 * - Cascading fallback: current lang → English → Indonesian → raw key
 * - Nested key resolution via dot notation
 */
export const useTranslation = () => {
  const { language, setLanguage } = useLanguage();
  const [, setLoaded] = useState(0);

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
        // Log missing translation in dev
        if (import.meta.env.DEV) {
          const logKey = `${language}:${key}`;
          if (!missingKeyLog.has(logKey)) {
            missingKeyLog.add(logKey);
            console.warn(`[i18n missing] ${language}.${key} — falling back to English`);
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
            console.warn(`[i18n missing] Key "${key}" not found in EN or ${language} — using ID fallback`);
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
        console.error(`[i18n error] Key "${key}" not found in any locale`);
      }
    }
    return fallback ?? key;
  }, [language, resolve]);

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
