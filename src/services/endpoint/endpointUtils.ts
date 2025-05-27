
import { DatabaseEndpoint, ProviderEndpoint } from './endpointTypes';
import { ScrapingConfig } from '../scraping/scrapingTypes';

export const convertDatabaseEndpoint = (dbEndpoint: DatabaseEndpoint): ProviderEndpoint => {
  return {
    id: dbEndpoint.id,
    category: dbEndpoint.category,
    name: dbEndpoint.name,
    endpoint_type: dbEndpoint.endpoint_type as 'api' | 'scraping',
    url: dbEndpoint.url,
    priority: dbEndpoint.priority,
    is_active: dbEndpoint.is_active,
    auth_required: dbEndpoint.auth_required,
    auth_config: dbEndpoint.auth_config,
    scraping_config: dbEndpoint.scraping_config as ScrapingConfig | undefined,
    last_success_at: dbEndpoint.last_success_at,
    failure_count: dbEndpoint.failure_count,
    total_requests: dbEndpoint.total_requests,
    success_rate: dbEndpoint.success_rate
  };
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
