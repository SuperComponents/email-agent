import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../database/db.js';
import { internal_notes, threads, users, agent_actions } from '../database/schema.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';
import { workerManager } from '../services/worker-interface.js';
import { z } from 'zod';

const app = new Hono();
app.use(authMiddleware);

// Validation schemas
const createNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  is_pinned: z.boolean().optional().default(false),
});

const updateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
  is_pinned: z.boolean().optional(),
});

// GET /api/threads/:threadId/internal-notes - Get all notes for a thread
app.get('/:threadId/internal-notes', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    const currentUser = c.get('user');

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    // Check if thread exists
    const [thread] = await db
      .select({ id: threads.id })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!thread) {
      return notFoundResponse(c, 'Thread');
    }

    // Get notes with author information
    const notes = await db
      .select({
        id: internal_notes.id,
        content: internal_notes.content,
        is_pinned: internal_notes.is_pinned,
        created_at: internal_notes.created_at,
        updated_at: internal_notes.updated_at,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(internal_notes)
      .leftJoin(users, eq(internal_notes.author_user_id, users.id))
      .where(eq(internal_notes.thread_id, threadId))
      .orderBy(desc(internal_notes.is_pinned), desc(internal_notes.created_at));

    const formattedNotes = notes.map((note) => ({
      id: note.id.toString(),
      content: note.content,
      is_pinned: note.is_pinned,
      created_at: note.created_at.toISOString(),
      updated_at: note.updated_at.toISOString(),
      author: {
        id: note.author?.id?.toString() || '',
        name: note.author?.name || 'Unknown User',
        email: note.author?.email || '',
      },
      can_edit: note.author?.id === currentUser.dbUser?.id,
    }));

    return successResponse(c, { notes: formattedNotes });
  } catch (error) {
    console.error('Error fetching internal notes:', error);
    return errorResponse(c, 'Failed to fetch internal notes', 500);
  }
});

