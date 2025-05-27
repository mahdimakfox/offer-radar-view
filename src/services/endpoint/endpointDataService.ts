
import { supabase } from '@/integrations/supabase/client';
import { ProviderEndpoint, DatabaseEndpoint } from './endpointTypes';
import { convertDatabaseEndpoint } from './endpointUtils';

export class EndpointDataService {
  async getEndpointsForCategory(category: string): Promise<ProviderEndpoint[]> {
    const { data, error } = await supabase
      .from('provider_endpoints')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching endpoints:', error);
      throw error;
    }

    return (data as DatabaseEndpoint[]).map(convertDatabaseEndpoint);
  }

  async getAllEndpoints(): Promise<ProviderEndpoint[]> {
    const { data, error } = await supabase
      .from('provider_endpoints')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching all endpoints:', error);
      throw error;
    }

    return (data as DatabaseEndpoint[]).map(convertDatabaseEndpoint);
  }

  async getEndpointById(endpointId: string): Promise<ProviderEndpoint> {
    const { data: endpoint, error } = await supabase
      .from('provider_endpoints')
      .select('*')
      .eq('id', endpointId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch endpoint: ${error.message}`);
    }

    if (!endpoint.is_active) {
      throw new Error('Endpoint is not active');
    }

    return convertDatabaseEndpoint(endpoint as DatabaseEndpoint);
  }
}
