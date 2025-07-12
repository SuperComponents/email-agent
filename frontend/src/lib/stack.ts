import { StackClientApp } from '@stackframe/react';

// Temporarily disabled for testing
// export const stackClientApp = new StackClientApp({
// projectId: import.meta.env.VITE_STACK_PROJECT_ID,
// publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
// tokenStore: 'cookie',
// redirectMethod: { useNavigate },
// });

// Temporary mock for testing
export const stackClientApp = {
  getUser: () => Promise.resolve(null),
  useUser: () => ({ user: null, loading: false }),
  signOut: () => Promise.resolve(),
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  sendMagicLinkEmail: () => Promise.resolve(),
  isAuthenticated: () => false,
  setCurrentUser: () => {},
  getCurrentUser: () => null,
  getCurrentUserOrNull: () => null,
  getOrganizationById: () => Promise.resolve(null),
  getTeamById: () => Promise.resolve(null),
  listTeams: () => Promise.resolve([]),
  listOrganizations: () => Promise.resolve([]),
  _internal: {
    setCurrentUser: () => {},
    currentUser: null,
    currentUserPromise: Promise.resolve(null),
  },
} as unknown as StackClientApp;