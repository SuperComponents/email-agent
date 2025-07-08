# Email Agent Integration Guide

This document explains how to integrate the `agent/` backend with the `frontend/` React application.

## Project Structure

```
email-agent/
├── agent/           # TypeScript AI agent backend
│   ├── src/         # Agent source code
│   ├── dist/        # Compiled JavaScript
│   └── example.js   # Usage example
├── frontend/        # React + TypeScript frontend
│   └── src/components/  # UI components ready for agent integration
└── Makefile         # Build commands for both projects
```

## Quick Start

### 1. Install All Dependencies
```bash
make install
```

### 2. Build the Agent
```bash
make build-agent
```

### 3. Start Frontend Development
```bash
make f
```

### 4. Test Agent (Optional)
```bash
# Requires .env file with OPENAI_API_KEY
make agent-example
```

## Agent Backend API

The agent provides a simple async function:

```typescript
import { assistSupportPerson } from '../agent/dist/index';

const response = await assistSupportPerson(
  customerEmail,    // string: customer email content
  context,          // string: support person context
  model            // string: optional OpenAI model (default: 'gpt-4o')
);

// Returns: { draft: string, reasoning: string }
```

## Frontend Integration Points

The frontend components are **already designed** to work with the agent:

### AgentPanel Component

Located: `frontend/src/components/organisms/AgentPanel.tsx`

```typescript
interface AgentPanelProps {
  actions: AgentActionProps[];    // Tool calls from agent
  analysis?: string;              // Maps to agent's 'reasoning'
  draftResponse?: string;         // Maps to agent's 'draft'
}
```

### Usage Example

```typescript
// In your React component
import { AgentPanel } from './components/organisms/AgentPanel';
import { assistSupportPerson } from '../agent/dist/index';

function EmailSupport() {
  const [agentData, setAgentData] = useState({
    actions: [],
    analysis: '',
    draftResponse: ''
  });

  const handleProcessEmail = async (customerEmail: string, context: string) => {
    try {
      // Call the agent
      const response = await assistSupportPerson(customerEmail, context);
      
      // Update UI with agent response
      setAgentData({
        actions: [
          {
            icon: MessageSquare,
            title: 'Email Analysis',
            description: 'Analyzed customer email for tone and intent',
            timestamp: new Date().toLocaleTimeString(),
            status: 'completed'
          },
          {
            icon: Clock,
            title: 'Current Time Retrieved',
            description: 'Got current timestamp for response',
            timestamp: new Date().toLocaleTimeString(),
            status: 'completed'
          }
        ],
        analysis: response.reasoning,     // Agent's step-by-step thinking
        draftResponse: response.draft     // Agent's drafted email
      });
    } catch (error) {
      console.error('Agent error:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <main className="flex-1">
        {/* Your main email interface */}
      </main>
      <AgentPanel 
        actions={agentData.actions}
        analysis={agentData.analysis}
        draftResponse={agentData.draftResponse}
      />
    </div>
  );
}
```

## Complete Integration Steps

### Step 1: Add Agent to Frontend Dependencies

Add the agent as a local dependency in `frontend/package.json`:

```json
{
  "dependencies": {
    "proresponse-agent": "file:../agent"
  }
}
```

### Step 2: Create Agent Service

Create `frontend/src/services/agentService.ts`:

```typescript
import { assistSupportPerson, type AgentResponse } from 'proresponse-agent';

export class AgentService {
  static async processEmail(
    customerEmail: string, 
    context: string = ''
  ): Promise<AgentResponse> {
    try {
      return await assistSupportPerson(customerEmail, context);
    } catch (error) {
      console.error('[AgentService] Error:', error);
      throw new Error(`Agent processing failed: ${error.message}`);
    }
  }
}
```

### Step 3: Update App.tsx

Replace the basic App.tsx with a real email support interface:

