
import { useState, useEffect } from 'react';
import { providerService, Provider } from '@/services/providerService';

interface ProviderDataResult {
  providers: Provider[];
  count: number;
  loading: boolean;
  error: string | null;
}

export const useProviderData = (category: string, searchTerm: string = ''): ProviderDataResult => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: Provider[];
        if (searchTerm.trim()) {
          data = await providerService.searchProviders(category, searchTerm);
        } else {
          data = await providerService.getProvidersByCategory(category);
        }
        setProviders(data);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Feil ved henting av leverandører');
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category, searchTerm]);

  return {
    providers,
    count: providers.length,
    loading,
    error
  };
};

// Hook for å hente antall leverandører per kategori
export const useCategoryProviderCounts = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];
      const countPromises = categories.map(async (category) => {
        const providers = await providerService.getProvidersByCategory(category);
        return { category, count: providers.length };
      });

      try {
        const results = await Promise.all(countPromises);
        const countsMap = results.reduce((acc, { category, count }) => {
          acc[category] = count;
          return acc;
        }, {} as Record<string, number>);
        
        setCounts(countsMap);
      } catch (error) {
        console.error('Error fetching provider counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading };
};
