
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { List, Plus, Play, FileText, Settings, Database } from 'lucide-react';
import EndpointOverview from './EndpointManagement/EndpointOverview';
import AddNewEndpoint from './EndpointManagement/AddNewEndpoint';
import ImportBatchExecution from './EndpointManagement/ImportBatchExecution';
import EndpointLogs from './EndpointManagement/EndpointLogs';
import ApiIntegrations from './EndpointManagement/ApiIntegrations';
import EndpointForm from './EndpointManagement/EndpointForm';

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

const EndpointManagement = () => {
  const queryClient = useQueryClient();
  const [editingEndpoint, setEditingEndpoint] = useState<ProviderEndpoint | null>(null);

  const handleExecutionComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
    queryClient.invalidateQueries({ queryKey: ['endpoint-logs'] });
  };

  const handleEndpointAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <List className="w-4 h-4 mr-2" />
            Endepunktoversikt
          </TabsTrigger>
          <TabsTrigger value="add-new">
            <Plus className="w-4 h-4 mr-2" />
            Legg til nytt endepunkt
          </TabsTrigger>
          <TabsTrigger value="execution">
            <Play className="w-4 h-4 mr-2" />
            Import/Batch-kjøring
          </TabsTrigger>
          <TabsTrigger value="all-data">
            <Database className="w-4 h-4 mr-2" />
            Hent alle data
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="w-4 h-4 mr-2" />
            Logg
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Settings className="w-4 h-4 mr-2" />
            API-integrasjoner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EndpointOverview />
        </TabsContent>

        <TabsContent value="add-new">
          <AddNewEndpoint onEndpointAdded={handleEndpointAdded} />
        </TabsContent>

        <TabsContent value="execution">
          <ImportBatchExecution onExecutionComplete={handleExecutionComplete} />
        </TabsContent>

        <TabsContent value="all-data">
          <Card>
            <CardHeader>
              <CardTitle>Hent alle data</CardTitle>
              <CardDescription>
                Utfør import fra alle aktive endepunkter på tvers av kategorier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportBatchExecution 
                onExecutionComplete={handleExecutionComplete} 
                showAllDataOption={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <EndpointLogs />
        </TabsContent>

        <TabsContent value="integrations">
          <ApiIntegrations />
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
                queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
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
