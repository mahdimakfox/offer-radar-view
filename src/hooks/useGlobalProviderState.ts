
import { useCallback } from 'react';
import { useProviderCounts } from './queries/useProviderCounts';
import { useProvidersForCategory } from './queries/useProvidersForCategory';
import { useProviderCacheActions } from './queries/useProviderCacheActions';
import { useProviderSorting, useAllCachedProviders } from './utils/providerUtils';
import { UseGlobalProviderStateOptions, ProviderStateResult } from './types/providerTypes';

export const useGlobalProviderState = (options: UseGlobalProviderStateOptions): ProviderStateResult => {
  const { category, searchTerm = '', sortBy = 'price', sortOrder = 'asc', enabled = true } = options;

  // Fetch providers for specific category with search
  const {
    data: providers = [],
    isLoading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
    isRefetching,
  } = useProvidersForCategory(category, searchTerm, enabled);

  // Fetch category counts
  const {
    counts,
    loading: countsLoading,
    error: countsError,
    refetch: refetchCounts,
  } = useProviderCounts();

  // Cache actions
  const { prefetchCategory, invalidateCategory } = useProviderCacheActions();

  // Memoized sorted providers
  const sortedProviders = useProviderSorting(providers, sortBy, sortOrder);

  // Get all providers from cache for global access
  const allProviders = useAllCachedProviders(providers);

  // Action functions
  const refetchAll = useCallback(() => {
    refetchProviders();
    refetchCounts();
  }, [refetchProviders, refetchCounts]);

  return {
    // Data
    providers: sortedProviders,
    allProviders,
    counts,
    
    // Loading states
    providersLoading,
    countsLoading,
    isRefetching,
    
    // Error states
    providersError: providersError as Error | null,
    countsError: countsError as Error | null,
    
    // Actions
    refetchProviders,
    refetchCounts,
    refetchAll,
    invalidateCategory,
    prefetchCategory,
    
    // Computed data
    sortedProviders,
    filteredProviders: sortedProviders,
    hasMoreData: false, // Can be implemented for pagination
    totalCount: sortedProviders.length,
  };
};

// Re-export specialized hooks for backward compatibility
export { useProviderCounts } from './queries/useProviderCounts';
export { useProvidersForCategory } from './queries/useProvidersForCategory';
export { useProviderCacheActions } from './queries/useProviderCacheActions';

// Re-export types
export type { ProviderFilters, UseGlobalProviderStateOptions, ProviderStateResult } from './types/providerTypes';

// Re-export query keys
export { PROVIDER_QUERY_KEYS } from './queries/providerQueryKeys';
