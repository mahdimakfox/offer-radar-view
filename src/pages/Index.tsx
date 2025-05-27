
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CategoryGrid from '@/components/CategoryGrid';
import ProviderCardNew from '@/components/ProviderCardNew';
import ComparisonTable from '@/components/ComparisonTable';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Search } from 'lucide-react';
import { Provider } from '@/services/providerService';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('strom');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleProviderSelect = (provider: Provider) => {
    if (selectedProviders.length < 4 && !selectedProviders.find(p => p.id === provider.id)) {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const handleProviderRemove = (providerId: number) => {
    setSelectedProviders(selectedProviders.filter(p => p.id !== providerId));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Add small delay to show loading state
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedProviders([]); // Clear selections when changing category
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ErrorBoundary>
        <Navigation 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Category Selection */}
        <ErrorBoundary>
          <CategoryGrid 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        </ErrorBoundary>

        {/* Search and Filters */}
        <div className="my-12 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Søk etter leverandører eller tilbud..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-4 pr-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg shadow-sm"
              disabled={isSearching}
            />
            <Button 
              type="submit"
              className="absolute right-2 top-2 h-10 bg-blue-600 hover:bg-blue-700"
              disabled={isSearching}
            >
              {isSearching ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>

        {/* Provider Grid - Now uses global state management with error boundaries */}
        <ErrorBoundary 
          fallback={
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">Det oppstod en feil ved lasting av leverandører.</p>
              <Button onClick={() => window.location.reload()}>
                Last siden på nytt
              </Button>
            </div>
          }
        >
          <ProviderCardNew 
            category={selectedCategory}
            searchTerm={searchTerm}
            onSelect={handleProviderSelect}
            selectedProviders={selectedProviders}
          />
        </ErrorBoundary>

        {/* Comparison Section */}
        {selectedProviders.length > 1 && (
          <ErrorBoundary>
            <ComparisonTable 
              providers={selectedProviders}
              onRemove={handleProviderRemove}
            />
          </ErrorBoundary>
        )}
      </div>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
