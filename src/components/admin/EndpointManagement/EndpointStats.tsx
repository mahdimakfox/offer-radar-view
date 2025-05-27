
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface EndpointStatsProps {
  endpoints: ProviderEndpoint[];
}

const EndpointStats = ({ endpoints }: EndpointStatsProps) => {
  const activeEndpoints = endpoints.filter(e => e.is_active);
  const inactiveEndpoints = endpoints.filter(e => !e.is_active);
  const highFailureEndpoints = endpoints.filter(e => e.failure_count > 5);
  const scrapingEndpoints = endpoints.filter(e => e.endpoint_type === 'scraping');

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Totalt endepunkter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{endpoints.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Aktive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeEndpoints.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Inaktive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{inactiveEndpoints.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Scraping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{scrapingEndpoints.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Problemer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{highFailureEndpoints.length}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointStats;
