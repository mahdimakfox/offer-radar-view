
import { supabase } from '@/integrations/supabase/client';

export const logScrapingAttempt = async (
  url: string,
  category: string,
  success: boolean,
  error?: string,
  retriedCount?: number
) => {
  try {
    await supabase.from('import_logs').insert({
      category,
      total_providers: success ? 1 : 0,
      successful_imports: success ? 1 : 0,
      failed_imports: success ? 0 : 1,
      import_status: success ? 'completed' : 'failed',
      error_details: error ? { 
        url, 
        error, 
        retriedCount,
        timestamp: new Date().toISOString()
      } : null
    });
  } catch (logError) {
    console.error('Failed to log scraping attempt:', logError);
  }
};
