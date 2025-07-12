import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/error-handler.js';
import threadRoutes from './routes/threads.js';
import messageRoutes from './routes/messages.js';
import draftRoutes from './routes/drafts.js';
import agentRoutes from './routes/agent.js';
import countRoutes from './routes/counts.js';
import demoRoutes from './routes/demo.js';
import authRoutes from './routes/auth.js';
import internalNotesRoutes from './routes/internal-notes.js';
import workerManagementRoutes from './routes/worker-management.js';
import { authMiddleware } from './middleware/auth.js';

const app = new Hono();

// Apply middleware
app.use('*', corsMiddleware);
app.use('*', errorHandler);

// 🔑 Auth routes (unprotected)
app.route('/api/auth', authRoutes);

app.get('/', c => {
  return c.text('ProResponse AI Backend API');
});

// Mount API routes with auth protection
// 🔐 Apply auth middleware to protected routes
app.use('/api/threads/*', authMiddleware);
app.use('/api/demo/*', authMiddleware);
app.use('/api/workers/*', authMiddleware);

// Mount routes with specific paths first to avoid conflicts
app.route('/api/threads', countRoutes);
app.route('/api/threads', threadRoutes);
app.route('/api/threads', messageRoutes);
app.route('/api/threads', draftRoutes);
app.route('/api/threads', agentRoutes);
app.route('/api/threads', internalNotesRoutes);

// Mount demo routes separately
app.route('/api/demo', demoRoutes);

// Mount worker management routes
app.route('/api/workers', workerManagementRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  info => {
    console.log(`[Server] Hono API server running on http://localhost:${info.port}`);
    console.log(`[Server] Available endpoints:`);
    console.log(`[Server] - GET / (Hello World)`);
    console.log(`[Server] - GET /db-test (Database test)`);
    console.log(`[Server] - API routes mounted from modules`);
    console.log(`[Server] Database connected and ready`);
  },
);
