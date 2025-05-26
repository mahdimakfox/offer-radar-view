
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
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
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

  // Handle successful data fetch
  useEffect(() => {
    if (providers.length > 0 && !providersError) {
      setLastSuccessfulFetch(new Date());
      setErrorCount(0);
    }
  }, [providers.length, providersError]);

  // Enhanced error handling with smart retry logic
  useEffect(() => {
    if (providersError && errorCount < 2) {
      console.warn(`Provider fetch error (attempt ${errorCount + 1}):`, providersError);
      setErrorCount(prev => prev + 1);
      
      // Auto-retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, errorCount), 5000);
      const timer = setTimeout(() => {
        console.log(`Retrying data fetch after ${retryDelay}ms...`);
        refetchProviders();
      }, retryDelay);
      
      return () => clearTimeout(timer);
    } else if (providersError && errorCount >= 2) {
      // Show persistent error toast after multiple failures
      toast({
        title: "Lasting av data feilet",
        description: `Kunne ikke laste leverandører for ${category}. Prøv å oppdatere siden eller velg en annen kategori.`,
        variant: "destructive",
      });
    }
  }, [providersError, errorCount, refetchProviders, toast, category]);

  // Enhanced action functions with better error handling
  const refetchAll = useCallback(() => {
    console.log('Refreshing all provider data...');
    setErrorCount(0);
    Promise.all([refetchProviders(), refetchCounts()])
      .then(() => {
        console.log('Successfully refreshed all data');
        toast({
          title: "Data oppdatert",
          description: "Alle leverandørdata har blitt lastet på nytt.",
        });
      })
      .catch((error) => {
        console.error('Failed to refresh data:', error);
        toast({
          title: "Oppdatering feilet",
          description: "Kunne ikke oppdatere alle data. Prøv igjen senere.",
          variant: "destructive",
        });
      });
  }, [refetchProviders, refetchCounts, toast]);

  const enhancedInvalidateCategory = useCallback((categoryToInvalidate: string) => {
    console.log(`Invalidating cache for category: ${categoryToInvalidate}`);
    setErrorCount(0);
    invalidateCategory(categoryToInvalidate);
  }, [invalidateCategory]);

  const enhancedPrefetchCategory = useCallback((categoryToPrefetch: string) => {
    console.log(`Prefetching data for category: ${categoryToPrefetch}`);
    prefetchCategory(categoryToPrefetch);
  }, [prefetchCategory]);

  // Calculate derived state
  const hasData = sortedProviders.length > 0;
  const isEmpty = !providersLoading && !isRefetching && sortedProviders.length === 0;
  const isError = (errorCount >= 2 ? providersError : null) !== null;

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
    prefetchCategory: enhancedPrefetchCategory,
    
    // Computed data
    sortedProviders,
    filteredProviders: sortedProviders,
    hasMoreData: false,
    totalCount: sortedProviders.length,

    // Enhanced status indicators
    hasData,
    isEmpty,
    isError,
    lastSuccessfulFetch,
    errorCount,
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
