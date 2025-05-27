
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download } from 'lucide-react';

interface ScrapingControlPanelProps {
  isRunning: boolean;
  currentStep: string;
  progress: number;
  onStartScraping: () => void;
}

const ScrapingControlPanel: React.FC<ScrapingControlPanelProps> = ({
  isRunning,
  currentStep,
  progress,
  onStartScraping
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={onStartScraping} 
        disabled={isRunning}
        size="lg"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {isRunning ? 'Kjører scraping...' : 'Start automatisert scraping'}
      </Button>
      
      {isRunning && (
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{currentStep}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default ScrapingControlPanel;
