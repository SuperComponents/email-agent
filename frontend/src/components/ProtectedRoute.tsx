/*
// TODO: 
// Remove auth store; using stack handler instead
*/

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