// POST /api/threads/:threadId/internal-notes - Create a new note
app.post('/:threadId/internal-notes', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    const currentUser = c.get('user');

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    const body = await c.req.json() as unknown;
    const validationResult = createNoteSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(c, validationResult.error.errors[0].message, 400);
    }

    const { content, is_pinned } = validationResult.data;

    // Check if thread exists
    const [thread] = await db
      .select({ id: threads.id })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!thread) {
      return notFoundResponse(c, 'Thread');
    }

    // Create the note
    const [newNote] = await db
      .insert(internal_notes)
      .values({
        thread_id: threadId,
        author_user_id: currentUser.dbUser!.id,
        content,
        is_pinned,
      })
      .returning();

    // Log the action
    await db.insert(agent_actions).values({
      thread_id: threadId,
      internal_note_id: newNote.id,
      actor_user_id: currentUser.dbUser!.id,
      action: 'internal_note_created',
      description: `Created internal note: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      metadata: {
        note_id: newNote.id,
        is_pinned,
        content,
      },
    });

    // Automatically start agent worker for the internal note
    try {
      console.log(`🤖 Starting agent worker for internal note in thread ${threadId}`);
      await workerManager.startWorkerForThreadIfNotActive(threadId);
      console.log(`✅ Agent worker started for thread ${threadId}`);
    } catch (error) {
      console.error(`❌ Failed to start agent worker for thread ${threadId}:`, error);
      // Don't throw error - internal note should still be processed even if worker fails
    }

    // Get the note with author info
    const [noteWithAuthor] = await db
      .select({
        id: internal_notes.id,
        content: internal_notes.content,
        is_pinned: internal_notes.is_pinned,
        created_at: internal_notes.created_at,
        updated_at: internal_notes.updated_at,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(internal_notes)
      .leftJoin(users, eq(internal_notes.author_user_id, users.id))
      .where(eq(internal_notes.id, newNote.id))
      .limit(1);

    const formattedNote = {
      id: noteWithAuthor.id.toString(),
      content: noteWithAuthor.content,
      is_pinned: noteWithAuthor.is_pinned,
      created_at: noteWithAuthor.created_at.toISOString(),
      updated_at: noteWithAuthor.updated_at.toISOString(),
      author: {
        id: noteWithAuthor.author?.id?.toString() || '',
        name: noteWithAuthor.author?.name || 'Unknown User',
        email: noteWithAuthor.author?.email || '',
      },
      can_edit: true,
    };

    return successResponse(c, { note: formattedNote }, 201);
  } catch (error) {
    console.error('Error creating internal note:', error);
    return errorResponse(c, 'Failed to create internal note', 500);
  }
});

// PUT /api/threads/:threadId/internal-notes/:noteId - Update a note
app.put('/:threadId/internal-notes/:noteId', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    const noteId = parseInt(c.req.param('noteId'));
    const currentUser = c.get('user');

    if (isNaN(threadId) || isNaN(noteId)) {
      return errorResponse(c, 'Invalid thread ID or note ID', 400);
    }

    const body = await c.req.json() as unknown;
    const validationResult = updateNoteSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(c, validationResult.error.errors[0].message, 400);
    }

    const updates = validationResult.data;

    // Check if note exists and user can edit it
    const [existingNote] = await db
      .select({
        id: internal_notes.id,
        thread_id: internal_notes.thread_id,
        author_user_id: internal_notes.author_user_id,
        content: internal_notes.content,
        is_pinned: internal_notes.is_pinned,
      })
      .from(internal_notes)
      .where(and(eq(internal_notes.id, noteId), eq(internal_notes.thread_id, threadId)))
      .limit(1);

    if (!existingNote) {
      return notFoundResponse(c, 'Internal note');
    }

    // Check permissions - only author can edit
    if (existingNote.author_user_id !== currentUser.dbUser!.id) {
      return errorResponse(c, 'Unauthorized to edit this note', 403);
    }

    // Update the note
    const [updatedNote] = await db
      .update(internal_notes)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(internal_notes.id, noteId))
      .returning();

    // Log the action
    await db.insert(agent_actions).values({
      thread_id: threadId,
      internal_note_id: noteId,
      actor_user_id: currentUser.dbUser!.id,
      action: 'internal_note_updated',
      description: `Updated internal note`,
      metadata: {
        note_id: noteId,
        changes: updates,
        content: updatedNote.content,
        is_pinned: updatedNote.is_pinned,
      },
    });

    // Automatically start agent worker for the updated internal note
    try {
      console.log(`🤖 Starting agent worker for updated internal note in thread ${threadId}`);
      await workerManager.startWorkerForThreadIfNotActive(threadId);
      console.log(`✅ Agent worker started for thread ${threadId}`);
    } catch (error) {
      console.error(`❌ Failed to start agent worker for thread ${threadId}:`, error);
      // Don't throw error - internal note update should still be processed even if worker fails
    }

    // Get the updated note with author info
    const [noteWithAuthor] = await db
      .select({
        id: internal_notes.id,
        content: internal_notes.content,
        is_pinned: internal_notes.is_pinned,
        created_at: internal_notes.created_at,
        updated_at: internal_notes.updated_at,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(internal_notes)
      .leftJoin(users, eq(internal_notes.author_user_id, users.id))
      .where(eq(internal_notes.id, noteId))
      .limit(1);

    const formattedNote = {
      id: noteWithAuthor.id.toString(),
      content: noteWithAuthor.content,
      is_pinned: noteWithAuthor.is_pinned,
      created_at: noteWithAuthor.created_at.toISOString(),
      updated_at: noteWithAuthor.updated_at.toISOString(),
      author: {
        id: noteWithAuthor.author?.id?.toString() || '',
        name: noteWithAuthor.author?.name || 'Unknown User',
        email: noteWithAuthor.author?.email || '',
      },
      can_edit: true,
    };

    return successResponse(c, { note: formattedNote });
  } catch (error) {
    console.error('Error updating internal note:', error);
    return errorResponse(c, 'Failed to update internal note', 500);
  }
});

// DELETE /api/threads/:threadId/internal-notes/:noteId - Delete a note
app.delete('/:threadId/internal-notes/:noteId', async (c) => {
  try {
    const threadId = parseInt(c.req.param('threadId'));
    const noteId = parseInt(c.req.param('noteId'));
    const currentUser = c.get('user');

    if (isNaN(threadId) || isNaN(noteId)) {
      return errorResponse(c, 'Invalid thread ID or note ID', 400);
    }

    // Check if note exists and user can delete it
    const [existingNote] = await db
      .select({
        id: internal_notes.id,
        thread_id: internal_notes.thread_id,
        author_user_id: internal_notes.author_user_id,
        content: internal_notes.content,
      })
      .from(internal_notes)
      .where(and(eq(internal_notes.id, noteId), eq(internal_notes.thread_id, threadId)))
      .limit(1);

    if (!existingNote) {
      return notFoundResponse(c, 'Internal note');
    }

    // Check permissions - only author can delete
    if (existingNote.author_user_id !== currentUser.dbUser!.id) {
      return errorResponse(c, 'Unauthorized to delete this note', 403);
    }

    // Log the action before deletion
    await db.insert(agent_actions).values({
      thread_id: threadId,
      actor_user_id: currentUser.dbUser!.id,
      action: 'internal_note_deleted',
      description: `Deleted internal note: ${existingNote.content.substring(0, 50)}${existingNote.content.length > 50 ? '...' : ''}`,
      metadata: {
        deleted_note_id: noteId,
        content: existingNote.content,
      },
    });

    // Delete the note
    await db.delete(internal_notes).where(eq(internal_notes.id, noteId));

    return successResponse(c, { message: 'Internal note deleted successfully' });
  } catch (error) {
    console.error('Error deleting internal note:', error);
    return errorResponse(c, 'Failed to delete internal note', 500);
  }
});

export default app;