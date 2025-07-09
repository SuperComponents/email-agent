

import { Navigate, Outlet } from 'react-router-dom';
import { useStackApp } from '@stackframe/react';

export function ProtectedRoute() {

  const app = useStackApp();
  const user = app.useUser();

  if (!user) {
    return <Navigate to="/handler/sign-in" replace />;
  }

  return <Outlet />;
}