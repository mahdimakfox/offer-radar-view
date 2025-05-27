
import { Zap, Wifi, Shield, Building, Smartphone, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface NavigationCategoriesProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const NavigationCategories = ({ selectedCategory, onCategoryChange }: NavigationCategoriesProps) => {
  const location = useLocation();

  const categories = [
    { id: 'strom', name: 'Strøm', icon: Zap, description: 'Sammenlign strømpriser' },
    { id: 'internett', name: 'Internett', icon: Wifi, description: 'Bredbånd og fiber' },
    { id: 'forsikring', name: 'Forsikring', icon: Shield, description: 'Bil, hjem og reise' },
    { id: 'bank', name: 'Bank', icon: Building, description: 'Lån og sparing' },
    { id: 'mobil', name: 'Mobil', icon: Smartphone, description: 'Mobilabonnement' },
    { id: 'boligalarm', name: 'Boligalarm', icon: Home, description: 'Sikkerhet hjemme' }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <div className="hidden md:flex items-center justify-center space-x-1 pb-4 border-b border-gray-100">
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`group flex flex-col items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 shadow-md'
                : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <IconComponent className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-semibold">{category.name}</span>
            <span className="text-xs opacity-75">{category.description}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavigationCategories;
