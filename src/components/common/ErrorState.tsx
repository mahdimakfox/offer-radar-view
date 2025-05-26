
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';

interface ErrorStateProps {
  error?: Error | string | null;
  onRetry?: () => void;
  variant?: 'card' | 'inline' | 'full';
  title?: string;
  description?: string;
  showRetry?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  variant = 'card',
  title,
  description,
  showRetry = true,
}) => {
  const errorMessage = error 
    ? (typeof error === 'string' ? error : error.message)
    : 'En uventet feil oppstod';

  const defaultTitle = title || 'Feil ved lasting';
  const defaultDescription = description || errorMessage;

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">{defaultTitle}</p>
            <p className="text-xs text-red-600">{defaultDescription}</p>
          </div>
        </div>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Prøv igjen
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{defaultTitle}</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{defaultDescription}</p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Prøv igjen
          </Button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className="p-8 text-center border-red-200 bg-red-50">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{defaultTitle}</h3>
      <p className="text-gray-600 mb-4">{defaultDescription}</p>
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Prøv igjen
        </Button>
      )}
    </Card>
  );
};

export default ErrorState;
