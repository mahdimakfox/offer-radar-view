
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface ScrapingLogsProps {
  logs: string[];
}

const ScrapingLogs: React.FC<ScrapingLogsProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Scraping-logger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full rounded border p-4">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                <span className="text-gray-500 mr-2">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className={
                  log.includes('✓') ? 'text-green-600' :
                  log.includes('✗') ? 'text-red-600' :
                  log.includes('-') ? 'text-yellow-600' :
                  'text-gray-700'
                }>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScrapingLogs;
