// Shared cookie preferences store used by the banner and the preferences page.
// Persists to localStorage and broadcasts changes via a window CustomEvent
// so any mounted UI (banner, preferences page) stays in sync.

export const COOKIE_PREFS_KEY = "astra-villa-cookie-preferences";
export const COOKIE_PREFS_EVENT = "cookie-preferences-changed";

export type CookiePrefs = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const defaultCookiePrefs: CookiePrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const allAcceptedPrefs: CookiePrefs = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export function loadCookiePrefs(): CookiePrefs {
  if (typeof window === "undefined") return defaultCookiePrefs;
  try {
    const raw = localStorage.getItem(COOKIE_PREFS_KEY);
    if (!raw) return defaultCookiePrefs;
    const parsed = JSON.parse(raw);
    return { ...defaultCookiePrefs, ...parsed, necessary: true };
  } catch {
    return defaultCookiePrefs;
  }
}

export function saveCookiePrefs(prefs: CookiePrefs) {
  if (typeof window === "undefined") return;
  try {
    const next: CookiePrefs = { ...prefs, necessary: true };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent<CookiePrefs>(COOKIE_PREFS_EVENT, { detail: next }));
  } catch (e) {
    console.error("Failed to save cookie preferences", e);
  }
}

export function subscribeCookiePrefs(cb: (prefs: CookiePrefs) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<CookiePrefs>).detail;
    cb(detail ?? loadCookiePrefs());
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === COOKIE_PREFS_KEY) cb(loadCookiePrefs());
  };
  window.addEventListener(COOKIE_PREFS_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(COOKIE_PREFS_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
