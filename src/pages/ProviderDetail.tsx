
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Star, Phone, Globe, Mail } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock provider data - in a real app this would come from your database
const getProviderById = (id: string, category: string) => {
  const providers = {
    strom: [
      {
        id: 1,
        name: 'Hafslund Eco',
        description: 'Norges ledende strømleverandør med fokus på fornybar energi.',
        rating: 4.5,
        reviews: 2834,
        price: '89.50 øre/kWh',
        features: ['100% fornybar energi', '24/7 kundeservice', 'App for forbruksovervåking', 'Ingen bindingstid'],
        contact: {
          phone: '22 43 90 00',
          email: 'kundeservice@hafslund.no',
          website: 'https://www.hafslund.no'
        },
        pros: ['Konkurransedyktige priser', 'Utmerket kundeservice', 'Miljøvennlig'],
        cons: ['Kan være dyrere i høylastperioder'],
        logo: '/api/placeholder/100/100'
      }
    ],
    forsikring: [
      {
        id: 1,
        name: 'If Forsikring',
        description: 'Skandinavias største forsikringsselskap med over 100 års erfaring.',
        rating: 4.3,
        reviews: 4521,
        price: 'Fra 299 kr/mnd',
        features: ['Bilforsikring', 'Innboforsikring', 'Reiseforsikring', 'Husforsikring'],
        contact: {
          phone: '915 02 030',
          email: 'kundeservice@if.no',
          website: 'https://www.if.no'
        },
        pros: ['Bred dekning', 'Rask skadebehandling', 'Gode rabatter'],
        cons: ['Høyere egenandel på noen produkter'],
        logo: '/api/placeholder/100/100'
      }
    ]
  };

  return providers[category]?.find(p => p.id === parseInt(id));
};

const ProviderDetail = () => {
  const { id, category } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && category) {
      const providerData = getProviderById(id, category);
      setProvider(providerData);
      checkIfFavorite();
      setLoading(false);
    }
  }, [id, category, user]);

  const checkIfFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider_id', parseInt(id))
        .eq('category', category)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not found is expected if not favorited
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Du må logge inn for å lagre favoritter');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('provider_id', parseInt(id!))
          .eq('category', category);
        
        setIsFavorite(false);
        toast.success('Fjernet fra favoritter');
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            provider_id: parseInt(id!),
            category: category!
          });
        
        setIsFavorite(true);
        toast.success('Lagt til i favoritter');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('En feil oppstod');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">Laster...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Leverandør ikke funnet</h1>
            <Link to="/">
              <Button>Tilbake til forsiden</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake til sammenligning
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <img 
                    src={provider.logo} 
                    alt={provider.name}
                    className="w-16 h-16 rounded-lg mr-4"
                  />
                  <div>
                    <h1 className="text-3xl font-bold">{provider.name}</h1>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold ml-1">{provider.rating}</span>
                        <span className="text-gray-600 ml-1">({provider.reviews} anmeldelser)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={toggleFavorite}
                  variant="outline"
                  size="icon"
                  className={isFavorite ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <p className="text-gray-700 mb-6">{provider.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Fordeler</h3>
                  <ul className="space-y-2">
                    {provider.pros.map((pro: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ulemper</h3>
                  <ul className="space-y-2">
                    {provider.cons.map((con: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Funksjoner og tjenester</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {provider.features.map((feature: string, index: number) => (
                  <Badge key={index} variant="secondary" className="justify-start p-3">
                    {feature}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pris</h2>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {provider.price}
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Få tilbud
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kontaktinformasjon</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-500 mr-3" />
                  <span>{provider.contact.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm">{provider.contact.email}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-500 mr-3" />
                  <a 
                    href={provider.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Besøk nettside
                  </a>
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
