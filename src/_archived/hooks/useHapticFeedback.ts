import { useCallback } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Hook to provide haptic feedback on mobile devices
 * Different patterns for different chat events
 */
export const useHapticFeedback = () => {
  const { isMobile } = useIsMobile();

  const triggerHaptic = useCallback((pattern: 'light' | 'medium' | 'heavy' | 'notification' | 'warning' | 'success') => {
    // Only trigger on mobile devices that support vibration
    if (!isMobile || !navigator.vibrate) return;

    try {
      switch (pattern) {
        case 'light':
          // Single short vibration for light feedback (e.g., button tap)
          navigator.vibrate(10);
          break;
        case 'medium':
          // Medium vibration for standard interactions
          navigator.vibrate(20);
          break;
        case 'heavy':
          // Longer vibration for important actions
          navigator.vibrate(40);
          break;
        case 'notification':
          // Double tap pattern for new messages
          navigator.vibrate([30, 50, 30]);
          break;
        case 'warning':
          // Three quick pulses for warnings (countdown)
          navigator.vibrate([20, 30, 20, 30, 20]);
          break;
        case 'success':
          // Smooth pattern for positive feedback
          navigator.vibrate([10, 20, 40]);
          break;
        default:
          navigator.vibrate(10);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }, [isMobile]);

  // Specific event handlers
  const onNewMessage = useCallback(() => {
    triggerHaptic('notification');
  }, [triggerHaptic]);

  const onCountdownWarning = useCallback(() => {
    triggerHaptic('warning');
  }, [triggerHaptic]);

  const onCollapse = useCallback(() => {
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const onOpen = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  const onClose = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    onNewMessage,
    onCountdownWarning,
    onCollapse,
    onOpen,
    onClose,
  };
};
