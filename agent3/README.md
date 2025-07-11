# EmailSmart - TypeScript + Bun + Drizzle ORM

A modern TypeScript project using Bun runtime, Hono web framework, and Drizzle ORM with SQLite.

## Setup

1. Install Bun: https://bun.sh
2. Install dependencies: `npm install` or `bun install`
3. Generate database: `npm run db:push`

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
