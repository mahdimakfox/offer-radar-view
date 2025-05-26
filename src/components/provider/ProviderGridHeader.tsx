
import { Badge } from '@/components/ui/badge';

interface ProviderGridHeaderProps {
  count: number;
  sortBy: 'price' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'price' | 'rating' | 'name') => void;
  isRefetching: boolean;
}

const ProviderGridHeader = ({ 
  count, 
  sortBy, 
  sortOrder, 
  onSortChange, 
  isRefetching 
}: ProviderGridHeaderProps) => {
  const getSortLabel = (field: 'price' | 'rating' | 'name') => {
    const labels = {
      price: 'Sorter etter pris',
      rating: 'Sorter etter rating',
      name: 'Sorter etter navn'
    };
    
    if (field === sortBy) {
      return `${labels[field]} (${sortOrder === 'asc' ? '↑' : '↓'})`;
    }
    
    return labels[field];
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4">
        <h2 className="text-3xl font-bold text-gray-900">
          {count} leverandører funnet
        </h2>
        {isRefetching && (
          <Badge variant="secondary" className="text-xs animate-pulse">
            Oppdaterer...
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <select 
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field] = e.target.value.split('-') as ['price' | 'rating' | 'name'];
            onSortChange(field);
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="price-asc">{getSortLabel('price')}</option>
          <option value="rating-desc">{getSortLabel('rating')}</option>
          <option value="name-asc">{getSortLabel('name')}</option>
        </select>
      </div>
    </div>
  );
};

export default ProviderGridHeader;
