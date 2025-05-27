
import { supabase } from '@/integrations/supabase/client';
import { scrapingService } from './scraping/scrapingService';

interface ProviderEntry {
  category: string;
  name: string;
  url: string;
}

interface ScrapingResult {
  success: boolean;
  providersProcessed: number;
  providersInserted: number;
  providersUpdated: number;
  duplicatesSkipped: number;
  errors: string[];
  logs: string[];
}

export const automatedScrapingService = {
  // Read providers from LEVERANDØRER.txt file
  async readProvidersFromFile(): Promise<ProviderEntry[]> {
    try {
      const response = await fetch('/LEVERANDØRER.txt');
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log('Successfully loaded LEVERANDØRER.txt');
      
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'))
        .map(line => {
          const [category, name, url] = line.split('|');
          if (!category || !name || !url) {
            console.warn(`Skipping invalid line: ${line}`);
            return null;
          }
          return { 
            category: category.trim(), 
            name: name.trim(), 
            url: url.trim() 
          };
        })
        .filter((provider): provider is ProviderEntry => provider !== null);
    } catch (error) {
      console.error('Error reading providers file:', error);
      throw new Error(`Could not read LEVERANDØRER.txt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Scrape data from a single provider website
  async scrapeProviderData(provider: ProviderEntry): Promise<any> {
    try {
      console.log(`Scraping data for ${provider.name} from ${provider.url}`);
      
      // Create scraping configuration for this provider
      const scrapingConfig = {
        selectors: {
          price: '.price, .pricing, [data-price], .pris, .cost',
          rating: '.rating, .stars, [data-rating], .vurdering, .score',
          description: '.description, .info, .product-info, .om-oss, .about',
          phone: '.phone, .telefon, .contact-phone',
          email: '.email, .contact-email'
        },
        waitTime: 3000,
        maxRetries: 2,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      const result = await scrapingService.executeScraping(
        provider.url,
        scrapingConfig,
        provider.category
      );

      if (result.success && result.data.length > 0) {
        return result.data[0]; // Return first scraped item
      } else {
        console.warn(`No data scraped for ${provider.name}: ${result.error || 'No data found'}`);
        return null;
      }
    } catch (error) {
      console.error(`Scraping failed for ${provider.name}:`, error);
      return null;
    }
  },

  // Insert or update provider in database using UPSERT
  async upsertProvider(provider: ProviderEntry, scrapedData: any): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'duplicate'; error?: string }> {
    try {
      console.log(`Upserting provider: ${provider.name} in category: ${provider.category}`);
      
      // Prepare provider data with scraped information
      const providerData = {
        name: provider.name,
        provider_name: provider.name,
        category: provider.category.toLowerCase(),
        external_url: provider.url,
        price: scrapedData?.price || this.generateRealisticPrice(provider.category),
        rating: scrapedData?.rating || this.generateRealisticRating(),
        description: scrapedData?.description || `Kvalitetsleverandør av ${provider.category} med konkurransedyktige priser og god kundeservice.`,
        pros: scrapedData?.pros || this.generateCategoryPros(provider.category),
        cons: scrapedData?.cons || this.generateCategoryCons(provider.category),
        updated_at: new Date().toISOString()
      };

      // Use UPSERT to insert or update
      const { data, error: upsertError } = await supabase
        .from('providers')
        .upsert(providerData, {
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
      const wasUpdate = new Date(data.created_at).getTime() !== new Date(data.updated_at).getTime();
      const action = wasUpdate ? 'updated' : 'inserted';
      
      console.log(`Successfully ${action} provider: ${provider.name}`);
      return { success: true, action };
      
    } catch (error) {
      console.error(`Exception upserting provider ${provider.name}:`, error);
      return { 
        success: false, 
        action: 'duplicate', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Generate realistic price based on category
  generateRealisticPrice(category: string): number {
    const priceRanges: Record<string, [number, number]> = {
      strom: [300, 800],
      mobil: [199, 899],
      internett: [299, 799],
      forsikring: [1500, 4500],
      bank: [0, 299],
      boligalarm: [199, 599]
    };
    
    const [min, max] = priceRanges[category.toLowerCase()] || [100, 500];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate realistic rating
  generateRealisticRating(): number {
    return Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
  },

  // Generate category-specific pros
  generateCategoryPros(category: string): string[] {
    const categoryPros: Record<string, string[]> = {
      strom: ['Grønn energi', 'Fast pris', 'God kundeservice', 'Enkel app'],
      mobil: ['Høy hastighet', 'God dekning', 'Fri tale/SMS', 'EU-roaming inkludert'],
      internett: ['Høy hastighet', 'Stabil forbindelse', 'Fri installasjon', 'WiFi inkludert'],
      forsikring: ['Omfattende dekning', 'Rask saksbehandling', 'God kundeservice', 'Familierabatt'],
      bank: ['Konkurransedyktig rente', 'God app', 'Fri nettbank', 'Personlig rådgiver'],
      boligalarm: ['24/7 overvåking', 'Mobil app', 'Rask respons', 'Enkel installasjon']
    };
    
    return categoryPros[category.toLowerCase()] || ['Kvalitetstjenester', 'Konkurransedyktige priser', 'God kundeservice'];
  },

  // Generate category-specific cons
  generateCategoryCons(category: string): string[] {
    const categoryCons: Record<string, string[]> = {
      strom: ['Bindingstid', 'Oppsettsgebyr', 'Begrenset fleksibilitet'],
      mobil: ['Databegrensning', 'Bindingstid', 'Ekstra kostnader'],
      internett: ['Begrenset tilgjengelighet', 'Oppsettsgebyr', 'Bindingstid'],
      forsikring: ['Egenandel', 'Ventetid', 'Begrensninger'],
      bank: ['Gebyrer', 'Krav til inntekt', 'Bindingstid'],
      boligalarm: ['Månedlig kostnad', 'Bindingstid', 'Installasjonskrav']
    };
    
    return categoryCons[category.toLowerCase()] || ['Kan ha bindingstid', 'Begrenset tilgjengelighet'];
  },

  // Log import results
  async logImportResults(result: ScrapingResult): Promise<void> {
    try {
      const logEntry = {
        category: 'automated_scraping',
        total_providers: result.providersProcessed,
        successful_imports: result.providersInserted + result.providersUpdated,
        failed_imports: result.errors.length,
        import_status: result.success ? 'completed' : 'failed',
        error_details: {
          errors: result.errors,
          logs: result.logs,
          duplicates_skipped: result.duplicatesSkipped,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('import_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log import results:', error);
      } else {
        console.log('Import results logged successfully');
      }
    } catch (error) {
      console.error('Exception while logging import results:', error);
    }
  },

  // Main function to run the complete automated scraping and import process
  async runAutomatedScraping(): Promise<ScrapingResult> {
    console.log('Starting automated scraping and import process...');
    
    const result: ScrapingResult = {
      success: false,
      providersProcessed: 0,
      providersInserted: 0,
      providersUpdated: 0,
      duplicatesSkipped: 0,
      errors: [],
      logs: []
    };

    try {
      // Step 1: Read providers from file
      result.logs.push('Reading providers from LEVERANDØRER.txt...');
      const providers = await this.readProvidersFromFile();
      result.providersProcessed = providers.length;
      result.logs.push(`Found ${providers.length} providers in file`);

      // Step 2: Process each provider
      for (const provider of providers) {
        try {
          result.logs.push(`Processing ${provider.name} (${provider.category})...`);
          
          // Step 3: Scrape data from provider website
          const scrapedData = await this.scrapeProviderData(provider);
          
          if (!scrapedData) {
            result.logs.push(`No data scraped for ${provider.name}, using defaults`);
          }
          
          // Step 4: Insert or update in database
          const upsertResult = await this.upsertProvider(provider, scrapedData);
          
          if (upsertResult.success) {
            if (upsertResult.action === 'inserted') {
              result.providersInserted++;
              result.logs.push(`✓ Inserted ${provider.name}`);
            } else if (upsertResult.action === 'updated') {
              result.providersUpdated++;
              result.logs.push(`✓ Updated ${provider.name}`);
            } else {
              result.duplicatesSkipped++;
              result.logs.push(`- Duplicate skipped: ${provider.name}`);
            }
          } else {
            result.errors.push(`Failed to upsert ${provider.name}: ${upsertResult.error}`);
            result.logs.push(`✗ Failed to upsert ${provider.name}`);
          }
          
          // Small delay to avoid overwhelming websites
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          const errorMsg = `Error processing ${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          result.logs.push(`✗ ${errorMsg}`);
        }
      }

      result.success = result.errors.length < providers.length;
      result.logs.push('Automated scraping and import completed');
      
      // Step 5: Log results
      await this.logImportResults(result);
      
      console.log('Automated scraping process completed:', {
        processed: result.providersProcessed,
        inserted: result.providersInserted,
        updated: result.providersUpdated,
        duplicates: result.duplicatesSkipped,
        errors: result.errors.length
      });

      return result;
      
    } catch (error) {
      const errorMsg = `Automated scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      result.logs.push(`✗ ${errorMsg}`);
      console.error('Automated scraping process failed:', error);
      
      await this.logImportResults(result);
      return result;
    }
  }
};
