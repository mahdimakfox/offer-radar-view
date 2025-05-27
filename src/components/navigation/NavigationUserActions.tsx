
import { Button } from '@/components/ui/button';
import { LogIn, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavigationUserActions = () => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span>Mine tilbud</span>
      </Button>
      <Link to="/login">
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <LogIn className="h-4 w-4" />
          <span>Logg inn</span>
        </Button>
      </Link>
      <Link to="/admin">
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Admin</span>
        </Button>
      </Link>
    </div>
  );
};

export default NavigationUserActions;
