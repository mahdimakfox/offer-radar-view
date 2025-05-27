
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface FormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const FormFields = ({ formData, setFormData }: FormFieldsProps) => {
  return (
    <>
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
    </>
  );
};

export default FormFields;
