import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';
import { apiClient } from '../../lib/api';

interface WorkerStatus {
  threadId: number;
  status: string;
  isActive: boolean;
}

interface WorkerInfo {
  threadId: number;
  status: string;
}

export function WorkerTesting({ threadId }: { threadId?: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);
  const [allWorkers, setAllWorkers] = useState<WorkerInfo[]>([]);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentThreadId = threadId || 1; // Default to thread 1 for testing

  // Auto-refresh worker status every 2 seconds
  useEffect(() => {
    if (currentThreadId) {
      refreshWorkerStatus();
      const interval = setInterval(refreshWorkerStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [currentThreadId]);

  // Auto-refresh all workers every 3 seconds
  useEffect(() => {
    refreshAllWorkers();
    const interval = setInterval(refreshAllWorkers, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshWorkerStatus = async () => {
    try {
      const response = await apiClient.getWorkerStatus(currentThreadId);
      if (response.success && response.data) {
        setWorkerStatus(response.data);
      }
    } catch (err) {
      // Silently handle errors for auto-refresh
    }
  };

  const refreshAllWorkers = async () => {
    try {
      const response = await apiClient.listWorkers();
      if (response.success && response.data) {
        setAllWorkers(response.data.workers);
      }
    } catch (err) {
      // Silently handle errors for auto-refresh
    }
  };

  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await action();
      if (response.success) {
        setMessage(`${actionName} successful: ${response.data?.message || 'OK'}`);
      } else {
        setError(`${actionName} failed: ${response.error || 'Unknown error'}`);
      }
      
      // Refresh status after action
      setTimeout(() => {
        refreshWorkerStatus();
        refreshAllWorkers();
      }, 500);
      
    } catch (err) {
      setError(`${actionName} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      // Clear messages after 3 seconds
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
    }
  };

  const startWorker = () => handleAction(
    () => apiClient.startWorker(currentThreadId),
    'Start Worker'
  );

  const stopWorker = () => handleAction(
    () => apiClient.stopWorker(currentThreadId, 'Manual stop from UI'),
    'Stop Worker'
  );

  const forceStopWorker = () => handleAction(
    () => apiClient.forceStopWorker(currentThreadId),
    'Force Stop Worker'
  );

  const stopAllWorkers = () => handleAction(
    () => apiClient.stopAllWorkers(),
    'Stop All Workers'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-gray-500';
      case 'not_found': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg border border-border space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Worker Testing Controls</h3>
        {isLoading && <Spinner size="sm" />}
      </div>

      {/* Current Thread Worker Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Thread {currentThreadId} Worker:</span>
          {workerStatus ? (
            <Badge className={`${getStatusColor(workerStatus.status)} text-white`}>
              {workerStatus.status}
            </Badge>
          ) : (
            <Badge className="bg-gray-400 text-white">Unknown</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={startWorker}
            disabled={isLoading || workerStatus?.status === 'running'}
            variant="primary"
            size="sm"
          >
            Start Worker
          </Button>
          
          <Button
            onClick={stopWorker}
            disabled={isLoading || workerStatus?.status !== 'running'}
            variant="secondary"
            size="sm"
          >
            Stop Worker
          </Button>
          
          <Button
            onClick={forceStopWorker}
            disabled={isLoading || workerStatus?.status !== 'running'}
            variant="destructive"
            size="sm"
          >
            Force Stop
          </Button>
        </div>
      </div>

      {/* All Workers Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">All Active Workers ({allWorkers.length})</span>
          <Button
            onClick={stopAllWorkers}
            disabled={isLoading || allWorkers.length === 0}
            variant="destructive"
            size="sm"
          >
            Stop All
          </Button>
        </div>

        {allWorkers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allWorkers.map((worker) => (
              <div key={worker.threadId} className="flex items-center gap-2 text-xs">
                <span>Thread {worker.threadId}:</span>
                <Badge className={`${getStatusColor(worker.status)} text-white text-xs`}>
                  {worker.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No active workers</p>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Testing Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Start Worker: Begins agent processing for this thread</p>
        <p>• Stop Worker: Gracefully stops the worker</p>
        <p>• Force Stop: Immediately terminates the worker</p>
        <p>• Status updates automatically every 2-3 seconds</p>
      </div>
    </div>
  );
}