
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for providers
const mockProviders = {
  strom: [
    {
      id: 1,
      name: 'Hafslund Eco',
      rating: 4.5,
      reviews: 2834,
      price: '89.50 øre/kWh',
      features: ['100% fornybar energi', '24/7 kundeservice', 'App for forbruksovervåking'],
      savings: 'Spar opptil 2,400 kr/år',
      logo: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Tibber',
      rating: 4.7,
      reviews: 1892,
      price: '92.30 øre/kWh',
      features: ['Smart hjemteknologi', 'Timeprising', 'Grønn energi'],
      savings: 'Spar opptil 1,800 kr/år',
      logo: '/api/placeholder/80/80'
    },
    {
      id: 3,
      name: 'Kraftsalg',
      rating: 4.2,
      reviews: 3421,
      price: '87.20 øre/kWh',
      features: ['Fastpris', 'Norsk vannkraft', 'Ingen bindingstid'],
      savings: 'Spar opptil 2,100 kr/år',
      logo: '/api/placeholder/80/80'
    }
  ],
  forsikring: [
    {
      id: 1,
      name: 'If Forsikring',
      rating: 4.3,
      reviews: 4521,
      price: 'Fra 299 kr/mnd',
      features: ['Bilforsikring', 'Innboforsikring', 'Reiseforsikring'],
      savings: 'Spar opptil 3,600 kr/år',
      logo: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Tryg Forsikring',
      rating: 4.1,
      reviews: 3892,
      price: 'Fra 320 kr/mnd',
      features: ['Husforsikring', 'Bilforsikring', 'Innboforsikring'],
      savings: 'Spar opptil 2,800 kr/år',
      logo: '/api/placeholder/80/80'
    }
  ],
  bank: [
    {
      id: 1,
      name: 'DNB',
      rating: 4.0,
      reviews: 5234,
      price: 'Fra 1.5% rente',
      features: ['Boliglån', 'Kredittkort', 'Sparekonto'],
      savings: 'Spar opptil 12,000 kr/år',
      logo: '/api/placeholder/80/80'
    }
  ],
  mobil: [
    {
      id: 1,
      name: 'Telenor',
      rating: 4.2,
      reviews: 3456,
      price: 'Fra 199 kr/mnd',
      features: ['Ubegrenset data', '5G dekning', 'Streaming inkludert'],
      savings: 'Spar opptil 1,200 kr/år',
      logo: '/api/placeholder/80/80'
    }
  ],
  bredband: [
    {
      id: 1,
      name: 'Altibox',
      rating: 4.4,
      reviews: 2134,
      price: 'Fra 399 kr/mnd',
      features: ['Fiber 500/500', 'TV-pakke', 'Ruter inkludert'],
      savings: 'Spar opptil 2,400 kr/år',
      logo: '/api/placeholder/80/80'
    }
  ],
  alarm: [
    {
      id: 1,
      name: 'Sector Alarm',
      rating: 4.3,
      reviews: 1876,
      price: 'Fra 299 kr/mnd',
      features: ['24/7 overvåkning', 'App-styring', 'Gratis installasjon'],
      savings: 'Spar opptil 1,800 kr/år',
      logo: '/api/placeholder/80/80'
    }
  ]
};

interface ProviderCardProps {
  category: string;
  searchTerm: string;
  onSelect: (provider: any) => void;
  selectedProviders: any[];
}

const ProviderCard = ({ category, searchTerm, onSelect, selectedProviders }: ProviderCardProps) => {
  const providers = mockProviders[category as keyof typeof mockProviders] || [];
  
  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Beste tilbud innen {category === 'strom' ? 'strøm' : category === 'forsikring' ? 'forsikring' : category === 'bredband' ? 'bredbånd' : category}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => {
          const isSelected = selectedProviders.some(p => p.id === provider.id);
          
          return (
            <Card key={provider.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src={provider.logo} 
                    alt={provider.name}
                    className="w-12 h-12 rounded-lg mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm ml-1">{provider.rating}</span>
                      <span className="text-gray-500 text-sm ml-1">({provider.reviews})</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">{provider.price}</div>
                <div className="text-green-600 font-medium text-sm">{provider.savings}</div>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {provider.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => onSelect(provider)}
                    disabled={isSelected || selectedProviders.length >= 4}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSelected ? 'Valgt' : 'Sammenlign'}
                  </Button>
                  <Link to={`/provider/${category}/${provider.id}`}>
                    <Button variant="outline" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <Button variant="outline" className="w-full">
                  Få tilbud
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Ingen leverandører funnet for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ProviderCard;
