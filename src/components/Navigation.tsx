
import NavigationLogo from './navigation/NavigationLogo';
import NavigationSearch from './navigation/NavigationSearch';
import NavigationUserActions from './navigation/NavigationUserActions';
import NavigationCategories from './navigation/NavigationCategories';
import NavigationMobile from './navigation/NavigationMobile';

interface NavigationProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const Navigation = ({ selectedCategory, onCategoryChange }: NavigationProps) => {
  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-50">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <NavigationLogo />
          <NavigationSearch />
          <NavigationUserActions />
          <NavigationMobile 
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>

        <NavigationCategories 
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>
    </nav>
  );
};

export default Navigation;
