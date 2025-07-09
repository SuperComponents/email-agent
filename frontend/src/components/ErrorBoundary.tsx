import { ErrorBoundary as REB } from 'react-error-boundary';
import { Button } from './atoms/Button';

function Fallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Unexpected error</h1>
      <pre className="text-sm opacity-70">{error.message}</pre>
      <Button onClick={resetErrorBoundary} variant="primary">Reload</Button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <REB FallbackComponent={Fallback} onReset={() => window.location.reload()}>
      {children}
    </REB>
  );
}
