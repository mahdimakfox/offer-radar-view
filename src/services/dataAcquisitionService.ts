
import { supabase } from '@/integrations/supabase/client';

export interface ApiMapping {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
  category: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// Mock API mappings for Norwegian providers
const mockApiMappings: ApiMapping[] = [
  {
    id: 'strom-api',
    name: 'Norsk Strøm API',
    url: 'https://api.strompriser.no/providers',
    category: 'strom',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    id: 'forsikring-api', 
    name: 'Forsikring Norge API',
    url: 'https://api.forsikring.no/companies',
    category: 'forsikring',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    id: 'bank-api',
    name: 'Bank Norge API', 
    url: 'https://api.bank.no/institutions',
    category: 'bank',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    id: 'mobil-api',
    name: 'Telecom Norge API',
    url: 'https://api.telecom.no/operators',
    category: 'mobil',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    id: 'internett-api',
    name: 'Bredbånd Norge API',
    url: 'https://api.bredband.no/providers',
    category: 'internett',
    headers: { 'Content-Type': 'application/json' }
  }
];

// Mock data for different categories
const mockProviderData = {
  strom: [
    { name: 'Hafslund Strøm', price: 89.5, rating: 4.2, description: 'Grønn strøm fra Hafslund med konkurransedyktige priser', external_url: 'https://hafslund.no', org_number: '123456789' },
    { name: 'Fortum Norge', price: 92.3, rating: 4.1, description: 'Klimavennlig energi fra Fortum', external_url: 'https://fortum.no', org_number: '987654321' },
    { name: 'Tibber', price: 88.1, rating: 4.5, description: 'Smart strøm med intelligent app-styring', external_url: 'https://tibber.com', org_number: '456789123' },
    { name: 'Lyse Energi', price: 90.8, rating: 4.3, description: 'Vestlandsk energi med lokalt fokus', external_url: 'https://lyse.no', org_number: '789123456' }
  ],
  forsikring: [
    { name: 'If Skadeforsikring', price: 299, rating: 4.3, description: 'Omfattende forsikringsdekning med god kundeservice', external_url: 'https://if.no', org_number: '321654987' },
    { name: 'Tryg Forsikring', price: 315, rating: 4.1, description: 'Trygg forsikring for hele familien', external_url: 'https://tryg.no', org_number: '654987321' },
    { name: 'Gjensidige', price: 289, rating: 4.4, description: 'Norges største gjensidig forsikringsselskap', external_url: 'https://gjensidige.no', org_number: '147258369' }
  ],
  bank: [
    { name: 'DNB', price: 0, rating: 4.1, description: 'Norges største bank med full digital løsning', external_url: 'https://dnb.no', org_number: '951882953' },
    { name: 'Nordea', price: 0, rating: 3.9, description: 'Nordisk bank med gode sparemuligheter', external_url: 'https://nordea.no', org_number: '920058817' },
    { name: 'SpareBank 1', price: 0, rating: 4.2, description: 'Lokale sparebanker med personlig service', external_url: 'https://sparebank1.no', org_number: '937895321' }
  ],
  mobil: [
    { name: 'Telenor', price: 399, rating: 4.2, description: 'Norges største mobiloperatør med best dekning', external_url: 'https://telenor.no', org_number: '935929954' },
    { name: 'Telia', price: 379, rating: 4.0, description: 'Konkurransedyktige mobilabonnement', external_url: 'https://telia.no', org_number: '840234725' },
    { name: 'Ice', price: 349, rating: 4.1, description: 'Ung og frisk mobiloperatør', external_url: 'https://ice.no', org_number: '987543210' }
  ],
  internett: [
    { name: 'Telenor Fiber', price: 699, rating: 4.1, description: 'Superrask fiber og ADSL', external_url: 'https://telenor.no/fiber', org_number: '935929954' },
    { name: 'Altibox', price: 599, rating: 4.4, description: 'Fiber i lysets hastighet', external_url: 'https://altibox.no', org_number: '123987456' },
    { name: 'Get', price: 759, rating: 3.9, description: 'TV og internett i samme pakke', external_url: 'https://get.no', org_number: '456123789' }
  ]
};

export const dataAcquisitionService = {
  async getApiMappings(): Promise<ApiMapping[]> {
    // Return mock API mappings
    return mockApiMappings;
  },

  async importProvidersFromApi(mapping: ApiMapping, category: string): Promise<ImportResult> {
    try {
      console.log(`Importing from ${mapping.name} for category ${category}`);
      
      // Get mock data for the category
      const categoryData = mockProviderData[category] || [];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Insert providers into database
      for (const providerData of categoryData) {
        try {
          const { error } = await supabase
            .from('providers')
            .upsert({
              name: providerData.name,
              category: category,
              price: providerData.price,
              rating: providerData.rating,
              description: providerData.description,
              external_url: providerData.external_url,
              org_number: providerData.org_number,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'name,category'
            });

          if (error) {
            console.error('Error inserting provider:', error);
            failedCount++;
            errors.push(`Failed to insert ${providerData.name}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Exception inserting provider:', err);
          failedCount++;
          errors.push(`Exception inserting ${providerData.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return {
        success: successCount,
        failed: failedCount,
        errors
      };
    } catch (error) {
      console.error('Import error:', error);
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
