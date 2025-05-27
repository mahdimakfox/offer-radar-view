
import { supabase } from '@/integrations/supabase/client';

export const logScrapingAttempt = async (
  url: string,
  category: string,
  success: boolean,
  error?: string,
  retriedCount?: number,
  providersFetched?: number,
  executionTime?: number
) => {
  try {
    const logEntry = {
      category,
      total_providers: providersFetched || (success ? 1 : 0),
      successful_imports: success ? (providersFetched || 1) : 0,
      failed_imports: success ? 0 : 1,
      import_status: success ? 'completed' : 'failed',
      error_details: error ? { 
        url, 
        error, 
        retriedCount: retriedCount || 0,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
        type: 'scraping_attempt'
      } : null
    };

    const { error: logError } = await supabase
      .from('import_logs')
      .insert(logEntry);

    if (logError) {
      console.error('Failed to log scraping attempt:', logError);
    } else {
      console.log('Successfully logged scraping attempt:', {
        url,
        category,
        success,
        providersFetched
      });
    }
  } catch (logError) {
    console.error('Exception while logging scraping attempt:', logError);
  }
};

export const logEndpointExecution = async (
  endpointId: string,
  executionType: string,
  status: 'success' | 'failed',
  providersFetched: number = 0,
  providersSaved: number = 0,
  duplicatesFound: number = 0,
  executionTimeMs: number = 0,
  errorMessage?: string,
  responseMetadata?: any
) => {
  try {
    const logEntry = {
      endpoint_id: endpointId,
      execution_type: executionType,
      status,
      providers_fetched: providersFetched,
      providers_saved: providersSaved,
      duplicates_found: duplicatesFound,
      execution_time_ms: executionTimeMs,
      error_message: errorMessage,
      response_metadata: responseMetadata,
      created_at: new Date().toISOString()
    };

    const { error: logError } = await supabase
      .from('endpoint_execution_logs')
      .insert(logEntry);

    if (logError) {
      console.error('Failed to log endpoint execution:', logError);
    } else {
      console.log('Successfully logged endpoint execution:', {
        endpointId,
        status,
        providersFetched,
        providersSaved
      });
    }
  } catch (logError) {
    console.error('Exception while logging endpoint execution:', logError);
  }
};
