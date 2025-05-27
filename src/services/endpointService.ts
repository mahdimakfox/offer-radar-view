import { supabase } from '@/integrations/supabase/client';
import { realApiService, RealApiProvider } from './realApiService';
import { scrapingService, ScrapingConfig } from './scrapingService';

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
  scraping_config?: ScrapingConfig;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
}

// Database response type that matches Supabase's actual return type
interface DatabaseEndpoint {
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

// Helper function to safely convert database response to ProviderEndpoint
const convertDatabaseEndpoint = (dbEndpoint: DatabaseEndpoint): ProviderEndpoint => {
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const logExecution = async (
  endpointId: string,
  executionType: 'manual' | 'scheduled' | 'fallback',
  result: ExecutionResult
) => {
  try {
    const { error } = await supabase.from('endpoint_execution_logs').insert({
      endpoint_id: endpointId,
      execution_type: executionType,
      status: result.success ? 'success' : 'failure',
      providers_fetched: result.providersFetched,
      providers_saved: result.providersSaved,
      duplicates_found: result.duplicatesFound,
      execution_time_ms: result.executionTimeMs,
      error_message: result.error
    });

    if (error) {
      console.error('Failed to log execution:', error);
    }
  } catch (err) {
    console.error('Exception logging execution:', err);
  }
};

const calculateContentHash = (provider: RealApiProvider): string => {
  // Create a normalized string representation of the provider data
  const normalizedData = {
    name: provider.name.trim().toLowerCase(),
    price: provider.price,
    rating: provider.rating,
    description: provider.description.trim().toLowerCase(),
    external_url: provider.external_url.trim(),
    org_number: provider.org_number?.trim()
  };
  
  // Create a simple hash from the stringified data
  const dataString = JSON.stringify(normalizedData);
  return btoa(dataString).slice(0, 32); // Base64 encoding, truncated
};

const insertProviderWithDuplicateDetection = async (
  provider: RealApiProvider, 
  category: string, 
  sourceEndpointId: string
): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'duplicate' | 'failed'; error?: string }> => {
  try {
    console.log(`Processing provider: ${provider.name}`);
    
    // Calculate content hash
    const contentHash = calculateContentHash(provider);
    
    // Check for existing provider by name and category
    const { data: existingProvider, error: selectError } = await supabase
      .from('providers')
      .select('id')
      .eq('name', provider.name)
      .eq('category', category)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing provider:', selectError);
      throw selectError;
    }

    if (existingProvider) {
      // Check if this exact content already exists
      const { data: existingDuplicate, error: duplicateError } = await supabase
        .from('provider_duplicates')
        .select('id')
        .eq('provider_id', existingProvider.id)
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (duplicateError) {
        console.error('Error checking duplicate:', duplicateError);
      }

      if (existingDuplicate) {
        console.log(`Duplicate content detected for provider: ${provider.name}`);
        return { success: true, action: 'duplicate' };
      }

      // Update existing provider with new data
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          price: provider.price,
          rating: provider.rating,
          description: provider.description,
          external_url: provider.external_url,
          org_number: provider.org_number,
          logo_url: provider.logo_url,
          pros: provider.pros,
          cons: provider.cons,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProvider.id);

      if (updateError) {
        console.error('Error updating provider:', updateError);
        throw updateError;
      }

      // Record this version in the duplicates table
      const { error: duplicateInsertError } = await supabase
        .from('provider_duplicates')
        .insert({
          provider_id: existingProvider.id,
          content_hash: contentHash,
          original_source: sourceEndpointId
        });

      if (duplicateInsertError) {
        console.error('Error recording duplicate:', duplicateInsertError);
      }

      console.log(`Updated existing provider: ${provider.name}`);
      return { success: true, action: 'updated' };
    } else {
      // Insert new provider
      const { data: insertedProvider, error: insertError } = await supabase
        .from('providers')
        .insert({
          name: provider.name,
          category: category,
          price: provider.price,
          rating: provider.rating,
          description: provider.description,
          external_url: provider.external_url,
          org_number: provider.org_number,
          logo_url: provider.logo_url,
          pros: provider.pros,
          cons: provider.cons,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting provider:', insertError);
        throw insertError;
      }

      // Record the initial version in the duplicates table
      const { error: duplicateInsertError } = await supabase
        .from('provider_duplicates')
        .insert({
          provider_id: insertedProvider.id,
          content_hash: contentHash,
          original_source: sourceEndpointId
        });

      if (duplicateInsertError) {
        console.error('Error recording initial duplicate:', duplicateInsertError);
      }

      console.log(`Inserted new provider: ${provider.name}`);
      return { success: true, action: 'inserted' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      action: 'failed'
    };
  }
};

const executeEndpoint = async (
  endpoint: ProviderEndpoint,
  executionType: 'manual' | 'scheduled' | 'fallback' = 'manual'
): Promise<ExecutionResult> => {
  const startTime = Date.now();
  let providersFetched = 0;
  let providersSaved = 0;
  let duplicatesFound = 0;
  let usedFallback = false;
  let retriedCount = 0;

  try {
    console.log(`Executing ${endpoint.endpoint_type} endpoint: ${endpoint.name} for category ${endpoint.category}`);
    
    let apiResponse;
    
    if (endpoint.endpoint_type === 'scraping' && endpoint.scraping_config) {
      // Use enhanced scraping service
      const scrapingResult = await scrapingService.executeScraping(
        endpoint.url,
        endpoint.scraping_config,
        endpoint.category
      );
      
      if (!scrapingResult.success) {
        throw new Error(scrapingResult.error || 'Scraping failed');
      }
      
      // Log scraping attempt
      await scrapingService.logScrapingAttempt(
        endpoint.url,
        endpoint.category,
        scrapingResult.success,
        scrapingResult.error,
        scrapingResult.retriedCount
      );
      
      apiResponse = {
        success: true,
        data: scrapingResult.data.map(item => ({
          name: item.name,
          price: item.price,
          rating: item.rating,
          description: `Provider scraped from ${endpoint.name}`,
          external_url: item.source || endpoint.url,
          org_number: '',
          logo_url: '',
          pros: ['Scraped data'],
          cons: []
        }))
      };
      
      usedFallback = scrapingResult.usedFallback || false;
      retriedCount = scrapingResult.retriedCount;
      
    } else {
      // Use existing API service
      apiResponse = await realApiService.fetchProvidersFromApi(endpoint.category);
    }
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Failed to fetch data from endpoint');
    }

    providersFetched = apiResponse.data.length;
    console.log(`Fetched ${providersFetched} providers from ${endpoint.name}`);

    // Process each provider with duplicate detection
    for (const provider of apiResponse.data) {
      const result = await insertProviderWithDuplicateDetection(
        provider, 
        endpoint.category, 
        endpoint.id
      );
      
      if (result.success) {
        if (result.action === 'duplicate') {
          duplicatesFound++;
        } else {
          providersSaved++;
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;
    const result: ExecutionResult = {
      success: true,
      providers: apiResponse.data,
      executionTimeMs,
      providersFetched,
      providersSaved,
      duplicatesFound,
      usedFallback,
      retriedCount
    };

    // Log the successful execution
    await logExecution(endpoint.id, executionType, result);

    return result;
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    const result: ExecutionResult = {
      success: false,
      providers: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs,
      providersFetched,
      providersSaved,
      duplicatesFound,
      usedFallback,
      retriedCount
    };

    // Log the failed execution
    await logExecution(endpoint.id, executionType, result);

    return result;
  }
};

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

    // Convert database response to ProviderEndpoint type using helper function
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

    // Convert database response to ProviderEndpoint type using helper function
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

    // Try endpoints in priority order with enhanced fallback
    for (const endpoint of endpoints) {
      try {
        attempts++;
        console.log(`Trying endpoint: ${endpoint.name} (priority ${endpoint.priority}, attempt ${attempts})`);
        const result = await executeEndpoint(endpoint, 'fallback');
        
        if (result.success && result.providersFetched > 0) {
          console.log(`Successfully executed endpoint: ${endpoint.name}`);
          
          // Add metadata about the fallback process
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
        
        // If this is the last endpoint, don't continue
        if (endpoint === endpoints[endpoints.length - 1]) {
          break;
        }
        
        // Wait a bit before trying the next endpoint
        await delay(1000);
      }
    }

    throw new Error(`All ${attempts} endpoints failed. Last error: ${lastError}`);
  }
};
