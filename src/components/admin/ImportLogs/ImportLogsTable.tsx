
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ImportLog {
  id: string;
  category: string;
  total_providers: number;
  successful_imports: number;
  failed_imports: number;
  import_status: string;
  error_details: any;
  created_at: string;
}

interface ImportLogsTableProps {
  logs: ImportLog[];
}

const ImportLogsTable = ({ logs }: ImportLogsTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('no-NO');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Fullført</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">Pågår</Badge>;
      case 'failed':
        return <Badge variant="destructive">Feilet</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSuccessRate = (log: ImportLog) => {
    if (log.total_providers === 0) return 0;
    return Math.round((log.successful_imports / log.total_providers) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nylige importer</CardTitle>
        <CardDescription>
          Siste importoperasjoner og deres resultater
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dato</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Totalt</TableHead>
              <TableHead>Suksess</TableHead>
              <TableHead>Feilet</TableHead>
              <TableHead>Suksessrate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.slice(0, 20).map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {formatDate(log.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.category}</Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(log.import_status)}
                </TableCell>
                <TableCell className="text-center">
                  {log.total_providers}
                </TableCell>
                <TableCell className="text-center text-green-600">
                  {log.successful_imports}
                </TableCell>
                <TableCell className="text-center text-red-600">
                  {log.failed_imports}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={getSuccessRate(log) === 100 ? "default" : 
                            getSuccessRate(log) > 50 ? "secondary" : "destructive"}
                  >
                    {getSuccessRate(log)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ImportLogsTable;
