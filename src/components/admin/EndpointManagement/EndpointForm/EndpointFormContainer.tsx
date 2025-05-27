
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EndpointFormFields from './EndpointFormFields';
import FormActions from './FormActions';

const endpointSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider_name: z.string().min(1, 'Provider name is required'),
  category: z.string().min(1, 'Category is required'),
  endpoint_type: z.enum(['api', 'scraping']),
  url: z.string().url('Please enter a valid URL'),
  priority: z.number().min(1).max(100),
  is_active: z.boolean(),
  auth_required: z.boolean(),
  auth_config: z.any().optional(),
  scraping_config: z.any().optional(),
  playwright_config: z.any().optional(),
  auto_generated_url: z.boolean().default(false)
});

type EndpointFormData = z.infer<typeof endpointSchema>;

interface ProviderEndpoint {
  id: string;
  category: string;
  name: string;
  provider_name?: string;
  endpoint_type: 'api' | 'scraping';
  url: string;
  priority: number;
  is_active: boolean;
  auth_required: boolean;
  auth_config?: any;
  scraping_config?: any;
  playwright_config?: any;
  auto_generated_url?: boolean;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  total_requests: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

interface EndpointFormContainerProps {
  endpoint?: ProviderEndpoint;
  onSave: () => void;
  onCancel: () => void;
}

const EndpointFormContainer = ({ endpoint, onSave, onCancel }: EndpointFormContainerProps) => {
  const { toast } = useToast();
  const isEditing = !!endpoint;

  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      name: endpoint?.name || '',
      provider_name: endpoint?.provider_name || '',
      category: endpoint?.category || '',
      endpoint_type: endpoint?.endpoint_type || 'api',
      url: endpoint?.url || '',
      priority: endpoint?.priority || 1,
      is_active: endpoint?.is_active ?? true,
      auth_required: endpoint?.auth_required || false,
      auth_config: endpoint?.auth_config || {},
      scraping_config: endpoint?.scraping_config || {},
      playwright_config: endpoint?.playwright_config || {},
      auto_generated_url: endpoint?.auto_generated_url || false
    }
  });

  const saveEndpointMutation = useMutation({
    mutationFn: async (data: EndpointFormData) => {
      const endpointData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error } = await supabase
          .from('provider_endpoints')
          .update(endpointData)
          .eq('id', endpoint.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('provider_endpoints')
          .insert({
            ...endpointData,
            created_at: new Date().toISOString()
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Endpoint updated" : "Endpoint created",
        description: `The endpoint has been ${isEditing ? 'updated' : 'created'} successfully.`
      });
      onSave();
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: `Failed to ${isEditing ? 'update' : 'create'} endpoint: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EndpointFormData) => {
    console.log('Submitting endpoint data:', data);
    saveEndpointMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EndpointFormFields form={form} isEditing={isEditing} />
        <FormActions 
          onCancel={onCancel}
          isLoading={saveEndpointMutation.isPending}
          isEditing={isEditing}
        />
      </form>
    </Form>
  );
};

export default EndpointFormContainer;
