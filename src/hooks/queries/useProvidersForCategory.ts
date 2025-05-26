
import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/services/providerService';
import { useDataProvider } from '@/providers/DataProvider';
import { PROVIDER_QUERY_KEYS } from './providerQueryKeys';

export const useProvidersForCategory = (category: string, searchTerm?: string, enabled = true) => {
  const { logError } = useDataProvider();

  return useQuery({
    queryKey: searchTerm 
      ? PROVIDER_QUERY_KEYS.search(category, searchTerm)
      : PROVIDER_QUERY_KEYS.category(category),
    queryFn: async () => {
      try {
        if (searchTerm?.trim()) {
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
};
