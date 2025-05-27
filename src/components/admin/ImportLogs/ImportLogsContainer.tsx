
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LogsStatsDashboard from './LogsStatsDashboard';
import ImportLogsHeader from './ImportLogsHeader';
import ImportLogsTable from './ImportLogsTable';
import EmptyLogsState from './EmptyLogsState';
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

const ImportLogsContainer = () => {
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
        .limit(100);

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
        .neq('id', '00000000-0000-0000-0000-000000000000');

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

  return (
    <div className="space-y-6">
      <ImportLogsHeader 
        logsCount={logs.length}
        loading={loading}
        onRefresh={loadLogs}
        onClearLogs={clearLogs}
      />

      {logs.length > 0 && (
        <>
          <LogsStatsDashboard logs={logs} />
          <Separator />
          <ImportLogsTable logs={logs} />
        </>
      )}

      {logs.length === 0 && <EmptyLogsState />}
    </div>
  );
};

export default ImportLogsContainer;
