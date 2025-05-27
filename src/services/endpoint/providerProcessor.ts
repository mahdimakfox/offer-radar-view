
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
    console.log(`Processing provider: ${provider.name}`);
    
    const contentHash = calculateContentHash(provider);
    
    const { data: existingProvider, error: selectError } = await supabase
      .from('providers')
      .select('id')
      .eq('name', provider.name)
      .eq('category', category)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing provider:', selectError);
      throw selectError;
    }

    if (existingProvider) {
      const { data: existingDuplicate, error: duplicateError } = await supabase
        .from('provider_duplicates')
        .select('id')
        .eq('provider_id', existingProvider.id)
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (duplicateError) {
        console.error('Error checking duplicate:', duplicateError);
      }

      if (existingDuplicate) {
        console.log(`Duplicate content detected for provider: ${provider.name}`);
        return { success: true, action: 'duplicate' };
      }

      const { error: updateError } = await supabase
        .from('providers')
        .update({
          price: provider.price,
          rating: provider.rating,
          description: provider.description,
          external_url: provider.external_url,
          org_number: provider.org_number,
          logo_url: provider.logo_url,
          pros: provider.pros,
          cons: provider.cons,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProvider.id);

      if (updateError) {
        console.error('Error updating provider:', updateError);
        throw updateError;
      }

      const { error: duplicateInsertError } = await supabase
        .from('provider_duplicates')
        .insert({
          provider_id: existingProvider.id,
          content_hash: contentHash,
          original_source: sourceEndpointId
        });

      if (duplicateInsertError) {
        console.error('Error recording duplicate:', duplicateInsertError);
      }

      console.log(`Updated existing provider: ${provider.name}`);
      return { success: true, action: 'updated' };
    } else {
      const { data: insertedProvider, error: insertError } = await supabase
        .from('providers')
        .insert({
          name: provider.name,
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
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting provider:', insertError);
        throw insertError;
      }

      const { error: duplicateInsertError } = await supabase
        .from('provider_duplicates')
        .insert({
          provider_id: insertedProvider.id,
          content_hash: contentHash,
          original_source: sourceEndpointId
        });

      if (duplicateInsertError) {
        console.error('Error recording initial duplicate:', duplicateInsertError);
      }

      console.log(`Inserted new provider: ${provider.name}`);
      return { success: true, action: 'inserted' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      action: 'failed'
    };
  }
};
