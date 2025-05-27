
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe, Zap, Database, CheckCircle } from 'lucide-react';

const ScrapingInfoPanel: React.FC = () => {
  return (
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
  );
};

export default ScrapingInfoPanel;
