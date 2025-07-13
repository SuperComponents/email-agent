import React, { useState } from 'react';
import { LogOut, Play, Square, Mail } from 'lucide-react';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { cn } from '../../lib/utils';
import { 
  useSimulationStatus, 
  useStartEmailSimulation, 
  useStopEmailSimulation, 
  useGenerateSingleEmail 
} from '../../repo/hooks';

export interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onEmailGenerated?: () => void;
  className?: string;
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  ({ userName = 'Support User', userEmail = 'support@company.com', userAvatar, onLogout, onEmailGenerated, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInterval, setSelectedInterval] = useState('90000'); // 1.5 minutes default

    const { data: statusData } = useSimulationStatus();
    const startSimulation = useStartEmailSimulation();
    const stopSimulation = useStopEmailSimulation();
    const generateEmail = useGenerateSingleEmail();

    const isRunning = statusData?.status?.isRunning || false;
    const emailsGenerated = statusData?.status?.emailsGenerated || 0;
    const isLoading = startSimulation.isPending || stopSimulation.isPending || generateEmail.isPending;

    const intervalOptions = [
      { value: '30000', label: '30 seconds', icon: Play },
      { value: '60000', label: '1 minute', icon: Play },
      { value: '90000', label: '1.5 minutes', icon: Play },
      { value: '120000', label: '2 minutes', icon: Play },
      { value: '180000', label: '3 minutes', icon: Play },
    ];

    const handleLogout = () => {
      onLogout?.();
      setIsOpen(false);
    };

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
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full hover:bg-accent/20 transition-colors"
        >
          <Avatar
            src={userAvatar}
            alt={userName}
            fallback={userName.split(' ').map(n => n[0]).join('')}
            size="sm"
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-md shadow-lg z-20">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-secondary-foreground">{userEmail}</p>
              </div>
              
              {/* Email Simulation Controls */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Email Simulation</span>
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    )} />
                    <span className="text-xs text-secondary-foreground">
                      {isRunning ? 'Running' : 'Stopped'}
                    </span>
                    {emailsGenerated > 0 && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {emailsGenerated}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={handleToggleSimulation}
                    disabled={isLoading}
                    size="sm"
                    variant={isRunning ? 'destructive' : 'primary'}
                    className="flex-1 gap-1"
                  >
                    <Icon 
                      icon={isRunning ? Square : Play} 
                      size="sm" 
                      className={isLoading ? 'animate-pulse' : ''} 
                    />
                    {isLoading ? 'Loading...' : isRunning ? 'Stop' : 'Start'}
                  </Button>
                  
                  <Button
                    onClick={handleGenerateEmail}
                    disabled={isLoading || isRunning}
                    size="sm"
                    variant="secondary"
                    className="flex-1 gap-1"
                    title="Generate one email immediately"
                  >
                    <Icon icon={Mail} size="sm" />
                    Generate
                  </Button>
                </div>

                {/* Interval Settings */}
                {!isRunning && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-foreground">Interval:</span>
                      <span className="text-xs font-medium">{parseInt(selectedInterval) / 1000}s</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {intervalOptions.map((option) => (
                        <Button
                          key={option.value}
                          onClick={() => handleIntervalChange(option.value)}
                          size="sm"
                          variant={selectedInterval === option.value ? 'primary' : 'ghost'}
                          className="text-xs px-2 py-1 h-7"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {isRunning && (
                  <div className="text-xs text-secondary-foreground text-center">
                    Generating emails every {parseInt(selectedInterval) / 1000}s
                  </div>
                )}
              </div>

              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Icon icon={LogOut} size="sm" />
                  Logout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

UserMenu.displayName = 'UserMenu';
