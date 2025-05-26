
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComparisonTableProps {
  providers: any[];
  onRemove: (providerId: number) => void;
}

const ComparisonTable = ({ providers, onRemove }: ComparisonTableProps) => {
  if (providers.length < 2) return null;

  const formatPrice = (price: number, provider: any) => {
    // Determine category based on price range or provider name
    if (price === 0) return 'Gratis';
    if (price < 100) return `${price} kr/mnd`;
    if (price < 500) return `${price} kr/mnd`;
    return `${price} kr/mnd`;
  };

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8">Sammenlign valgte tilbud</h2>
      
      <Card className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 font-semibold">Leverandør</th>
              {providers.map((provider) => (
                <th key={provider.id} className="text-center py-4 min-w-[200px]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
                      {provider.logo}
                    </div>
                    <div className="font-semibold">{provider.name}</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRemove(provider.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Fjern
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            <tr className="border-b">
              <td className="py-4 font-semibold">Pris per måned</td>
              {providers.map((provider) => (
                <td key={provider.id} className="text-center py-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(provider.price, provider)}
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b">
              <td className="py-4 font-semibold">Rating</td>
              {providers.map((provider) => (
                <td key={provider.id} className="text-center py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{provider.rating}</span>
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b">
              <td className="py-4 font-semibold">Beskrivelse</td>
              {providers.map((provider) => (
                <td key={provider.id} className="text-center py-4">
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="py-4 font-semibold">Gå til tilbud</td>
              {providers.map((provider) => (
                <td key={provider.id} className="text-center py-4">
                  <Button 
                    className="w-full"
                    onClick={() => window.open(provider.url, '_blank')}
                  >
                    Velg dette tilbudet
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default ComparisonTable;
