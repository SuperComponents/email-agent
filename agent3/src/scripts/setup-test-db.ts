#!/usr/bin/env tsx
import { ensureTestDatabase } from '../db/reset-schema.js';

async function setupTestDb() {
  try {
    await ensureTestDatabase();
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

void setupTestDb();
