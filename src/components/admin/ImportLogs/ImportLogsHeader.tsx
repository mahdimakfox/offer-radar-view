
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';

interface ImportLogsHeaderProps {
  logsCount: number;
  loading: boolean;
  onRefresh: () => void;
  onClearLogs: () => void;
}

const ImportLogsHeader = ({ logsCount, loading, onRefresh, onClearLogs }: ImportLogsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Import Activity</h3>
        <p className="text-sm text-gray-600">
          {logsCount} nylige importoperasjoner
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Oppdater
        </Button>
        <Button
          onClick={onClearLogs}
          variant="outline"
          size="sm"
          disabled={logsCount === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Slett logger
        </Button>
      </div>
    </div>
  );
};

export default ImportLogsHeader;
