import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations, loadTranslations, type TranslationMap, type Language } from './translations';

/**
 * Hook for accessing centralized translations.
 * Lazy-loads non-primary locale files (zh, ja, ko) on demand.
 */
export const useTranslation = () => {
  const { language, setLanguage } = useLanguage();
  const [, setLoaded] = useState(0); // trigger re-render after lazy load

  useEffect(() => {
    loadTranslations(language).then(() => setLoaded((n) => n + 1));
  }, [language]);

  const resolve = (map: TranslationMap, keys: string[]): string | undefined => {
    let result: any = map;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return undefined;
      }
    }
    return typeof result === 'string' ? result : undefined;
  };

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    const current = getTranslations(language);
    const value = resolve(current, keys);
    if (value !== undefined) return value;
    // Fallback to English
    const en = getTranslations('en');
    return resolve(en, keys) ?? fallback ?? key;
  };

  const tArray = (key: string): string[] => {
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
    return resolveArr(getTranslations('en'));
  };

  return { t, tArray, language, setLanguage };
};

export default useTranslation;
