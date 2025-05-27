
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Zap, Clock, TrendingUp } from 'lucide-react';
import { endpointService } from '@/services/endpointService';

interface ExecutionResult {
  success: boolean;
  providers: any[];
  error?: string;
  executionTimeMs: number;
  providersFetched: number;
  providersSaved: number;
  duplicatesFound: number;
  usedFallback?: boolean;
  retriedCount?: number;
}

interface CategoryExecutionPanelProps {
  onExecutionComplete: () => void;
}

const CategoryExecutionPanel: React.FC<CategoryExecutionPanelProps> = ({ 
  onExecutionComplete 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const { toast } = useToast();

  const categories = [
    { value: 'strom', label: 'Strøm' },
    { value: 'forsikring', label: 'Forsikring' },
    { value: 'bank', label: 'Bank' },
    { value: 'mobil', label: 'Mobil' },
    { value: 'internett', label: 'Internett' },
    { value: 'boligalarm', label: 'Boligalarm' }
  ];

  const executeCategory = async () => {
    if (!selectedCategory) return;
    
    setExecuting(true);
    setProgress(0);
    setResults([]);
    setCurrentOperation(`Executing endpoints for ${selectedCategory}...`);

    try {
      const result = await endpointService.executeWithFallback(selectedCategory);
      
      setResults([result]);
      setProgress(100);
      setCurrentOperation('Completed');

      const message = `${selectedCategory}: ${result.providersFetched} fetched, ${result.providersSaved} saved${result.duplicatesFound ? `, ${result.duplicatesFound} duplicates` : ''}`;
      
      if (result.success) {
        toast({
          title: "Category execution completed",
          description: message + (result.usedFallback ? ' (used fallback)' : ''),
          variant: result.usedFallback ? "destructive" : "default"
        });
      } else {
        toast({
          title: "Category execution failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      }
      
      onExecutionComplete();
    } catch (error) {
      console.error('Category execution error:', error);
      toast({
        title: "Execution error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setExecuting(false);
    }
  };

  const executeAllCategories = async () => {
    setExecuting(true);
    setProgress(0);
    setResults([]);
    setCurrentOperation('Starting batch execution...');

    const allResults: ExecutionResult[] = [];
    
    try {
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        setCurrentOperation(`Processing ${category.label}...`);
        setProgress((i / categories.length) * 100);

        try {
          const result = await endpointService.executeWithFallback(category.value);
          allResults.push(result);
          setResults([...allResults]);
        } catch (error) {
          console.error(`Error processing ${category.value}:`, error);
          // Continue with next category even if one fails
        }
      }

      setProgress(100);
      setCurrentOperation('Batch execution completed');

      const totalFetched = allResults.reduce((sum, r) => sum + r.providersFetched, 0);
      const totalSaved = allResults.reduce((sum, r) => sum + r.providersSaved, 0);
      const totalDuplicates = allResults.reduce((sum, r) => sum + r.duplicatesFound, 0);
      const successCount = allResults.filter(r => r.success).length;
      const fallbackCount = allResults.filter(r => r.usedFallback).length;

      let message = `${successCount}/${categories.length} categories completed. ${totalSaved} providers updated.`;
      if (totalDuplicates > 0) message += ` ${totalDuplicates} duplicates found.`;
      if (fallbackCount > 0) message += ` ${fallbackCount} used fallback.`;

      toast({
        title: "Batch execution completed",
        description: message,
        variant: successCount === categories.length && fallbackCount === 0 ? "default" : "destructive"
      });

      onExecutionComplete();
    } catch (error) {
      console.error('Batch execution error:', error);
      toast({
        title: "Batch execution error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Category Execution
        </CardTitle>
        <CardDescription>
          Execute data import for specific categories or run batch operations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={executeCategory}
            disabled={executing || !selectedCategory}
            variant="default"
          >
            <Play className="h-4 w-4 mr-2" />
            Execute
          </Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Batch Operations</h4>
            <p className="text-sm text-gray-600">Execute all categories with fallback handling</p>
          </div>
          <Button
            onClick={executeAllCategories}
            disabled={executing}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Execute All
          </Button>
        </div>

        {executing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentOperation}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Execution Results
              </h4>
              {results.map((result, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {result.executionTimeMs}ms
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Fetched:</span> {result.providersFetched}
                    </div>
                    <div>
                      <span className="text-gray-600">Saved:</span> {result.providersSaved}
                    </div>
                    <div>
                      <span className="text-gray-600">Duplicates:</span> {result.duplicatesFound}
                    </div>
                  </div>
                  {result.usedFallback && (
                    <Badge variant="outline" className="mt-2">
                      Used Fallback
                    </Badge>
                  )}
                  {result.error && (
                    <p className="text-red-600 text-sm mt-2">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryExecutionPanel;
