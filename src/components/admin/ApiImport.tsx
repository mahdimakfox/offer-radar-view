
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { useDataAcquisition } from '@/hooks/useDataAcquisition';
import { dataAcquisitionService, ApiMapping } from '@/services/dataAcquisitionService';

interface FetchResult {
  provider_name: string;
  success: boolean;
  message: string;
  data_count?: number;
  using_fallback?: boolean;
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
      // Try different categories for each mapping type
      const categoryMap: Record<string, string> = {
        'strom-api': 'strom',
        'forsikring-api': 'forsikring', 
        'bank-api': 'bank',
        'mobil-api': 'mobil',
        'internett-api': 'internett',
        'boligalarm-api': 'boligalarm'
      };
      
      const category = categoryMap[mapping.id] || 'strom';
      const result = await importData(category, mapping.id);
      
      const fetchResult: FetchResult = {
        provider_name: mapping.provider_name,
        success: result !== null,
        message: result 
          ? `Importerte ${result.success} leverandører${result.failed > 0 ? `, ${result.failed} feilet` : ''}${result.usingFallback ? ' (fallback data)' : ''}`
          : 'Import feilet',
        data_count: result?.success || 0,
        using_fallback: result?.usingFallback || false
      };
      
      setResults(prev => [fetchResult, ...prev.filter(r => r.provider_name !== mapping.provider_name)]);
    } finally {
      setFetching(null);
    }
  };

  const handleFetchAll = async () => {
    setLoading(true);
    setResults([]);

    try {
      const fetchResults: FetchResult[] = [];
      const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];
      
      for (let i = 0; i < apiMappings.length && i < categories.length; i++) {
        const mapping = apiMappings[i];
        const category = categories[i];
        
        setFetching(mapping.id);
        const result = await importData(category, mapping.id);
        
        const fetchResult: FetchResult = {
          provider_name: mapping.provider_name,
          success: result !== null,
          message: result 
            ? `Importerte ${result.success} leverandører${result.failed > 0 ? `, ${result.failed} feilet` : ''}${result.usingFallback ? ' (fallback)' : ''}`
            : 'Import feilet',
          data_count: result?.success || 0,
          using_fallback: result?.usingFallback || false
        };
        
        fetchResults.push(fetchResult);
      }

      setResults(fetchResults);

      const successCount = fetchResults.filter(r => r.success).length;
      const fallbackCount = fetchResults.filter(r => r.using_fallback).length;
      const totalData = fetchResults.reduce((sum, r) => sum + (r.data_count || 0), 0);

      let message = `${successCount}/${fetchResults.length} API-er behandlet. ${totalData} leverandører oppdatert.`;
      if (fallbackCount > 0) {
        message += ` ${fallbackCount} brukte fallback-data.`;
      }

      toast({
        title: "Batch import fullført",
        description: message,
        variant: successCount === fetchResults.length && fallbackCount === 0 ? "default" : "destructive"
      });

    } finally {
      setLoading(false);
      setFetching(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Real API Integration</h3>
          <p className="text-sm text-gray-600">
            {apiMappings.length} ekte API-endepunkter konfigurert (med fallback)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadApiMappings}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Oppdater
          </Button>
          <Button
            onClick={handleFetchAll}
            disabled={loading || apiMappings.length === 0}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Henter...' : 'Hent alle'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiMappings.map((mapping) => (
          <Card key={mapping.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mapping.provider_name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Badge variant="outline">{mapping.api_type}</Badge>
                    {mapping.auth_required && (
                      <Badge variant="secondary">Autentisering påkrevd</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Real API + Fallback
                    </Badge>
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleFetchSingle(mapping)}
                  disabled={fetching === mapping.id}
                  size="sm"
                  variant="outline"
                >
                  {fetching === mapping.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate text-gray-600">{mapping.api_url}</span>
                </div>
                
                {results.find(r => r.provider_name === mapping.provider_name) && (
                  <div className="mt-3 p-2 border rounded">
                    {(() => {
                      const result = results.find(r => r.provider_name === mapping.provider_name)!;
                      return (
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            result.using_fallback ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{result.message}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {// ... keep existing code (empty state and results display sections)}
    </div>
  );
};

export default ApiImport;
