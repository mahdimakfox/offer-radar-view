import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { providerService, Provider } from '@/services/providerService';
import { useNavigate } from 'react-router-dom';
import { Star, ExternalLink, Plus, Check, Search } from 'lucide-react';

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {sortedProviders.length} leverandører funnet
        </h2>
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
        {sortedProviders.map((provider) => {
          const isSelected = selectedProviders.find(p => p.id === provider.id);
          
          return (
            <Card 
              key={provider.id} 
              className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                      {provider.logo_url ? (
                        <img 
                          src={provider.logo_url} 
                          alt={provider.name}
                          className="w-full h-full object-cover rounded-xl"
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
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                        {provider.name}
                      </h3>
                      {renderStars(provider.rating)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPrice(provider.price, provider.category)}
                    </div>
                    {category !== 'bank' && (
                      <Badge variant="secondary" className="mt-1">
                        Fra {formatPrice(provider.price * 0.8, provider.category)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 mb-6 line-clamp-3">{provider.description}</p>
                
                {/* Features */}
                {provider.pros && provider.pros.length > 0 && (
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
                )}
                
                {/* Actions */}
                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    className="flex-1 group-hover:border-blue-500 group-hover:text-blue-700 transition-colors" 
                    onClick={() => handleViewDetails(provider.id)}
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
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/0 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </Card>
          );
        })}
      </div>

      {sortedProviders.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ingen leverandører funnet</h3>
          <p className="text-gray-500">Prøv å endre søkekriteriene eller velg en annen kategori.</p>
        </div>
      )}
    </div>
  );
};

export default ProviderCardNew;
