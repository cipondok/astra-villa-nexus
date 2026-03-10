import { useEffect } from 'react';

/**
 * No-op hook. Scroll locking is handled globally via CSS overrides
 * on body[data-scroll-locked] to prevent layout shift across all pages.
 */
export const useScrollLock = (_lock: boolean) => {
  useEffect(() => {}, [_lock]);
};
