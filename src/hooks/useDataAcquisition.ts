
import { useState } from 'react';
import { dataAcquisitionService } from '@/services/dataAcquisitionService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { PROVIDER_QUERY_KEYS } from './queries/providerQueryKeys';

export const useDataAcquisition = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importData = async (category: string, apiMappingId?: string) => {
    setLoading(true);
    
    try {
      console.log(`Starting import for category: ${category}, mapping: ${apiMappingId}`);
      
      // Hent API-mappings
      const mappings = await dataAcquisitionService.getApiMappings();
      console.log(`Found ${mappings.length} API mappings`);
      
      let targetMapping = mappings.find(m => m.id === apiMappingId);
      
      // Hvis ingen spesifikk mapping er valgt, bruk første tilgjengelige
      if (!targetMapping && mappings.length > 0) {
        targetMapping = mappings[0];
        console.log(`No specific mapping selected, using: ${targetMapping.provider_name}`);
      }
      
      if (!targetMapping) {
        throw new Error('Ingen API-mapping funnet');
      }

      console.log(`Importing from ${targetMapping.provider_name} for category ${category}`);
      const results = await dataAcquisitionService.importProvidersFromApi(targetMapping, category);
      
      // Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ 
        queryKey: PROVIDER_QUERY_KEYS.category(category) 
      });
      await queryClient.invalidateQueries({ 
        queryKey: PROVIDER_QUERY_KEYS.counts() 
      });
      
      const successMessage = `Importerte ${results.success} leverandører${results.failed > 0 ? `, ${results.failed} feilet` : ''}`;
      
      toast({
        title: "Import fullført",
        description: successMessage,
        variant: results.failed === 0 ? "default" : "destructive"
      });
      
      // Log detailed results if there were errors
      if (results.errors.length > 0) {
        console.warn('Import errors:', results.errors);
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukjent feil';
      console.error('Import error:', error);
      
      toast({
        title: "Import feilet",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    importData,
    loading
  };
};
