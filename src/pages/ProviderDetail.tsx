
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { providerService, Provider } from '@/services/providerService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;
      
      try {
        const data = await providerService.getProviderById(parseInt(id));
        setProvider(data);
      } catch (error) {
        console.error('Error fetching provider details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const formatPrice = (price: number, category: string) => {
    if (category === 'bank') return 'Gratis';
    return `${price} kr/mnd`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Leverandør ikke funnet</h1>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Gå tilbake
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til søkeresultater
        </Button>

        <Card className="p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden">
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
            </div>

            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="text-lg font-semibold">{provider.rating}</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {provider.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatPrice(provider.price, provider.category)}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-lg mb-6">{provider.description}</p>

              {provider.pros && provider.pros.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-green-700">Fordeler</h3>
                  <ul className="space-y-2">
                    {provider.pros.map((pro, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {provider.cons && provider.cons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-red-700">Ulemper</h3>
                  <ul className="space-y-2">
                    {provider.cons.map((con, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-4">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(provider.external_url, '_blank')}
                >
                  Gå til tilbud
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(-1)}
                >
                  Sammenlign med andre
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ProviderDetail;
