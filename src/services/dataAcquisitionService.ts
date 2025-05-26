
import { supabase } from '@/integrations/supabase/client';
import { realApiService, RealApiProvider } from './realApiService';

export interface ApiMapping {
  id: string;
  provider_name: string;
  api_url: string;
  api_type?: string;
  auth_required?: boolean;
  data_mapping?: Record<string, any>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  usingFallback?: boolean;
}

export interface ImportLogEntry {
  category: string;
  total_providers: number;
  successful_imports: number;
  failed_imports: number;
  import_status: 'in_progress' | 'completed' | 'failed';
  error_details?: any;
}

// Real API mappings for Norwegian providers
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

const insertProviderWithRetry = async (providerData: RealApiProvider, category: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to insert provider: ${providerData.name} (attempt ${attempt}/${maxRetries})`);
      
      // First, try to find existing provider
      const { data: existingProvider, error: selectError } = await supabase
        .from('providers')
        .select('id')
        .eq('name', providerData.name)
        .eq('category', category)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing provider:', selectError);
        throw selectError;
      }

      if (existingProvider) {
        // Update existing provider
        const { error: updateError } = await supabase
          .from('providers')
          .update({
            price: providerData.price,
            rating: providerData.rating,
            description: providerData.description,
            external_url: providerData.external_url,
            org_number: providerData.org_number,
            logo_url: providerData.logo_url,
            pros: providerData.pros,
            cons: providerData.cons,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProvider.id);

        if (updateError) {
          console.error('Error updating provider:', updateError);
          throw updateError;
        }
        
        console.log(`Updated existing provider: ${providerData.name}`);
        return { success: true, action: 'updated' };
      } else {
        // Insert new provider
        const { error: insertError } = await supabase
          .from('providers')
          .insert({
            name: providerData.name,
            category: category,
            price: providerData.price,
            rating: providerData.rating,
            description: providerData.description,
            external_url: providerData.external_url,
            org_number: providerData.org_number,
            logo_url: providerData.logo_url,
            pros: providerData.pros,
            cons: providerData.cons,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting provider:', insertError);
          throw insertError;
        }
        
        console.log(`Inserted new provider: ${providerData.name}`);
        return { success: true, action: 'inserted' };
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${providerData.name}:`, error);
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          action: 'failed'
        };
      }
      
      // Exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying in ${backoffTime}ms...`);
      await delay(backoffTime);
    }
  }
  
  return { success: false, error: 'Max retries exceeded', action: 'failed' };
};

export const dataAcquisitionService = {
  async getApiMappings(): Promise<ApiMapping[]> {
    console.log('Fetching API mappings...');
    return realApiMappings;
  },

  async importProvidersFromApi(mapping: ApiMapping, category: string): Promise<ImportResult> {
    console.log(`Starting real API import from ${mapping.provider_name} for category ${category}`);
    
    // Create initial log entry
    const logEntry: ImportLogEntry = {
      category,
      total_providers: 0,
      successful_imports: 0,
      failed_imports: 0,
      import_status: 'in_progress'
    };
    
    try {
      // Use real API service to fetch data
      const apiResponse = await realApiService.fetchProvidersFromApi(category);
      
      if (apiResponse.data.length === 0) {
        console.warn(`No data available for category: ${category}`);
        return {
          success: 0,
          failed: 0,
          errors: [`No data available for category: ${category}`],
          usingFallback: !apiResponse.success
        };
      }

      console.log(`Found ${apiResponse.data.length} providers for category ${category}${!apiResponse.success ? ' (using fallback data)' : ''}`);
      
      // Update log entry with total
      logEntry.total_providers = apiResponse.data.length;
      await logImportActivity(logEntry);
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // If API call failed, add this to errors
      if (!apiResponse.success && apiResponse.error) {
        errors.push(`API Error: ${apiResponse.error} - Using fallback data`);
      }

      // Process providers with improved error handling
      for (const providerData of apiResponse.data) {
        try {
          console.log(`Processing provider: ${providerData.name}`);
          
          const result = await insertProviderWithRetry(providerData, category);
          
          if (result.success) {
            successCount++;
            console.log(`✓ Successfully ${result.action} provider: ${providerData.name}`);
          } else {
            failedCount++;
            const errorMsg = `Failed to insert ${providerData.name}: ${result.error}`;
            errors.push(errorMsg);
            console.error(`✗ ${errorMsg}`);
          }
        } catch (err) {
          failedCount++;
          const errorMsg = `Exception processing ${providerData.name}: ${err instanceof Error ? err.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`✗ ${errorMsg}`);
        }
      }

      // Log final results
      const finalLogEntry: ImportLogEntry = {
        category,
        total_providers: apiResponse.data.length,
        successful_imports: successCount,
        failed_imports: failedCount,
        import_status: failedCount === 0 ? 'completed' : 'failed',
        error_details: errors.length > 0 ? { errors, apiError: apiResponse.error } : null
      };
      
      await logImportActivity(finalLogEntry);

      console.log(`Import completed for ${mapping.provider_name}:`, {
        success: successCount,
        failed: failedCount,
        total: apiResponse.data.length,
        usingFallback: !apiResponse.success
      });

      return {
        success: successCount,
        failed: failedCount,
        errors,
        usingFallback: !apiResponse.success
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
