/*
// TODO: 
// Remove auth store; using stack handler instead
*/

import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '../stores/auth-store';
import { useStackApp } from '@stackframe/react';

export function ProtectedRoute() {
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const app = useStackApp();
  const user = app.useUser();

  if (!user) {
    return <Navigate to="/handler/sign-in" replace />;
  }
  // return <div>{user.displayName}</div>;
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}