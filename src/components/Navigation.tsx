
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Sammenlign.no
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Strøm</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Forsikring</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Bank</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Mobil</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Bredbånd</a>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <User className="w-4 h-4 mr-2" />
                    Min profil
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Logg inn
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Registrer deg
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
