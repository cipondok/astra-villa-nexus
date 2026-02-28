// Centralized translations aggregator
// English loaded eagerly (fallback); all others lazy-loaded on demand

import en from './locales/en';

export type Language = 'en' | 'id' | 'zh' | 'ja' | 'ko';

export interface TranslationMap {
  [key: string]: string | string[] | TranslationMap;
}

const lazyLoaders: Partial<Record<Language, () => Promise<{ default: TranslationMap }>>> = {
  id: () => import('./locales/id'),
  zh: () => import('./locales/zh'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
};

const cache: Partial<Record<Language, TranslationMap>> = { en };

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

export default { en } as Record<Language, TranslationMap>;
