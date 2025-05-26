
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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
  created_at?: string;
  updated_at?: string;
}

// Use the Supabase generated type for providers table
type ProviderRow = Tables<'providers'>;

export const providerService = {
  async getProvidersByCategory(category: string): Promise<Provider[]> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('category', category)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching providers:', error);
        return [];
      }

      return (data || []).map((row: ProviderRow) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        logo_url: row.logo_url || undefined,
        rating: Number(row.rating),
        description: row.description,
        external_url: row.external_url,
        pros: row.pros || undefined,
        cons: row.cons || undefined,
        created_at: row.created_at || undefined,
        updated_at: row.updated_at || undefined,
      }));
    } catch (error) {
      console.error('Service error:', error);
      return [];
    }
  },

  async searchProviders(category: string, searchTerm: string): Promise<Provider[]> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('category', category)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error searching providers:', error);
        return [];
      }

      return (data || []).map((row: ProviderRow) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        logo_url: row.logo_url || undefined,
        rating: Number(row.rating),
        description: row.description,
        external_url: row.external_url,
        pros: row.pros || undefined,
        cons: row.cons || undefined,
        created_at: row.created_at || undefined,
        updated_at: row.updated_at || undefined,
      }));
    } catch (error) {
      console.error('Service error:', error);
      return [];
    }
  },

  async getProviderById(id: number): Promise<Provider | null> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching provider:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        category: data.category,
        price: Number(data.price),
        logo_url: data.logo_url || undefined,
        rating: Number(data.rating),
        description: data.description,
        external_url: data.external_url,
        pros: data.pros || undefined,
        cons: data.cons || undefined,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined,
      };
    } catch (error) {
      console.error('Service error:', error);
      return null;
    }
  }
};
