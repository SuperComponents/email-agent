import { Hono } from 'hono';
import { workerManager } from '../services/worker-interface.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validation.js';
import { z } from 'zod';

const app = new Hono();

// Validation schemas
const startWorkerSchema = z.object({
  threadId: z.number().int().positive(),
  userMessage: z.string().optional()
});


// POST /api/workers/start - Start a worker for a specific thread
app.post('/start', async (c) => {
  try {
    const body = await validateRequest(c, startWorkerSchema);
    if (!body) {
      return errorResponse(c, 'Invalid request body', 400);
    }
    const { threadId } = body;

    console.log(`[WorkerManagement] Starting worker for thread ${threadId}`);

    // Start the worker
    const worker = await workerManager.startWorkerForThread(threadId);

    // Set up response promise
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker start timeout'));
      }, 30000); // 30 second timeout for start

      worker.on('running', () => {
        clearTimeout(timeout);
        resolve({
          success: true,
          threadId,
          status: 'running',
          message: 'Worker started successfully'
        } as Record<string, unknown>);
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      worker.on('failed', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    return successResponse(c, result as Record<string, unknown>);
  } catch (error) {
    console.error('[WorkerManagement] Error starting worker:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to start worker',
      500
    );
  }
});

// POST /api/workers/stop/:threadId - Stop a worker for a specific thread
app.post('/stop/:threadId', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    const body = await c.req.json().catch(() => ({})) as { reason?: string };
    const reason = body?.reason;

    console.log(`[WorkerManagement] Stopping worker for thread ${threadId}`);

    await workerManager.stopWorkerForThread(threadId, reason);

    return successResponse(c, {
      success: true,
      threadId,
      status: 'stopped',
      message: 'Worker stopped successfully'
    });
  } catch (error) {
    console.error('[WorkerManagement] Error stopping worker:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to stop worker',
      500
    );
  }
});

// POST /api/workers/force-stop/:threadId - Force stop a worker for a specific thread
app.post('/force-stop/:threadId', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    console.log(`[WorkerManagement] Force stopping worker for thread ${threadId}`);

    await workerManager.forceStopWorkerForThread(threadId);

    return successResponse(c, {
      success: true,
      threadId,
      status: 'force_stopped',
      message: 'Worker force stopped successfully'
    });
  } catch (error) {
    console.error('[WorkerManagement] Error force stopping worker:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to force stop worker',
      500
    );
  }
});

// GET /api/workers/status/:threadId - Get worker status for a specific thread
app.get('/status/:threadId', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    const status = workerManager.getWorkerStatus(threadId);
    
    return successResponse(c, {
      threadId,
      status,
      isActive: status === 'running'
    });
  } catch (error) {
    console.error('[WorkerManagement] Error getting worker status:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to get worker status',
      500
    );
  }
});

// GET /api/workers/list - List all active workers
app.get('/list', async (c) => {
  try {
    const activeThreads = workerManager.getActiveThreads();
    
    const workers = activeThreads.map(threadId => ({
      threadId,
      status: workerManager.getWorkerStatus(threadId)
    }));

    return successResponse(c, {
      workers,
      totalActive: activeThreads.length
    });
  } catch (error) {
    console.error('[WorkerManagement] Error listing workers:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to list workers',
      500
    );
  }
});

// POST /api/workers/stop-all - Stop all active workers
app.post('/stop-all', async (c) => {
  try {
    console.log('[WorkerManagement] Stopping all workers');

    await workerManager.stopAllWorkers();

    return successResponse(c, {
      success: true,
      message: 'All workers stopped successfully'
    });
  } catch (error) {
    console.error('[WorkerManagement] Error stopping all workers:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to stop all workers',
      500
    );
  }
});

export default app;