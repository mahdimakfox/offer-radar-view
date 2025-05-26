
import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/services/providerService';
import { useDataProvider } from '@/providers/DataProvider';
import { PROVIDER_QUERY_KEYS } from './providerQueryKeys';

export const useProviderCounts = () => {
  const { logError } = useDataProvider();

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

  return {
    counts,
    loading: countsLoading,
    error: countsError,
    refetch: refetchCounts,
  };
};
