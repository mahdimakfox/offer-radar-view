
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/services/providerService';
import { useProviders, useProviderSelectors } from '@/hooks/useProviders';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ProviderCard from './ProviderCard';

interface ProviderGridProps {
  category: string;
  searchTerm: string;
  onSelect: (provider: Provider) => void;
  selectedProviders: Provider[];
}

const ProviderGrid = ({ category, searchTerm, onSelect, selectedProviders }: ProviderGridProps) => {
  const [sortBy, setSortBy] = useState('price');
  
  const { providers, count, loading, error, refetch, isStale } = useProviders({ 
    category, 
    searchTerm 
  });
  
  const { sortedByPrice, sortedByRating, sortedByName } = useProviderSelectors(providers);

  const getSortedProviders = () => {
    switch (sortBy) {
      case 'price': return sortedByPrice;
      case 'rating': return sortedByRating;
      case 'name': return sortedByName;
      default: return providers;
    }
  };

  const sortedProviders = getSortedProviders();

  if (loading) {
    return <LoadingState message="Henter leverandører..." count={6} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={refetch}
        variant="full"
        title="Feil ved lasting av leverandører"
      />
    );
  }

  if (sortedProviders.length === 0) {
    return (
      <EmptyState
        title="Ingen leverandører funnet"
        description="Prøv å endre søkekriteriene eller velg en annen kategori."
        action={{
          label: 'Tilbakestill søk',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {count} leverandører funnet
          </h2>
          {isStale && (
            <Badge variant="secondary" className="text-xs">
              Oppdaterer...
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="price">Sorter etter pris</option>
            <option value="rating">Sorter etter rating</option>
            <option value="name">Sorter etter navn</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedProviders.map((provider) => (
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
