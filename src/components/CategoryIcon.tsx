
import { Zap, Wifi, Shield, Building, Smartphone, Home } from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

const CategoryIcon = ({ category, className = "h-6 w-6" }: CategoryIconProps) => {
  const getIcon = () => {
    switch (category) {
      case 'strom':
        return <Zap className={className} />;
      case 'internett':
        return <Wifi className={className} />;
      case 'forsikring':
        return <Shield className={className} />;
      case 'bank':
        return <Building className={className} />;
      case 'mobil':
        return <Smartphone className={className} />;
      case 'boligalarm':
        return <Home className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  return getIcon();
};

export default CategoryIcon;
