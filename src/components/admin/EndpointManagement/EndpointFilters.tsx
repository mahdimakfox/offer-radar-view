
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EndpointFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onRefresh: () => void;
}

const EndpointFilters = ({ selectedCategory, onCategoryChange, onRefresh }: EndpointFiltersProps) => {
  const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];

  return (
    <div className="flex items-center space-x-4">
      <Label htmlFor="category">Filtrer etter kategori:</Label>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle kategorier</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onRefresh} variant="outline" size="sm">
        Oppdater
      </Button>
    </div>
  );
};

export default EndpointFilters;
