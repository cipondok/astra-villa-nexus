import { useLanguage } from '@/contexts/LanguageContext';
import translations, { type TranslationMap } from './translations';

/**
 * Hook for accessing centralized translations.
 * 
 * Usage:
 *   const { t, language, setLanguage } = useTranslation();
 *   t('common.loading')    // "Loading..." or "Memuat..."
 *   t('analytics.dashboard') // "Analytics Dashboard" or "Dasbor Analitik"
 */
export const useTranslation = () => {
  const { language, setLanguage } = useLanguage();

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to English
        let enResult: any = translations.en;
        for (const ek of keys) {
          if (enResult && typeof enResult === 'object' && ek in enResult) {
            enResult = enResult[ek];
          } else {
            return fallback || key;
          }
        }
        return typeof enResult === 'string' ? enResult : fallback || key;
      }
    }

    return typeof result === 'string' ? result : fallback || key;
  };

  /** Get an array translation (e.g. footer.benefits) */
  const tArray = (key: string): string[] => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        let enResult: any = translations.en;
        for (const ek of keys) {
          if (enResult && typeof enResult === 'object' && ek in enResult) {
            enResult = enResult[ek];
          } else {
            return [];
          }
        }
        return Array.isArray(enResult) ? enResult : [];
      }
    }
    return Array.isArray(result) ? result : [];
  };

  return { t, tArray, language, setLanguage };
};

export default useTranslation;
