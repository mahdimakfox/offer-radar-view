
import { Link } from 'react-router-dom';

const NavigationLogo = () => {
  return (
    <Link to="/" className="flex items-center ml-8 group">
      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-110 group-hover:from-blue-700 group-hover:to-blue-900">
        Sky Smart Valg
      </div>
    </Link>
  );
};

export default NavigationLogo;
