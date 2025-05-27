
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

const FormActions = ({ onCancel, isLoading, isEditing }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isEditing ? 'Update' : 'Create'} Endpoint
      </Button>
    </div>
  );
};

export default FormActions;
