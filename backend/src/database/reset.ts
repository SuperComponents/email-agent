import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './db.js';

const main = async () => {
  try {
    console.log('Dropping all tables...');
    
    // Drop all tables in the correct order (reverse of dependencies)
    await db.execute(sql`DROP TABLE IF EXISTS agent_actions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS draft_responses CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS email_tags CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS emails CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS threads CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS internal_notes CASCADE`);
    
    console.log('All tables dropped successfully');
    
    // Drop ENUM types that are used by the tables
    console.log('Dropping ENUM types...');
    await db.execute(sql`DROP TYPE IF EXISTS "public"."agent_action" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "public"."direction" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "public"."draft_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "public"."role" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "public"."status" CASCADE`);
    
    // Drop the migration tracking table to force a fresh migration
    console.log('Dropping migration tracking table...');
    await db.execute(sql`DROP TABLE IF EXISTS drizzle.__drizzle_migrations CASCADE`);
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    
    console.log('Running fresh migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    
    console.log('✅ Database reset and migration completed successfully!');
    
    // Drizzle leaves the PG client open; explicitly exit so Docker
    // entry-point continues to the server start.
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
};

void main();