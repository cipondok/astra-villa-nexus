import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to lock body scroll and prevent layout shift caused by scrollbar removal
 * 
 * This hook:
 * 1. Calculates the scrollbar width (typically 15px on desktop, 0 on mobile)
 * 2. When locked, sets overflow:hidden and adds padding-right to compensate
 * 3. Prevents the dreaded "page jump" when modals/popovers open
 * 
 * @returns {lockScroll, unlockScroll, isLocked}
 */
export function useScrollLock() {
  const isLockedRef = useRef(false);
  const originalStyleRef = useRef<{
    overflow: string;
    paddingRight: string;
  } | null>(null);

  /**
   * Calculate scrollbar width (desktop: ~15px, mobile: 0px)
   */
  const getScrollbarWidth = useCallback(() => {
    // Create a temporary div to measure scrollbar
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.width = '100px';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);

    console.log('[useScrollLock] Scrollbar width calculated:', scrollbarWidth + 'px');
    return scrollbarWidth;
  }, []);

  /**
   * Lock scroll and reserve space for removed scrollbar
   */
  const lockScroll = useCallback(() => {
    if (isLockedRef.current) {
      console.warn('[useScrollLock] Already locked, skipping');
      return;
    }

    // Save original styles
    originalStyleRef.current = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    // Calculate and apply
    const scrollbarWidth = getScrollbarWidth();
    const currentPadding = parseInt(
      window.getComputedStyle(document.body).paddingRight || '0',
      10
    );

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    
    // Set CSS variable for child components
    document.documentElement.style.setProperty(
      '--removed-body-scroll-bar-size',
      `${scrollbarWidth}px`
    );

    isLockedRef.current = true;
    console.log('[useScrollLock] 🔒 Scroll locked. Padding added:', scrollbarWidth + 'px');
  }, [getScrollbarWidth]);

  /**
   * Unlock scroll and restore original styles
   */
  const unlockScroll = useCallback(() => {
    if (!isLockedRef.current) {
      console.warn('[useScrollLock] Not locked, skipping unlock');
      return;
    }

    // Restore original styles
    if (originalStyleRef.current) {
      document.body.style.overflow = originalStyleRef.current.overflow;
      document.body.style.paddingRight = originalStyleRef.current.paddingRight;
    }

    // Clean up CSS variable
    document.documentElement.style.removeProperty('--removed-body-scroll-bar-size');

    isLockedRef.current = false;
    console.log('[useScrollLock] 🔓 Scroll unlocked. Styles restored.');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLockedRef.current) {
        unlockScroll();
      }
    };
  }, [unlockScroll]);

  return {
    lockScroll,
    unlockScroll,
    isLocked: isLockedRef.current,
  };
}

/**
 * Alternative: Auto-lock when condition is true
 * Usage: useAutoScrollLock(isModalOpen || isPopoverOpen);
 */
export function useAutoScrollLock(shouldLock: boolean) {
  const { lockScroll, unlockScroll } = useScrollLock();

  useEffect(() => {
    if (shouldLock) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [shouldLock, lockScroll, unlockScroll]);
}
