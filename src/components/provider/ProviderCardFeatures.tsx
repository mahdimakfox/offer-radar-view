
import { Provider } from '@/services/providerService';
import { Check } from 'lucide-react';

interface ProviderCardFeaturesProps {
  provider: Provider;
}

const ProviderCardFeatures = ({ provider }: ProviderCardFeaturesProps) => {
  if (!provider.pros || provider.pros.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <ul className="space-y-1">
        {provider.pros.slice(0, 3).map((pro, index) => (
          <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{pro}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProviderCardFeatures;
