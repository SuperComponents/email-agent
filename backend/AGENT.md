# Agentic Email Service - Agent Guide

## Build & Test Commands
- `npm run build` - TypeScript build
- `npm run dev` - Development server with hot reload
- `npm start` - Production server 
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- **No tests configured yet** - Add test framework if needed

## Architecture
- **Backend**: Hono API server (TypeScript ESM)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT-based authentication
- **AI**: OpenAI GPT integration for email drafting
- **Entry Point**: `src/index.ts`
- **Key Tables**: users, threads, emails, draft_responses, agent_actions

## Code Style
- ES modules with `.js` extensions in imports
- Strict TypeScript with `verbatimModuleSyntax`
- Drizzle ORM schema in `src/database/schema.ts`
- Environment config in `src/config/env.ts`
- PostgreSQL enums for status fields
- JSON columns for arrays (emails, metadata)
- Timestamp fields with `defaultNow()`
- Foreign key constraints with proper cascade behavior
