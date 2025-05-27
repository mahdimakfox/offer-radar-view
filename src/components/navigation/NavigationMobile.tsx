
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, LogIn, Search, Settings, Zap, Wifi, Shield, Building, Smartphone, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationMobileProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const NavigationMobile = ({ selectedCategory, onCategoryChange }: NavigationMobileProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t border-gray-100">
          {/* Mobile Search */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Søk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-4 pr-12"
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-2 top-2 h-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="space-y-2">
            {location.pathname === '/' && categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-left flex-1">
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                    </div>
                    <div className="text-xs opacity-75">{category.description}</div>
                  </div>
                </button>
              );
            })}
            
            <div className="pt-4 space-y-2">
              <Link to="/login" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Logg inn</span>
                </Button>
              </Link>
              <Link to="/admin" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationMobile;
