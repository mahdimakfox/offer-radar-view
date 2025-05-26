
import { Card } from '@/components/ui/card';
import { Provider } from '@/services/providerService';
import { useNavigate } from 'react-router-dom';
import { useProviderCacheActions } from '@/hooks/useGlobalProviderState';
import ProviderCardHeader from './ProviderCardHeader';
import ProviderCardPricing from './ProviderCardPricing';
import ProviderCardFeatures from './ProviderCardFeatures';
import ProviderCardActions from './ProviderCardActions';

interface ProviderCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
  selectedProviders: Provider[];
}

const ProviderCard = ({ provider, onSelect, selectedProviders }: ProviderCardProps) => {
  const navigate = useNavigate();
  const { prefetchProvider } = useProviderCacheActions();

  const isSelected = selectedProviders.find(p => p.id === provider.id);

  const handleViewDetails = (providerId: number) => {
    navigate(`/provider/${providerId}`);
  };

  const handleProviderHover = (providerId: number) => {
    // Prefetch provider details for better UX using global cache management
    prefetchProvider(providerId);
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
      onMouseEnter={() => handleProviderHover(provider.id)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <ProviderCardHeader provider={provider} />
          <ProviderCardPricing provider={provider} />
        </div>
        
        {/* Description */}
        <p className="text-gray-600 mb-6 line-clamp-3">{provider.description}</p>
        
        {/* Features */}
        <ProviderCardFeatures provider={provider} />
        
        {/* Actions */}
        <ProviderCardActions
          provider={provider}
          isSelected={!!isSelected}
          onSelect={onSelect}
          onViewDetails={handleViewDetails}
          selectedProviders={selectedProviders}
        />
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50/0 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </Card>
  );
};

export default ProviderCard;
