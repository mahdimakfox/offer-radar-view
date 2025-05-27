
import EndpointFormContainer from './EndpointForm/EndpointFormContainer';

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
  return (
    <EndpointFormContainer 
      endpoint={endpoint}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
};

export default EndpointForm;
