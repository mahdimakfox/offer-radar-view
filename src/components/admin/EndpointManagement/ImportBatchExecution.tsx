
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import EndpointExecutionPanel from './EndpointExecutionPanel';

interface ProviderEndpoint {
  id: string;
  category: string;
  name: string;
  endpoint_type: 'api' | 'scraping';
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: any;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

interface ImportBatchExecutionProps {
  onExecutionComplete: () => void;
}

const ImportBatchExecution = ({ onExecutionComplete }: ImportBatchExecutionProps) => {
  // Fetch active endpoints
  const { data: endpoints = [], isLoading } = useQuery({
    queryKey: ['active-endpoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_endpoints')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as ProviderEndpoint[];
    }
  });

  // Group endpoints by category
  const endpointsByCategory = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, ProviderEndpoint[]>);

  if (isLoading) {
    return <div className="text-center py-8">Laster endepunkter...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Import og batch-kjøring</h3>
        <p className="text-gray-600">Utfør datainnsamling fra konfigurerte endepunkter</p>
      </div>

      {Object.keys(endpointsByCategory).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Ingen aktive endepunkter funnet</p>
            <p className="text-sm text-gray-400 mt-2">
              Aktiver endepunkter i "Endepunktoversikt" for å kunne utføre dem
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(endpointsByCategory).map(([category, categoryEndpoints]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>
                  {categoryEndpoints.length} aktive endepunkter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryEndpoints.map(endpoint => (
                  <EndpointExecutionPanel
                    key={endpoint.id}
                    endpoint={endpoint}
                    onExecutionComplete={onExecutionComplete}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportBatchExecution;
