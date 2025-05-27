
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
      // Generate ratings between 3.0 and 5.0 with realistic distribution
      return Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
    };

    // Use upsert to handle duplicates
    const { data, error: upsertError } = await supabase
      .from('providers')
      .upsert([{
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }], { 
        onConflict: 'name,category',
        ignoreDuplicates: false 
      })
      .select('id');

    if (upsertError) {
      console.error(`Error upserting provider ${provider.name}:`, upsertError);
      return { 
        success: false, 
        isDuplicate: false, 
        error: upsertError.message 
      };
    }

    console.log(`Successfully processed provider: ${provider.name}`);
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
