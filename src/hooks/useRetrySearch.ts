import { useState, useCallback } from 'react';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

export const useRetrySearch = <T, Args extends any[]>(
  searchFunction: (...args: Args) => Promise<T>,
  config: RetryConfig = {}
) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = config;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const calculateDelay = (attemptNumber: number): number => {
    const delay = initialDelay * Math.pow(backoffMultiplier, attemptNumber);
    return Math.min(delay, maxDelay);
  };

  const executeWithRetry = useCallback(
    async (...args: Args): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setRetryState({
            isRetrying: attempt > 0,
            retryCount: attempt,
            lastError: null,
          });

          const result = await searchFunction(...args);

          // Reset state on success
          setRetryState({
            isRetrying: false,
            retryCount: 0,
            lastError: null,
          });

          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          console.warn(
            `Search attempt ${attempt + 1}/${maxRetries + 1} failed:`,
            lastError.message
          );

          // Don't retry on the last attempt
          if (attempt < maxRetries) {
            const delay = calculateDelay(attempt);
            console.log(`Retrying in ${delay}ms...`);
            
            setRetryState({
              isRetrying: true,
              retryCount: attempt + 1,
              lastError,
            });

            await sleep(delay);
          }
        }
      }

      // All retries failed
      setRetryState({
        isRetrying: false,
        retryCount: maxRetries,
        lastError: lastError,
      });

      throw lastError || new Error('Search failed after retries');
    },
    [searchFunction, maxRetries, initialDelay, maxDelay, backoffMultiplier]
  );

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
    });
  }, []);

  return {
    executeWithRetry,
    isRetrying: retryState.isRetrying,
    retryCount: retryState.retryCount,
    lastError: retryState.lastError,
    reset,
  };
};
