
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Provider } from '@/services/providerService';

export const useProviderSorting = (providers: Provider[], sortBy: 'price' | 'rating' | 'name', sortOrder: 'asc' | 'desc') => {
  return useMemo(() => {
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
};

export const useAllCachedProviders = (currentProviders: Provider[]) => {
  const queryClient = useQueryClient();

  return useMemo(() => {
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
  }, [queryClient, currentProviders]);
};
