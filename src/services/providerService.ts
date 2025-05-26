
import { supabase } from '@/integrations/supabase/client';

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

export const providerService = {
  async getProvidersByCategory(category: string): Promise<Provider[]> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('category', category)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching providers:', error);
      return [];
    }

    return data || [];
  },

  async searchProviders(category: string, searchTerm: string): Promise<Provider[]> {
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

    return data || [];
  },

  async getProviderById(id: number): Promise<Provider | null> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching provider:', error);
      return null;
    }

    return data;
  }
};
