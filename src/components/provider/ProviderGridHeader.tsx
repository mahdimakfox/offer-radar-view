
import { Badge } from '@/components/ui/badge';

interface ProviderGridHeaderProps {
  count: number;
  sortBy: 'price' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'price' | 'rating' | 'name') => void;
  isRefetching: boolean;
  lastUpdated?: Date | null;
}

const ProviderGridHeader = ({ 
  count, 
  sortBy, 
  sortOrder, 
  onSortChange, 
  isRefetching,
  lastUpdated 
}: ProviderGridHeaderProps) => {
  const getSortLabel = (field: 'price' | 'rating' | 'name') => {
    const labels = {
      price: 'Pris',
      rating: 'Vurdering',
      name: 'Navn'
    };
    
    if (field === sortBy) {
      return `${labels[field]} (${sortOrder === 'asc' ? '↑' : '↓'})`;
    }
    
    return labels[field];
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins === 0) return 'akkurat nå';
    if (diffMins === 1) return '1 minutt siden';
    if (diffMins < 60) return `${diffMins} minutter siden`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 time siden';
    if (diffHours < 24) return `${diffHours} timer siden`;
    
    return date.toLocaleDateString('nb-NO', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {count} leverandører
        </h2>
        
        <div className="flex items-center space-x-2">
          {isRefetching && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
              Oppdaterer...
            </Badge>
          )}
          
          {lastUpdated && !isRefetching && (
            <Badge variant="outline" className="text-xs text-gray-600">
              Sist oppdatert: {formatLastUpdated(lastUpdated)}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <select 
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field] = e.target.value.split('-') as ['price' | 'rating' | 'name'];
            onSortChange(field);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={isRefetching}
        >
          <option value="price-asc">Pris (lav → høy)</option>
          <option value="price-desc">Pris (høy → lav)</option>
          <option value="rating-desc">Vurdering (høy → lav)</option>
          <option value="rating-asc">Vurdering (lav → høy)</option>
          <option value="name-asc">Navn (A → Z)</option>
          <option value="name-desc">Navn (Z → A)</option>
        </select>
      </div>
    </div>
  );
};

export default ProviderGridHeader;
