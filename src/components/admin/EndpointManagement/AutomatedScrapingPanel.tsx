
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { automatedScrapingService } from '@/services/automatedScrapingService';
import { Globe, Database, FileText, Zap, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface AutomatedScrapingPanelProps {
  onImportComplete?: () => void;
}

const AutomatedScrapingPanel: React.FC<AutomatedScrapingPanelProps> = ({ onImportComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runAutomatedScraping = async () => {
    setIsRunning(true);
    setProgress(0);
    setLogs([]);
    setResults(null);
    setCurrentStep('Initialiserer...');

    try {
      toast({
        title: "Starter automatisert scraping",
        description: "Leser leverandører fra fil og starter scraping med AllOrigins API..."
      });

      setCurrentStep('Leser leverandører fra LEVERANDØRER.txt...');
      setProgress(10);

      const result = await automatedScrapingService.runAutomatedScraping();
      
      setProgress(100);
      setCurrentStep('Ferdig!');
      setLogs(result.logs);
      setResults(result);

      if (result.success) {
        toast({
          title: "Automatisert scraping fullført",
          description: `Prosesserte ${result.providersProcessed} leverandører. ${result.providersInserted} nye, ${result.providersUpdated} oppdatert.`
        });
      } else {
        toast({
          title: "Scraping fullført med feil",
          description: `${result.errors.length} feil oppstod under prosessen.`,
          variant: "destructive"
        });
      }

      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Automated scraping failed:', error);
      setCurrentStep('Feil oppstod');
      setLogs(prev => [...prev, `Kritisk feil: ${error instanceof Error ? error.message : 'Ukjent feil'}`]);
      
      toast({
        title: "Scraping feilet",
        description: error instanceof Error ? error.message : 'En ukjent feil oppstod',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automatisert Scraping med AllOrigins API
          </CardTitle>
          <CardDescription>
            Komplett automatisert prosess som leser leverandører fra LEVERANDØRER.txt, 
            henter HTML via AllOrigins API, ekstraherer relevant data, og lagrer i databasen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Panel */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={runAutomatedScraping} 
              disabled={isRunning}
              size="lg"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isRunning ? 'Kjører scraping...' : 'Start automatisert scraping'}
            </Button>
            
            {isRunning && (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{currentStep}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>

          {/* Results Summary */}
          {results && (
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
          )}

          {/* Live Logs */}
          {logs.length > 0 && (
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
          )}

          {/* Error Details */}
          {results && results.errors.length > 0 && (
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
                    {results.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prosess-informasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <strong>Steg 1:</strong> Leser leverandører fra LEVERANDØRER.txt fil
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 mt-0.5 text-green-500" />
              <div>
                <strong>Steg 2:</strong> Henter HTML via AllOrigins API for å unngå CORS-problemer
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 text-purple-500" />
              <div>
                <strong>Steg 3:</strong> Ekstraherer data som beskrivelse, kontaktinfo, priser og logo
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 mt-0.5 text-orange-500" />
              <div>
                <strong>Steg 4:</strong> Lagrer/oppdaterer data i database med duplikatdeteksjon
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-teal-500" />
              <div>
                <strong>Steg 5:</strong> Logger resultater og feil for senere analyse
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>AllOrigins API:</strong> Brukes for å hente HTML fra leverandørenes nettsider 
              uten CORS-problemer. Dette gjør at vi kan analysere innholdet og ekstraktere relevant informasjon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedScrapingPanel;
