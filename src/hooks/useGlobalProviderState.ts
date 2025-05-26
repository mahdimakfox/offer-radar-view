
import { useCallback, useEffect, useState } from 'react';
import { useProviderCounts } from './queries/useProviderCounts';
import { useProvidersForCategory } from './queries/useProvidersForCategory';
import { useProviderCacheActions } from './queries/useProviderCacheActions';
import { useProviderSorting, useAllCachedProviders } from './utils/providerUtils';
import { UseGlobalProviderStateOptions, ProviderStateResult } from './types/providerTypes';
import { useToast } from '@/hooks/use-toast';

export const useGlobalProviderState = (options: UseGlobalProviderStateOptions): ProviderStateResult => {
  const { category, searchTerm = '', sortBy = 'price', sortOrder = 'asc', enabled = true } = options;
  const [errorCount, setErrorCount] = useState(0);
  const { toast } = useToast();

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

  // Handle errors with retry logic
  useEffect(() => {
    if (providersError && errorCount < 2) {
      console.warn(`Provider fetch error (attempt ${errorCount + 1}):`, providersError);
      setErrorCount(prev => prev + 1);
      
      // Auto-retry once after a delay
      const timer = setTimeout(() => {
        refetchProviders();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (providersError && errorCount >= 2) {
      // Show error toast after multiple failures
      toast({
        title: "Lasting av data feilet",
        description: "Prøv å oppdatere siden eller velg en annen kategori.",
        variant: "destructive",
      });
    }
  }, [providersError, errorCount, refetchProviders, toast]);

  // Reset error count when category changes successfully
  useEffect(() => {
    if (providers.length > 0) {
      setErrorCount(0);
    }
  }, [providers.length]);

  // Action functions
  const refetchAll = useCallback(() => {
    setErrorCount(0);
    refetchProviders();
    refetchCounts();
  }, [refetchProviders, refetchCounts]);

  const enhancedInvalidateCategory = useCallback((categoryToInvalidate: string) => {
    setErrorCount(0);
    invalidateCategory(categoryToInvalidate);
  }, [invalidateCategory]);

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
    providersError: (errorCount >= 2 ? providersError : null) as Error | null,
    countsError: countsError as Error | null,
    
    // Actions
    refetchProviders,
    refetchCounts,
    refetchAll,
    invalidateCategory: enhancedInvalidateCategory,
    prefetchCategory,
    
    // Computed data
    sortedProviders,
    filteredProviders: sortedProviders,
    hasMoreData: false,
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
