import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  action: () => void;
  description: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook to manage keyboard shortcuts
 * Automatically prevents shortcuts when user is typing in input fields
 */
export const useKeyboardShortcuts = ({ 
  shortcuts, 
  enabled = true 
}: UseKeyboardShortcutsOptions) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable ||
      target.closest('[contenteditable="true"]');

    if (isInputField) return;

    // Check each shortcut
    shortcuts.forEach(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enabled, handleKeyPress]);

  return shortcuts;
};
