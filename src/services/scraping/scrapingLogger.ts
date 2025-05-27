
import { supabase } from '@/integrations/supabase/client';

interface ScrapingResult {
  success: boolean;
  providersProcessed: number;
  providersInserted: number;
  providersUpdated: number;
  duplicatesSkipped: number;
  errors: string[];
  logs: string[];
}

export const scrapingLogger = {
  // Log import results
  async logImportResults(result: ScrapingResult): Promise<void> {
    try {
      const logEntry = {
        category: 'automated_scraping',
        total_providers: result.providersProcessed,
        successful_imports: result.providersInserted + result.providersUpdated,
        failed_imports: result.errors.length,
        import_status: result.success ? 'completed' : 'failed',
        error_details: {
          errors: result.errors,
          logs: result.logs,
          duplicates_skipped: result.duplicatesSkipped,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('import_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log import results:', error);
      } else {
        console.log('Import results logged successfully');
      }
    } catch (error) {
      console.error('Exception while logging import results:', error);
    }
  }
};
