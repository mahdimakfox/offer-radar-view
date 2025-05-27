
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EndpointsTable from './EndpointsTable';

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

const EndpointOverview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];

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

  // Calculate summary statistics
  const activeEndpoints = endpoints.filter(e => e.is_active);
  const inactiveEndpoints = endpoints.filter(e => !e.is_active);
  const highFailureEndpoints = endpoints.filter(e => e.failure_count > 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt endepunkter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEndpoints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inaktive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveEndpoints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Problemer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highFailureEndpoints.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="category">Filtrer etter kategori:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle kategorier</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Oppdater
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurerte endepunkter</CardTitle>
          <CardDescription>
            {endpoints.length} endepunkter konfigurert
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Laster endepunkter...</div>
          ) : (
            <EndpointsTable
              endpoints={endpoints}
              onToggleActive={(id, isActive) => toggleEndpointMutation.mutate({ id, isActive })}
              onEdit={() => {}} // Will be handled by parent component
              onDelete={(id) => deleteEndpointMutation.mutate(id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointOverview;
