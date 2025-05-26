
import { Card } from '@/components/ui/card';

const categories = [
  {
    id: 'strom',
    name: 'Strøm',
    icon: '⚡',
    description: 'Sammenlign strømpriser',
    providerCount: 25
  },
  {
    id: 'forsikring',
    name: 'Forsikring',
    icon: '🛡️',
    description: 'Bil-, reise- og innboforsikring',
    providerCount: 22
  },
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    description: 'Lån, sparing og kredittkort',
    providerCount: 28
  },
  {
    id: 'mobil',
    name: 'Mobil',
    icon: '📱',
    description: 'Mobilabonnement og telefoner',
    providerCount: 21
  },
  {
    id: 'bredband',
    name: 'Bredbånd',
    icon: '🌐',
    description: 'Internett og TV-pakker',
    providerCount: 24
  },
  {
    id: 'alarm',
    name: 'Boligalarm',
    icon: '🔒',
    description: 'Sikkerhet for hjemmet',
    providerCount: 18
  }
];

interface CategoryGridProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryGrid = ({ selectedCategory, onCategoryChange }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedCategory === category.id
              ? 'bg-blue-50 border-blue-500 border-2'
              : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            <p className="text-xs text-blue-600 font-medium">{category.providerCount} leverandører</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
