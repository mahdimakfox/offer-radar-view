
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const NavigationSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
      <form onSubmit={handleSearch} className="w-full relative">
        <Input
          type="text"
          placeholder="Søk på tjenester, leverandører eller tilbud..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-4 pr-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg"
        />
        <Button 
          type="submit"
          size="sm"
          className="absolute right-2 top-2 h-8 bg-blue-600 hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default NavigationSearch;
