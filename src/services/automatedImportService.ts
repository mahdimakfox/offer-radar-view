
import { dataImportService } from './dataImportService';
import { endpointService } from './endpointService';
import { supabase } from '@/integrations/supabase/client';

interface AutomatedImportResult {
  fileImport: {
    success: boolean;
    stats?: any;
    error?: string;
  };
  dataCollection: {
    success: boolean;
    results?: any[];
    error?: string;
  };
  summary: {
    totalProviders: number;
    newProviders: number;
    updatedProviders: number;
    failedProviders: number;
    duplicatesSkipped: number;
  };
}

export const automatedImportService = {
  async runCompleteImportPipeline(): Promise<AutomatedImportResult> {
    console.log('Starting automated import pipeline...');
    
    const result: AutomatedImportResult = {
      fileImport: { success: false },
      dataCollection: { success: false },
      summary: {
        totalProviders: 0,
        newProviders: 0,
        updatedProviders: 0,
        failedProviders: 0,
        duplicatesSkipped: 0
      }
    };

    try {
      // Step 1: Import providers from file
      console.log('Step 1: Importing providers from LEVERANDØRER.txt...');
      
      const fileContent = await dataImportService.loadProvidersFile();
      const fileImportStats = await dataImportService.importProvidersFromFile(fileContent);
      
      result.fileImport = {
        success: true,
        stats: fileImportStats
      };
      
      result.summary.totalProviders += fileImportStats.totalProcessed;
      result.summary.newProviders += fileImportStats.successfulImports;
      result.summary.updatedProviders += fileImportStats.updated || 0;
      result.summary.duplicatesSkipped += fileImportStats.duplicatesSkipped;
      result.summary.failedProviders += fileImportStats.errors.length;

      console.log('File import completed:', fileImportStats);

      // Step 2: Execute data collection from all active endpoints
      console.log('Step 2: Executing data collection from endpoints...');
      
      const categories = ['strom', 'mobil', 'internett', 'forsikring', 'bank', 'boligalarm'];
      const dataCollectionResults = [];

      for (const category of categories) {
        try {
          console.log(`Collecting data for category: ${category}`);
          
          const categoryResult = await endpointService.executeWithFallback(category);
          dataCollectionResults.push({
            category,
            ...categoryResult
          });

          result.summary.totalProviders += categoryResult.providersFetched || 0;
          result.summary.newProviders += categoryResult.providersSaved || 0;
          result.summary.duplicatesSkipped += categoryResult.duplicatesFound || 0;

          if (categoryResult.error) {
            result.summary.failedProviders += 1;
          }

          // Small delay between categories to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Error collecting data for ${category}:`, error);
          dataCollectionResults.push({
            category,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          result.summary.failedProviders += 1;
        }
      }

      result.dataCollection = {
        success: true,
        results: dataCollectionResults
      };

      // Step 3: Log the complete pipeline execution
      await this.logPipelineExecution(result);

      console.log('Automated import pipeline completed:', result.summary);
      return result;

    } catch (error) {
      console.error('Automated import pipeline failed:', error);
      
      if (!result.fileImport.success) {
        result.fileImport = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      if (!result.dataCollection.success) {
        result.dataCollection = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      return result;
    }
  },

  async logPipelineExecution(result: AutomatedImportResult): Promise<void> {
    try {
      const logEntry = {
        category: 'automated_pipeline',
        total_providers: result.summary.totalProviders,
        successful_imports: result.summary.newProviders + result.summary.updatedProviders,
        failed_imports: result.summary.failedProviders,
        import_status: (result.fileImport.success && result.dataCollection.success) ? 'completed' : 'failed',
        error_details: {
          file_import_success: result.fileImport.success,
          data_collection_success: result.dataCollection.success,
          file_import_error: result.fileImport.error,
          data_collection_error: result.dataCollection.error,
          summary: result.summary,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('import_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log pipeline execution:', error);
      } else {
        console.log('Pipeline execution logged successfully');
      }
    } catch (error) {
      console.error('Exception while logging pipeline execution:', error);
    }
  },

  async getImportStatistics(): Promise<any> {
    try {
      // Get overall provider statistics
      const { data: providerStats, error: providerError } = await supabase
        .from('providers')
        .select('category, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (providerError) {
        throw providerError;
      }

      // Get recent import logs
      const { data: importLogs, error: logsError } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) {
        throw logsError;
      }

      // Calculate statistics
      const stats = {
        totalProviders: providerStats?.length || 0,
        providersByCategory: {},
        recentImports: importLogs || [],
        lastImportDate: importLogs?.[0]?.created_at || null
      };

      // Group providers by category
      if (providerStats) {
        stats.providersByCategory = providerStats.reduce((acc: any, provider: any) => {
          acc[provider.category] = (acc[provider.category] || 0) + 1;
          return acc;
        }, {});
      }

      return stats;
    } catch (error) {
      console.error('Error fetching import statistics:', error);
      throw error;
    }
  }
};
