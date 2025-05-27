
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDataAcquisition } from '@/hooks/useDataAcquisition';
import { dataAcquisitionService } from '@/services/dataAcquisitionService';
import { ApiMapping } from '@/services/types/dataAcquisitionTypes';
import ImportHeader from './ApiImport/ImportHeader';
import EndpointCard from './ApiImport/EndpointCard';
import ImportSummary from './ApiImport/ImportSummary';
import CategoryExecutionPanel from './ApiImport/CategoryExecutionPanel';
import { Separator } from '@/components/ui/separator';

interface FetchResult {
  provider_name: string;
  success: boolean;
  message: string;
  data_count?: number;
  using_fallback?: boolean;
  retried_count?: number;
  execution_time?: number;
}

const ApiImport = () => {
  const [apiMappings, setApiMappings] = useState<ApiMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState<string | null>(null);
  const [results, setResults] = useState<FetchResult[]>([]);
  const { toast } = useToast();
  const { importData } = useDataAcquisition();

  useEffect(() => {
    loadApiMappings();
  }, []);

  const loadApiMappings = async () => {
    try {
      const mappings = await dataAcquisitionService.getApiMappings();
      setApiMappings(mappings);
    } catch (error) {
      console.error('Error loading API mappings:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste API-mappings",
        variant: "destructive"
      });
    }
  };

  const handleFetchSingle = async (mapping: ApiMapping) => {
    setFetching(mapping.id);
    try {
      const categoryMap: Record<string, string> = {
        'strom-api': 'strom',
        'forsikring-api': 'forsikring', 
        'bank-api': 'bank',
        'mobil-api': 'mobil',
        'internett-api': 'internett',
        'boligalarm-api': 'boligalarm'
      };
      
      const category = categoryMap[mapping.id] || 'strom';
      const startTime = Date.now();
      const result = await importData(category, mapping.id);
      const executionTime = Date.now() - startTime;
      
      const fetchResult: FetchResult = {
        provider_name: mapping.provider_name,
        success: result !== null,
        message: result 
          ? `Importerte ${result.success} leverandører${result.failed > 0 ? `, ${result.failed} feilet` : ''}${result.usingFallback ? ' (brukte fallback)' : ''}`
          : 'Import feilet',
        data_count: result?.success || 0,
        using_fallback: result?.usingFallback || false,
        execution_time: executionTime
      };
      
      setResults(prev => [fetchResult, ...prev.filter(r => r.provider_name !== mapping.provider_name)]);
    } finally {
      setFetching(null);
    }
  };

  const handleExecutionComplete = () => {
    loadApiMappings();
  };

  return (
    <div className="space-y-6">
      <ImportHeader 
        endpointCount={apiMappings.length}
        loading={loading}
        onRefresh={loadApiMappings}
        onFetchAll={() => {}} // Replaced with CategoryExecutionPanel
      />

      {/* New Category Execution Panel */}
      <CategoryExecutionPanel onExecutionComplete={handleExecutionComplete} />

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Legacy API Mappings</h3>
        <p className="text-sm text-gray-600 mb-4">
          Disse endepunktene er migrert til det nye endpoint-systemet. Bruk "Category Execution" over for å utføre importer.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiMappings.map((mapping) => (
            <EndpointCard
              key={mapping.id}
              mapping={mapping}
              result={results.find(r => r.provider_name === mapping.provider_name)}
              isLoading={fetching === mapping.id}
              onFetch={handleFetchSingle}
            />
          ))}
        </div>
      </div>

      {apiMappings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Ingen endepunkter konfigurert</p>
          <p className="text-sm text-gray-400 mt-2">
            Gå til "Endpoint Management" for å legge til API-er eller scraping-endepunkter
          </p>
        </div>
      )}

      <ImportSummary results={results} />
    </div>
  );
};

export default ApiImport;
