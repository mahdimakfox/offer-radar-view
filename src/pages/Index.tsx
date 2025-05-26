
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

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('strom');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([]);

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
          <div className="relative">
            <Input
              type="text"
              placeholder="Søk etter leverandører eller tilbud..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-4 pr-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg shadow-sm"
            />
            <Button 
              className="absolute right-2 top-2 h-10 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Provider Grid - Data hentet dynamisk fra Supabase */}
        <ProviderCardNew 
          category={selectedCategory}
          searchTerm={searchTerm}
          onSelect={(provider) => {
            if (selectedProviders.length < 4 && !selectedProviders.find(p => p.id === provider.id)) {
              setSelectedProviders([...selectedProviders, provider]);
            }
          }}
          selectedProviders={selectedProviders}
        />

        {/* Comparison Section */}
        {selectedProviders.length > 1 && (
          <ComparisonTable 
            providers={selectedProviders}
            onRemove={(providerId) => {
              setSelectedProviders(selectedProviders.filter(p => p.id !== providerId));
            }}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
