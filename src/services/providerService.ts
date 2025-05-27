
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { validateProviderArray, sanitizeProvider, logDataInconsistency } from '@/utils/dataValidation';

export interface Provider {
  id: number;
  name: string;
  category: string;
  price: number;
  logo_url?: string;
  rating: number;
  description: string;
  external_url: string;
  pros?: string[];
  cons?: string[];
  org_number?: string;
  industry_code?: string;
  ehf_invoice_support?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Use the Supabase generated type for providers table
type ProviderRow = Tables<'providers'>;

const transformProviderRow = (row: ProviderRow): Provider | null => {
  return sanitizeProvider({
    id: row.id,
    name: row.name,
    category: row.category || 'unknown',
    price: row.price ? Number(row.price) : 0,
    logo_url: row.logo_url || undefined,
    rating: row.rating ? Number(row.rating) : 0,
    description: row.description || '',
    external_url: row.external_url || '',
    pros: row.pros || undefined,
    cons: row.cons || undefined,
    org_number: row.org_number || undefined,
    industry_code: row.industry_code || undefined,
    ehf_invoice_support: row.ehf_invoice_support || false,
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined,
  });
};

export const providerService = {
  async getProvidersByCategory(category: string): Promise<Provider[]> {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category parameter');
      }

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('category', category.toLowerCase())
        .order('rating', { ascending: false });

      if (error) {
        logDataInconsistency('getProvidersByCategory', { category, error: error.message });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validate and transform data
      const transformedProviders = data
        .map(row => transformProviderRow(row))
        .filter((provider): provider is Provider => provider !== null);

      const validation = validateProviderArray(transformedProviders);
      if (!validation.isValid) {
        logDataInconsistency('getProvidersByCategory_validation', { 
          category, 
          errors: validation.errors,
          originalCount: data.length,
          validCount: transformedProviders.length
        });
      }

      return transformedProviders;
    } catch (error) {
      logDataInconsistency('getProvidersByCategory_exception', { category }, error as Error);
      throw error;
    }
  },

  async searchProviders(category: string, searchTerm: string): Promise<Provider[]> {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category parameter');
      }

      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new Error('Invalid search term parameter');
      }

      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm.length === 0) {
        return this.getProvidersByCategory(category);
      }

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('category', category.toLowerCase())
        .or(`name.ilike.%${trimmedSearchTerm}%,description.ilike.%${trimmedSearchTerm}%,org_number.ilike.%${trimmedSearchTerm}%`)
        .order('rating', { ascending: false });

      if (error) {
        logDataInconsistency('searchProviders', { category, searchTerm: trimmedSearchTerm, error: error.message });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validate and transform data
      const transformedProviders = data
        .map(row => transformProviderRow(row))
        .filter((provider): provider is Provider => provider !== null);

      const validation = validateProviderArray(transformedProviders);
      if (!validation.isValid) {
        logDataInconsistency('searchProviders_validation', { 
          category, 
          searchTerm: trimmedSearchTerm,
          errors: validation.errors,
          originalCount: data.length,
          validCount: transformedProviders.length
        });
      }

      return transformedProviders;
    } catch (error) {
      logDataInconsistency('searchProviders_exception', { category, searchTerm }, error as Error);
      throw error;
    }
  },

  async getProviderById(id: number): Promise<Provider | null> {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid provider ID parameter');
      }

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        logDataInconsistency('getProviderById', { id, error: error.message });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      const transformedProvider = transformProviderRow(data);
      if (!transformedProvider) {
        logDataInconsistency('getProviderById_invalid', { id, data });
      }

      return transformedProvider;
    } catch (error) {
      logDataInconsistency('getProviderById_exception', { id }, error as Error);
      throw error;
    }
  }
};
