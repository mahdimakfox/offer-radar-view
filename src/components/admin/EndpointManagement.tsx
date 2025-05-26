
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Play, Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

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
      toast({ title: "Endpoint updated", description: "Status has been changed successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update endpoint: ${error.message}`, variant: "destructive" });
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
      toast({ title: "Endpoint deleted", description: "Endpoint has been removed successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete endpoint: ${error.message}`, variant: "destructive" });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (endpoint: ProviderEndpoint) => {
    if (!endpoint.is_active) {
      return <Badge variant="secondary">Inaktiv</Badge>;
    }
    
    if (endpoint.failure_count > 5) {
      return <Badge variant="destructive">Høy feilrate</Badge>;
    }
    
    if (endpoint.success_rate >= 90) {
      return <Badge variant="default" className="bg-green-500">Bra</Badge>;
    }
    
    if (endpoint.success_rate >= 70) {
      return <Badge variant="outline">OK</Badge>;
    }
    
    return <Badge variant="destructive">Problemer</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Endpoint Management</h2>
          <p className="text-gray-600">Manage API and scraping endpoints for data collection</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Endpoint</DialogTitle>
              <DialogDescription>Configure a new API or scraping endpoint for data collection</DialogDescription>
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
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="category">Filter by category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configured Endpoints</CardTitle>
              <CardDescription>
                {endpoints.length} endpoints configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {endpointsLoading ? (
                <div className="text-center py-8">Loading endpoints...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Last Success</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpoints.map((endpoint) => (
                      <TableRow key={endpoint.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{endpoint.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-48">{endpoint.url}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{endpoint.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={endpoint.endpoint_type === 'api' ? 'default' : 'secondary'}>
                            {endpoint.endpoint_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{endpoint.priority}</TableCell>
                        <TableCell>{getStatusBadge(endpoint)}</TableCell>
                        <TableCell>
                          {endpoint.total_requests > 0 ? `${endpoint.success_rate}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {endpoint.last_success_at ? formatDate(endpoint.last_success_at) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={endpoint.is_active}
                              onCheckedChange={(checked) => 
                                toggleEndpointMutation.mutate({ id: endpoint.id, isActive: checked })
                              }
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEndpoint(endpoint)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteEndpointMutation.mutate(endpoint.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Execution Logs</CardTitle>
              <CardDescription>Last 50 endpoint executions</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">Loading logs...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Providers</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const endpoint = endpoints.find(e => e.id === log.endpoint_id);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.created_at)}</TableCell>
                          <TableCell>{endpoint?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.execution_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.status === 'success' ? 'default' : 'destructive'}
                              className={log.status === 'success' ? 'bg-green-500' : ''}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.providers_saved}/{log.providers_fetched}
                            {log.duplicates_found > 0 && (
                              <span className="text-sm text-gray-500"> (+{log.duplicates_found} dup)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.execution_time_ms ? `${log.execution_time_ms}ms` : 'N/A'}
                          </TableCell>
                          <TableCell className="max-w-48 truncate">
                            {log.error_message || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
              <DialogTitle>Edit Endpoint</DialogTitle>
              <DialogDescription>Update endpoint configuration</DialogDescription>
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

// Form component for adding/editing endpoints
const EndpointForm = ({ 
  endpoint, 
  onSave, 
  onCancel 
}: { 
  endpoint?: ProviderEndpoint; 
  onSave: () => void; 
  onCancel: () => void; 
}) => {
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strom">Strøm</SelectItem>
              <SelectItem value="forsikring">Forsikring</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="mobil">Mobil</SelectItem>
              <SelectItem value="internett">Internett</SelectItem>
              <SelectItem value="boligalarm">Boligalarm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="endpoint_type">Type</Label>
          <Select value={formData.endpoint_type} onValueChange={(value: 'api' | 'scraping') => setFormData({ ...formData, endpoint_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="scraping">Scraping</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="auth_required"
            checked={formData.auth_required}
            onCheckedChange={(checked) => setFormData({ ...formData, auth_required: checked })}
          />
          <Label htmlFor="auth_required">Requires Authentication</Label>
        </div>
      </div>

      {formData.auth_required && (
        <div>
          <Label htmlFor="auth_config">Authentication Config (JSON)</Label>
          <Textarea
            id="auth_config"
            value={formData.auth_config}
            onChange={(e) => setFormData({ ...formData, auth_config: e.target.value })}
            placeholder='{"apiKey": "your-api-key", "headers": {"Authorization": "Bearer token"}}'
            rows={3}
          />
        </div>
      )}

      {formData.endpoint_type === 'scraping' && (
        <div>
          <Label htmlFor="scraping_config">Scraping Config (JSON)</Label>
          <Textarea
            id="scraping_config"
            value={formData.scraping_config}
            onChange={(e) => setFormData({ ...formData, scraping_config: e.target.value })}
            placeholder='{"selectors": {"name": ".provider-name", "price": ".price-value"}, "waitTime": 2000}'
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveEndpointMutation.isPending}>
          {saveEndpointMutation.isPending ? 'Saving...' : (endpoint ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default EndpointManagement;
