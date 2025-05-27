
import { supabase } from '@/integrations/supabase/client';
import { ProviderEndpoint, DatabaseEndpoint, ExecutionResult } from './endpoint/endpointTypes';
import { convertDatabaseEndpoint, delay } from './endpoint/endpointUtils';
import { executeEndpoint } from './endpoint/endpointExecutor';

export type { ProviderEndpoint, ExecutionResult };

export const endpointService = {
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
  },

  async executeEndpoint(endpointId: string, executionType: 'manual' | 'scheduled' | 'fallback' = 'manual'): Promise<ExecutionResult> {
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

    const typedEndpoint = convertDatabaseEndpoint(endpoint as DatabaseEndpoint);
    return executeEndpoint(typedEndpoint, executionType);
  },

  async executeWithFallback(category: string): Promise<ExecutionResult> {
    const endpoints = await this.getEndpointsForCategory(category);
    
    if (endpoints.length === 0) {
      throw new Error(`No active endpoints configured for category: ${category}`);
    }

    let lastError: string = '';
    let attempts = 0;

    for (const endpoint of endpoints) {
      try {
        attempts++;
        console.log(`Trying endpoint: ${endpoint.name} (priority ${endpoint.priority}, attempt ${attempts})`);
        const result = await executeEndpoint(endpoint, 'fallback');
        
        if (result.success && result.providersFetched > 0) {
          console.log(`Successfully executed endpoint: ${endpoint.name}`);
          
          return {
            ...result,
            usedFallback: attempts > 1 || result.usedFallback
          };
        }
        
        lastError = result.error || 'No data returned';
        console.warn(`Endpoint ${endpoint.name} returned no data, trying next...`);
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Endpoint ${endpoint.name} failed with error:`, error);
        
        if (endpoint === endpoints[endpoints.length - 1]) {
          break;
        }
        
        await delay(1000);
      }
    }

    throw new Error(`All ${attempts} endpoints failed. Last error: ${lastError}`);
  }
};
