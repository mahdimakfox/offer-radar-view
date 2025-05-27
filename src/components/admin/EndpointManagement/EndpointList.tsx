
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EndpointsTable from './EndpointsTable';

interface ProviderEndpoint {
  id: string;
  category: string;
  name: string;
  provider_name?: string;
  endpoint_type: 'api' | 'scraping';
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: any;
  playwright_config?: any;
  auto_generated_url?: boolean;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
  scraped_data_count?: number;
  created_at: string;
  updated_at: string;
}

interface EndpointListProps {
  endpoints: ProviderEndpoint[];
  isLoading: boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (endpoint: ProviderEndpoint) => void;
  onDelete: (id: string) => void;
}

const EndpointList = ({ endpoints, isLoading, onToggleActive, onEdit, onDelete }: EndpointListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurerte endepunkter</CardTitle>
        <CardDescription>
          {endpoints.length} endepunkter konfigurert
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Laster endepunkter...</div>
        ) : (
          <EndpointsTable
            endpoints={endpoints}
            onToggleActive={onToggleActive}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EndpointList;
