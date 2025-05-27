
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FetchResult {
  provider_name: string;
  success: boolean;
  message: string;
  data_count?: number;
  using_fallback?: boolean;
  execution_time?: number;
}

interface ImportSummaryProps {
  results: FetchResult[];
}

const ImportSummary = ({ results }: ImportSummaryProps) => {
  if (results.length === 0) return null;

  return (
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
  );
};

export default ImportSummary;
