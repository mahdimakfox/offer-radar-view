
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Play, Clock, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { endpointService } from '@/services/endpointService';

interface ProviderEndpoint {
  id: string;
  category: string;
  name: string;
  endpoint_type: 'api' | 'scraping';
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: any;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

interface ExecutionResult {
  success: boolean;
  providers: any[];
  error?: string;
  executionTimeMs: number;
  providersFetched: number;
  providersSaved: number;
  duplicatesFound: number;
  usedFallback?: boolean;
  retriedCount?: number;
}

interface EndpointExecutionPanelProps {
  endpoint: ProviderEndpoint;
  onExecutionComplete: () => void;
}

const EndpointExecutionPanel: React.FC<EndpointExecutionPanelProps> = ({ 
  endpoint, 
  onExecutionComplete 
}) => {
  const [executing, setExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const { toast } = useToast();

  const executeEndpoint = async (executionType: 'manual' | 'fallback' = 'manual') => {
    setExecuting(true);
    try {
      console.log(`Executing endpoint: ${endpoint.name} (${executionType})`);
      
      const result = await endpointService.executeEndpoint(endpoint.id, executionType);
      setLastResult(result);
      
      if (result.success) {
        toast({
          title: "Endpoint executed successfully",
          description: `${result.providersFetched} providers fetched, ${result.providersSaved} saved${result.duplicatesFound ? `, ${result.duplicatesFound} duplicates found` : ''}`,
        });
      } else {
        toast({
          title: "Execution failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
      
      onExecutionComplete();
    } catch (error) {
      console.error('Execution error:', error);
      toast({
        title: "Execution error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setExecuting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('no-NO');
  };

  const getStatusIcon = () => {
    if (endpoint.last_success_at && endpoint.last_failure_at) {
      const lastSuccess = new Date(endpoint.last_success_at);
      const lastFailure = new Date(endpoint.last_failure_at);
      return lastSuccess > lastFailure ? CheckCircle : XCircle;
    }
    if (endpoint.last_success_at) return CheckCircle;
    if (endpoint.last_failure_at) return XCircle;
    return Clock;
  };

  const getStatusColor = () => {
    if (endpoint.success_rate >= 80) return 'text-green-600';
    if (endpoint.success_rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
            <div>
              <CardTitle className="text-lg">{endpoint.name}</CardTitle>
              <CardDescription>
                {endpoint.endpoint_type.toUpperCase()} • {endpoint.category} • Priority {endpoint.priority}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={endpoint.is_active ? "default" : "secondary"}>
              {endpoint.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {endpoint.success_rate}% success
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Requests</p>
            <p className="font-semibold">{endpoint.total_requests}</p>
          </div>
          <div>
            <p className="text-gray-600">Failures</p>
            <p className="font-semibold text-red-600">{endpoint.failure_count}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Success</p>
            <p className="font-semibold text-green-600">{formatDate(endpoint.last_success_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Failure</p>
            <p className="font-semibold text-red-600">{formatDate(endpoint.last_failure_at)}</p>
          </div>
        </div>

        {lastResult && (
          <>
            <Separator />
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                {lastResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                Last Execution Result
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold">{lastResult.executionTimeMs}ms</p>
                </div>
                <div>
                  <p className="text-gray-600">Fetched</p>
                  <p className="font-semibold">{lastResult.providersFetched}</p>
                </div>
                <div>
                  <p className="text-gray-600">Saved</p>
                  <p className="font-semibold">{lastResult.providersSaved}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duplicates</p>
                  <p className="font-semibold">{lastResult.duplicatesFound}</p>
                </div>
              </div>
              {lastResult.usedFallback && (
                <Badge variant="outline" className="mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Used Fallback
                </Badge>
              )}
              {lastResult.error && (
                <p className="text-red-600 text-sm mt-2">{lastResult.error}</p>
              )}
            </div>
          </>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={() => executeEndpoint('manual')}
            disabled={executing || !endpoint.is_active}
            variant="default"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {executing ? 'Executing...' : 'Execute'}
          </Button>
          <Button
            onClick={() => executeEndpoint('fallback')}
            disabled={executing || !endpoint.is_active}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Fallback Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EndpointExecutionPanel;
