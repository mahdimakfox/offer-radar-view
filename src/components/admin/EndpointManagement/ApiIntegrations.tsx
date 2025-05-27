
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';

const ApiIntegrations = () => {
  const integrations = [
    {
      name: 'Real API Service',
      description: 'Hovedservice for API-kall til leverandører',
      status: 'active',
      type: 'internal',
      endpoints: 6,
      lastUsed: '2024-01-27'
    },
    {
      name: 'Scraping Service',
      description: 'Web scraping for leverandørdata',
      status: 'active',
      type: 'internal',
      endpoints: 4,
      lastUsed: '2024-01-27'
    },
    {
      name: 'Fallback Data Generator',
      description: 'Genererer fallback-data ved API-feil',
      status: 'active',
      type: 'internal',
      endpoints: 'N/A',
      lastUsed: '2024-01-26'
    },
    {
      name: 'Norwegian Company Registry',
      description: 'Brreg.no API for organisasjonsinformasjon',
      status: 'configured',
      type: 'external',
      endpoints: 1,
      lastUsed: 'Never'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktiv</Badge>;
      case 'configured':
        return <Badge variant="secondary">Konfigurert</Badge>;
      case 'error':
        return <Badge variant="destructive">Feil</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'internal' ? 'default' : 'outline'}>
        {type === 'internal' ? 'Intern' : 'Ekstern'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">API-integrasjoner</h3>
        <p className="text-gray-600">Oversikt over tjenester og API-er som systemet bruker</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktive integrasjoner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totale endepunkter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + (typeof i.endpoints === 'number' ? i.endpoints : 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {integrations.map((integration, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge(integration.status)}
                  {getTypeBadge(integration.type)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Endepunkter:</span> {integration.endpoints}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Sist brukt:</span> {integration.lastUsed}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {integration.type === 'external' && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Åpne API
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Konfigurer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legg til ny integrasjon</CardTitle>
          <CardDescription>
            Konfigurer nye API-er eller tjenester for datainnsamling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Bruk "Legg til nytt endepunkt" fanen for å legge til nye API- eller scraping-endepunkter.
          </p>
          <Button variant="outline">
            Gå til endpoint-oppsett
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrations;
