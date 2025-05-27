
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

interface ImportHeaderProps {
  endpointCount: number;
  loading: boolean;
  onRefresh: () => void;
  onFetchAll: () => void;
}

const ImportHeader = ({ endpointCount, loading, onRefresh, onFetchAll }: ImportHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Enhanced Data Import System</h3>
        <p className="text-sm text-gray-600">
          {endpointCount} endepunkter med automatisk fallback og feilhåndtering
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Oppdater
        </Button>
        <Button
          onClick={onFetchAll}
          disabled={loading || endpointCount === 0}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Henter...' : 'Hent alle'}
        </Button>
      </div>
    </div>
  );
};

export default ImportHeader;
