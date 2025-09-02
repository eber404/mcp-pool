# 🏊 MCP Pool - Unified HTTP Server for MCPs

Unified system that allows **hosting multiple MCPs via HTTP**

## 🏗️ Architecture

**Unified Server:**

- **Only 1 Container** (mcp-pool-server)
- **MCPs organized** in folders under `src/mcps/`
- **Clean endpoints** - `/convex` and `/material-ui`
- **Easy scalability** to add new MCPs

## 📁 Project Structure

```
mcp-pool/
├── src/                         # Server source code
│   ├── mcps/                    # MCPs organized by folder
│   │   ├── convex/
│   │   │   └── index.js         # Convex MCP Core
│   │   └── material-ui/
│   │       └── index.js         # Material-UI MCP Core
│   └── server.js                # Main HTTP server
├── Dockerfile                   # Unified Dockerfile
├── docker-compose.yml           # Simplified orchestration
├── nginx.conf                   # Reverse proxy configuration
├── package.json                 # Project dependencies
├── .env                         # Configuration settings
├── .env.example                 # Configuration example
└── README.md
```

## 🚀 Quick Setup

### 1. Start the Server

```bash
# Build and start all services
docker compose up -d --build

# Check status
docker compose ps
```

### 2. Connect Claude Code via HTTP

Now the endpoints are **cleaner**:

```bash
# Convex MCP (direct endpoint)
claude mcp add --transport http convex http://localhost:3000/convex

# Material-UI MCP (direct endpoint)
claude mcp add --transport http mui http://localhost:3000/material-ui

# Check connections
claude mcp list
```

### 3. Access MCPs via HTTP

The server will be available at `http://localhost:3000`:

```bash
# Main page - list available MCPs
curl http://localhost:3000/

# System health check
curl http://localhost:3000/health

# Convex MCP (clean endpoint)
curl http://localhost:3000/convex
curl http://localhost:3000/convex/tools

# Material-UI MCP (clean endpoint)
curl http://localhost:3000/material-ui
curl http://localhost:3000/material-ui/components
```

## ➕ Add New MCP

### Simplified Step-by-Step:

1. **Create MCP folder:**

```bash
mkdir mcp-pool/src/mcps/my-new-mcp
cd mcp-pool/src/mcps/my-new-mcp
```

2. **Create index.js** (MCP Core):

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

export class MyNewMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'my-new-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: { tools: {}, resources: {} },
      }
    )
    this.setupHandlers()
  }

  setupHandlers() {
    // Define available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'my_tool',
          description: 'Tool description',
          inputSchema: {
            type: 'object',
            properties: {
              parameter: {
                type: 'string',
                description: 'Parameter description',
              },
            },
            required: ['parameter'],
          },
        },
      ],
    }))

    // Implement other handlers...
  }

  // Implement tool methods...
}
```

3. **Register in main server** (src/server.js):

```javascript
import { MyNewMCP } from './mcps/my-new-mcp/index.js'

// Add in initializeMCPs() function
const myNewMCP = new MyNewMCP()
mcpInstances.set('my-new-mcp', myNewMCP)

// Add to mcpNames array
const mcpNames = ['convex', 'material-ui', 'my-new-mcp']
```

4. **Rebuild and test:**

```bash
docker compose up -d --build
curl http://localhost:3000/my-new-mcp/health
claude mcp add --transport http my-new http://localhost:3000/my-new-mcp
```

## 🔧 Common Operations

```bash
# View logs in real time
docker compose logs -f

# Restart unified server
docker compose restart mcp-pool-server

# View detailed status
docker compose ps

# Rebuild after changes
docker compose up -d --build

# Stop everything
docker compose down

# View server logs
docker compose logs mcp-pool-server
```
