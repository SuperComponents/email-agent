import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center p-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button onClick={handleGoHome} variant="primary" className="mt-4">
        Go Home
      </Button>
    </div>
  );
}
