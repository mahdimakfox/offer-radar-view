
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const EmptyLogsState = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Ingen importlogger funnet</p>
        <p className="text-sm text-gray-400 mt-2">
          Importaktivitet vil vises her når du starter import av data
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyLogsState;
