
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { XCircle } from 'lucide-react';

interface ScrapingErrorDetailsProps {
  errors: string[];
}

const ScrapingErrorDetails: React.FC<ScrapingErrorDetailsProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
          <XCircle className="w-4 h-4" />
          Feildetaljer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 w-full">
          <div className="space-y-2">
            {errors.map((error: string, index: number) => (
              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScrapingErrorDetails;
