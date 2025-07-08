import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { AuthLayout } from '../components/templates';
import { AuthContainer } from '../containers/AuthContainer';

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AuthLayout>
      <AuthContainer />
    </AuthLayout>
  );
}