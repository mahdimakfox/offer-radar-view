
import { useState, useCallback } from 'react';
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
    lastSuccessfulFetch,
    isRefetching,
  } = useProviderDataFetch({ 
    category, 
    searchTerm,
    sortBy,
    sortOrder,
  });

  const handleSortChange = useCallback((newSortBy: 'price' | 'rating' | 'name') => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'rating' ? 'desc' : 'asc'); // Default to desc for rating
    }
  }, [sortBy]);

  // Show loading state for initial load
  if (loading && !hasData) {
    return <LoadingState message="Henter leverandører..." count={6} />;
  }

  // Show error state with retry options
  if (error) {
    const canRetry = retryCount < 3;
    return (
      <ErrorState 
        error={error}
        onRetry={canRetry ? retryFetch : refetch}
        variant="full"
        title="Feil ved lasting av leverandører"
        description={
          !canRetry 
            ? "Maksimalt antall forsøk er nådd. Vennligst prøv igjen senere."
            : "Det oppstod en feil ved lasting av data. Vi prøver å laste på nytt automatisk."
        }
      />
    );
  }

  // Show empty state with helpful actions
  if (isEmpty) {
    return (
      <EmptyState
        title="Ingen leverandører funnet"
        description={searchTerm 
          ? `Ingen leverandører funnet for "${searchTerm}" i kategorien ${category}.`
          : `Ingen leverandører funnet i kategorien ${category}. Dette kan skyldes midlertidige problemer med datakilden.`
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
          isRefetching={isRefetching}
          lastUpdated={lastSuccessfulFetch}
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

        {/* Show loading overlay during refetch */}
        {isRefetching && hasData && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Oppdaterer data...</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProviderGrid;
