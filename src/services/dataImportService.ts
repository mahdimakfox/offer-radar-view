
import { supabase } from '@/integrations/supabase/client';

interface ProviderEntry {
  category: string;
  name: string;
  url: string;
}

export interface ImportStats {
  totalProcessed: number;
  successfulImports: number;
  errors: string[];
  duplicatesSkipped: number;
  updated: number;
}

// Category mapping to category_id
const categoryMap: Record<string, number> = {
  strom: 2,
  internett: 5,
  forsikring: 3,
  bank: 4,
  mobil: 1,
  boligalarm: 6
};

const parseProvidersFile = (fileContent: string): ProviderEntry[] => {
  const lines = fileContent.split('\n').filter(line => line.trim());
  const providers: ProviderEntry[] = [];
  
  lines.forEach((line, index) => {
    const parts = line.split('|');
    if (parts.length === 3) {
      providers.push({
        category: parts[0].trim(),
        name: parts[1].trim(),
        url: parts[2].trim()
      });
    } else {
      console.warn(`Skipping invalid line ${index + 1}: ${line}`);
    }
  });
  
  return providers;
};

const createProviderFromEntry = async (provider: ProviderEntry): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'duplicate'; error?: string }> => {
  try {
    console.log(`Processing provider: ${provider.name} (${provider.category})`);
    
    // Check category mapping
    const categoryId = categoryMap[provider.category.toLowerCase()];
    if (!categoryId) {
      console.warn(`Unknown category: ${provider.category}`);
      return { 
        success: false, 
        action: 'duplicate', 
        error: `Unknown category: ${provider.category}` 
      };
    }

    // Generate realistic pricing and rating data
    const generatePrice = (category: string): number => {
      const priceRanges: Record<string, [number, number]> = {
        strom: [300, 800],
        mobil: [199, 899],
        internett: [299, 799],
        forsikring: [1500, 4500],
        bank: [0, 299],
        boligalarm: [199, 599]
      };
      
      const [min, max] = priceRanges[category] || [100, 500];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const generateRating = (): number => {
      return Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
    };

    // Use UPSERT with the new unique constraint
    const { data, error: upsertError } = await supabase
      .from('providers')
      .upsert({
        name: provider.name,
        provider_name: provider.name,
        external_url: provider.url,
        category_id: categoryId,
        category: provider.category.toLowerCase(),
        price: generatePrice(provider.category.toLowerCase()),
        rating: generateRating(),
        description: `Kvalitetsleverandør av ${provider.category.toLowerCase()} med konkurransedyktige priser og god service.`,
        pros: ['Konkurransedyktige priser', 'God kundeservice', 'Pålitelig leverandør'],
        cons: ['Kan ha bindingstid', 'Begrenset tilgjengelighet'],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name,category',
        ignoreDuplicates: false
      })
      .select('id, created_at, updated_at')
      .single();

    if (upsertError) {
      console.error(`Error upserting provider ${provider.name}:`, upsertError);
      return { 
        success: false, 
        action: 'duplicate', 
        error: upsertError.message 
      };
    }

    // Determine if this was an insert or update
    const wasUpdate = data.created_at !== data.updated_at;
    const action = wasUpdate ? 'updated' : 'inserted';
    
    console.log(`Successfully ${action} provider: ${provider.name}`);
    return { success: true, action };
    
  } catch (error) {
    console.error(`Exception processing provider ${provider.name}:`, error);
    return { 
      success: false, 
      action: 'duplicate', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

const createEndpointFromEntry = async (provider: ProviderEntry): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'duplicate'; error?: string }> => {
  try {
    console.log(`Creating endpoint for: ${provider.name} (${provider.category})`);
    
    // Create scraping configuration
    const scrapingConfig = {
      selectors: {
        price: '.price, .pricing, [data-price], .pris',
        rating: '.rating, .stars, [data-rating], .vurdering',
        description: '.description, .info, .product-info, .om-oss'
      },
      waitTime: 2000,
      maxRetries: 3,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Use UPSERT with the new unique constraint
    const { data, error: upsertError } = await supabase
      .from('provider_endpoints')
      .upsert({
        name: provider.name,
        provider_name: provider.name,
        category: provider.category.toLowerCase(),
        endpoint_type: 'scraping',
        url: provider.url,
        is_active: true,
        priority: 1,
        auth_required: false,
        scraping_config: scrapingConfig,
        auto_generated_url: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name,category',
        ignoreDuplicates: false
      })
      .select('id, created_at, updated_at')
      .single();

    if (upsertError) {
      console.error(`Error upserting endpoint ${provider.name}:`, upsertError);
      return { 
        success: false, 
        action: 'duplicate', 
        error: upsertError.message 
      };
    }

    // Determine if this was an insert or update
    const wasUpdate = data.created_at !== data.updated_at;
    const action = wasUpdate ? 'updated' : 'inserted';
    
    console.log(`Successfully ${action} endpoint: ${provider.name}`);
    return { success: true, action };
    
  } catch (error) {
    console.error(`Exception creating endpoint for ${provider.name}:`, error);
    return { 
      success: false, 
      action: 'duplicate', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const dataImportService = {
  async importProvidersFromFile(fileContent: string): Promise<ImportStats> {
    console.log('Starting enhanced provider import from file...');
    
    const stats: ImportStats = {
      totalProcessed: 0,
      successfulImports: 0,
      errors: [],
      duplicatesSkipped: 0,
      updated: 0
    };

    try {
      const providers = parseProvidersFile(fileContent);
      console.log(`Parsed ${providers.length} providers from file`);
      
      stats.totalProcessed = providers.length;

      // Process each provider
      for (const provider of providers) {
        try {
          // Create both provider and endpoint
          const providerResult = await createProviderFromEntry(provider);
          const endpointResult = await createEndpointFromEntry(provider);
          
          if (providerResult.success && endpointResult.success) {
            if (providerResult.action === 'inserted' || endpointResult.action === 'inserted') {
              stats.successfulImports++;
            } else if (providerResult.action === 'updated' || endpointResult.action === 'updated') {
              stats.updated++;
            } else {
              stats.duplicatesSkipped++;
            }
          } else {
            const errors = [];
            if (!providerResult.success && providerResult.error) {
              errors.push(`Provider: ${providerResult.error}`);
            }
            if (!endpointResult.success && endpointResult.error) {
              errors.push(`Endpoint: ${endpointResult.error}`);
            }
            stats.errors.push(`${provider.name}: ${errors.join(', ')}`);
          }
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          const errorMsg = `Failed to process ${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('Enhanced import completed:', stats);
      return stats;
      
    } catch (error) {
      const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.errors.push(errorMsg);
      console.error(errorMsg);
      return stats;
    }
  },

  async loadProvidersFile(): Promise<string> {
    try {
      const response = await fetch('/LEVERANDØRER.txt');
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      const content = await response.text();
      console.log('File loaded successfully, first 200 characters:\n', content.slice(0, 200));
      return content;
    } catch (error) {
      throw new Error(`Could not load LEVERANDØRER.txt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
