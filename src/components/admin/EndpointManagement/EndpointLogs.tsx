
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import ExecutionLogsTable from './ExecutionLogsTable';

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

const EndpointLogs = () => {
  // Fetch execution logs
  const { data: logs = [], isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['endpoint-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('endpoint_execution_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ExecutionLog[];
    }
  });

  // Fetch endpoints for reference
  const { data: endpoints = [] } = useQuery({
    queryKey: ['endpoints-reference'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_endpoints')
        .select('id, name');
      if (error) throw error;
      return data as ProviderEndpoint[];
    }
  });

  // Calculate summary statistics
  const totalExecutions = logs.length;
  const successfulExecutions = logs.filter(log => log.status === 'success').length;
  const failedExecutions = logs.filter(log => log.status !== 'success').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Endpoint-logger</h3>
          <p className="text-gray-600">Overvåk utførelser og feilsøk problemer</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" disabled={logsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
          Oppdater
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totale utførelser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vellykkede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulExecutions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feilede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedExecutions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suksessrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nylige utførelser</CardTitle>
          <CardDescription>De siste 100 endpoint-utførelsene</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8">Laster logger...</div>
          ) : (
            <ExecutionLogsTable logs={logs} endpoints={endpoints} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointLogs;
