
import { supabase } from '@/integrations/supabase/client';
import { RealApiProvider } from '../realApiService';

const calculateContentHash = (provider: RealApiProvider): string => {
  const normalizedData = {
    name: provider.name.trim().toLowerCase(),
    price: provider.price,
    rating: provider.rating,
    description: provider.description.trim().toLowerCase(),
    external_url: provider.external_url.trim(),
    org_number: provider.org_number?.trim()
  };
  
  const dataString = JSON.stringify(normalizedData);
  return btoa(dataString).slice(0, 32);
};

export const insertProviderWithDuplicateDetection = async (
  provider: RealApiProvider, 
  category: string, 
  sourceEndpointId: string
): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'duplicate' | 'failed'; error?: string }> => {
  try {
    console.log(`Processing provider: ${provider.name} for category: ${category}`);
    
    const contentHash = calculateContentHash(provider);
    
    // Use UPSERT with the new unique constraint
    const { data: upsertedProvider, error: upsertError } = await supabase
      .from('providers')
      .upsert({
        name: provider.name,
        provider_name: provider.name,
        category: category,
        price: provider.price,
        rating: provider.rating,
        description: provider.description,
        external_url: provider.external_url,
        org_number: provider.org_number,
        logo_url: provider.logo_url,
        pros: provider.pros,
        cons: provider.cons,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name,category',
        ignoreDuplicates: false
      })
      .select('id, created_at, updated_at')
      .single();

    if (upsertError) {
      console.error('Error upserting provider:', upsertError);
      return { 
        success: false, 
        error: upsertError.message,
        action: 'failed'
      };
    }

    // Check if this is a duplicate by looking at content hash
    const { data: existingDuplicate, error: duplicateError } = await supabase
      .from('provider_duplicates')
      .select('id')
      .eq('provider_id', upsertedProvider.id)
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (duplicateError) {
      console.error('Error checking duplicate:', duplicateError);
    }

    if (existingDuplicate) {
      console.log(`Duplicate content detected for provider: ${provider.name}`);
      return { success: true, action: 'duplicate' };
    }

    // Record the new content hash
    const { error: duplicateInsertError } = await supabase
      .from('provider_duplicates')
      .insert({
        provider_id: upsertedProvider.id,
        content_hash: contentHash,
        original_source: sourceEndpointId
      });

    if (duplicateInsertError) {
      console.error('Error recording duplicate:', duplicateInsertError);
    }

    // Determine if this was an insert or update based on created_at vs updated_at
    const wasUpdate = new Date(upsertedProvider.created_at).getTime() !== new Date(upsertedProvider.updated_at).getTime();
    const action = wasUpdate ? 'updated' : 'inserted';
    
    console.log(`${action} provider: ${provider.name}`);
    return { success: true, action };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      action: 'failed'
    };
  }
};
