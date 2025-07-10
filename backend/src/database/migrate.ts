import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './db.js';
const main = async () => {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed');
    // Drizzle leaves the PG client open; explicitly exit so Docker
    // entry-point continues to the seeding step.
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};
main();