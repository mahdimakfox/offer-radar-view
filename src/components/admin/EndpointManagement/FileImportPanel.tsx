
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Upload, CheckCircle, AlertCircle, Database, Globe } from 'lucide-react';
import { dataImportService, ImportStats } from '@/services/dataImportService';

interface FileImportPanelProps {
  onImportComplete: () => void;
}

const FileImportPanel = ({ onImportComplete }: FileImportPanelProps) => {
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { toast } = useToast();

  const handleFileImport = async () => {
    setImporting(true);
    setImportStats(null);

    try {
      console.log('Loading LEVERANDØRER.txt file...');
      const fileContent = await dataImportService.loadProvidersFile();
      
      console.log('Starting import process...');
      const stats = await dataImportService.importProvidersFromFile(fileContent);
      
      setImportStats(stats);
      
      if (stats.errors.length === 0) {
        toast({
          title: "Import vellykket",
          description: `${stats.successfulImports} leverandører og endepunkter opprettet, ${stats.duplicatesSkipped} duplikater hoppet over`,
        });
      } else {
        toast({
          title: "Import fullført med feil",
          description: `${stats.successfulImports} vellykket, ${stats.errors.length} feil`,
          variant: "destructive"
        });
      }
      
      onImportComplete();
      
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import feilet",
        description: error instanceof Error ? error.message : 'Ukjent feil',
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileUp className="h-5 w-5" />
            <span>Import fra LEVERANDØRER.txt</span>
          </CardTitle>
          <CardDescription>
            Automatisk import og oppsett av leverandører med scraping-endepunkter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>Dette vil importere alle leverandører fra LEVERANDØRER.txt og automatisk:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span>Opprette leverandøroppføringer i databasen</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span>Konfigurere scraping-endepunkter for hver leverandør</span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Eksisterende leverandører og endepunkter vil bli hoppet over for å unngå duplikater.
            </p>
          </div>
          
          <Button 
            onClick={handleFileImport}
            disabled={importing}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importerer leverandører og endepunkter...' : 'Start komplett import'}
          </Button>
        </CardContent>
      </Card>

      {importStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {importStats.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span>Import-resultater</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importStats.totalProcessed}</div>
                <div className="text-sm text-blue-700">Totalt behandlet</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importStats.successfulImports}</div>
                <div className="text-sm text-green-700">Opprettet</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{importStats.duplicatesSkipped}</div>
                <div className="text-sm text-yellow-700">Duplikater hoppet over</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importStats.errors.length}</div>
                <div className="text-sm text-red-700">Feil</div>
              </div>
            </div>
            
            {importStats.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-700 mb-2">Feil som oppstod:</h4>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    {importStats.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileImportPanel;
