
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { providerService } from '@/services/providerService';
import { useDataProvider } from '@/providers/DataProvider';
import { PROVIDER_QUERY_KEYS } from './providerQueryKeys';

export const useProviderCacheActions = () => {
  const queryClient = useQueryClient();
  const { logError } = useDataProvider();

  const prefetchProvider = useCallback(async (id: number) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: PROVIDER_QUERY_KEYS.byId(id),
        queryFn: () => providerService.getProviderById(id),
        staleTime: 5 * 60 * 1000,
      });
    } catch (error) {
      logError(`Failed to prefetch provider ${id}`, error);
    }
  }, [queryClient, logError]);

  const prefetchCategory = useCallback((categoryId: string) => {
    queryClient.prefetchQuery({
      queryKey: PROVIDER_QUERY_KEYS.category(categoryId),
      queryFn: () => providerService.getProvidersByCategory(categoryId),
      staleTime: 3 * 60 * 1000,
    });
  }, [queryClient]);

  const invalidateCategory = useCallback((categoryId: string) => {
    queryClient.invalidateQueries({ 
      queryKey: PROVIDER_QUERY_KEYS.category(categoryId),
      exact: false 
    });
  }, [queryClient]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROVIDER_QUERY_KEYS.all });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    prefetchProvider,
    prefetchCategory,
    invalidateCategory,
    invalidateAll,
    clearCache,
  };
};
