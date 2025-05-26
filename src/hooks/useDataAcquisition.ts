
import { useState } from 'react';
import { dataAcquisitionService } from '@/services/dataAcquisitionService';
import { useToast } from '@/hooks/use-toast';

export const useDataAcquisition = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const importData = async (category: string, apiMappingId?: string) => {
    setLoading(true);
    
    try {
      // Hent API-mappings
      const mappings = await dataAcquisitionService.getApiMappings();
      
      let targetMapping = mappings.find(m => m.id === apiMappingId);
      
      // Hvis ingen spesifikk mapping er valgt, bruk første tilgjengelige
      if (!targetMapping && mappings.length > 0) {
        targetMapping = mappings[0];
      }
      
      if (!targetMapping) {
        throw new Error('Ingen API-mapping funnet');
      }

      const results = await dataAcquisitionService.importProvidersFromApi(targetMapping, category);
      
      toast({
        title: "Import fullført",
        description: `Importerte ${results.success} leverandører. ${results.failed} feilet.`
      });
      
      return results;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import feilet",
        description: error.message,
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
