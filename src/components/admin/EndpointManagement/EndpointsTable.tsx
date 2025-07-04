
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Globe, Code, Wand2 } from 'lucide-react';

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

interface EndpointsTableProps {
  endpoints: ProviderEndpoint[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (endpoint: ProviderEndpoint) => void;
  onDelete: (id: string) => void;
}

const EndpointsTable = ({ endpoints, onToggleActive, onEdit, onDelete }: EndpointsTableProps) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name / Provider</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>Data Count</TableHead>
          <TableHead>Last Success</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {endpoints.map((endpoint) => (
          <TableRow key={endpoint.id}>
            <TableCell>
              <div>
                <div className="font-medium flex items-center">
                  {endpoint.name}
                  {endpoint.auto_generated_url && (
                    <span title="Auto-generated URL">
                      <Wand2 className="w-3 h-3 ml-1 text-blue-500" />
                    </span>
                  )}
                </div>
                {endpoint.provider_name && (
                  <div className="text-sm text-gray-500">{endpoint.provider_name}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{endpoint.category}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                {endpoint.endpoint_type === 'api' ? (
                  <Code className="w-4 h-4 mr-1" />
                ) : (
                  <Globe className="w-4 h-4 mr-1" />
                )}
                <Badge variant={endpoint.endpoint_type === 'api' ? 'default' : 'secondary'}>
                  {endpoint.endpoint_type}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div className="max-w-48 truncate text-sm" title={endpoint.url}>
                {endpoint.url}
              </div>
            </TableCell>
            <TableCell>{endpoint.priority}</TableCell>
            <TableCell>{getStatusBadge(endpoint)}</TableCell>
            <TableCell>
              {endpoint.total_requests > 0 ? `${endpoint.success_rate}%` : 'N/A'}
            </TableCell>
            <TableCell>
              {endpoint.endpoint_type === 'scraping' ? (
                <Badge variant="outline">
                  {endpoint.scraped_data_count || 0} scraped
                </Badge>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              {endpoint.last_success_at ? formatDate(endpoint.last_success_at) : 'Never'}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={endpoint.is_active}
                  onCheckedChange={(checked) => onToggleActive(endpoint.id, checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(endpoint)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(endpoint.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EndpointsTable;
