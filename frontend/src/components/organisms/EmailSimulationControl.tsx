import React, { useState } from 'react';
import { Play, Square, Zap, Settings, Mail } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { Dropdown } from '../atoms/Dropdown';
import { cn } from '../../lib/utils';
import { 
  useSimulationStatus, 
  useStartEmailSimulation, 
  useStopEmailSimulation, 
  useGenerateSingleEmail 
} from '../../repo/hooks';

export interface EmailSimulationControlProps extends React.HTMLAttributes<HTMLDivElement> {
  onEmailGenerated?: () => void;
}

export const EmailSimulationControl = React.forwardRef<HTMLDivElement, EmailSimulationControlProps>(
  ({ className, onEmailGenerated, ...props }, ref) => {
    const [showSettings, setShowSettings] = useState(false);
    const [selectedInterval, setSelectedInterval] = useState('90000'); // 1.5 minutes default

    const { data: statusData } = useSimulationStatus();
    const startSimulation = useStartEmailSimulation();
    const stopSimulation = useStopEmailSimulation();
    const generateEmail = useGenerateSingleEmail();

    const isRunning = statusData?.status?.isRunning || false;
    const emailsGenerated = statusData?.status?.emailsGenerated || 0;
    const isLoading = startSimulation.isPending || stopSimulation.isPending || generateEmail.isPending;

    const intervalOptions = [
      { value: '30000', label: '30 seconds', icon: Zap },
      { value: '60000', label: '1 minute', icon: Play },
      { value: '90000', label: '1.5 minutes', icon: Play },
      { value: '120000', label: '2 minutes', icon: Play },
      { value: '180000', label: '3 minutes', icon: Play },
    ];

    const handleToggleSimulation = () => {
      void (async () => {
        if (isRunning) {
          await stopSimulation.mutateAsync();
        } else {
          await startSimulation.mutateAsync({ intervalMs: parseInt(selectedInterval) });
        }
        onEmailGenerated?.();
      })();
    };

    const handleGenerateEmail = () => {
      void (async () => {
        await generateEmail.mutateAsync();
        onEmailGenerated?.();
      })();
    };

    const handleIntervalChange = (value: string) => {
      setSelectedInterval(value);
      setShowSettings(false);
    };

    return (
      <div 
        ref={ref} 
        className={cn('flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg', className)} 
        {...props}
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-2 mr-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )} />
          <span className="text-sm font-medium text-foreground">
            {isRunning ? 'Running' : 'Stopped'}
          </span>
          {emailsGenerated > 0 && (
            <Badge variant="secondary" className="text-xs">
              {emailsGenerated} emails
            </Badge>
          )}
        </div>

        {/* Main Control Button */}
        <Button
          onClick={handleToggleSimulation}
          disabled={isLoading}
          size="sm"
          variant={isRunning ? 'destructive' : 'primary'}
          className="gap-2 min-w-[100px]"
        >
          <Icon 
            icon={isRunning ? Square : Play} 
            size="sm" 
            className={isLoading ? 'animate-pulse' : ''} 
          />
          {isLoading ? 'Loading...' : isRunning ? 'Stop' : 'Start'}
        </Button>

        {/* Generate Single Email Button */}
        <Button
          onClick={handleGenerateEmail}
          disabled={isLoading || isRunning}
          size="sm"
          variant="secondary"
          className="gap-2"
          title="Generate one email immediately"
        >
          <Icon icon={Mail} size="sm" />
          Generate
        </Button>

        {/* Settings Dropdown */}
        <div className="relative">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            disabled={isRunning}
            size="sm"
            variant="ghost"
            className="p-2"
            title="Simulation settings"
          >
            <Icon icon={Settings} size="sm" />
          </Button>

          {showSettings && !isRunning && (
            <div className="absolute top-full right-0 mt-1 z-50">
              <Dropdown
                options={intervalOptions}
                value={selectedInterval}
                onChange={handleIntervalChange}
                className="w-40"
              />
            </div>
          )}
        </div>

        {/* Info Text */}
        <div className="text-xs text-secondary-foreground ml-2 hidden sm:block">
          {isRunning 
            ? `Generating emails every ${parseInt(selectedInterval) / 1000}s` 
            : 'Email simulation stopped'
          }
        </div>
      </div>
    );
  },
);

EmailSimulationControl.displayName = 'EmailSimulationControl';