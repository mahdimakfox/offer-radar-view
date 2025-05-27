
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EndpointForm from './EndpointForm';

interface AddNewEndpointProps {
  onEndpointAdded: () => void;
}

const AddNewEndpoint = ({ onEndpointAdded }: AddNewEndpointProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Legg til nytt endepunkt</h3>
        <p className="text-gray-600">Konfigurer et nytt API- eller scraping-endepunkt for datainnsamling</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Endpoint-konfigurasjon</CardTitle>
          <CardDescription>
            Fyll ut informasjonen nedenfor for å legge til et nytt endepunkt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EndpointForm 
            onSave={onEndpointAdded}
            onCancel={() => {}} // Parent will handle navigation
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Veiledning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">API-endepunkter</h4>
            <p className="text-sm text-gray-600">
              For REST API-er, spesifiser URL-en og eventuelle autentiseringsdetaljer.
              Systemet vil automatisk mappe JSON-responser til provider-data.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Scraping-endepunkter</h4>
            <p className="text-sm text-gray-600">
              For web scraping, spesifiser CSS-selektorer for datahenting.
              Eksempel: {`{"selectors": {"name": ".provider-name", "price": ".price-value"}}`}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Prioritet</h4>
            <p className="text-sm text-gray-600">
              Lavere tall = høyere prioritet. Endepunkter med høyere prioritet prøves først ved fallback.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewEndpoint;
