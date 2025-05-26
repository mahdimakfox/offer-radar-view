
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { providerService, Provider } from '@/services/providerService';
import { useMemo, useCallback } from 'react';
import { useDataProvider } from '@/providers/DataProvider';

// Centralized query keys for consistency
export const PROVIDER_QUERY_KEYS = {
  all: ['providers'] as const,
  categories: () => [...PROVIDER_QUERY_KEYS.all, 'categories'] as const,
  category: (category: string) => [...PROVIDER_QUERY_KEYS.categories(), category] as const,
  search: (category: string, searchTerm: string) => [...PROVIDER_QUERY_KEYS.category(category), 'search', searchTerm] as const,
  counts: () => [...PROVIDER_QUERY_KEYS.all, 'counts'] as const,
  byId: (id: number) => [...PROVIDER_QUERY_KEYS.all, 'byId', id] as const,
} as const;

// Centralized pagination and filtering state
interface ProviderFilters {
  category: string;
  searchTerm?: string;
  sortBy?: 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UseGlobalProviderStateOptions extends ProviderFilters {
  enabled?: boolean;
}

interface ProviderStateResult {
  // Data
  providers: Provider[];
  allProviders: Provider[];
  counts: Record<string, number>;
  
  // Loading states
  providersLoading: boolean;
  countsLoading: boolean;
  isRefetching: boolean;
  
  // Error states
  providersError: Error | null;
  countsError: Error | null;
  
  // Actions
  refetchProviders: () => void;
  refetchCounts: () => void;
  refetchAll: () => void;
  invalidateCategory: (category: string) => void;
  prefetchCategory: (category: string) => void;
  
  // Computed data
  sortedProviders: Provider[];
  filteredProviders: Provider[];
  hasMoreData: boolean;
  totalCount: number;
}

export const useGlobalProviderState = (options: UseGlobalProviderStateOptions): ProviderStateResult => {
  const { category, searchTerm = '', sortBy = 'price', sortOrder = 'asc', enabled = true } = options;
  const { logError } = useDataProvider();
  const queryClient = useQueryClient();

  // Fetch providers for specific category with search
  const {
    data: providers = [],
    isLoading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
    isRefetching,
  } = useQuery({
    queryKey: searchTerm 
      ? PROVIDER_QUERY_KEYS.search(category, searchTerm)
      : PROVIDER_QUERY_KEYS.category(category),
    queryFn: async () => {
      try {
        if (searchTerm.trim()) {
          return await providerService.searchProviders(category, searchTerm);
        }
        return await providerService.getProvidersByCategory(category);
      } catch (error) {
        logError(`Failed to fetch providers for category ${category}`, error);
        throw error;
      }
    },
    enabled: enabled && !!category,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Fetch category counts
  const {
    data: counts = {},
    isLoading: countsLoading,
    error: countsError,
    refetch: refetchCounts,
  } = useQuery({
    queryKey: PROVIDER_QUERY_KEYS.counts(),
    queryFn: async () => {
      try {
        const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];
        
        const countPromises = categories.map(async (cat) => {
          const providers = await providerService.getProvidersByCategory(cat);
          return { category: cat, count: providers.length };
        });

        const results = await Promise.all(countPromises);
        return results.reduce((acc, { category: cat, count }) => {
          acc[cat] = count;
          return acc;
        }, {} as Record<string, number>);
      } catch (error) {
        logError('Failed to fetch category counts', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoized sorted providers
  const sortedProviders = useMemo(() => {
    const sorted = [...providers];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = b.rating - a.rating; // Higher rating first
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [providers, sortBy, sortOrder]);

  // Memoized filtered providers (for additional client-side filtering if needed)
  const filteredProviders = useMemo(() => {
    return sortedProviders; // Currently same as sorted, but can be extended
  }, [sortedProviders]);

  // Get all providers from cache for global access
  const allProviders = useMemo(() => {
    const allCachedProviders: Provider[] = [];
    const queryCache = queryClient.getQueryCache();
    
    queryCache.getAll().forEach((query) => {
      if (query.queryKey[0] === 'providers' && query.state.data) {
        const data = query.state.data;
        // Only spread if data is an array
        if (Array.isArray(data)) {
          allCachedProviders.push(...data);
        }
      }
    });
    
    // Remove duplicates
    const uniqueProviders = allCachedProviders.filter((provider, index, self) => 
      index === self.findIndex(p => p.id === provider.id)
    );
    
    return uniqueProviders;
  }, [queryClient, providers]);

  // Action functions
  const refetchAll = useCallback(() => {
    refetchProviders();
    refetchCounts();
  }, [refetchProviders, refetchCounts]);

  const invalidateCategory = useCallback((categoryId: string) => {
    queryClient.invalidateQueries({ 
      queryKey: PROVIDER_QUERY_KEYS.category(categoryId),
      exact: false 
    });
  }, [queryClient]);

  const prefetchCategory = useCallback((categoryId: string) => {
    queryClient.prefetchQuery({
      queryKey: PROVIDER_QUERY_KEYS.category(categoryId),
      queryFn: () => providerService.getProvidersByCategory(categoryId),
      staleTime: 3 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    // Data
    providers: filteredProviders,
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
    filteredProviders,
    hasMoreData: false, // Can be implemented for pagination
    totalCount: filteredProviders.length,
  };
};

// Specialized hooks for specific use cases
export const useProviderCounts = () => {
  const { counts, countsLoading, countsError, refetchCounts } = useGlobalProviderState({
    category: 'strom', // Default category, not used for counts
    enabled: true,
  });

  return {
    counts,
    loading: countsLoading,
    error: countsError,
    refetch: refetchCounts,
  };
};

export const useProvidersForCategory = (category: string, searchTerm?: string) => {
  return useGlobalProviderState({
    category,
    searchTerm,
    enabled: !!category,
  });
};

// Hook for prefetching and cache management
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

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROVIDER_QUERY_KEYS.all });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    prefetchProvider,
    invalidateAll,
    clearCache,
  };
};
