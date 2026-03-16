import { useState, useEffect } from 'react';

/**
 * Returns a human-readable relative time string that auto-updates every 10s.
 * @param timestamp - epoch ms or undefined
 */
export function useRelativeTime(timestamp: number | undefined): string {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timestamp) return;
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, [timestamp]);

  if (!timestamp) return '';

  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
