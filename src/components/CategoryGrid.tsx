
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategoryProviderCounts } from '@/hooks/useProviderData';

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
  const { counts, loading } = useCategoryProviderCounts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`group relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
            selectedCategory === category.id
              ? 'bg-white border-2 border-blue-500 shadow-xl scale-105'
              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
          
          <div className="relative p-6 text-center">
            {/* Icon */}
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            
            {/* Category Name */}
            <h3 className={`font-bold text-xl mb-3 transition-colors ${
              selectedCategory === category.id ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'
            }`}>
              {category.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors">
              {category.description}
            </p>
            
            {/* Provider Count */}
            <Badge 
              variant={selectedCategory === category.id ? "default" : "secondary"}
              className={`text-xs font-medium transition-all ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'
              }`}
            >
              {loading ? '...' : (counts[category.id] || 0)} leverandører
            </Badge>
            
            {/* Selection Indicator */}
            {selectedCategory === category.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Hover Effect Border */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-lg transition-colors"></div>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
