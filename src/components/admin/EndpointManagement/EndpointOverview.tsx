
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EndpointStats from './EndpointStats';
import EndpointFilters from './EndpointFilters';
import EndpointList from './EndpointList';
import EndpointEditDialog from './EndpointEditDialog';

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
  scraped_data_count?: number;
  created_at: string;
  updated_at: string;
}

const EndpointOverview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingEndpoint, setEditingEndpoint] = useState<ProviderEndpoint | null>(null);

  // Fetch endpoints
  const { data: endpoints = [], isLoading, refetch } = useQuery({
    queryKey: ['provider-endpoints', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('provider_endpoints').select('*').order('category', { ascending: true }).order('priority', { ascending: true });
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ProviderEndpoint[];
    }
  });

  // Toggle endpoint active status
  const toggleEndpointMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('provider_endpoints')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
      toast({ title: "Endpoint oppdatert", description: "Status er endret." });
    },
    onError: (error) => {
      toast({ title: "Feil", description: `Kunne ikke oppdatere endpoint: ${error.message}`, variant: "destructive" });
    }
  });

  // Delete endpoint
  const deleteEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('provider_endpoints').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
      toast({ title: "Endpoint slettet", description: "Endpoint er fjernet." });
    },
    onError: (error) => {
      toast({ title: "Feil", description: `Kunne ikke slette endpoint: ${error.message}`, variant: "destructive" });
    }
  });

  const handleEdit = (endpoint: ProviderEndpoint) => {
    setEditingEndpoint(endpoint);
  };

  const handleEditSave = () => {
    setEditingEndpoint(null);
    queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
  };

  const handleEditClose = () => {
    setEditingEndpoint(null);
  };

  return (
    <div className="space-y-6">
      <EndpointStats endpoints={endpoints} />

      <EndpointFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRefresh={() => refetch()}
      />

      <EndpointList
        endpoints={endpoints}
        isLoading={isLoading}
        onToggleActive={(id, isActive) => toggleEndpointMutation.mutate({ id, isActive })}
        onEdit={handleEdit}
        onDelete={(id) => deleteEndpointMutation.mutate(id)}
      />

      <EndpointEditDialog
        endpoint={editingEndpoint}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default EndpointOverview;
