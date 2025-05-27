
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Check, Heart } from 'lucide-react';
import { Provider } from '@/services/providerService';

interface ProviderCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
  selectedProviders: Provider[];
}

const ProviderCard = ({ provider, onSelect, selectedProviders }: ProviderCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const isSelected = selectedProviders.some(p => p.id === provider.id);
  const canSelect = selectedProviders.length < 4;

  const handleSelect = () => {
    if (!isSelected && canSelect) {
      onSelect(provider);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `${price.toLocaleString('nb-NO')} kr`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
      isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-gray-300'
    }`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {provider.name}
              </h3>
              <div className="mb-3">
                {renderStars(provider.rating)}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className="text-gray-400 hover:text-red-500"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Price */}
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(provider.price)}
            </div>
            <div className="text-sm text-gray-600">per måned</div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {provider.description}
          </p>

          {/* Features */}
          {provider.pros && provider.pros.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">Fordeler:</h4>
              <div className="space-y-1">
                {provider.pros.slice(0, 3).map((pro, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{pro}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleSelect}
              disabled={!canSelect && !isSelected}
              className="w-full"
              variant={isSelected ? "secondary" : "default"}
            >
              {isSelected ? (
                <><Check className="h-4 w-4 mr-2" /> Valgt for sammenligning</>
              ) : !canSelect ? (
                'Maks 4 leverandører'
              ) : (
                'Sammenlign'
              )}
            </Button>
            
            {provider.external_url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(provider.external_url, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Besøk nettside
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
