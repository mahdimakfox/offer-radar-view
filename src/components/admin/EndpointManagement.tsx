
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Plus, Play, FileText, Settings, Database } from 'lucide-react';
import EndpointOverview from './EndpointManagement/EndpointOverview';
import AddNewEndpoint from './EndpointManagement/AddNewEndpoint';
import ImportBatchExecution from './EndpointManagement/ImportBatchExecution';
import EndpointLogs from './EndpointManagement/EndpointLogs';
import ApiIntegrations from './EndpointManagement/ApiIntegrations';

const EndpointManagement = () => {
  const queryClient = useQueryClient();

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
              <ImportBatchExecution onExecutionComplete={handleExecutionComplete} />
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
    </div>
  );
};

export default EndpointManagement;
