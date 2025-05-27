
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

const FormActions = ({ onCancel, isLoading, isEditing }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
      </Button>
    </div>
  );
};

export default FormActions;
