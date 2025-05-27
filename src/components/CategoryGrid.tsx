
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CategoryIcon from '@/components/CategoryIcon';

interface CategoryGridProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { 
    id: 'strom', 
    name: 'Strøm', 
    icon: 'zap',
    description: 'Sammenlign strømleverandører og finn beste pris',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  { 
    id: 'mobil', 
    name: 'Mobil', 
    icon: 'smartphone',
    description: 'Mobilabonnementer og beste tilbud',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'internett', 
    name: 'Bredbånd', 
    icon: 'wifi',
    description: 'Bredbånd og internettleverandører',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'forsikring', 
    name: 'Forsikring', 
    icon: 'shield',
    description: 'Forsikringsselskaper og dekninger',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    id: 'bank', 
    name: 'Bank', 
    icon: 'building',
    description: 'Banker og finansielle tjenester',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  { 
    id: 'boligalarm', 
    name: 'Boligalarm', 
    icon: 'home',
    description: 'Sikkerhetssystemer for hjemmet',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
];

const CategoryGrid = ({ selectedCategory, onCategoryChange }: CategoryGridProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Velg kategori
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sammenlign leverandører og finn de beste tilbudene i Norge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className={`p-4 rounded-full ${category.color}`}>
                    <CategoryIcon 
                      category={category.id} 
                      className="h-8 w-8" 
                    />
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                  
                  {/* Action Button */}
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="w-full mt-4"
                  >
                    {isSelected ? 'Valgt' : 'Velg kategori'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
