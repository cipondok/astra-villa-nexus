import { useEffect, useRef } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useGlobalLoading } from './useGlobalLoading';

/**
 * Hook that automatically shows the loading progress popup
 * when React Query is fetching or mutating data
 */
export const useQueryLoadingIntegration = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { startLoading, updateProgress, finishLoading, isLoading } = useGlobalLoading();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    const isActive = isFetching > 0 || isMutating > 0;

    if (isActive && !wasLoadingRef.current) {
      // Start loading
      wasLoadingRef.current = true;
      progressRef.current = 0;
      
      const message = isMutating > 0 ? 'Saving changes...' : 'Loading data...';
      startLoading(message);

      // Simulate progress
      const simulateProgress = () => {
        if (progressRef.current < 90) {
          progressRef.current += Math.random() * 15;
          updateProgress(progressRef.current);
        }
        timeoutRef.current = setTimeout(simulateProgress, 200 + Math.random() * 300);
      };
      simulateProgress();
    } else if (!isActive && wasLoadingRef.current) {
      // Finish loading
      wasLoadingRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Complete the progress bar before finishing
      updateProgress(100);
      setTimeout(() => {
        finishLoading();
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFetching, isMutating]);

  return { isFetching, isMutating };
};
