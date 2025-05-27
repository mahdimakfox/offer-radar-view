
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ScrapingResultsProps {
  results: any;
}

const ScrapingResults: React.FC<ScrapingResultsProps> = ({ results }) => {
  if (!results) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="w-4 h-4" />
          Scraping-resultater
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{results.providersProcessed}</div>
            <div className="text-sm text-gray-600">Prosessert</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{results.providersInserted}</div>
            <div className="text-sm text-gray-600">Nye</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{results.providersUpdated}</div>
            <div className="text-sm text-gray-600">Oppdatert</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{results.errors.length}</div>
            <div className="text-sm text-gray-600">Feil</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <Badge variant={results.success ? "default" : "destructive"} className="flex items-center gap-1">
            {results.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {results.success ? 'Suksess' : 'Feil'}
          </Badge>
          {results.duplicatesSkipped > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {results.duplicatesSkipped} duplikater hoppet over
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingResults;
