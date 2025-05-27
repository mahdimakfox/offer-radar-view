
interface ProviderEntry {
  category: string;
  name: string;
  url: string;
}

interface ExtractedData {
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  price?: number;
  logo_url?: string;
  products?: string[];
  org_number?: string;
}

export const dataExtractor = {
  // Extract data from HTML using enhanced patterns
  extractDataFromHtml(html: string, provider: ProviderEntry): ExtractedData {
    try {
      console.log(`Extracting data for ${provider.name}`);
      
      const extracted: ExtractedData = {};

      // Extract description - look for common description patterns
      const descriptionPatterns = [
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
        /<p[^>]*class=["'][^"']*(?:about|description|intro|summary)[^"']*["'][^>]*>([^<]+)</i,
        /<div[^>]*class=["'][^"']*(?:about|description|intro|summary)[^"']*["'][^>]*>([^<]+)</i
      ];

      for (const pattern of descriptionPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          extracted.description = this.cleanText(match[1]);
          break;
        }
      }

      // Extract phone numbers
      const phonePattern = /(?:\+47\s?)?(?:\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})/g;
      const phoneMatches = html.match(phonePattern);
      if (phoneMatches && phoneMatches.length > 0) {
        extracted.phone = phoneMatches[0];
      }

      // Extract email addresses
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emailMatches = html.match(emailPattern);
      if (emailMatches && emailMatches.length > 0) {
        // Filter out common non-contact emails
        const filteredEmails = emailMatches.filter(email => 
          !email.includes('noreply') && 
          !email.includes('no-reply') &&
          !email.includes('example.com')
        );
        if (filteredEmails.length > 0) {
          extracted.email = filteredEmails[0];
        }
      }

      // Extract organization number
      const orgNumberPattern = /(?:org\.?\s*nr\.?|organisasjonsnummer|org\.?\s*nummer)[\s:]*(\d{9})/gi;
      const orgMatch = html.match(orgNumberPattern);
      if (orgMatch && orgMatch[1]) {
        extracted.org_number = orgMatch[1];
      }

      // Extract logo URL
      const logoPatterns = [
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
        /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*src=["']([^"']*logo[^"']*)["']/i
      ];

      for (const pattern of logoPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          extracted.logo_url = this.normalizeUrl(match[1], provider.url);
          break;
        }
      }

      // Extract price information
      const pricePatterns = [
        /(?:kr|NOK|pris)[\s]*([0-9,\s]+)/gi,
        /([0-9,\s]+)[\s]*(?:kr|NOK)/gi
      ];

      for (const pattern of pricePatterns) {
        const matches = Array.from(html.matchAll(pattern));
        if (matches.length > 0) {
          const prices = matches
            .map(match => parseInt(match[1].replace(/[^\d]/g, '')))
            .filter(price => price > 0 && price < 100000);
          
          if (prices.length > 0) {
            extracted.price = prices[0];
            break;
          }
        }
      }

      console.log(`Extracted data for ${provider.name}:`, extracted);
      return extracted;

    } catch (error) {
      console.error(`Error extracting data for ${provider.name}:`, error);
      return {};
    }
  },

  // Clean and normalize text
  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-æøåÆØÅ]/g, '')
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
  }
};
