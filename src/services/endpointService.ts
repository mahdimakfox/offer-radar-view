
import { ProviderEndpoint, ExecutionResult } from './endpoint/endpointTypes';
import { EndpointDataService } from './endpoint/endpointDataService';
import { EndpointFallbackService } from './endpoint/endpointFallbackService';
import { executeEndpoint } from './endpoint/endpointExecutor';

export type { ProviderEndpoint, ExecutionResult };

const endpointDataService = new EndpointDataService();
const endpointFallbackService = new EndpointFallbackService();

export const endpointService = {
  async getEndpointsForCategory(category: string): Promise<ProviderEndpoint[]> {
    return endpointDataService.getEndpointsForCategory(category);
  },

  async getAllEndpoints(): Promise<ProviderEndpoint[]> {
    return endpointDataService.getAllEndpoints();
  },

  async executeEndpoint(endpointId: string, executionType: 'manual' | 'scheduled' | 'fallback' = 'manual'): Promise<ExecutionResult> {
    const endpoint = await endpointDataService.getEndpointById(endpointId);
    return executeEndpoint(endpoint, executionType);
  },

  async executeWithFallback(category: string): Promise<ExecutionResult> {
    const endpoints = await this.getEndpointsForCategory(category);
    return endpointFallbackService.executeWithFallback(category, endpoints);
  }
};
