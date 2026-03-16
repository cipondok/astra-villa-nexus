/**
 * Haptic feedback utility for native-like tactile responses.
 * Uses the Vibration API where available, gracefully no-ops elsewhere.
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error';

const PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  selection: 8,
  success: [10, 30, 10],
  error: [20, 40, 20, 40, 20],
};

/** Check if haptic feedback is available */
export const supportsHaptics = (): boolean =>
  typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Trigger haptic feedback.
 * Silent no-op on unsupported devices.
 */
export const haptic = (style: HapticStyle = 'light'): void => {
  if (!supportsHaptics()) return;
  try {
    const pattern = PATTERNS[style];
    navigator.vibrate(pattern);
  } catch {
    // Silently fail — haptics are non-critical
  }
};

/**
 * React onClick wrapper that adds haptic feedback.
 * Usage: <button onClick={withHaptic(handleClick, 'light')}>
 */
export const withHaptic = <E extends React.SyntheticEvent>(
  handler?: (e: E) => void,
  style: HapticStyle = 'light'
) => {
  return (e: E) => {
    haptic(style);
    handler?.(e);
  };
};
