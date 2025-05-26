
import { Button } from '@/components/ui/button';

interface NavigationProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const Navigation = ({ selectedCategory, onCategoryChange }: NavigationProps) => {
  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              Sammenlign.no
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleCategoryClick('strom')} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                selectedCategory === 'strom' ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Strøm
            </button>
            <button 
              onClick={() => handleCategoryClick('forsikring')} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                selectedCategory === 'forsikring' ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Forsikring
            </button>
            <button 
              onClick={() => handleCategoryClick('bank')} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                selectedCategory === 'bank' ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Bank
            </button>
            <button 
              onClick={() => handleCategoryClick('mobil')} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                selectedCategory === 'mobil' ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Mobil
            </button>
            <button 
              onClick={() => handleCategoryClick('bredband')} 
              className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                selectedCategory === 'bredband' ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Bredbånd
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Logg inn
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Registrer deg
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
