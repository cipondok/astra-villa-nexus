import { useEffect, useCallback } from 'react';

interface ShortcutItem {
  id: string;
  label: string;
}

interface UseAdminKeyboardShortcutsOptions {
  items: ShortcutItem[];
  onNavigate: (id: string) => void;
  enabled?: boolean;
}

/**
 * Global keyboard shortcut handler for admin quick navigation.
 * Maps number keys 1–9 to quick nav items.
 * Auto-disables when:
 *  - Focus is in input/textarea/select/contenteditable
 *  - A modal/dialog/command-palette overlay is open
 *  - Any modifier key (Ctrl/Alt/Meta) is held
 */
export function useAdminKeyboardShortcuts({
  items,
  onNavigate,
  enabled = true,
}: UseAdminKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Skip when modifier keys are held (browser/system shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Skip when focused on interactive text elements
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable
      ) {
        return;
      }

      // Skip when modal/dialog/command-palette overlays are open
      const hasOverlay =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('[role="alertdialog"]') ||
        document.querySelector('[data-radix-popper-content-wrapper]') ||
        document.querySelector('[cmdk-overlay]') ||
        document.querySelector('[data-state="open"][role="listbox"]');
      if (hasOverlay) return;

      // Map digit keys 1–9 to items
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 9 && keyNum <= items.length) {
        e.preventDefault();
        onNavigate(items[keyNum - 1].id);
      }
    },
    [items, onNavigate, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
