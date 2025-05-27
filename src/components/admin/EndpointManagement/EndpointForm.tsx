
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FormFields from './EndpointForm/FormFields';
import FormActions from './EndpointForm/FormActions';

interface ProviderEndpoint {
  id: string;
  category: string;
  name: string;
  endpoint_type: 'api' | 'scraping';
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: any;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

interface EndpointFormProps {
  endpoint?: ProviderEndpoint;
  onSave: () => void;
  onCancel: () => void;
}

const EndpointForm = ({ endpoint, onSave, onCancel }: EndpointFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: endpoint?.name || '',
    category: endpoint?.category || 'strom',
    endpoint_type: endpoint?.endpoint_type || 'api',
    url: endpoint?.url || '',
    priority: endpoint?.priority || 1,
    is_active: endpoint?.is_active ?? true,
    auth_required: endpoint?.auth_required || false,
    auth_config: endpoint?.auth_config ? JSON.stringify(endpoint.auth_config, null, 2) : '',
    scraping_config: endpoint?.scraping_config ? JSON.stringify(endpoint.scraping_config, null, 2) : ''
  });

  const saveEndpointMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        auth_config: data.auth_config ? JSON.parse(data.auth_config) : null,
        scraping_config: data.scraping_config ? JSON.parse(data.scraping_config) : null,
        updated_at: new Date().toISOString()
      };

      if (endpoint) {
        const { error } = await supabase
          .from('provider_endpoints')
          .update(payload)
          .eq('id', endpoint.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('provider_endpoints')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
      toast({ 
        title: endpoint ? "Endpoint updated" : "Endpoint created", 
        description: "Changes saved successfully." 
      });
      onSave();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to save endpoint: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveEndpointMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormFields formData={formData} setFormData={setFormData} />
      <FormActions 
        onCancel={onCancel} 
        isLoading={saveEndpointMutation.isPending}
        isEditing={!!endpoint}
      />
    </form>
  );
};

export default EndpointForm;
