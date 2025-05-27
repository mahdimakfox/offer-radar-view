
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Plus, Play, FileText, Settings, Database, FileUp, Zap, Globe } from 'lucide-react';
import EndpointOverview from './EndpointManagement/EndpointOverview';
import AddNewEndpoint from './EndpointManagement/AddNewEndpoint';
import ImportBatchExecution from './EndpointManagement/ImportBatchExecution';
import EndpointLogs from './EndpointManagement/EndpointLogs';
import ApiIntegrations from './EndpointManagement/ApiIntegrations';
import FileImportPanel from './EndpointManagement/FileImportPanel';
import AutomatedImportPanel from './EndpointManagement/AutomatedImportPanel';
import AutomatedScrapingPanel from './EndpointManagement/AutomatedScrapingPanel';

const EndpointManagement = () => {
  const queryClient = useQueryClient();

  const handleExecutionComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
    queryClient.invalidateQueries({ queryKey: ['endpoint-logs'] });
  };

  const handleEndpointAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
  };

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['provider-endpoints'] });
    queryClient.invalidateQueries({ queryKey: ['endpoint-logs'] });
    queryClient.invalidateQueries({ queryKey: ['providers'] });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">
            <List className="w-4 h-4 mr-2" />
            Oversikt
          </TabsTrigger>
          <TabsTrigger value="scraping">
            <Globe className="w-4 h-4 mr-2" />
            Scraping
          </TabsTrigger>
          <TabsTrigger value="automated">
            <Zap className="w-4 h-4 mr-2" />
            Automatisert
          </TabsTrigger>
          <TabsTrigger value="file-import">
            <FileUp className="w-4 h-4 mr-2" />
            Fil-import
          </TabsTrigger>
          <TabsTrigger value="add-new">
            <Plus className="w-4 h-4 mr-2" />
            Legg til
          </TabsTrigger>
          <TabsTrigger value="execution">
            <Play className="w-4 h-4 mr-2" />
            Kjøring
          </TabsTrigger>
          <TabsTrigger value="all-data">
            <Database className="w-4 h-4 mr-2" />
            Alle data
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="w-4 h-4 mr-2" />
            Logger
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Settings className="w-4 h-4 mr-2" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EndpointOverview />
        </TabsContent>

        <TabsContent value="scraping">
          <Card>
            <CardHeader>
              <CardTitle>Automatisert Scraping og Import</CardTitle>
              <CardDescription>
                Komplett automatisert prosess som leser LEVERANDØRER.txt, scraper nettsider og lagrer data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomatedScrapingPanel onImportComplete={handleImportComplete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated">
          <AutomatedImportPanel onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="file-import">
          <Card>
            <CardHeader>
              <CardTitle>Import leverandører fra fil</CardTitle>
              <CardDescription>
                Automatisk opprettelse av endepunkter basert på LEVERANDØRER.txt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileImportPanel onImportComplete={handleImportComplete} />
            </CardContent>
          </Card>
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
