
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CategoryGrid from '@/components/CategoryGrid';
import ProviderCardNew from '@/components/ProviderCardNew';
import ComparisonTable from '@/components/ComparisonTable';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Search } from 'lucide-react';
import { Provider } from '@/services/providerService';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('strom');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);

  const handleProviderSelect = (provider: Provider) => {
    if (selectedProviders.length < 4 && !selectedProviders.find(p => p.id === provider.id)) {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const handleProviderRemove = (providerId: number) => {
    setSelectedProviders(selectedProviders.filter(p => p.id !== providerId));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality is now handled by the global state
    // The searchTerm is passed to ProviderCardNew which uses useGlobalProviderState
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Category Selection */}
        <CategoryGrid 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />

        {/* Search and Filters */}
        <div className="my-12 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Søk etter leverandører eller tilbud..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-4 pr-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg shadow-sm"
            />
            <Button 
              type="submit"
              className="absolute right-2 top-2 h-10 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Provider Grid - Now uses global state management */}
        <ProviderCardNew 
          category={selectedCategory}
          searchTerm={searchTerm}
          onSelect={handleProviderSelect}
          selectedProviders={selectedProviders}
        />

        {/* Comparison Section */}
        {selectedProviders.length > 1 && (
          <ComparisonTable 
            providers={selectedProviders}
            onRemove={handleProviderRemove}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
