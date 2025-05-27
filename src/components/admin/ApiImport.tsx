
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download, CheckCircle, XCircle, ExternalLink, AlertTriangle, Clock, Zap } from 'lucide-react';
import { useDataAcquisition } from '@/hooks/useDataAcquisition';
import { dataAcquisitionService } from '@/services/dataAcquisitionService';
import { ApiMapping } from '@/services/types/dataAcquisitionTypes';

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
        const startTime = Date.now();
        const result = await importData(category, mapping.id);
        const executionTime = Date.now() - startTime;
        
        const fetchResult: FetchResult = {
          provider_name: mapping.provider_name,
          success: result !== null,
          message: result 
            ? `Importerte ${result.success} leverandører${result.failed > 0 ? `, ${result.failed} feilet` : ''}${result.usingFallback ? ' (fallback)' : ''}`
            : 'Import feilet',
          data_count: result?.success || 0,
          using_fallback: result?.usingFallback || false,
          execution_time: executionTime
        };
        
        fetchResults.push(fetchResult);
      }

      setResults(fetchResults);

      const successCount = fetchResults.filter(r => r.success).length;
      const fallbackCount = fetchResults.filter(r => r.using_fallback).length;
      const totalData = fetchResults.reduce((sum, r) => sum + (r.data_count || 0), 0);
      const avgTime = fetchResults.reduce((sum, r) => sum + (r.execution_time || 0), 0) / fetchResults.length;

      let message = `${successCount}/${fetchResults.length} endepunkter fullført. ${totalData} leverandører oppdatert.`;
      if (fallbackCount > 0) {
        message += ` ${fallbackCount} brukte fallback-system.`;
      }
      message += ` Gjennomsnittlig tid: ${Math.round(avgTime)}ms.`;

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

  const getEndpointTypeBadge = (mapping: ApiMapping) => {
    if (mapping.api_type === 'SCRAPING') {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Scraping</Badge>;
    }
    return <Badge variant="outline">{mapping.api_type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Enhanced Data Import System</h3>
          <p className="text-sm text-gray-600">
            {apiMappings.length} endepunkter med automatisk fallback og feilhåndtering
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
          <Card key={mapping.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mapping.provider_name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-2">
                    {getEndpointTypeBadge(mapping)}
                    {mapping.auth_required && (
                      <Badge variant="secondary">Auth påkrevd</Badge>
                    )}
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      <Zap className="h-3 w-3 mr-1" />
                      Enhanced
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
                  <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                    {(() => {
                      const result = results.find(r => r.provider_name === mapping.provider_name)!;
                      return (
                        <div className="space-y-2">
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
                            <span className="text-sm font-medium">{result.message}</span>
                          </div>
                          {result.execution_time && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>Utførelsestid: {result.execution_time}ms</span>
                            </div>
                          )}
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
        <div className="text-center py-8">
          <p className="text-gray-500">Ingen endepunkter konfigurert</p>
          <p className="text-sm text-gray-400 mt-2">
            Gå til "Endpoint Management" for å legge til API-er eller scraping-endepunkter
          </p>
        </div>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import sammendrag</CardTitle>
            <CardDescription>
              Siste import-resultater med ytelse og feilhåndtering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.success).length}
                </div>
                <div className="text-sm text-green-700">Vellykkede importer</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.using_fallback).length}
                </div>
                <div className="text-sm text-yellow-700">Brukte fallback</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.reduce((sum, r) => sum + (r.data_count || 0), 0)}
                </div>
                <div className="text-sm text-blue-700">Totale leverandører</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiImport;
