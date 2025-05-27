
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
}

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

const createEndpointFromProvider = async (provider: ProviderEntry): Promise<boolean> => {
  try {
    // Check if endpoint already exists
    const { data: existingEndpoint, error: checkError } = await supabase
      .from('provider_endpoints')
      .select('id')
      .eq('category', provider.category)
      .eq('name', provider.name)
      .eq('url', provider.url)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing endpoint:', checkError);
      return false;
    }

    if (existingEndpoint) {
      console.log(`Endpoint already exists for ${provider.name}, skipping`);
      return false; // Indicates duplicate, not error
    }

    // Create new endpoint
    const { error: insertError } = await supabase
      .from('provider_endpoints')
      .insert({
        category: provider.category,
        name: provider.name,
        provider_name: provider.name,
        endpoint_type: 'scraping',
        url: provider.url,
        priority: 5,
        is_active: true,
        auth_required: false,
        auto_generated_url: true,
        scraping_config: {
          selectors: {
            name: 'h1, .company-name, .provider-name, title',
            description: '.description, .about, p',
            price: '.price, .pricing, .cost',
            rating: '.rating, .score, .stars'
          },
          waitTime: 2000,
          maxRetries: 3
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error(`Error inserting endpoint for ${provider.name}:`, insertError);
      return false;
    }

    console.log(`Successfully created endpoint for ${provider.name}`);
    return true;
  } catch (error) {
    console.error(`Exception creating endpoint for ${provider.name}:`, error);
    return false;
  }
};

export const dataImportService = {
  async importProvidersFromFile(fileContent: string): Promise<ImportStats> {
    console.log('Starting provider import from file...');
    
    const stats: ImportStats = {
      totalProcessed: 0,
      successfulImports: 0,
      errors: [],
      duplicatesSkipped: 0
    };

    try {
      const providers = parseProvidersFile(fileContent);
      console.log(`Parsed ${providers.length} providers from file`);
      
      stats.totalProcessed = providers.length;

      // Process each provider
      for (const provider of providers) {
        try {
          const result = await createEndpointFromProvider(provider);
          
          if (result === true) {
            stats.successfulImports++;
          } else {
            stats.duplicatesSkipped++;
          }
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          const errorMsg = `Failed to process ${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('Import completed:', stats);
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
      return await response.text();
    } catch (error) {
      throw new Error(`Could not load LEVERANDØRER.txt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
