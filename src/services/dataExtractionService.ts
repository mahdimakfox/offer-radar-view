
import { fileReader } from './scraping/fileReader';
import { htmlFetcher } from './scraping/htmlFetcher';

interface ProviderEntry {
  category: string;
  name: string;
  url: string;
}

interface ExtractedProviderData {
  kategori: string;
  navn: string;
  url: string;
  beskrivelse: string;
  kontakt: {
    telefon?: string;
    epost?: string;
    adresse?: string;
  };
  produkter: string[];
  bilder: string[];
  org_nummer?: string;
}

interface ExtractionError {
  kategori: string;
  navn: string;
  url: string;
  feil: string;
  tidspunkt: string;
}

interface ExtractionResult {
  leverandorer: ExtractedProviderData[];
  feillogg: ExtractionError[];
  statistikk: {
    total_behandlet: number;
    vellykkede: number;
    feilede: number;
    generert_tidspunkt: string;
  };
}

export const dataExtractionService = {
  // Extract comprehensive data from HTML using enhanced patterns
  extractProviderDataFromHtml(html: string, provider: ProviderEntry): Partial<ExtractedProviderData> {
    try {
      console.log(`Extracting comprehensive data for ${provider.name}`);
      
      const extracted: Partial<ExtractedProviderData> = {
        kategori: provider.category,
        navn: provider.name,
        url: provider.url,
        kontakt: {},
        produkter: [],
        bilder: []
      };

      // Enhanced description extraction with multiple patterns
      const descriptionPatterns = [
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']{20,500})["']/i,
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']{20,500})["']/i,
        /<p[^>]*class=["'][^"']*(?:about|description|intro|summary|lead)[^"']*["'][^>]*>([^<]{30,300})/i,
        /<div[^>]*class=["'][^"']*(?:about|description|intro|summary|hero)[^"']*["'][^>]*>.*?<p[^>]*>([^<]{30,300})/i,
        /<h1[^>]*>.*?<\/h1>.*?<p[^>]*>([^<]{30,300})/i
      ];

      for (const pattern of descriptionPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          extracted.beskrivelse = this.cleanText(match[1]);
          break;
        }
      }

      // If no description found, create fallback based on company name and category
      if (!extracted.beskrivelse) {
        extracted.beskrivelse = this.generateFallbackDescription(provider);
      }

      // Enhanced phone number extraction
      const phonePatterns = [
        /(?:telefon|tlf|ring|kontakt)[\s\w]*?(?:\+47\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/gi,
        /(?:\+47\s?)?([2-9]\d{7})/g,
        /(?:\+47\s?)(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/g
      ];

      for (const pattern of phonePatterns) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          extracted.kontakt!.telefon = matches[0].replace(/\D/g, '').replace(/^47/, '+47 ');
          break;
        }
      }

      // Enhanced email extraction
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emailMatches = html.match(emailPattern);
      if (emailMatches) {
        const filteredEmails = emailMatches.filter(email => 
          !email.includes('noreply') && 
          !email.includes('no-reply') &&
          !email.includes('example.com') &&
          !email.includes('placeholder') &&
          !email.includes('@sentry.') &&
          !email.includes('@google.') &&
          !email.includes('@facebook.')
        );
        if (filteredEmails.length > 0) {
          extracted.kontakt!.epost = filteredEmails[0];
        }
      }

      // Enhanced address extraction
      const addressPatterns = [
        /(?:adresse|besøksadresse|postadresse|kontoradresse)[\s\w]*?([A-ZÆØÅ][a-zæøå\s]+\d+[^<\n]{10,100})/gi,
        /(\d{4}\s+[A-ZÆØÅ][a-zæøå\s]+)/g,
        /([A-ZÆØÅ][a-zæøå\s]+\s+\d+[A-Za-z]?,?\s*\d{4}\s+[A-ZÆØÅ][a-zæøå\s]+)/g
      ];

      for (const pattern of addressPatterns) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          extracted.kontakt!.adresse = this.cleanText(matches[0]);
          break;
        }
      }

      // Organization number extraction
      const orgNumberPattern = /(?:org\.?\s*nr\.?|organisasjonsnummer|foretaksregisteret)[\s:]*(\d{9})/gi;
      const orgMatch = html.match(orgNumberPattern);
      if (orgMatch && orgMatch[1]) {
        extracted.org_nummer = orgMatch[1];
      }

      // Enhanced product/service extraction based on category
      extracted.produkter = this.extractProducts(html, provider.category);

      // Enhanced image/logo extraction
      extracted.bilder = this.extractImages(html, provider.url);

      console.log(`Successfully extracted data for ${provider.name}:`, extracted);
      return extracted;

    } catch (error) {
      console.error(`Error extracting data for ${provider.name}:`, error);
      return {
        kategori: provider.category,
        navn: provider.name,
        url: provider.url,
        beskrivelse: this.generateFallbackDescription(provider),
        kontakt: {},
        produkter: [],
        bilder: []
      };
    }
  },

  // Extract products/services based on category
  extractProducts(html: string, category: string): string[] {
    const products: string[] = [];
    
    const categoryKeywords: Record<string, string[]> = {
      strom: ['strøm', 'fastpris', 'spotpris', 'grønn energi', 'solceller', 'kraft'],
      mobil: ['mobilabonnement', 'data', 'tale', 'SMS', 'roaming', '5G', '4G'],
      internett: ['bredbånd', 'fiber', 'ADSL', 'WiFi', 'internet', 'hastighet'],
      forsikring: ['bilforsikring', 'boligforsikring', 'reiseforsikring', 'livsforsikring', 'innbo'],
      bank: ['bankkonto', 'lån', 'kredittkort', 'sparekonto', 'rente', 'boliglån'],
      boligalarm: ['alarm', 'overvåking', 'sikkerhet', 'kamera', 'sensor', 'vakt']
    };

    const keywords = categoryKeywords[category] || [];
    
    for (const keyword of keywords) {
      const regex = new RegExp(`[^<>]*${keyword}[^<>]*`, 'gi');
      const matches = html.match(regex);
      if (matches) {
        matches.slice(0, 3).forEach(match => {
          const cleaned = this.cleanText(match).substring(0, 100);
          if (cleaned.length > 10 && !products.includes(cleaned)) {
            products.push(cleaned);
          }
        });
      }
    }

    // Fallback products if none found
    if (products.length === 0) {
      products.push(...this.generateFallbackProducts(category));
    }

    return products.slice(0, 5); // Limit to 5 products
  },

  // Extract images and logos
  extractImages(html: string, baseUrl: string): string[] {
    const images: string[] = [];
    
    const imagePatterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi,
      /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi,
      /<img[^>]*src=["']([^"']*logo[^"']*)["']/gi,
      /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi
    ];

    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imageUrl = this.normalizeUrl(match[1], baseUrl);
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
        if (images.length >= 3) break;
      }
      if (images.length >= 3) break;
    }

    return images;
  },

  // Generate fallback description
  generateFallbackDescription(provider: ProviderEntry): string {
    const categoryDescriptions: Record<string, string> = {
      strom: 'leverandør av strømtjenester og energiløsninger',
      mobil: 'tilbyder av mobilabonnement og telekommunikasjonstjenester',
      internett: 'leverandør av bredbånd og internettjenester',
      forsikring: 'forsikringsselskap som tilbyr ulike forsikringsordninger',
      bank: 'finansinstitusjon som tilbyr bank- og finanstjenester',
      boligalarm: 'sikkerhetsleverandør som tilbyr alarm- og overvåkingstjenester'
    };

    const service = categoryDescriptions[provider.category] || 'leverandør av tjenester';
    return `${provider.name} er en norsk ${service}. Selskapet tilbyr konkurransedyktige løsninger og god kundeservice til private og bedriftskunder.`;
  },

  // Generate fallback products
  generateFallbackProducts(category: string): string[] {
    const categoryProducts: Record<string, string[]> = {
      strom: ['Fastpris strøm', 'Spotpris strøm', 'Grønn energi'],
      mobil: ['Mobilabonnement', 'Fri tale og SMS', 'Data-pakker'],
      internett: ['Fiber bredbånd', 'ADSL', 'WiFi-løsninger'],
      forsikring: ['Bilforsikring', 'Boligforsikring', 'Reiseforsikring'],
      bank: ['Bankkonto', 'Sparekonto', 'Lån og kreditt'],
      boligalarm: ['Boligalarm', 'Overvåking', 'Sikkerhetskamera']
    };

    return categoryProducts[category] || ['Ulike tjenester', 'Kundetilpassede løsninger'];
  },

  // Clean and normalize text
  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?()-æøåÆØÅ]/g, '')
      .trim()
      .substring(0, 500);
  },

  // Normalize URL to absolute URL
  normalizeUrl(url: string, baseUrl: string): string {
    try {
      if (url.startsWith('http')) {
        return url;
      }
      const base = new URL(baseUrl);
      if (url.startsWith('/')) {
        return base.origin + url;
      }
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  },

  // Main extraction function
  async extractAllProviderData(): Promise<ExtractionResult> {
    console.log('Starting comprehensive provider data extraction...');
    
    const result: ExtractionResult = {
      leverandorer: [],
      feillogg: [],
      statistikk: {
        total_behandlet: 0,
        vellykkede: 0,
        feilede: 0,
        generert_tidspunkt: new Date().toISOString()
      }
    };

    try {
      // Step 1: Read providers from file
      console.log('Reading providers from LEVERANDØRER.txt...');
      const providers = await fileReader.readProvidersFromFile();
      result.statistikk.total_behandlet = providers.length;
      
      console.log(`Found ${providers.length} providers to process`);

      // Step 2: Process each provider
      for (const provider of providers) {
        try {
          console.log(`Processing ${provider.name} (${provider.category})...`);
          
          // Step 3: Fetch HTML via AllOrigins API
          const html = await htmlFetcher.fetchHtmlViaAllOrigins(provider.url);
          
          // Step 4: Extract comprehensive data
          const extractedData = this.extractProviderDataFromHtml(html, provider);
          
          // Ensure all required fields are present
          const completeData: ExtractedProviderData = {
            kategori: extractedData.kategori || provider.category,
            navn: extractedData.navn || provider.name,
            url: extractedData.url || provider.url,
            beskrivelse: extractedData.beskrivelse || this.generateFallbackDescription(provider),
            kontakt: extractedData.kontakt || {},
            produkter: extractedData.produkter || this.generateFallbackProducts(provider.category),
            bilder: extractedData.bilder || [],
            ...(extractedData.org_nummer && { org_nummer: extractedData.org_nummer })
          };
          
          result.leverandorer.push(completeData);
          result.statistikk.vellykkede++;
          
          console.log(`✓ Successfully processed ${provider.name}`);
          
          // Small delay to be respectful to AllOrigins API
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ukjent feil';
          console.error(`✗ Failed to process ${provider.name}:`, errorMessage);
          
          result.feillogg.push({
            kategori: provider.category,
            navn: provider.name,
            url: provider.url,
            feil: errorMessage,
            tidspunkt: new Date().toISOString()
          });
          
          result.statistikk.feilede++;
        }
      }

      console.log('Data extraction completed:', {
        total: result.statistikk.total_behandlet,
        successful: result.statistikk.vellykkede,
        failed: result.statistikk.feilede
      });

      return result;
      
    } catch (error) {
      console.error('Critical error during data extraction:', error);
      throw new Error(`Data extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generate downloadable JSON file
  generateDownloadableJson(data: ExtractionResult): string {
    return JSON.stringify(data, null, 2);
  },

  // Download JSON file
  downloadJsonFile(data: ExtractionResult, filename: string = 'leverandorer_data.json') {
    const jsonString = this.generateDownloadableJson(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
};
