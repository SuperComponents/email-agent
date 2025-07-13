# ProResponse AI Frontend

The React-based frontend for ProResponse AI - an AI-powered customer support platform with intelligent email thread management and automated response generation.

## Features

### ✅ **Fully Implemented**
- **Email Thread Management**: View and manage customer email conversations
- **AI Agent Integration**: Real-time agent activity panel with tool execution history
- **Knowledge Base Management**: Complete CRUD interface for company documentation
- **Draft Management**: Review and approve AI-generated response drafts
- **Modern UI Components**: Atomic design system with Tailwind CSS v4
- **Authentication Ready**: StackAuth integration (currently disabled for testing)

### 🔄 **In Development**
- **Real-time Updates**: WebSocket integration for live agent activity
- **Advanced Filtering**: Read/unread status, tags, and assignments
- **Email Provider Integration**: Gmail/Outlook OAuth and synchronization

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS v4 with CSS variables
- **State Management**: Zustand for UI state
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Authentication**: StackAuth React SDK
- **GitHub Integration**: Octokit for knowledge base management
- **Testing**: Vitest with Playwright
- **Documentation**: Storybook for component library

## Project Structure

```
frontend/src/
├── components/
│   ├── atoms/          # Basic UI components (Button, Input, etc.)
│   ├── molecules/      # Composed components (SearchInput, FilterPills, etc.)
│   ├── organisms/      # Complex components (ThreadList, AgentPanel, etc.)
│   └── templates/      # Layout components (AppLayout, AuthLayout)
├── containers/         # Smart components with business logic
├── pages/             # Route components
├── repo/              # API client and data fetching
├── stores/            # Zustand state management
├── lib/               # Utilities and helpers
└── types/             # TypeScript type definitions
```

## Key Components

### **Thread Management**
- **ThreadList**: Email conversation list with filtering
- **ThreadDetail**: Individual email thread view
- **ThreadPreview**: Thread summary cards

### **AI Agent Interface**
- **AgentPanel**: Real-time agent activity and tool execution
- **AgentAction**: Individual agent action components
- **Composer**: Draft review and editing interface

### **Knowledge Base**
- **KnowledgeBasePage**: Full CRUD interface for documentation
- **GitHub Integration**: Automatic sync with repository
- **Markdown Support**: Rich text editing and preview

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# GitHub Integration (for knowledge base)
VITE_GITHUB_TOKEN=your_github_token
VITE_GITHUB_OWNER=your_username
VITE_GITHUB_REPO=your_repo

# Authentication (when enabled)
VITE_STACK_PROJECT_ID=your_stack_project_id
```

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm run lint         # Run ESLint
npm run lint:all     # Run TypeScript check + ESLint

# Documentation
npm run storybook    # Start Storybook
npm run build-storybook  # Build Storybook
```

### Component Development

The frontend uses an atomic design system:

1. **Atoms**: Basic UI elements (Button, Input, Badge, etc.)
2. **Molecules**: Simple component combinations (SearchInput, FilterPills, etc.)
3. **Organisms**: Complex UI sections (ThreadList, AgentPanel, etc.)
4. **Templates**: Page layouts and structure
5. **Pages**: Route-level components

### API Integration

The frontend connects to the backend through:
- **API Client**: Centralized HTTP client with error handling
- **React Query**: Data fetching, caching, and synchronization
- **Type Safety**: Full TypeScript coverage for API responses

## Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (Vite + TS)       │
├─────────────────────┤
│ • Thread Management │
│ • Agent Integration │
│ • Knowledge Base    │
│ • Authentication    │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Backend API       │
│   (Hono + PostgreSQL)│
└─────────────────────┘
```

## Authentication

The frontend includes complete StackAuth integration:
- **Login/Logout**: Full authentication flow
- **Protected Routes**: Automatic route protection
- **User Context**: Global user state management
- **JWT Handling**: Automatic token management

**Current Status**: Disabled for development/testing (easily re-enabled)

## Knowledge Base Integration

Complete GitHub-integrated knowledge base management:
- **Document Management**: Create, read, update, delete documentation
- **Version Control**: Automatic GitHub commits and sync
- **Markdown Support**: Rich text editing with preview
- **Vector Store Sync**: Automatic OpenAI vector store updates

## Styling

The frontend uses Tailwind CSS v4 with:
- **CSS Variables**: Custom design tokens in `src/index.css`
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: CSS variable-based theming
- **Component Library**: Consistent design system

## Contributing

1. Follow the atomic design pattern
2. Use TypeScript for all components
3. Include Storybook stories for new components
4. Maintain test coverage
5. Follow the established code style

## Deployment

The frontend is deployed as a static site:
- **Build**: `npm run build`
- **Output**: `dist/` directory
- **Serve**: Can be served by any static file server

## Integration with Backend

The frontend is fully integrated with the ProResponse AI backend:
- **Email Threads**: Real-time thread management
- **Agent Activity**: Live agent tool execution
- **Draft Management**: AI-generated response review
- **Knowledge Base**: Synchronized documentation management

For backend integration details, see the main [INTEGRATION.md](../INTEGRATION.md) file.
