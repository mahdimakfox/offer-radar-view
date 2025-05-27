
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, User, Settings, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavigationProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'strom', name: 'Strøm', icon: '⚡' },
  { id: 'mobil', name: 'Mobil', icon: '📱' },
  { id: 'internett', name: 'Internett', icon: '🌐' },
  { id: 'forsikring', name: 'Forsikring', icon: '🛡️' },
  { id: 'bank', name: 'Bank', icon: '🏦' },
  { id: 'boligalarm', name: 'Boligalarm', icon: '🔒' }
];

const Navigation = ({ selectedCategory, onCategoryChange }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    navigate(`/?category=${categoryId}`);
    setIsOpen(false);
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">PrisJakt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isHomePage ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Hjem</span>
            </Link>

            {/* Category Navigation */}
            {isHomePage && (
              <div className="flex items-center space-x-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCategoryClick(category.id)}
                    className="flex items-center space-x-1"
                  >
                    <span>{category.icon}</span>
                    <span className="hidden lg:inline">{category.name}</span>
                  </Button>
                ))}
              </div>
            )}

            <Link 
              to="/admin" 
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isHomePage ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Hjem
              </Link>

              {isHomePage && (
                <div className="pl-4 space-y-1">
                  <div className="text-sm font-medium text-gray-500 mb-2">Kategorier:</div>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category.id 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

              <Link 
                to="/admin" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
