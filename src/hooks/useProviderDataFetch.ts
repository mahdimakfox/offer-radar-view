
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
  lastSuccessfulFetch: Date | null;
  isRefetching: boolean;
}

export const useProviderDataFetch = (options: UseProviderDataFetchOptions): UseProviderDataFetchResult => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    providers,
    providersLoading,
    providersError,
    refetchProviders,
    isRefetching,
    hasData,
    isEmpty,
    isError,
    lastSuccessfulFetch,
    errorCount,
  } = useGlobalProviderState({
    category: options.category,
    searchTerm: options.searchTerm,
    sortBy: options.sortBy || 'price',
    sortOrder: options.sortOrder || 'asc',
    enabled: options.enabled !== false,
  });

  const retryFetch = useCallback(async () => {
    if (errorCount >= 3) {
      toast({
        title: "Maksimalt antall forsøk nådd",
        description: "Vennligst prøv igjen senere eller kontakt support.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Manual retry attempt (${errorCount + 1}/3) for category: ${options.category}`);
      
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
      console.error('Manual retry failed:', error);
      toast({
        title: "Kunne ikke laste data",
        description: "Prøv igjen om litt eller kontakt support hvis problemet vedvarer.",
        variant: "destructive",
      });
    }
  }, [errorCount, queryClient, options.category, refetchProviders, toast]);

  const refetch = useCallback(() => {
    console.log(`Refreshing data for category: ${options.category}`);
    refetchProviders();
  }, [refetchProviders, options.category]);

  return {
    providers,
    loading: providersLoading,
    error: providersError,
    retryCount: errorCount,
    hasData,
    isEmpty,
    refetch,
    retryFetch,
    lastSuccessfulFetch,
    isRefetching,
  };
};
