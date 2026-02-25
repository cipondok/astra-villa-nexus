import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/**
 * Hook that tracks React Query fetching/mutating state.
 * No longer auto-fires the loading popup — that should only be triggered
 * explicitly for long operations (e.g., file uploads).
 */
export const useQueryLoadingIntegration = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  return { isFetching, isMutating };
};
