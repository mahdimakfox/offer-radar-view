
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useDataAcquisition } from '@/hooks/useDataAcquisition';
import { dataAcquisitionService, ApiMapping } from '@/services/dataAcquisitionService';

interface FetchResult {
  provider_name: string;
  success: boolean;
  message: string;
  data_count?: number;
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
      const result = await importData('strom', mapping.id);
      
      const fetchResult: FetchResult = {
        provider_name: mapping.provider_name,
        success: result !== null,
        message: result 
          ? `Importerte ${result.success} leverandører, ${result.failed} feilet`
          : 'Import feilet',
        data_count: result?.success || 0
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
      
      for (const mapping of apiMappings) {
        setFetching(mapping.id);
        const result = await importData('strom', mapping.id);
        
        const fetchResult: FetchResult = {
          provider_name: mapping.provider_name,
          success: result !== null,
          message: result 
            ? `Importerte ${result.success} leverandører, ${result.failed} feilet`
            : 'Import feilet',
          data_count: result?.success || 0
        };
        
        fetchResults.push(fetchResult);
      }

      setResults(fetchResults);

      const successCount = fetchResults.filter(r => r.success).length;
      const totalData = fetchResults.reduce((sum, r) => sum + (r.data_count || 0), 0);

      toast({
        title: "Batch import fullført",
        description: `${successCount}/${fetchResults.length} API-er behandlet. ${totalData} leverandører oppdatert.`,
        variant: successCount === fetchResults.length ? "default" : "destructive"
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
          <h3 className="text-lg font-semibold">API Mappings</h3>
          <p className="text-sm text-gray-600">
            {apiMappings.length} API-endepunkter konfigurert
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
                            <CheckCircle className="h-4 w-4 text-green-500" />
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

      {apiMappings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Ingen API-mappings konfigurert ennå.</p>
            <p className="text-sm text-gray-400 mt-2">
              API-mappings ble automatisk opprettet under migreringen
            </p>
            <Button onClick={loadApiMappings} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Last på nytt
            </Button>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Siste hente-resultater</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="flex-1 text-sm">
                    <strong>{result.provider_name}:</strong> {result.message}
                  </span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'Suksess' : 'Feilet'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiImport;
