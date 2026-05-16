import { useEffect } from "react";

interface UseChatKeyboardShortcutsProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  disabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for the chat widget:
 * - Ctrl+K (or Cmd+K on Mac) to open chat
 * - Escape to close chat
 */
export const useChatKeyboardShortcuts = ({
  isOpen,
  onOpen,
  onClose,
  disabled = false
}: UseChatKeyboardShortcutsProps) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          onOpen();
        }
      }

      // Escape to close chat
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpen, onClose, disabled]);
};
