
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Star, Check, X, Phone, Mail, MapPin, Award, Shield, Clock } from 'lucide-react';
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-lg font-semibold ml-2">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Laster leverandør...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="p-12 text-center shadow-xl">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <X className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Leverandør ikke funnet</h1>
            <p className="text-gray-600 mb-8">Beklager, vi kunne ikke finne leverandøren du leter etter.</p>
            <Button onClick={() => navigate(-1)} size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Gå tilbake
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-blue-50 hover:border-blue-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til søkeresultater
        </Button>

        {/* Hero Section */}
        <Card className="p-8 mb-8 shadow-xl bg-white border-0">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-4xl overflow-hidden shadow-lg">
                {provider.logo_url ? (
                  <img 
                    src={provider.logo_url} 
                    alt={provider.name}
                    className="w-full h-full object-cover rounded-2xl"
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
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-4 text-gray-900">{provider.name}</h1>
                  <div className="flex items-center space-x-6 mb-4">
                    {renderStars(provider.rating)}
                    <Badge variant="secondary" className="capitalize text-lg px-4 py-2">
                      {provider.category}
                    </Badge>
                  </div>
                  {provider.org_number && (
                    <p className="text-gray-600">Org.nr: {provider.org_number}</p>
                  )}
                </div>
                <div className="text-right mt-4 lg:mt-0">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {formatPrice(provider.price, provider.category)}
                  </div>
                  {provider.category !== 'bank' && (
                    <Badge variant="outline" className="text-sm">
                      Fra {formatPrice(provider.price * 0.8, provider.category)}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-700 text-xl mb-8 leading-relaxed">{provider.description}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  onClick={() => window.open(provider.external_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Gå til tilbud
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg hover:bg-blue-50"
                  onClick={() => navigate(-1)}
                >
                  Sammenlign med andre
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pros and Cons */}
          <div className="lg:col-span-2 space-y-6">
            {provider.pros && provider.pros.length > 0 && (
              <Card className="p-6 shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-green-700 flex items-center">
                  <Check className="mr-2 h-6 w-6" />
                  Fordeler
                </h3>
                <ul className="space-y-3">
                  {provider.pros.map((pro, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {provider.cons && provider.cons.length > 0 && (
              <Card className="p-6 shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-red-700 flex items-center">
                  <X className="mr-2 h-6 w-6" />
                  Ulemper
                </h3>
                <ul className="space-y-3">
                  {provider.cons.map((con, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <X className="text-red-500 mt-1 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-600" />
                Rask info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{provider.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kategori</span>
                  <Badge variant="secondary" className="capitalize">
                    {provider.category}
                  </Badge>
                </div>
                {provider.ehf_invoice_support && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">EHF-faktura</span>
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Kontakt</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Ring oss
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send e-post
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Finn butikk
                </Button>
              </div>
            </Card>

            {/* Trust Indicators */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                Trygghet
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Norsk selskap</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Finanstilsynet regulert</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Etablert siden 2010</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProviderDetail;
