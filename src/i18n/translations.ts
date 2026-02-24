// Centralized translations aggregator
// Usage: import { useTranslation } from '@/i18n/useTranslation';
//        const { t } = useTranslation();
//        <p>{t('common.loading')}</p>

import en from './locales/en';
import id from './locales/id';
import zh from './locales/zh';
import ja from './locales/ja';
import ko from './locales/ko';

export type Language = 'en' | 'id' | 'zh' | 'ja' | 'ko';

export interface TranslationMap {
  [key: string]: string | string[] | TranslationMap;
}

const translations: Record<Language, TranslationMap> = {
  en,
  id,
  zh,
  ja,
  ko,
};

export default translations;
