
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import FileImport from '@/components/admin/FileImport';
import ApiImport from '@/components/admin/ApiImport';
import ImportLogs from '@/components/admin/ImportLogs';
import EndpointManagement from '@/components/admin/EndpointManagement';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Admin = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage provider data imports, API integrations, and endpoint configurations
          </p>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints">Endpoint Management</TabsTrigger>
            <TabsTrigger value="file-import">File Import</TabsTrigger>
            <TabsTrigger value="api-import">API Import</TabsTrigger>
            <TabsTrigger value="logs">Import Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Management</CardTitle>
                <CardDescription>
                  Configure and manage API and scraping endpoints for data collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EndpointManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file-import">
            <Card>
              <CardHeader>
                <CardTitle>File Import</CardTitle>
                <CardDescription>
                  Upload .txt files to import provider data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileImport />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-import">
            <Card>
              <CardHeader>
                <CardTitle>API Import</CardTitle>
                <CardDescription>
                  Fetch real-time data from provider APIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiImport />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Import Logs</CardTitle>
                <CardDescription>
                  Monitor import activities and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImportLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
