
import { supabase } from '@/integrations/supabase/client';

export interface ExternalProviderData {
  org_number: string;
  company_name: string;
  industry_code?: string;
  industry_name?: string;
  ehf_support?: boolean;
  price_estimate?: number;
  logo_url?: string;
  website_url?: string;
  rating?: number;
  description?: string;
}

export interface ApiMapping {
  id: string;
  provider_name: string;
  api_url: string;
  api_type: string;
  data_mapping: any;
  auth_required: boolean;
}

export const dataAcquisitionService = {
  // Hent data fra Brønnøysundregisteret (eksempel)
  async fetchFromBronnoy(orgNumber?: string): Promise<ExternalProviderData[]> {
    try {
      console.log('Fetching data from Brønnøysundregisteret...');
      
      // Dette er et eksempel på hvordan du kan kalle Brønnøysund API
      // Du må erstatte med riktig API-endpoint og struktur
      const response = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter${orgNumber ? `/${orgNumber}` : ''}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Konverter Brønnøysund-data til vårt format
      const providers: ExternalProviderData[] = [];
      
      if (data._embedded?.enheter) {
        for (const enhet of data._embedded.enheter) {
          providers.push({
            org_number: enhet.organisasjonsnummer,
            company_name: enhet.navn,
            industry_code: enhet.naeringskode1?.kode,
            industry_name: enhet.naeringskode1?.beskrivelse,
            ehf_support: false, // Dette må sjekkes separat
            price_estimate: Math.floor(Math.random() * 1000) + 100, // Dummy data
            website_url: enhet.hjemmeside,
            rating: 3.5 + Math.random() * 1.5, // Dummy rating
            description: `${enhet.navn} - ${enhet.naeringskode1?.beskrivelse || 'Ingen beskrivelse'}`
          });
        }
      }
      
      return providers;
    } catch (error) {
      console.error('Error fetching from Brønnøysund:', error);
      return [];
    }
  },

  // Hent API-mappings fra database
  async getApiMappings(): Promise<ApiMapping[]> {
    const { data, error } = await supabase
      .from('provider_api_mappings')
      .select('*');
    
    if (error) {
      console.error('Error fetching API mappings:', error);
      return [];
    }
    
    return data || [];
  },

  // Oppdater provider i database
  async upsertProvider(providerData: ExternalProviderData, category: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('providers')
        .upsert({
          name: providerData.company_name,
          category: category,
          price: providerData.price_estimate || 0,
          rating: providerData.rating || 0,
          description: providerData.description || '',
          external_url: providerData.website_url || '#',
          logo_url: providerData.logo_url,
          pros: [],
          cons: []
        }, {
          onConflict: 'name,category'
        });

      if (error) {
        console.error('Error upserting provider:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in upsertProvider:', error);
      return false;
    }
  },

  // Logg import-resultater
  async logImport(category: string, total: number, successful: number, failed: number, errors?: any[]): Promise<void> {
    try {
      await supabase
        .from('import_logs')
        .insert({
          category,
          total_providers: total,
          successful_imports: successful,
          failed_imports: failed,
          import_status: failed > 0 ? 'completed_with_errors' : 'completed',
          error_details: errors || null
        });
    } catch (error) {
      console.error('Error logging import:', error);
    }
  },

  // Hovedfunksjon for datainnhenting
  async importProvidersFromApi(apiMapping: ApiMapping, category: string): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = { success: 0, failed: 0, errors: [] };
    
    try {
      let providers: ExternalProviderData[] = [];
      
      // Velg riktig datakilde basert på API-mapping
      switch (apiMapping.provider_name.toLowerCase()) {
        case 'brønnøysund':
        case 'brreg':
          providers = await this.fetchFromBronnoy();
          break;
        default:
          throw new Error(`Ukjent API-leverandør: ${apiMapping.provider_name}`);
      }

      // Importer hver leverandør
      for (const provider of providers) {
        try {
          const success = await this.upsertProvider(provider, category);
          if (success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`Failed to import ${provider.company_name}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Error importing ${provider.company_name}: ${error.message}`);
        }
      }

      // Logg resultatet
      await this.logImport(category, providers.length, results.success, results.failed, results.errors);
      
    } catch (error) {
      console.error('Import error:', error);
      results.errors.push(error.message);
      await this.logImport(category, 0, 0, 1, [error.message]);
    }
    
    return results;
  }
};
