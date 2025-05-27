
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

const createProviderFromEntry = async (provider: ProviderEntry): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> => {
  try {
    console.log(`Processing provider: ${provider.name} (${provider.category})`);
    
    // Check category mapping
    const categoryId = categoryMap[provider.category.toLowerCase()];
    if (!categoryId) {
      console.warn(`Unknown category: ${provider.category}`);
      return { 
        success: false, 
        isDuplicate: false, 
        error: `Unknown category: ${provider.category}` 
      };
    }

    // Check for existing provider to avoid duplicates
    const { data: existingProvider } = await supabase
      .from('providers')
      .select('id')
      .eq('name', provider.name)
      .eq('category', provider.category.toLowerCase())
      .single();

    if (existingProvider) {
      console.log(`Provider ${provider.name} already exists, skipping`);
      return { success: true, isDuplicate: true };
    }

    // Insert new provider
    const { data, error: insertError } = await supabase
      .from('providers')
      .insert([{
        name: provider.name,
        provider_name: provider.name,
        external_url: provider.url,
        category_id: categoryId,
        category: provider.category.toLowerCase(),
        price: Math.floor(Math.random() * 1000) + 100, // Simulated price
        rating: Math.floor(Math.random() * 5) + 1, // Simulated rating
        description: `Provider offering ${provider.category} services`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id');

    if (insertError) {
      console.error(`Error inserting provider ${provider.name}:`, insertError);
      return { 
        success: false, 
        isDuplicate: false, 
        error: insertError.message 
      };
    }

    console.log(`Successfully inserted provider: ${provider.name}`);
    return { success: true, isDuplicate: false };
    
  } catch (error) {
    console.error(`Exception processing provider ${provider.name}:`, error);
    return { 
      success: false, 
      isDuplicate: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
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
          const result = await createProviderFromEntry(provider);
          
          if (result.success) {
            if (result.isDuplicate) {
              stats.duplicatesSkipped++;
            } else {
              stats.successfulImports++;
            }
          } else {
            stats.errors.push(result.error || `Failed to process ${provider.name}`);
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
      const content = await response.text();
      console.log('File loaded successfully, first 200 characters:\n', content.slice(0, 200));
      return content;
    } catch (error) {
      throw new Error(`Could not load LEVERANDØRER.txt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
