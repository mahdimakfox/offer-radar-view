
import { Provider } from '@/services/providerService';

export interface ProviderFilters {
  category: string;
  searchTerm?: string;
  sortBy?: 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UseGlobalProviderStateOptions extends ProviderFilters {
  enabled?: boolean;
}

export interface ProviderStateResult {
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
