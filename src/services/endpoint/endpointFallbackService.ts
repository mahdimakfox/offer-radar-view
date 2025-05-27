
import { ProviderEndpoint, ExecutionResult } from './endpointTypes';
import { executeEndpoint } from './endpointExecutor';
import { delay } from './endpointUtils';

export class EndpointFallbackService {
  async executeWithFallback(category: string, endpoints: ProviderEndpoint[]): Promise<ExecutionResult> {
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
}
