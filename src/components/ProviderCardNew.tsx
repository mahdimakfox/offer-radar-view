
import ProviderGrid from './provider/ProviderGrid';
import { Provider } from '@/services/providerService';

interface ProviderCardNewProps {
  category: string;
  searchTerm: string;
  onSelect: (provider: Provider) => void;
  selectedProviders: Provider[];
}

const ProviderCardNew = ({ category, searchTerm, onSelect, selectedProviders }: ProviderCardNewProps) => {
  return (
    <ProviderGrid
      category={category}
      searchTerm={searchTerm}
      onSelect={onSelect}
      selectedProviders={selectedProviders}
    />
  );
};

export default ProviderCardNew;
