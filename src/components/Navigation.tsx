
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Navigation = () => {
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
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Strøm</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Forsikring</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Bank</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Mobil</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Bredbånd</a>
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
