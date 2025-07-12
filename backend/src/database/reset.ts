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
    
    // Drop any remaining tables that might exist
    await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`);
    
    console.log('All tables dropped successfully');
    
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