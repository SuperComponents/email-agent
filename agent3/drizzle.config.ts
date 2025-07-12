import type { Config } from 'drizzle-kit';
// Note: This file is used by drizzle-kit CLI which runs before TypeScript compilation
// So we need to use the compiled environment.js file
console.log('🧪 Drizzle Config');
// const { DATABASE_URL } = require('./dist/src/config/environment.js');

export default {
  schema: './src/db/newschema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'abc', //DATABASE_URL,
  },
} satisfies Config;
