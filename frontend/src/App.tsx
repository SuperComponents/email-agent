/*
// TODO: 
// Remove loginpage; using stack handler instead
*/
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './repo/query-client';
// import { LoginPage } from './pages/LoginPage';
import { InboxPage } from './pages/InboxPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { stackClientApp } from './lib/stack';
import { StackHandler, StackProvider, StackTheme } from '@stackframe/react';


function HandlerRoutes() {
const location = useLocation();
return (
<StackHandler app={stackClientApp} location={location.pathname} fullPage />
);
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StackProvider app={stackClientApp}>
      <StackTheme>

      <Router>
        <Routes>
        <Route path="/handler/*" element={<HandlerRoutes />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<InboxPage />} />
            <Route path="/thread/:threadId" element={<InboxPage />} />
          </Route>
        </Routes>
      </Router>
      </StackTheme>
      </StackProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App
