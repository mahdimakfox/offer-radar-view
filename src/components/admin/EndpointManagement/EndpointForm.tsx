
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

export default EndpointForm;
