// Safe wrappers around localStorage/sessionStorage.
// Some browsers (or privacy modes) can throw on access; this prevents crashes.
// IMPORTANT: if persistent storage is not available, popups should fail-closed (do not auto-show)
// to avoid reappearing on every refresh.

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const memoryFallback = new Map<string, string>();

const canUseWindow = () => typeof window !== 'undefined';

const testPersistentStorage = (storage: StorageLike | undefined) => {
  if (!storage) return false;
  try {
    const k = '__astra_storage_test__';
    storage.setItem(k, '1');
    storage.removeItem(k);
    return true;
  } catch {
    return false;
  }
};

// Evaluated once per page load.
export const storageSupport = {
  session: canUseWindow() ? testPersistentStorage(window.sessionStorage) : false,
  local: canUseWindow() ? testPersistentStorage(window.localStorage) : false,
};

const safeGet = (storage: StorageLike | undefined, key: string): string | null => {
  try {
    if (!storage) return memoryFallback.get(key) ?? null;
    return storage.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
};

const safeSet = (storage: StorageLike | undefined, key: string, value: string) => {
  try {
    if (!storage) {
      memoryFallback.set(key, value);
      return;
    }
    storage.setItem(key, value);
  } catch {
    memoryFallback.set(key, value);
  }
};

const safeRemove = (storage: StorageLike | undefined, key: string) => {
  try {
    if (!storage) {
      memoryFallback.delete(key);
      return;
    }
    storage.removeItem(key);
  } catch {
    memoryFallback.delete(key);
  }
};

export const safeSessionStorage = {
  getItem: (key: string) => safeGet(canUseWindow() ? window.sessionStorage : undefined, key),
  setItem: (key: string, value: string) => safeSet(canUseWindow() ? window.sessionStorage : undefined, key, value),
  removeItem: (key: string) => safeRemove(canUseWindow() ? window.sessionStorage : undefined, key),
};

export const safeLocalStorage = {
  getItem: (key: string) => safeGet(canUseWindow() ? window.localStorage : undefined, key),
  setItem: (key: string, value: string) => safeSet(canUseWindow() ? window.localStorage : undefined, key, value),
  removeItem: (key: string) => safeRemove(canUseWindow() ? window.localStorage : undefined, key),
};

export const getLocalDayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

