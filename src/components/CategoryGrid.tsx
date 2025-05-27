
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
    description: 'Sammenlign strømpriser',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'internett',
    name: 'Internett',
    icon: '🌐',
    description: 'Bredbånd og fiber',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'forsikring',
    name: 'Forsikring',
    icon: '🛡️',
    description: 'Bil, hjem og reise',
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    description: 'Lån og sparing',
    color: 'from-blue-400 to-purple-500'
  },
  {
    id: 'mobil',
    name: 'Mobil',
    icon: '📱',
    description: 'Mobilabonnement',
    color: 'from-pink-400 to-red-500'
  },
  {
    id: 'boligalarm',
    name: 'Boligalarm',
    icon: '🔒',
    description: 'Sikkerhet hjemme',
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
    
    // Scroll to providers section after a short delay to allow state update
    setTimeout(() => {
      const providersSection = document.getElementById('providers-section');
      if (providersSection) {
        providersSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const getCategoryCount = (categoryId: string): number => {
    return counts[categoryId] || 0;
  };

  const formatCategoryCount = (count: number): string => {
    if (count === 0) return '0 tilbud';
    if (count === 1) return '1 tilbud';
    return `${count} tilbud`;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16">
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
            }`}
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
              <h3 className={`font-bold text-xl mb-2 transition-colors ${
                isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'
              }`}>
                {category.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                {category.description}
              </p>
              
              {/* Provider Count */}
              <div className={`text-lg font-semibold transition-colors ${
                isSelected 
                  ? 'text-blue-600' 
                  : hasProviders
                    ? 'text-gray-800 group-hover:text-blue-600'
                    : 'text-red-600'
              }`}>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Laster...</span>
                  </div>
                ) : (
                  formatCategoryCount(count)
                )}
              </div>
              
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
