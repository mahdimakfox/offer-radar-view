
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const Navigation = ({ selectedCategory, onCategoryChange }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const categories = [
    { id: 'strom', name: 'Strøm', icon: '⚡' },
    { id: 'internett', name: 'Internett', icon: '🌐' },
    { id: 'forsikring', name: 'Forsikring', icon: '🛡️' },
    { id: 'bank', name: 'Bank', icon: '🏦' },
    { id: 'mobil', name: 'Mobil', icon: '📱' }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">
              Leverandør
            </div>
            <Badge variant="secondary" className="text-xs">
              Sammenlign
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {location.pathname === '/' && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
            
            <Link to="/admin">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          </div>

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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {location.pathname === '/' && categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
              
              <Link to="/admin" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
