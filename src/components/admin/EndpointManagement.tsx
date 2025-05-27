
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Activity } from 'lucide-react';
import EndpointForm from './EndpointManagement/EndpointForm';
import EndpointsTable from './EndpointManagement/EndpointsTable';
import ExecutionLogsTable from './EndpointManagement/ExecutionLogsTable';
import EndpointExecutionPanel from './EndpointManagement/EndpointExecutionPanel';

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

interface ExecutionLog {
  id: string;
  endpoint_id: string;
  execution_type: 'manual' | 'scheduled' | 'fallback';
  status: 'success' | 'failure' | 'timeout' | 'error';
  providers_fetched: number;
  providers_saved: number;
  duplicates_found: number;
  execution_time_ms?: number;
  error_message?: string;
  created_at: string;
}

const EndpointManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ProviderEndpoint | null>(null);

  const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];

  // Fetch endpoints
  const { data: endpoints = [], isLoading: endpointsLoading, refetch: refetchEndpoints } = useQuery({
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

  // Fetch execution logs
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['endpoint-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('endpoint_execution_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ExecutionLog[];
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

  const handleExecutionComplete = () => {
    refetchEndpoints();
    queryClient.invalidateQueries({ queryKey: ['endpoint-logs'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Endpoint Management</h2>
          <p className="text-gray-600">Administrer API- og scraping-endepunkter for datainnsamling</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Legg til endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Legg til nytt endpoint</DialogTitle>
              <DialogDescription>Konfigurer et nytt API- eller scraping-endpoint for datainnsamling</DialogDescription>
            </DialogHeader>
            <EndpointForm 
              onSave={() => {
                setIsAddDialogOpen(false);
                refetchEndpoints();
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">
            <Settings className="w-4 h-4 mr-2" />
            Endepunkter
          </TabsTrigger>
          <TabsTrigger value="execution">
            <Activity className="w-4 h-4 mr-2" />
            Utførelse
          </TabsTrigger>
          <TabsTrigger value="logs">Logg</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Konfigurerte endepunkter</CardTitle>
              <CardDescription>
                {endpoints.length} endepunkter konfigurert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {endpointsLoading ? (
                <div className="text-center py-8">Laster endepunkter...</div>
              ) : (
                <EndpointsTable
                  endpoints={endpoints}
                  onToggleActive={(id, isActive) => toggleEndpointMutation.mutate({ id, isActive })}
                  onEdit={setEditingEndpoint}
                  onDelete={(id) => deleteEndpointMutation.mutate(id)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <div className="space-y-4">
            {endpoints.filter(endpoint => endpoint.is_active).map(endpoint => (
              <EndpointExecutionPanel
                key={endpoint.id}
                endpoint={endpoint}
                onExecutionComplete={handleExecutionComplete}
              />
            ))}
            
            {endpoints.filter(endpoint => endpoint.is_active).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Ingen aktive endepunkter funnet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Aktiver endepunkter i "Endepunkter" fanen for å kunne utføre dem
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nylige utførelseslogger</CardTitle>
              <CardDescription>De siste 50 endpoint-utførelsene</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">Laster logger...</div>
              ) : (
                <ExecutionLogsTable logs={logs} endpoints={endpoints} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingEndpoint && (
        <Dialog open={!!editingEndpoint} onOpenChange={() => setEditingEndpoint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rediger endpoint</DialogTitle>
              <DialogDescription>Oppdater endpoint-konfigurasjon</DialogDescription>
            </DialogHeader>
            <EndpointForm 
              endpoint={editingEndpoint}
              onSave={() => {
                setEditingEndpoint(null);
                refetchEndpoints();
              }}
              onCancel={() => setEditingEndpoint(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EndpointManagement;
