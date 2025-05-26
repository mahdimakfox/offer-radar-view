
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ApiMapping {
  id: string;
  provider_name: string;
  api_url: string;
  api_type: string;
  auth_required: boolean;
  data_mapping: any;
  created_at: string;
  updated_at: string;
}

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

  useEffect(() => {
    loadApiMappings();
  }, []);

  const loadApiMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_api_mappings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading API mappings:', error);
        toast({
          title: "Error",
          description: "Failed to load API mappings",
          variant: "destructive"
        });
        return;
      }

      setApiMappings(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchApiData = async (mapping: ApiMapping): Promise<FetchResult> => {
    try {
      // Simulate API fetch - in real implementation, this would be an edge function
      // For demo purposes, we'll create mock data
      const mockData = {
        providers: [
          {
            name: `${mapping.provider_name} Premium`,
            price: Math.random() * 500 + 100,
            rating: Math.random() * 2 + 3,
            description: `Latest data from ${mapping.provider_name} API`,
            external_url: mapping.api_url,
            category: 'strom'
          },
          {
            name: `${mapping.provider_name} Standard`,
            price: Math.random() * 300 + 50,
            rating: Math.random() * 2 + 3,
            description: `Standard offering from ${mapping.provider_name}`,
            external_url: mapping.api_url,
            category: 'strom'
          }
        ]
      };

      // Insert the fetched data into providers table
      const { data, error } = await supabase
        .from('providers')
        .upsert(mockData.providers, { 
          onConflict: 'name',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        return {
          provider_name: mapping.provider_name,
          success: false,
          message: `Error importing data: ${error.message}`
        };
      }

      // Log the import
      await supabase.from('import_logs').insert({
        category: 'API Import',
        total_providers: mockData.providers.length,
        successful_imports: data?.length || 0,
        failed_imports: mockData.providers.length - (data?.length || 0),
        import_status: 'completed'
      });

      return {
        provider_name: mapping.provider_name,
        success: true,
        message: `Successfully imported ${data?.length || 0} providers`,
        data_count: data?.length || 0
      };

    } catch (error) {
      console.error(`Error fetching data for ${mapping.provider_name}:`, error);
      return {
        provider_name: mapping.provider_name,
        success: false,
        message: `Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const handleFetchSingle = async (mapping: ApiMapping) => {
    setFetching(mapping.id);
    try {
      const result = await fetchApiData(mapping);
      setResults(prev => [result, ...prev.filter(r => r.provider_name !== mapping.provider_name)]);
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
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
        const result = await fetchApiData(mapping);
        fetchResults.push(result);
      }

      setResults(fetchResults);

      const successCount = fetchResults.filter(r => r.success).length;
      const totalData = fetchResults.reduce((sum, r) => sum + (r.data_count || 0), 0);

      toast({
        title: "Batch fetch completed",
        description: `${successCount}/${fetchResults.length} APIs processed successfully. ${totalData} providers updated.`,
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
            {apiMappings.length} API endpoints configured
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadApiMappings}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleFetchAll}
            disabled={loading || apiMappings.length === 0}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Fetching...' : 'Fetch All'}
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
                      <Badge variant="secondary">Auth Required</Badge>
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
            <p className="text-gray-500">No API mappings configured yet.</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Fetch Results</CardTitle>
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
                    {result.success ? 'Success' : 'Failed'}
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
