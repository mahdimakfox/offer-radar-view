
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { providerService, Provider } from '@/services/providerService';
import { useNavigate } from 'react-router-dom';

interface ProviderCardNewProps {
  category: string;
  searchTerm: string;
  onSelect: (provider: Provider) => void;
  selectedProviders: Provider[];
}

const ProviderCardNew = ({ category, searchTerm, onSelect, selectedProviders }: ProviderCardNewProps) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        let data: Provider[];
        if (searchTerm.trim()) {
          data = await providerService.searchProviders(category, searchTerm);
        } else {
          data = await providerService.getProvidersByCategory(category);
        }
        setProviders(data);
      } catch (error) {
        console.error('Error fetching providers:', error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category, searchTerm]);

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.name.localeCompare(b.name);
  });

  const formatPrice = (price: number, category: string) => {
    if (category === 'bank') return 'Gratis';
    return `${price} kr/mnd`;
  };

  const handleViewDetails = (providerId: number) => {
    navigate(`/provider/${providerId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {sortedProviders.length} leverandører funnet
        </h2>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="price">Sorter etter pris</option>
          <option value="rating">Sorter etter rating</option>
          <option value="name">Sorter etter navn</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProviders.map((provider) => {
          const isSelected = selectedProviders.find(p => p.id === provider.id);
          
          return (
            <Card key={provider.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                    {provider.logo_url ? (
                      <img 
                        src={provider.logo_url} 
                        alt={provider.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.textContent = provider.name.substring(0, 2).toUpperCase();
                          }
                        }}
                      />
                    ) : (
                      provider.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600">{provider.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(provider.price, provider.category)}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{provider.description}</p>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  className="flex-1" 
                  onClick={() => handleViewDetails(provider.id)}
                >
                  Les mer
                </Button>
                <Button 
                  variant={isSelected ? "secondary" : "outline"}
                  onClick={() => onSelect(provider)}
                  disabled={selectedProviders.length >= 4 && !isSelected}
                >
                  {isSelected ? 'Valgt' : 'Sammenlign'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {sortedProviders.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Ingen leverandører funnet for søket.</p>
        </div>
      )}
    </div>
  );
};

export default ProviderCardNew;
