
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, FileJson, Play, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { dataExtractionService } from '@/services/dataExtractionService';

const DataExtractionPanel = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractionData, setExtractionData] = useState<any>(null);
  const { toast } = useToast();

  const runDataExtraction = async () => {
    setIsExtracting(true);
    setProgress(0);
    setExtractionData(null);
    setCurrentStep('Starter datauttrekk...');

    try {
      setProgress(10);
      setCurrentStep('Leser leverandører fra LEVERANDØRER.txt...');
      
      toast({
        title: "Starter automatisk datauttrekk",
        description: "Henter og analyserer data fra alle leverandør-websider..."
      });

      setProgress(20);
      setCurrentStep('Henter og analyserer leverandørdata...');

      const result = await dataExtractionService.extractAllProviderData();
      
      setProgress(100);
      setCurrentStep('Datauttrekk fullført!');
      setExtractionData(result);

      toast({
        title: "Datauttrekk fullført",
        description: `${result.statistikk.vellykkede} leverandører prosessert, ${result.statistikk.feilede} feil`
      });

    } catch (error) {
      console.error('Data extraction failed:', error);
      setCurrentStep('Datauttrekk feilet');
      
      toast({
        title: "Datauttrekk feilet",
        description: error instanceof Error ? error.message : 'En ukjent feil oppstod',
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadJsonFile = () => {
    if (extractionData) {
      dataExtractionService.downloadJsonFile(extractionData);
      toast({
        title: "JSON-fil lastet ned",
        description: "leverandorer_data.json er lastet ned til din enhet"
      });
    }
  };

  const resetExtraction = () => {
    setExtractionData(null);
    setProgress(0);
    setCurrentStep('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Automatisk Datauttrekk og JSON-generering
        </CardTitle>
        <CardDescription>
          Hent og strukturer leverandørdata fra LEVERANDØRER.txt til komplett JSON-fil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {!isExtracting && !extractionData && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Hva denne funksjonen gjør:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Leser alle leverandører fra LEVERANDØRER.txt</li>
                <li>• Henter HTML fra hver leverandør-side via AllOrigins API</li>
                <li>• Ekstraherer navn, beskrivelse, kontaktinfo, produkter og bilder</li>
                <li>• Genererer strukturert JSON-fil for videre bruk</li>
                <li>• Håndterer feil elegant med detaljert feillogg</li>
              </ul>
            </div>
            
            <Button 
              onClick={runDataExtraction}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Automatisk Datauttrekk
            </Button>
          </div>
        )}

        {isExtracting && (
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
              Prosesserer leverandørdata...
            </div>
          </div>
        )}

        {extractionData && (
          <div className="space-y-6">
            
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {extractionData.statistikk.total_behandlet}
                </div>
                <div className="text-sm text-blue-700">Totalt behandlet</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {extractionData.statistikk.vellykkede}
                </div>
                <div className="text-sm text-green-700">Vellykkede</div>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {extractionData.statistikk.feilede}
                </div>
                <div className="text-sm text-red-700">Feilede</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {extractionData.leverandorer.length}
                </div>
                <div className="text-sm text-purple-700">JSON-objekter</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={downloadJsonFile}
                className="flex-1"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned leverandorer_data.json
              </Button>
              
              <Button 
                onClick={resetExtraction}
                variant="outline"
                size="lg"
              >
                Kjør på nytt
              </Button>
            </div>

            {/* Preview Section */}
            <div className="space-y-3">
              <h4 className="font-medium">Forhåndsvisning av uttrukne data:</h4>
              
              {extractionData.leverandorer.slice(0, 3).map((provider: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{provider.navn}</span>
                    <span className="text-sm text-gray-500">({provider.kategori})</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">{provider.beskrivelse?.substring(0, 100)}...</p>
                    <div className="flex gap-4 text-xs">
                      <span>Produkter: {provider.produkter?.length || 0}</span>
                      <span>Bilder: {provider.bilder?.length || 0}</span>
                      {provider.kontakt?.telefon && <span>Telefon: ✓</span>}
                      {provider.kontakt?.epost && <span>E-post: ✓</span>}
                    </div>
                  </div>
                </div>
              ))}
              
              {extractionData.leverandorer.length > 3 && (
                <div className="text-sm text-gray-500 text-center">
                  ... og {extractionData.leverandorer.length - 3} flere leverandører
                </div>
              )}
            </div>

            {/* Error Log */}
            {extractionData.feillogg.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">Feillogg ({extractionData.feillogg.length}):</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {extractionData.feillogg.map((error: any, index: number) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-800">{error.navn}</span>
                      </div>
                      <div className="text-sm text-red-700">
                        <p>Feil: {error.feil}</p>
                        <p>URL: {error.url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JSON Structure Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON-struktur:
              </h4>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "leverandorer": [
    {
      "kategori": "strom",
      "navn": "Hafslund",
      "url": "https://www.hafslundstrom.no/",
      "beskrivelse": "...",
      "kontakt": {
        "telefon": "...",
        "epost": "...",
        "adresse": "..."
      },
      "produkter": [...],
      "bilder": [...],
      "org_nummer": "..."
    }
  ],
  "feillogg": [...],
  "statistikk": {...}
}`}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataExtractionPanel;
