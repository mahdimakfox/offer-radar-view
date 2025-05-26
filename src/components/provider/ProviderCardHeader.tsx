
import { Provider } from '@/services/providerService';
import { Star } from 'lucide-react';

interface ProviderCardHeaderProps {
  provider: Provider;
}

const ProviderCardHeader = ({ provider }: ProviderCardHeaderProps) => {
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

  return (
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
  );
};

export default ProviderCardHeader;
