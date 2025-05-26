
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Ingen data funnet',
  description = 'Vi fant ingen resultater som matcher dine kriterier.',
  action,
  icon = <Search className="h-12 w-12 text-gray-400" />,
}) => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700">
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
