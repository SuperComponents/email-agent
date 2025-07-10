

import { Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // Auth disabled for testing - always allow access
  return <Outlet />;
}