```typescript
import React, { useState } from 'react';
import { AgentPanel } from './components/organisms/AgentPanel';
import { Composer } from './components/organisms/Composer';
import { ThreadDetail } from './components/organisms/ThreadDetail';
import { AgentService } from './services/agentService';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

function App() {
  const [agentData, setAgentData] = useState({
    actions: [],
    analysis: '',
    draftResponse: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmailProcess = async (email: string, context: string) => {
    setIsProcessing(true);
    
    // Show processing action
    setAgentData(prev => ({
      ...prev,
      actions: [
        {
          icon: MessageSquare,
          title: 'Processing Email',
          description: 'Analyzing customer request...',
          timestamp: new Date().toLocaleTimeString(),
          status: 'pending'
        }
      ]
    }));

    try {
      const response = await AgentService.processEmail(email, context);
      
      // Update with final results
      setAgentData({
        actions: [
          {
            icon: MessageSquare,
            title: 'Email Analysis Complete',
            description: 'Successfully analyzed customer email',
            timestamp: new Date().toLocaleTimeString(),
            status: 'completed'
          },
          {
            icon: Clock,
            title: 'Timestamp Retrieved',
            description: 'Got current time for response',
            timestamp: new Date().toLocaleTimeString(),
            status: 'completed'
          },
          {
            icon: CheckCircle,
            title: 'Response Draft Ready',
            description: 'Created professional response draft',
            timestamp: new Date().toLocaleTimeString(),
            status: 'completed'
          }
        ],
        analysis: response.reasoning,
        draftResponse: response.draft
      });
    } catch (error) {
      setAgentData(prev => ({
        ...prev,
        actions: [
          ...prev.actions,
          {
            icon: AlertCircle,
            title: 'Processing Failed',
            description: error.message,
            timestamp: new Date().toLocaleTimeString(),
            status: 'failed'
          }
        ]
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col">
        {/* Your email interface components */}
        <ThreadDetail onProcessWithAgent={handleEmailProcess} />
        <Composer />
      </main>
      <AgentPanel 
        className="w-96"
        actions={agentData.actions}
        analysis={agentData.analysis}
        draftResponse={agentData.draftResponse}
      />
    </div>
  );
}

export default App;
```

## Environment Setup

### Required Environment Variables

Create `.env` in the root directory:

```bash
# OpenAI API Key for the agent
OPENAI_API_KEY=your-openai-api-key-here
```

### Frontend Environment

If needed, create `frontend/.env`:

```bash
# Backend API URL (if you add a backend API layer)
VITE_AGENT_API_URL=http://localhost:3001
```

## Available Make Commands

```bash
# Install all dependencies
make install

# Install individual projects
make install-fe
make install-agent

# Development
make f                # Start frontend dev server
make sb               # Start Storybook
make build-agent      # Build agent TypeScript

# Testing
make agent-example    # Test agent with example

# Cleanup
make clean           # Remove build artifacts
```

## Production Considerations

### 1. Security
- **Never expose OpenAI API keys in frontend**
- Create a backend API that calls the agent
- Use environment variables properly

### 2. Backend API Layer (Recommended)

Create a simple Express.js server:

```javascript
// backend/server.js
const express = require('express');
const { assistSupportPerson } = require('../agent/dist/index');

const app = express();
app.use(express.json());

app.post('/api/agent/process', async (req, res) => {
  try {
    const { customerEmail, context } = req.body;
    const response = await assistSupportPerson(customerEmail, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Agent API running on port 3001');
});
```

### 3. Error Handling

Always handle agent errors gracefully:

```typescript
try {
  const response = await AgentService.processEmail(email, context);
  // Handle success
} catch (error) {
  // Show user-friendly error message
  console.error('Agent processing failed:', error);
  setError('Unable to process email with AI assistant. Please try again.');
}
```

## Component Architecture

The frontend follows atomic design principles:

- **Atoms**: Basic UI elements (Button, Input, Icon)
- **Molecules**: Simple combinations (SearchInput, ThreadPreview)  
- **Organisms**: Complex components (AgentPanel, Composer, ThreadDetail)
- **Templates**: Layout components (AppLayout, AuthLayout)

All components are fully typed with TypeScript and include Storybook stories.

## Next Steps

1. Set up your OpenAI API key in `.env`
2. Run `make install` to install all dependencies
3. Run `make build-agent` to compile the agent
4. Start developing with `make f`
5. Integrate the agent service into your email workflows
6. Test the integration with real customer emails

The agent is ready to use immediately with the existing frontend components! 