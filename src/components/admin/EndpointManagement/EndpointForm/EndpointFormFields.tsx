
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EndpointFormFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

const EndpointFormFields = ({ form, isEditing }: EndpointFormFieldsProps) => {
  const categories = ['strom', 'forsikring', 'bank', 'mobil', 'internett', 'boligalarm'];

  const generateUrl = async () => {
    const providerName = form.getValues('provider_name');
    const category = form.getValues('category');
    
    if (!providerName || !category) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('generate_provider_url', {
        provider_name: providerName,
        category: category
      });

      if (!error && data) {
        form.setValue('url', data);
        form.setValue('auto_generated_url', true);
      }
    } catch (error) {
      console.error('Error generating URL:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Telenor Mobil API" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="provider_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Telenor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endpoint_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="scraping">Web Scraping</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input 
                  placeholder="https://example.com/api/endpoint" 
                  {...field} 
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateUrl}
                disabled={!form.getValues('provider_name') || !form.getValues('category')}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority (1-100)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="100" 
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Active</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="auth_required"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Requires Authentication</FormLabel>
            </FormItem>
          )}
        />
      </div>

      {form.watch('auth_required') && (
        <FormField
          control={form.control}
          name="auth_config"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Config (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"apiKey": "your-api-key", "headers": {"Authorization": "Bearer token"}}'
                  className="font-mono"
                  rows={4}
                  value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {form.watch('endpoint_type') === 'scraping' && (
        <>
          <FormField
            control={form.control}
            name="scraping_config"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scraping Config (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"selectors": {"name": ".provider-name", "price": ".price-value"}, "waitTime": 2000}'
                    className="font-mono"
                    rows={4}
                    value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        field.onChange(parsed);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="playwright_config"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Playwright Config (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"headless": true, "viewport": {"width": 1280, "height": 720}, "userAgent": "..."}'
                    className="font-mono"
                    rows={4}
                    value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        field.onChange(parsed);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default EndpointFormFields;
