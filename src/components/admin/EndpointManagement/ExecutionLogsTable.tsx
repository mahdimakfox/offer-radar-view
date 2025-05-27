
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProviderEndpoint {
  id: string;
  name: string;
}

interface ExecutionLog {
  id: string;
  endpoint_id: string;
  execution_type: 'manual' | 'scheduled' | 'fallback';
  status: 'success' | 'failure' | 'timeout' | 'error';
  providers_fetched: number;
  providers_saved: number;
  duplicates_found: number;
  execution_time_ms?: number;
  error_message?: string;
  created_at: string;
}

interface ExecutionLogsTableProps {
  logs: ExecutionLog[];
  endpoints: ProviderEndpoint[];
}

const ExecutionLogsTable = ({ logs, endpoints }: ExecutionLogsTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Providers</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const endpoint = endpoints.find(e => e.id === log.endpoint_id);
          return (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.created_at)}</TableCell>
              <TableCell>{endpoint?.name || 'Unknown'}</TableCell>
              <TableCell>
                <Badge variant="outline">{log.execution_type}</Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={log.status === 'success' ? 'default' : 'destructive'}
                  className={log.status === 'success' ? 'bg-green-500' : ''}
                >
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                {log.providers_saved}/{log.providers_fetched}
                {log.duplicates_found > 0 && (
                  <span className="text-sm text-gray-500"> (+{log.duplicates_found} dup)</span>
                )}
              </TableCell>
              <TableCell>
                {log.execution_time_ms ? `${log.execution_time_ms}ms` : 'N/A'}
              </TableCell>
              <TableCell className="max-w-48 truncate">
                {log.error_message || '-'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExecutionLogsTable;
