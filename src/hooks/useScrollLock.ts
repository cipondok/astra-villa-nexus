import { useEffect } from 'react';

// Reference-counted, global scroll lock to prevent layout shifts when overlays open
let locked = 0;
let scrollbarWidth = 0;
let originalPadding = "";

export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      if (locked === 0) {
        const doc = document.documentElement;
        scrollbarWidth = window.innerWidth - doc.clientWidth;
        originalPadding = document.body.style.paddingRight;
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
      locked++;
    } else if (locked > 0) {
      locked--;
      if (locked === 0) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = originalPadding;
      }
    }
  }, [isOpen]);
};
