
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { automatedScrapingService } from '@/services/automatedScrapingService';
import { Zap } from 'lucide-react';
import ScrapingControlPanel from './AutomatedScraping/ScrapingControlPanel';
import ScrapingResults from './AutomatedScraping/ScrapingResults';
import ScrapingLogs from './AutomatedScraping/ScrapingLogs';
import ScrapingErrorDetails from './AutomatedScraping/ScrapingErrorDetails';
import ScrapingInfoPanel from './AutomatedScraping/ScrapingInfoPanel';

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
          <ScrapingControlPanel
            isRunning={isRunning}
            currentStep={currentStep}
            progress={progress}
            onStartScraping={runAutomatedScraping}
          />

          <ScrapingResults results={results} />
          <ScrapingLogs logs={logs} />
          <ScrapingErrorDetails errors={results?.errors} />
        </CardContent>
      </Card>

      <Separator />
      <ScrapingInfoPanel />
    </div>
  );
};

export default AutomatedScrapingPanel;
