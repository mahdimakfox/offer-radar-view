
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/services/providerService';
import { useGlobalProviderState } from '@/hooks/useGlobalProviderState';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ProviderCard from './ProviderCard';
import ProviderGridHeader from './ProviderGridHeader';

interface ProviderGridProps {
  category: string;
  searchTerm: string;
  onSelect: (provider: Provider) => void;
  selectedProviders: Provider[];
}

const ProviderGrid = ({ category, searchTerm, onSelect, selectedProviders }: ProviderGridProps) => {
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const {
    providers,
    providersLoading,
    providersError,
    isRefetching,
    refetchProviders,
    totalCount,
    prefetchCategory,
  } = useGlobalProviderState({ 
    category, 
    searchTerm,
    sortBy,
    sortOrder,
  });

  const handleSortChange = (newSortBy: 'price' | 'rating' | 'name') => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'rating' ? 'desc' : 'asc'); // Default to desc for rating
    }
  };

  const handleProviderHover = (providerId: number) => {
    // Prefetch provider details for better UX
    // This is handled by the ProviderCard component now
  };

  const handleCategoryHover = (categoryId: string) => {
    prefetchCategory(categoryId);
  };

  if (providersLoading) {
    return <LoadingState message="Henter leverandører..." count={6} />;
  }

  if (providersError) {
    return (
      <ErrorState 
        error={providersError}
        onRetry={refetchProviders}
        variant="full"
        title="Feil ved lasting av leverandører"
      />
    );
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        title="Ingen leverandører funnet"
        description={searchTerm 
          ? `Ingen leverandører funnet for "${searchTerm}" i kategorien ${category}.`
          : "Prøv å endre søkekriteriene eller velg en annen kategori."
        }
        action={{
          label: searchTerm ? 'Tilbakestill søk' : 'Last inn på nytt',
          onClick: searchTerm ? () => window.location.reload() : refetchProviders,
        }}
      />
    );
  }

  return (
    <div>
      <ProviderGridHeader
        count={totalCount}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        isRefetching={isRefetching}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onSelect={onSelect}
            selectedProviders={selectedProviders}
          />
        ))}
      </div>
    </div>
  );
};

export default ProviderGrid;
