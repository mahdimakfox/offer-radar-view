import { supabase } from '@/integrations/supabase/client';
import { endpointService } from './endpointService';
import { ApiMapping } from './types/dataAcquisitionTypes';

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  usingFallback?: boolean;
  duplicatesFound?: number;
}

export interface ImportLogEntry {
  category: string;
  total_providers: number;
  successful_imports: number;
  failed_imports: number;
  import_status: 'in_progress' | 'completed' | 'failed';
  error_details?: any;
}

const logImportActivity = async (logEntry: ImportLogEntry) => {
  try {
    const { error } = await supabase
      .from('import_logs')
      .insert(logEntry);
    
    if (error) {
      console.error('Failed to log import activity:', error);
    }
  } catch (err) {
    console.error('Exception logging import activity:', err);
  }
};

export const dataAcquisitionService = {
  async getApiMappings(): Promise<ApiMapping[]> {
    console.log('Fetching API mappings from endpoints...');
    
    // Fetch active endpoints from the database
    const { data: endpoints, error } = await supabase
      .from('provider_endpoints')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching endpoints:', error);
      // Fallback to the original hardcoded mappings
      const realApiMappings: ApiMapping[] = [
        {
          id: 'strom-api',
          provider_name: 'Strøm API Norge',
          api_url: 'https://api.strompriser.no/v1/providers',
          api_type: 'REST',
          auth_required: false
        },
        {
          id: 'forsikring-api', 
          provider_name: 'Forsikring Norge API',
          api_url: 'https://api.forsikring.no/v1/companies',
          api_type: 'REST',
          auth_required: false
        },
        {
          id: 'bank-api',
          provider_name: 'Bank Norge API', 
          api_url: 'https://api.bank.no/v1/institutions',
          api_type: 'REST',
          auth_required: true
        },
        {
          id: 'mobil-api',
          provider_name: 'Telecom Norge API',
          api_url: 'https://api.telecom.no/v1/operators',
          api_type: 'REST',
          auth_required: false
        },
        {
          id: 'internett-api',
          provider_name: 'Bredbånd Norge API',
          api_url: 'https://api.bredband.no/v1/providers',
          api_type: 'REST',
          auth_required: false
        },
        {
          id: 'boligalarm-api',
          provider_name: 'Security Norge API',
          api_url: 'https://api.security.no/v1/providers',
          api_type: 'REST',
          auth_required: false
        }
      ];
      return realApiMappings;
    }

    // Convert endpoints to ApiMapping format for backward compatibility
    return endpoints.map(endpoint => ({
      id: endpoint.id,
      provider_name: endpoint.name,
      api_url: endpoint.url,
      api_type: endpoint.endpoint_type.toUpperCase(),
      auth_required: endpoint.auth_required,
      data_mapping: endpoint.scraping_config || endpoint.auth_config
    }));
  },

  async importProvidersFromApi(mapping: ApiMapping, category: string): Promise<ImportResult> {
    console.log(`Starting enhanced API import from ${mapping.provider_name} for category ${category}`);
    
    // Create initial log entry
    const logEntry: ImportLogEntry = {
      category,
      total_providers: 0,
      successful_imports: 0,
      failed_imports: 0,
      import_status: 'in_progress'
    };
    
    try {
      // Use the new endpoint service with fallback mechanism
      const result = await endpointService.executeWithFallback(category);
      
      if (result.providersFetched === 0) {
        console.warn(`No data available for category: ${category}`);
        return {
          success: 0,
          failed: 0,
          errors: [`No data available for category: ${category}`],
          duplicatesFound: 0
        };
      }

      console.log(`Processed ${result.providersFetched} providers for category ${category}`);
      
      // Update log entry with results
      const finalLogEntry: ImportLogEntry = {
        category,
        total_providers: result.providersFetched,
        successful_imports: result.providersSaved,
        failed_imports: result.providersFetched - result.providersSaved - result.duplicatesFound,
        import_status: result.success ? 'completed' : 'failed',
        error_details: result.error ? { error: result.error } : null
      };
      
      await logImportActivity(finalLogEntry);

      console.log(`Import completed for ${mapping.provider_name}:`, {
        success: result.providersSaved,
        failed: result.providersFetched - result.providersSaved - result.duplicatesFound,
        duplicates: result.duplicatesFound,
        total: result.providersFetched
      });

      return {
        success: result.providersSaved,
        failed: result.providersFetched - result.providersSaved - result.duplicatesFound,
        errors: result.error ? [result.error] : [],
        duplicatesFound: result.duplicatesFound
      };
    } catch (error) {
      const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('Import error:', error);
      
      // Log failure
      const failedLogEntry: ImportLogEntry = {
        category,
        total_providers: 0,
        successful_imports: 0,
        failed_imports: 1,
        import_status: 'failed',
        error_details: { error: errorMsg }
      };
      
      await logImportActivity(failedLogEntry);
      
      throw new Error(errorMsg);
    }
  }
};
