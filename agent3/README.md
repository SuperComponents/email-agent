# EmailSmart - TypeScript + Bun + Drizzle ORM

A modern TypeScript project using Bun runtime, Hono web framework, and Drizzle ORM with PostgreSQL.

## Setup

1. Install Bun: https://bun.sh
2. Install dependencies: `npm install` or `bun install`
3. Create `.env` file with `DATABASE_URL`
4. Generate database: `npm run db:push`

## Test Setup

1. Create a separate test database in PostgreSQL
2. Add `TEST_DATABASE_URL` to your `.env` file pointing to the test database
3. Run tests: `npm test`

Tests automatically:

- Use `TEST_DATABASE_URL` when `NODE_ENV=test`
- Drop and recreate the database schema for each test run
- Start with a completely fresh database state

To manually reset the test database:

```bash
npm run test:db:setup
```

## Development

```bash
# Run development server with hot reload
npm run dev

# Run production server
npm run start

# Database commands
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## API Endpoints

- `GET /` - Health check
- `GET /users` - List all users
- `POST /users` - Create user (body: {name, email})
- `GET /users/:id` - Get user by ID
- `GET /posts` - List all posts
- `POST /posts` - Create post (body: {title, content, userId})

## Tech Stack

- Runtime: Bun (with Node.js fallback)
- Web Framework: Hono
- Database: SQLite with Drizzle ORM
- Language: TypeScript
