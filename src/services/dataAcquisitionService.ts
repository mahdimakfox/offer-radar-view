
import { supabase } from '@/integrations/supabase/client';

export interface ApiMapping {
  id: string;
  provider_name: string;
  api_url: string;
  api_type?: string;
  auth_required?: boolean;
  data_mapping?: Record<string, any>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface ImportLogEntry {
  category: string;
  total_providers: number;
  successful_imports: number;
  failed_imports: number;
  import_status: 'in_progress' | 'completed' | 'failed';
  error_details?: any;
}

// Mock API mappings for Norwegian providers
const mockApiMappings: ApiMapping[] = [
  {
    id: 'strom-api',
    provider_name: 'Norsk Strøm API',
    api_url: 'https://api.strompriser.no/providers',
    api_type: 'REST',
    auth_required: false
  },
  {
    id: 'forsikring-api', 
    provider_name: 'Forsikring Norge API',
    api_url: 'https://api.forsikring.no/companies',
    api_type: 'REST',
    auth_required: false
  },
  {
    id: 'bank-api',
    provider_name: 'Bank Norge API', 
    api_url: 'https://api.bank.no/institutions',
    api_type: 'REST',
    auth_required: true
  },
  {
    id: 'mobil-api',
    provider_name: 'Telecom Norge API',
    api_url: 'https://api.telecom.no/operators',
    api_type: 'REST',
    auth_required: false
  },
  {
    id: 'internett-api',
    provider_name: 'Bredbånd Norge API',
    api_url: 'https://api.bredband.no/providers',
    api_type: 'REST',
    auth_required: false
  }
];

// Mock data for different categories
const mockProviderData = {
  strom: [
    { name: 'Hafslund Strøm', price: 89.5, rating: 4.2, description: 'Grønn strøm fra Hafslund med konkurransedyktige priser', external_url: 'https://hafslund.no', org_number: '123456789' },
    { name: 'Fortum Norge', price: 92.3, rating: 4.1, description: 'Klimavennlig energi fra Fortum', external_url: 'https://fortum.no', org_number: '987654321' },
    { name: 'Tibber AS', price: 88.1, rating: 4.5, description: 'Smart strøm med intelligent app-styring', external_url: 'https://tibber.com', org_number: '456789123' },
    { name: 'Lyse Energi', price: 90.8, rating: 4.3, description: 'Vestlandsk energi med lokalt fokus', external_url: 'https://lyse.no', org_number: '789123456' }
  ],
  forsikring: [
    { name: 'If Skadeforsikring', price: 299, rating: 4.3, description: 'Omfattende forsikringsdekning med god kundeservice', external_url: 'https://if.no', org_number: '321654987' },
    { name: 'Tryg Forsikring', price: 315, rating: 4.1, description: 'Trygg forsikring for hele familien', external_url: 'https://tryg.no', org_number: '654987321' },
    { name: 'Gjensidige', price: 289, rating: 4.4, description: 'Norges største gjensidig forsikringsselskap', external_url: 'https://gjensidige.no', org_number: '147258369' }
  ],
  bank: [
    { name: 'DNB Bank', price: 0, rating: 4.1, description: 'Norges største bank med full digital løsning', external_url: 'https://dnb.no', org_number: '951882953' },
    { name: 'Nordea Bank', price: 0, rating: 3.9, description: 'Nordisk bank med gode sparemuligheter', external_url: 'https://nordea.no', org_number: '920058817' },
    { name: 'SpareBank 1', price: 0, rating: 4.2, description: 'Lokale sparebanker med personlig service', external_url: 'https://sparebank1.no', org_number: '937895321' }
  ],
  mobil: [
    { name: 'Telenor Mobil', price: 399, rating: 4.2, description: 'Norges største mobiloperatør med best dekning', external_url: 'https://telenor.no', org_number: '935929954' },
    { name: 'Telia Norge', price: 379, rating: 4.0, description: 'Konkurransedyktige mobilabonnement', external_url: 'https://telia.no', org_number: '840234725' },
    { name: 'Ice Norge', price: 349, rating: 4.1, description: 'Ung og frisk mobiloperatør', external_url: 'https://ice.no', org_number: '987543210' }
  ],
  internett: [
    { name: 'Telenor Fiber', price: 699, rating: 4.1, description: 'Superrask fiber og ADSL', external_url: 'https://telenor.no/fiber', org_number: '935929954' },
    { name: 'Altibox AS', price: 599, rating: 4.4, description: 'Fiber i lysets hastighet', external_url: 'https://altibox.no', org_number: '123987456' },
    { name: 'Get AS', price: 759, rating: 3.9, description: 'TV og internett i samme pakke', external_url: 'https://get.no', org_number: '456123789' }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const logImportActivity = async (logEntry: ImportLogEntry) => {
  try {
    const { error } = await supabase
      .from('import_logs')
      .insert(logEntry);
    
    if (error) {
      console.error('Failed to log import activity:', error);
    }
  } catch (err) {
    console.error('Exception logging import activity:', err);
  }
};

const insertProviderWithRetry = async (providerData: any, category: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to insert provider: ${providerData.name} (attempt ${attempt}/${maxRetries})`);
      
      // First, try to find existing provider
      const { data: existingProvider, error: selectError } = await supabase
        .from('providers')
        .select('id')
        .eq('name', providerData.name)
        .eq('category', category)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing provider:', selectError);
        throw selectError;
      }

      if (existingProvider) {
        // Update existing provider
        const { error: updateError } = await supabase
          .from('providers')
          .update({
            price: providerData.price,
            rating: providerData.rating,
            description: providerData.description,
            external_url: providerData.external_url,
            org_number: providerData.org_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProvider.id);

        if (updateError) {
          console.error('Error updating provider:', updateError);
          throw updateError;
        }
        
        console.log(`Updated existing provider: ${providerData.name}`);
        return { success: true, action: 'updated' };
      } else {
        // Insert new provider
        const { error: insertError } = await supabase
          .from('providers')
          .insert({
            name: providerData.name,
            category: category,
            price: providerData.price,
            rating: providerData.rating,
            description: providerData.description,
            external_url: providerData.external_url,
            org_number: providerData.org_number,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting provider:', insertError);
          throw insertError;
        }
        
        console.log(`Inserted new provider: ${providerData.name}`);
        return { success: true, action: 'inserted' };
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${providerData.name}:`, error);
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          action: 'failed'
        };
      }
      
      // Exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying in ${backoffTime}ms...`);
      await delay(backoffTime);
    }
  }
  
  return { success: false, error: 'Max retries exceeded', action: 'failed' };
};

export const dataAcquisitionService = {
  async getApiMappings(): Promise<ApiMapping[]> {
    console.log('Fetching API mappings...');
    return mockApiMappings;
  },

  async importProvidersFromApi(mapping: ApiMapping, category: string): Promise<ImportResult> {
    console.log(`Starting import from ${mapping.provider_name} for category ${category}`);
    
    // Create initial log entry
    const logEntry: ImportLogEntry = {
      category,
      total_providers: 0,
      successful_imports: 0,
      failed_imports: 0,
      import_status: 'in_progress'
    };
    
    try {
      // Get mock data for the category (in real implementation, this would be an API call)
      const categoryData = mockProviderData[category as keyof typeof mockProviderData] || [];
      
      if (categoryData.length === 0) {
        console.warn(`No data available for category: ${category}`);
        return {
          success: 0,
          failed: 0,
          errors: [`No data available for category: ${category}`]
        };
      }

      console.log(`Found ${categoryData.length} providers for category ${category}`);
      
      // Update log entry with total
      logEntry.total_providers = categoryData.length;
      await logImportActivity(logEntry);
      
      // Simulate API call delay
      await delay(1000);
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Process providers with improved error handling
      for (const providerData of categoryData) {
        try {
          console.log(`Processing provider: ${providerData.name}`);
          
          const result = await insertProviderWithRetry(providerData, category);
          
          if (result.success) {
            successCount++;
            console.log(`✓ Successfully ${result.action} provider: ${providerData.name}`);
          } else {
            failedCount++;
            const errorMsg = `Failed to insert ${providerData.name}: ${result.error}`;
            errors.push(errorMsg);
            console.error(`✗ ${errorMsg}`);
          }
        } catch (err) {
          failedCount++;
          const errorMsg = `Exception processing ${providerData.name}: ${err instanceof Error ? err.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`✗ ${errorMsg}`);
        }
      }

      // Log final results
      const finalLogEntry: ImportLogEntry = {
        category,
        total_providers: categoryData.length,
        successful_imports: successCount,
        failed_imports: failedCount,
        import_status: failedCount === 0 ? 'completed' : 'failed',
        error_details: errors.length > 0 ? { errors } : null
      };
      
      await logImportActivity(finalLogEntry);

      console.log(`Import completed for ${mapping.provider_name}:`, {
        success: successCount,
        failed: failedCount,
        total: categoryData.length
      });

      return {
        success: successCount,
        failed: failedCount,
        errors
      };
    } catch (error) {
      const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('Import error:', error);
      
      // Log failure
      const failedLogEntry: ImportLogEntry = {
        category,
        total_providers: 0,
        successful_imports: 0,
        failed_imports: 1,
        import_status: 'failed',
        error_details: { error: errorMsg }
      };
      
      await logImportActivity(failedLogEntry);
      
      throw new Error(errorMsg);
    }
  }
};
