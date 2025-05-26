
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { providerService, Provider } from '@/services/providerService';
import { useMemo } from 'react';

// Query keys for React Query
export const QUERY_KEYS = {
  providers: (category: string, searchTerm?: string) => 
    ['providers', category, searchTerm].filter(Boolean),
  providerCounts: () => ['provider-counts'],
  providerById: (id: number) => ['provider', id],
} as const;

interface UseProvidersOptions {
  category: string;
  searchTerm?: string;
  enabled?: boolean;
}

interface UseProvidersResult {
  providers: Provider[];
  count: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
}

export const useProviders = ({ 
  category, 
  searchTerm = '', 
  enabled = true 
}: UseProvidersOptions): UseProvidersResult => {
  const {
    data: providers = [],
    isLoading: loading,
    error,
    refetch,
    isStale,
  } = useQuery({
    queryKey: QUERY_KEYS.providers(category, searchTerm),
    queryFn: async () => {
      if (searchTerm.trim()) {
        return await providerService.searchProviders(category, searchTerm);
      }
      return await providerService.getProvidersByCategory(category);
    },
    enabled: enabled && !!category,
    staleTime: 3 * 60 * 1000, // 3 minutes for provider data
  });

  return {
    providers,
    count: providers.length,
    loading,
    error: error as Error | null,
    refetch,
    isStale,
  };
};

// Hook for fetching provider counts across all categories
interface UseCategoryCountsResult {
  counts: Record<string, number>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCategoryCounts = (): UseCategoryCountsResult => {
  const {
    data: counts = {},
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.providerCounts(),
    queryFn: async () => {
      const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];
      
      const countPromises = categories.map(async (category) => {
        const providers = await providerService.getProvidersByCategory(category);
        return { category, count: providers.length };
      });

      const results = await Promise.all(countPromises);
      return results.reduce((acc, { category, count }) => {
        acc[category] = count;
        return acc;
      }, {} as Record<string, number>);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for counts
  });

  return {
    counts,
    loading,
    error: error as Error | null,
    refetch,
  };
};

// Hook for individual provider details
interface UseProviderResult {
  provider: Provider | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useProvider = (id: number, enabled: boolean = true): UseProviderResult => {
  const {
    data: provider = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.providerById(id),
    queryFn: () => providerService.getProviderById(id),
    enabled: enabled && !!id,
  });

  return {
    provider,
    loading,
    error: error as Error | null,
    refetch,
  };
};

// Custom hook for invalidating and refetching related data
export const useProviderActions = () => {
  const queryClient = useQueryClient();

  const invalidateProviders = (category?: string) => {
    if (category) {
      queryClient.invalidateQueries({ 
        queryKey: ['providers', category],
        exact: false 
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  };

  const invalidateCounts = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providerCounts() });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['providers'] });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providerCounts() });
  };

  const prefetchProvider = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.providerById(id),
      queryFn: () => providerService.getProviderById(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCategory = (category: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.providers(category),
      queryFn: () => providerService.getProvidersByCategory(category),
      staleTime: 3 * 60 * 1000,
    });
  };

  return {
    invalidateProviders,
    invalidateCounts,
    invalidateAll,
    prefetchProvider,
    prefetchCategory,
  };
};

// Memoized selectors for efficient data access
export const useProviderSelectors = (providers: Provider[]) => {
  const sortedByPrice = useMemo(() => 
    [...providers].sort((a, b) => a.price - b.price), 
    [providers]
  );

  const sortedByRating = useMemo(() => 
    [...providers].sort((a, b) => b.rating - a.rating), 
    [providers]
  );

  const sortedByName = useMemo(() => 
    [...providers].sort((a, b) => a.name.localeCompare(b.name)), 
    [providers]
  );

  const getProvidersByRating = useMemo(() => (minRating: number) => 
    providers.filter(p => p.rating >= minRating), 
    [providers]
  );

  const getProvidersByPriceRange = useMemo(() => (min: number, max: number) => 
    providers.filter(p => p.price >= min && p.price <= max), 
    [providers]
  );

  return {
    sortedByPrice,
    sortedByRating,
    sortedByName,
    getProvidersByRating,
    getProvidersByPriceRange,
  };
};
