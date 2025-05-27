
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProviderCounts, useProviderCacheActions } from '@/hooks/useGlobalProviderState';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

const categories = [
  {
    id: 'strom',
    name: 'Strøm',
    icon: '⚡',
    description: 'Sammenlign strømpriser og finn billigste tilbud',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'forsikring',
    name: 'Forsikring',
    icon: '🛡️',
    description: 'Bil-, reise- og innboforsikring med best dekning',
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    description: 'Lån, sparing og kredittkort med beste renter',
    color: 'from-blue-400 to-purple-500'
  },
  {
    id: 'mobil',
    name: 'Mobil',
    icon: '📱',
    description: 'Mobilabonnement og telefoner til lavest pris',
    color: 'from-pink-400 to-red-500'
  },
  {
    id: 'internett',
    name: 'Internett',
    icon: '🌐',
    description: 'Fiber, bredbånd og TV-pakker med høy hastighet',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'boligalarm',
    name: 'Boligalarm',
    icon: '🔒',
    description: 'Sikkerhet og overvåkning for hjemmet ditt',
    color: 'from-gray-400 to-gray-600'
  }
];

interface CategoryGridProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryGrid = ({ selectedCategory, onCategoryChange }: CategoryGridProps) => {
  const { counts, loading, error, refetch } = useProviderCounts();
  const { prefetchCategory } = useProviderCacheActions();

  const handleCategoryHover = (categoryId: string) => {
    // Prefetch category data for better UX
    if (categoryId !== selectedCategory) {
      prefetchCategory(categoryId);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log(`Category selected: ${categoryId}`);
    onCategoryChange(categoryId);
  };

  const getCategoryCount = (categoryId: string): number => {
    return counts[categoryId] || 0;
  };

  const formatCategoryCount = (count: number): string => {
    if (count === 0) return 'Ingen leverandører';
    if (count === 1) return '1 leverandør';
    return `${count} leverandører`;
  };

  if (error) {
    return (
      <div className="mb-16">
        <ErrorState 
          error={error}
          onRetry={refetch}
          variant="inline"
          title="Feil ved lasting av kategorier"
          description="Kunne ikke laste kategoriinformasjon. Dette påvirker ikke hovedfunksjonaliteten."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
      {categories.map((category) => {
        const count = getCategoryCount(category.id);
        const isSelected = selectedCategory === category.id;
        const hasProviders = count > 0;
        
        return (
          <Card
            key={category.id}
            className={`group relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
              isSelected
                ? 'bg-white border-2 border-blue-500 shadow-xl scale-105'
                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
            } ${!hasProviders && !loading ? 'opacity-75' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
            onMouseEnter={() => handleCategoryHover(category.id)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            
            <div className="relative p-6 text-center">
              {/* Icon */}
              <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              
              {/* Category Name */}
              <h3 className={`font-bold text-lg sm:text-xl mb-3 transition-colors ${
                isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'
              }`}>
                {category.name}
              </h3>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors">
                {category.description}
              </p>
              
              {/* Provider Count */}
              <Badge 
                variant={isSelected ? "default" : "secondary"}
                className={`text-xs font-medium transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : hasProviders
                      ? 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                      : 'bg-red-50 text-red-600 group-hover:bg-red-100'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                    <span>Laster...</span>
                  </div>
                ) : (
                  formatCategoryCount(count)
                )}
              </Badge>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}

              {/* Warning for empty categories */}
              {!loading && !hasProviders && (
                <div className="absolute top-3 left-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </div>
            
            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-lg transition-colors"></div>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
