
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EndpointForm from './EndpointForm';

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

interface EndpointEditDialogProps {
  endpoint: ProviderEndpoint | null;
  onClose: () => void;
  onSave: () => void;
}

const EndpointEditDialog = ({ endpoint, onClose, onSave }: EndpointEditDialogProps) => {
  if (!endpoint) return null;

  return (
    <Dialog open={!!endpoint} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger endpoint</DialogTitle>
          <DialogDescription>Oppdater endpoint-konfigurasjon</DialogDescription>
        </DialogHeader>
        <EndpointForm 
          endpoint={endpoint}
          onSave={onSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EndpointEditDialog;
