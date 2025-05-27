
import { supabase } from '@/integrations/supabase/client';
import { ExecutionResult } from './endpointTypes';

export const logExecution = async (
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
