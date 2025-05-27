
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, CheckCircle, XCircle, ExternalLink, AlertTriangle, Clock, Zap } from 'lucide-react';
import { ApiMapping } from '@/services/types/dataAcquisitionTypes';

interface FetchResult {
  provider_name: string;
  success: boolean;
  message: string;
  data_count?: number;
  using_fallback?: boolean;
  execution_time?: number;
}

interface EndpointCardProps {
  mapping: ApiMapping;
  result?: FetchResult;
  isLoading: boolean;
  onFetch: (mapping: ApiMapping) => void;
}

const EndpointCard = ({ mapping, result, isLoading, onFetch }: EndpointCardProps) => {
  const getEndpointTypeBadge = (mapping: ApiMapping) => {
    if (mapping.api_type === 'SCRAPING') {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Scraping</Badge>;
    }
    return <Badge variant="outline">{mapping.api_type}</Badge>;
  };

  return (
    <Card className="relative">
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
            onClick={() => onFetch(mapping)}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
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
          
          {result && (
            <div className="mt-3 p-3 border rounded-lg bg-gray-50">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EndpointCard;
