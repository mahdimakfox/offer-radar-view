
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { automatedImportService } from '@/services/automatedImportService';

interface AutomatedImportPanelProps {
  onImportComplete: () => void;
}

const AutomatedImportPanel = ({ onImportComplete }: AutomatedImportPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runAutomatedImport = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);
    
    try {
      setCurrentStep('Starter automatisert import...');
      setProgress(10);
      
      const result = await automatedImportService.runCompleteImportPipeline();
      
      setProgress(100);
      setCurrentStep('Import fullført!');
      setResults(result);
      
      const totalSuccess = result.summary.newProviders + result.summary.updatedProviders;
      const hasErrors = result.summary.failedProviders > 0;
      
      toast({
        title: hasErrors ? "Import fullført med advarsler" : "Import fullført",
        description: `${totalSuccess} leverandører behandlet, ${result.summary.failedProviders} feil`,
        variant: hasErrors ? "destructive" : "default"
      });
      
      onImportComplete();
      
    } catch (error) {
      console.error('Automated import failed:', error);
      setCurrentStep('Import feilet');
      toast({
        title: "Import feilet",
        description: error instanceof Error ? error.message : 'Ukjent feil',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetResults = () => {
    setResults(null);
    setProgress(0);
    setCurrentStep('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Automatisert Import Pipeline
        </CardTitle>
        <CardDescription>
          Kjør komplett import fra LEVERANDØRER.txt og alle aktive endepunkter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && !results && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Denne funksjonen vil:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Importere leverandører fra LEVERANDØRER.txt</li>
              <li>Opprette endepunkter for scraping</li>
              <li>Kjøre datainnsamling fra alle aktive endepunkter</li>
              <li>Logge alle resultater og statistikk</li>
            </ul>
            
            <Button 
              onClick={runAutomatedImport}
              disabled={isRunning}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Automatisert Import
            </Button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 animate-spin" />
              Import pågår...
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Import Resultater</h4>
              <Button variant="outline" size="sm" onClick={resetResults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Tilbakestill
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.summary.totalProviders}
                </div>
                <div className="text-sm text-blue-700">Totalt behandlet</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.summary.newProviders}
                </div>
                <div className="text-sm text-green-700">Nye leverandører</div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.summary.updatedProviders}
                </div>
                <div className="text-sm text-yellow-700">Oppdaterte</div>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {results.summary.failedProviders}
                </div>
                <div className="text-sm text-red-700">Feilet</div>
              </div>
            </div>

            {/* Step Results */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {results.fileImport.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">Fil Import</span>
                {results.fileImport.success ? (
                  <span className="text-sm text-green-600">Fullført</span>
                ) : (
                  <span className="text-sm text-red-600">Feilet</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {results.dataCollection.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">Data Innsamling</span>
                {results.dataCollection.success ? (
                  <span className="text-sm text-green-600">Fullført</span>
                ) : (
                  <span className="text-sm text-red-600">Feilet</span>
                )}
              </div>
            </div>

            {/* Error Details */}
            {(results.fileImport.error || results.dataCollection.error) && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h5 className="font-medium text-red-800 mb-2">Feil detaljer:</h5>
                {results.fileImport.error && (
                  <p className="text-sm text-red-700">Fil import: {results.fileImport.error}</p>
                )}
                {results.dataCollection.error && (
                  <p className="text-sm text-red-700">Data innsamling: {results.dataCollection.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomatedImportPanel;
