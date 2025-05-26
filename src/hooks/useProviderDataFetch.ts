
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Provider } from '@/services/providerService';
import { useGlobalProviderState } from '@/hooks/useGlobalProviderState';
import { useToast } from '@/hooks/use-toast';

interface UseProviderDataFetchOptions {
  category: string;
  searchTerm?: string;
  sortBy?: 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

interface UseProviderDataFetchResult {
  providers: Provider[];
  loading: boolean;
  error: Error | null;
  retryCount: number;
  hasData: boolean;
  isEmpty: boolean;
  refetch: () => void;
  retryFetch: () => void;
}

export const useProviderDataFetch = (options: UseProviderDataFetchOptions): UseProviderDataFetchResult => {
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    providers,
    providersLoading,
    providersError,
    refetchProviders,
  } = useGlobalProviderState({
    category: options.category,
    searchTerm: options.searchTerm,
    sortBy: options.sortBy || 'price',
    sortOrder: options.sortOrder || 'asc',
    enabled: options.enabled !== false,
  });

  // Handle error state changes
  useEffect(() => {
    if (providersError && providersError !== lastError) {
      setLastError(providersError);
      
      // Show error toast only for new errors
      if (retryCount < 3) {
        toast({
          title: "Feil ved lasting av data",
          description: "Prøver å laste data på nytt...",
          variant: "destructive",
        });
      }
    }
  }, [providersError, lastError, retryCount, toast]);

  const retryFetch = useCallback(async () => {
    if (retryCount >= 3) {
      toast({
        title: "Maksimalt antall forsøk nådd",
        description: "Vennligst prøv igjen senere eller kontakt support.",
        variant: "destructive",
      });
      return;
    }

    setRetryCount(prev => prev + 1);
    
    try {
      // Clear the error before retrying
      setLastError(null);
      
      // Invalidate and refetch the data
      await queryClient.invalidateQueries({ 
        queryKey: ['providers', options.category] 
      });
      
      await refetchProviders();
      
      toast({
        title: "Data lastet på nytt",
        description: "Dataene har blitt oppdatert.",
      });
    } catch (error) {
      console.error('Retry failed:', error);
      setLastError(error as Error);
    }
  }, [retryCount, queryClient, options.category, refetchProviders, toast]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
    refetchProviders();
  }, [refetchProviders]);

  // Reset retry count when category changes
  useEffect(() => {
    setRetryCount(0);
    setLastError(null);
  }, [options.category]);

  return {
    providers,
    loading: providersLoading,
    error: providersError || lastError,
    retryCount,
    hasData: providers.length > 0,
    isEmpty: !providersLoading && providers.length === 0,
    refetch,
    retryFetch,
  };
};
