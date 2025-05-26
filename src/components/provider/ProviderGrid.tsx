
import { useState } from 'react';
import { Provider } from '@/services/providerService';
import { useProviderDataFetch } from '@/hooks/useProviderDataFetch';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ErrorBoundary from '@/components/common/ErrorBoundary';
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
    loading,
    error,
    retryCount,
    hasData,
    isEmpty,
    refetch,
    retryFetch,
  } = useProviderDataFetch({ 
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

  // Show loading state
  if (loading) {
    return <LoadingState message="Henter leverandører..." count={6} />;
  }

  // Show error state with retry options
  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={retryCount < 3 ? retryFetch : refetch}
        variant="full"
        title="Feil ved lasting av leverandører"
        description={
          retryCount >= 3 
            ? "Maksimalt antall forsøk er nådd. Vennligst prøv igjen senere."
            : "Det oppstod en feil ved lasting av data. Vi prøver å laste på nytt automatisk."
        }
      />
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <EmptyState
        title="Ingen leverandører funnet"
        description={searchTerm 
          ? `Ingen leverandører funnet for "${searchTerm}" i kategorien ${category}.`
          : "Prøv å endre søkekriteriene eller velg en annen kategori."
        }
        action={{
          label: searchTerm ? 'Tilbakestill søk' : 'Last inn på nytt',
          onClick: searchTerm ? () => window.location.reload() : refetch,
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <ProviderGridHeader
          count={providers.length}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          isRefetching={false}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((provider) => (
            <ErrorBoundary key={provider.id}>
              <ProviderCard
                provider={provider}
                onSelect={onSelect}
                selectedProviders={selectedProviders}
              />
            </ErrorBoundary>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProviderGrid;
