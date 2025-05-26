
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImportResult {
  success: boolean;
  message: string;
  providersImported?: number;
  errors?: string[];
}

const FileImport = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = [
    { value: 'strom', label: 'Strøm' },
    { value: 'internett', label: 'Internett' },
    { value: 'forsikring', label: 'Forsikring' },
    { value: 'bank', label: 'Bank' },
    { value: 'mobil', label: 'Mobil' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles);
      setResults([]);
    }
  };

  const parseProviderData = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const providers = [];

    for (const line of lines) {
      try {
        // Expected format: Name|Price|Rating|Description|URL|Pros|Cons
        const parts = line.split('|');
        if (parts.length >= 5) {
          const provider = {
            name: parts[0]?.trim(),
            price: parseFloat(parts[1]?.trim()) || 0,
            rating: parseFloat(parts[2]?.trim()) || 0,
            description: parts[3]?.trim() || '',
            external_url: parts[4]?.trim() || '',
            pros: parts[5] ? parts[5].split(',').map(p => p.trim()).filter(Boolean) : [],
            cons: parts[6] ? parts[6].split(',').map(c => c.trim()).filter(Boolean) : [],
            category: selectedCategory
          };
          
          if (provider.name && provider.external_url) {
            providers.push(provider);
          }
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    return providers;
  };

  const importFile = async (file: File): Promise<ImportResult> => {
    try {
      const content = await file.text();
      const providers = parseProviderData(content);

      if (providers.length === 0) {
        return {
          success: false,
          message: `No valid providers found in ${file.name}`
        };
      }

      // Insert providers into database
      const { data, error } = await supabase
        .from('providers')
        .insert(providers)
        .select();

      if (error) {
        return {
          success: false,
          message: `Error importing ${file.name}: ${error.message}`
        };
      }

      // Log the import
      await supabase.from('import_logs').insert({
        category: selectedCategory,
        total_providers: providers.length,
        successful_imports: data?.length || 0,
        failed_imports: providers.length - (data?.length || 0),
        import_status: 'completed'
      });

      return {
        success: true,
        message: `Successfully imported ${data?.length || 0} providers from ${file.name}`,
        providersImported: data?.length || 0
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: `Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const handleImport = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to import",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "No category selected",
        description: "Please select a category for the providers",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setResults([]);

    try {
      const importResults: ImportResult[] = [];
      
      for (const file of Array.from(files)) {
        const result = await importFile(file);
        importResults.push(result);
      }

      setResults(importResults);

      const successCount = importResults.filter(r => r.success).length;
      const totalProviders = importResults.reduce((sum, r) => sum + (r.providersImported || 0), 0);

      toast({
        title: "Import completed",
        description: `${successCount}/${importResults.length} files processed successfully. ${totalProviders} providers imported.`,
        variant: successCount === importResults.length ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Import process error:', error);
      toast({
        title: "Import failed",
        description: "An error occurred during the import process",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const clearFiles = () => {
    setFiles(null);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="files">Files (.txt)</Label>
          <Input
            ref={fileInputRef}
            id="files"
            type="file"
            accept=".txt"
            multiple
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {files && files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Files</CardTitle>
            <CardDescription>
              {files.length} file(s) selected for import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from(files).map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button
          onClick={handleImport}
          disabled={!files || files.length === 0 || !selectedCategory || importing}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{importing ? 'Importing...' : 'Import Files'}</span>
        </Button>

        {files && files.length > 0 && (
          <Button variant="outline" onClick={clearFiles}>
            Clear Files
          </Button>
        )}
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="flex-1 text-sm">{result.message}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">File Format</CardTitle>
          <CardDescription>
            Expected format for .txt files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm">
            <div>Name|Price|Rating|Description|URL|Pros|Cons</div>
            <div className="text-gray-600 mt-2">Example:</div>
            <div>Hafslund|299.99|4.5|Reliable power provider|https://hafslund.no|Stable supply,Good service|Higher price</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileImport;
