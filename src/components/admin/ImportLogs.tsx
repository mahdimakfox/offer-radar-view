
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LogsStatsDashboard from './ImportLogs/LogsStatsDashboard';
import { Separator } from '@/components/ui/separator';

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

const ImportLogs = () => {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Increased limit for better analytics

      if (error) {
        console.error('Error loading logs:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke laste importlogger",
          variant: "destructive"
        });
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const { error } = await supabase
        .from('import_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all logs

      if (error) {
        console.error('Error clearing logs:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke slette logger",
          variant: "destructive"
        });
        return;
      }

      setLogs([]);
      toast({
        title: "Suksess",
        description: "Alle logger er slettet"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Import Activity</h3>
          <p className="text-sm text-gray-600">
            {logs.length} nylige importoperasjoner
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadLogs}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Oppdater
          </Button>
          <Button
            onClick={clearLogs}
            variant="outline"
            size="sm"
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Slett logger
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      {logs.length > 0 && (
        <>
          <LogsStatsDashboard logs={logs} />
          <Separator />
        </>
      )}

      {logs.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Ingen importlogger funnet</p>
            <p className="text-sm text-gray-400 mt-2">
              Importaktivitet vil vises her når du starter import av data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportLogs;
