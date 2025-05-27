
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

const FormActions = ({ onCancel, isLoading, isEditing }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        <Save className="w-4 h-4 mr-2" />
        {isLoading ? 'Saving...' : (isEditing ? 'Update Endpoint' : 'Create Endpoint')}
      </Button>
    </div>
  );
};

export default FormActions;
