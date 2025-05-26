
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/services/providerService';

interface ProviderCardPricingProps {
  provider: Provider;
}

const ProviderCardPricing = ({ provider }: ProviderCardPricingProps) => {
  const formatPrice = (price: number, category: string) => {
    if (category === 'bank') return 'Gratis';
    return `${price} kr/mnd`;
  };

  return (
    <div className="text-right">
      <div className="text-3xl font-bold text-blue-600">
        {formatPrice(provider.price, provider.category)}
      </div>
      {provider.category !== 'bank' && (
        <Badge variant="secondary" className="mt-1">
          Fra {formatPrice(provider.price * 0.8, provider.category)}
        </Badge>
      )}
    </div>
  );
};

export default ProviderCardPricing;
