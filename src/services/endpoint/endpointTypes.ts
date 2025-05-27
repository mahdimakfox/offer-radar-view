
import { ScrapingConfig } from '../scraping/scrapingTypes';
import { RealApiProvider } from '../realApiService';

export interface ProviderEndpoint {
  id: string;
  category: string;
  name: string;
  endpoint_type: 'api' | 'scraping';
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: ScrapingConfig;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
}

export interface DatabaseEndpoint {
  id: string;
  category: string;
  name: string;
  endpoint_type: string;
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: any;
  last_success_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ExecutionResult {
  success: boolean;
  providers: RealApiProvider[];
  error?: string;
  executionTimeMs: number;
  providersFetched: number;
  providersSaved: number;
  duplicatesFound: number;
  usedFallback?: boolean;
  retriedCount?: number;
}
