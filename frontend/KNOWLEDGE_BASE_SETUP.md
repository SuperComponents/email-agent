# Knowledge Base Integration Setup

This document explains how to set up the GitHub-integrated knowledge base management system.

## Overview

The knowledge base integration allows users to:
- View, edit, and delete existing markdown documents from the `rag/knowledge_base/` folder
- Create new documents directly through the web interface
- Automatically sync changes to GitHub, which triggers the vector store update workflow

## Prerequisites

1. **GitHub Personal Access Token**: You'll need a GitHub Personal Access Token with repository access
2. **Repository Access**: The token needs read/write access to the repository containing your knowledge base

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Email Agent Knowledge Base"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
5. Click "Generate token" and copy the token

### 2. Configure Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# GitHub Integration for Knowledge Base
VITE_GITHUB_TOKEN=your_github_personal_access_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=email-agent

# Stack Auth (existing)
VITE_STACK_PROJECT_ID=your_stack_project_id
```

Replace the placeholders with your actual values:
- `VITE_GITHUB_TOKEN`: Your GitHub Personal Access Token
- `VITE_GITHUB_OWNER`: Your GitHub username or organization name
- `VITE_GITHUB_REPO`: The repository name (e.g., "email-agent")

### 3. Install Dependencies

The knowledge base integration requires the following packages:

```bash
cd frontend
npm install @octokit/rest
```

Note: The current implementation uses the native fetch API for GitHub integration to avoid external dependencies, but you can optionally install @octokit/rest for more robust GitHub API handling.

## Usage

### Accessing the Knowledge Base

1. Start the frontend development server: `npm run dev`
2. Navigate to the application in your browser
3. Click on the "Knowledge Base" tab in the header navigation

### Managing Documents

**Viewing Documents:**
- Documents from `rag/knowledge_base/*.md` will be listed in the sidebar
- Click on any document to view its content

**Editing Documents:**
- Click the "Edit" button when viewing a document
- Make your changes in the text editor
- Click "Save" to commit changes to GitHub

**Creating New Documents:**
- Click the "New" button in the sidebar
- Enter a filename (`.md` extension will be added automatically if not provided)
- Write your content in markdown format
- Click "Save" to create the document

**Deleting Documents:**
- Click the "Delete" button when viewing a document
- Confirm the deletion in the popup dialog

### Automatic Sync

When you save or delete documents through the interface:

1. Changes are immediately committed to GitHub
2. The existing workflow (`.github/workflows/sync-knowledge-base.yml`) detects changes to `rag/knowledge_base/**/*.md`
3. The workflow automatically updates the OpenAI vector store
4. The AI agent will have access to the updated knowledge base for future responses

## Troubleshooting

### Common Issues

**"Failed to load documents from GitHub"**
- Check that your GitHub token is valid and has the correct permissions
- Verify that the repository owner and name are correct in your environment variables
- Ensure the `rag/knowledge_base/` directory exists in your repository

**"Failed to save document"**
- Check that your GitHub token has write permissions to the repository
- Verify that you're not trying to create a file that already exists without proper conflict resolution

**"GitHub API error: 403"**
- Your GitHub token may have expired or insufficient permissions
- Regenerate your token with the correct scopes

**"GitHub API error: 404"**
- The repository or path doesn't exist
- Check your `VITE_GITHUB_OWNER` and `VITE_GITHUB_REPO` environment variables

### Security Considerations

- Never commit your GitHub Personal Access Token to version control
- Consider using GitHub Apps for production deployments instead of personal access tokens
- The token is exposed in the frontend bundle, so only use tokens with minimal required permissions
- For production use, consider implementing a backend proxy to handle GitHub API calls

## Future Enhancements

- **Rich Text Editor**: Replace the plain textarea with a markdown editor with preview
- **File Upload**: Support for uploading existing markdown files
- **Bulk Operations**: Select and delete multiple documents at once
- **Document Templates**: Pre-defined templates for common document types
- **Search and Filter**: Search through documents and filter by content
- **Version History**: View and restore previous versions of documents
- **Collaborative Editing**: Real-time collaborative editing with conflict resolution 