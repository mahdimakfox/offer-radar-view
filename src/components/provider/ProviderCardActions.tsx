
import { Button } from '@/components/ui/button';
import { Provider } from '@/services/providerService';
import { ExternalLink, Plus, Check } from 'lucide-react';

interface ProviderCardActionsProps {
  provider: Provider;
  isSelected: boolean;
  onSelect: (provider: Provider) => void;
  onViewDetails: (providerId: number) => void;
  selectedProviders: Provider[];
}

const ProviderCardActions = ({ 
  provider, 
  isSelected, 
  onSelect, 
  onViewDetails, 
  selectedProviders 
}: ProviderCardActionsProps) => {
  return (
    <div className="flex space-x-3">
      <Button 
        variant="outline"
        className="flex-1 group-hover:border-blue-500 group-hover:text-blue-700 transition-colors" 
        onClick={() => onViewDetails(provider.id)}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Les mer
      </Button>
      <Button 
        variant={isSelected ? "default" : "outline"}
        onClick={() => onSelect(provider)}
        disabled={selectedProviders.length >= 4 && !isSelected}
        className={`${
          isSelected 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700'
        } transition-all duration-200`}
      >
        {isSelected ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Valgt
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Sammenlign
          </>
        )}
      </Button>
    </div>
  );
};

export default ProviderCardActions;
