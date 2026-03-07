// Centralized translations aggregator
// Indonesian loaded eagerly (default); all others lazy-loaded on demand

import id from './locales/id';

export type Language = 'en' | 'id' | 'zh' | 'ja' | 'ko' | 'ru';

export interface TranslationMap {
  [key: string]: string | string[] | TranslationMap;
}

const lazyLoaders: Partial<Record<Language, () => Promise<{ default: TranslationMap }>>> = {
  en: () => import('./locales/en'),
  zh: () => import('./locales/zh'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  ru: () => import('./locales/ru'),
};

const cache: Partial<Record<Language, TranslationMap>> = { id };

/** Get translations for a language, loading lazily if needed */
export async function loadTranslations(lang: Language): Promise<TranslationMap> {
  if (cache[lang]) return cache[lang]!;
  const loader = lazyLoaders[lang];
  if (loader) {
    const mod = await loader();
    cache[lang] = mod.default;
    return mod.default;
  }
  return id; // fallback
}

/** Synchronous access — returns cached translations or Indonesian fallback */
export function getTranslations(lang: Language): TranslationMap {
  return cache[lang] || id;
}

export default { id } as Record<Language, TranslationMap>;
