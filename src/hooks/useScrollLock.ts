import { useEffect } from 'react';

/**
 * Reference-counted scroll lock system for handling multiple overlays
 * Prevents layout shift when modals/popovers open by:
 * 1. Calculating scrollbar width (typically 15px desktop, 0px mobile)
 * 2. Setting overflow:hidden on body
 * 3. Adding padding-right to compensate for removed scrollbar
 * 
 * Uses reference counting so multiple overlays can be open simultaneously
 * without interfering with each other.
 */

let lockCount = 0;
let scrollbarWidth = 0;
let originalPaddingRight = '';
let originalOverflow = '';

const calculateScrollbarWidth = () => {
  const doc = document.documentElement;
  const width = window.innerWidth - doc.clientWidth;
  console.log('[useScrollLock] Scrollbar width:', width + 'px');
  return width;
};

const lockScroll = () => {
  if (lockCount === 0) {
    // First lock - save original state and apply lock
    scrollbarWidth = calculateScrollbarWidth();
    originalPaddingRight = document.body.style.paddingRight;
    originalOverflow = document.body.style.overflow;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.setProperty(
        '--removed-body-scroll-bar-size',
        `${scrollbarWidth}px`
      );
    }
    console.log('[useScrollLock] 🔒 Scroll locked (count: 1, padding: ' + scrollbarWidth + 'px)');
  }
  lockCount++;
  if (lockCount > 1) {
    console.log('[useScrollLock] 🔒 Lock count increased:', lockCount);
  }
};

const unlockScroll = () => {
  if (lockCount > 0) {
    lockCount--;
    console.log('[useScrollLock] 🔓 Lock count decreased:', lockCount);
  }
  
  if (lockCount === 0) {
    // Last unlock - restore original state
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
    document.documentElement.style.removeProperty('--removed-body-scroll-bar-size');
    console.log('[useScrollLock] 🔓 Scroll fully unlocked');
  }
};

/**
 * Hook to automatically lock/unlock scroll based on a boolean state
 * Supports multiple instances - uses reference counting internally
 * 
 * @param isOpen - Whether the overlay is open
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);
}
