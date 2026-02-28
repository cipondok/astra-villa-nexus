// Centralized translations aggregator
// Primary locales (en, id) loaded eagerly; others lazy-loaded on demand

import en from './locales/en';
import id from './locales/id';

export type Language = 'en' | 'id' | 'zh' | 'ja' | 'ko';

export interface TranslationMap {
  [key: string]: string | string[] | TranslationMap;
}

const eagerTranslations: Partial<Record<Language, TranslationMap>> = { en, id };

const lazyLoaders: Partial<Record<Language, () => Promise<{ default: TranslationMap }>>> = {
  zh: () => import('./locales/zh'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
};

const cache: Partial<Record<Language, TranslationMap>> = { ...eagerTranslations };

/** Get translations for a language, loading lazily if needed */
export async function loadTranslations(lang: Language): Promise<TranslationMap> {
  if (cache[lang]) return cache[lang]!;
  const loader = lazyLoaders[lang];
  if (loader) {
    const mod = await loader();
    cache[lang] = mod.default;
    return mod.default;
  }
  return en; // fallback
}

/** Synchronous access — returns cached translations or English fallback */
export function getTranslations(lang: Language): TranslationMap {
  return cache[lang] || en;
}

export default { en, id } as Record<Language, TranslationMap>;
