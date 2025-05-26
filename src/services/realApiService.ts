
import { supabase } from '@/integrations/supabase/client';

export interface RealApiProvider {
  name: string;
  price: number;
  rating: number;
  description: string;
  external_url: string;
  org_number?: string;
  logo_url?: string;
  pros?: string[];
  cons?: string[];
}

export interface ApiResponse {
  success: boolean;
  data: RealApiProvider[];
  error?: string;
}

const API_ENDPOINTS = {
  strom: 'https://api.strompriser.no/v1/providers',
  forsikring: 'https://api.forsikring.no/v1/companies',
  bank: 'https://api.bank.no/v1/institutions',
  mobil: 'https://api.telecom.no/v1/operators',
  internett: 'https://api.bredband.no/v1/providers',
  boligalarm: 'https://api.security.no/v1/providers'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const realApiService = {
  async fetchProvidersFromApi(category: string): Promise<ApiResponse> {
    const endpoint = API_ENDPOINTS[category as keyof typeof API_ENDPOINTS];
    
    if (!endpoint) {
      return {
        success: false,
        data: [],
        error: `No API endpoint configured for category: ${category}`
      };
    }

    try {
      console.log(`Fetching data from ${endpoint} for category: ${category}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the API response to our expected format
      const transformedData = this.transformApiResponse(data, category);
      
      return {
        success: true,
        data: transformedData,
      };
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      
      // Return fallback mock data with error indication
      const fallbackData = this.getFallbackData(category);
      
      return {
        success: false,
        data: fallbackData,
        error: error instanceof Error ? error.message : 'Unknown API error'
      };
    }
  },

  transformApiResponse(data: any, category: string): RealApiProvider[] {
    if (!Array.isArray(data)) {
      console.warn('API response is not an array, attempting to extract providers');
      data = data.providers || data.companies || data.institutions || data.operators || [];
    }

    return data.map((item: any) => ({
      name: item.name || item.company_name || item.provider_name || 'Unknown Provider',
      price: this.parsePrice(item.price || item.monthly_cost || item.fee || 0),
      rating: this.parseRating(item.rating || item.score || item.customer_rating || 3.5),
      description: item.description || item.summary || item.details || 'No description available',
      external_url: item.website || item.url || item.homepage || '#',
      org_number: item.org_number || item.organization_number || item.business_id,
      logo_url: item.logo || item.logo_url || item.image,
      pros: item.advantages || item.benefits || item.pros,
      cons: item.disadvantages || item.drawbacks || item.cons,
    }));
  },

  parsePrice(price: any): number {
    if (typeof price === 'number') return Math.max(0, price);
    if (typeof price === 'string') {
      const numPrice = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
      return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
    }
    return 0;
  },

  parseRating(rating: any): number {
    if (typeof rating === 'number') return Math.min(5, Math.max(0, rating));
    if (typeof rating === 'string') {
      const numRating = parseFloat(rating);
      return isNaN(numRating) ? 3.5 : Math.min(5, Math.max(0, numRating));
    }
    return 3.5;
  },

  getFallbackData(category: string): RealApiProvider[] {
    // Return limited fallback data when API fails
    const fallbackProviders: Record<string, RealApiProvider[]> = {
      strom: [
        {
          name: 'Hafslund Strøm',
          price: 89.5,
          rating: 4.2,
          description: 'Grønn strøm fra Hafslund med konkurransedyktige priser',
          external_url: 'https://hafslund.no',
          org_number: '123456789'
        }
      ],
      forsikring: [
        {
          name: 'If Skadeforsikring',
          price: 299,
          rating: 4.3,
          description: 'Omfattende forsikringsdekning med god kundeservice',
          external_url: 'https://if.no',
          org_number: '321654987'
        }
      ],
      bank: [
        {
          name: 'DNB Bank',
          price: 0,
          rating: 4.1,
          description: 'Norges største bank med full digital løsning',
          external_url: 'https://dnb.no',
          org_number: '951882953'
        }
      ],
      mobil: [
        {
          name: 'Telenor Mobil',
          price: 399,
          rating: 4.2,
          description: 'Norges største mobiloperatør med best dekning',
          external_url: 'https://telenor.no',
          org_number: '935929954'
        }
      ],
      internett: [
        {
          name: 'Telenor Fiber',
          price: 699,
          rating: 4.1,
          description: 'Superrask fiber og ADSL',
          external_url: 'https://telenor.no/fiber',
          org_number: '935929954'
        }
      ],
      boligalarm: [
        {
          name: 'Verisure Norge',
          price: 599,
          rating: 4.4,
          description: 'Ledende leverandør av boligalarmer og sikkerhet',
          external_url: 'https://verisure.no',
          org_number: '987654321'
        }
      ]
    };

    return fallbackProviders[category] || [];
  }
};
