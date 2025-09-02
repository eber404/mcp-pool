import express from 'express'
import cors from 'cors'

import { ConvexMCP } from './mcps/convex/index.js'
import { MaterialUIMCP } from './mcps/material-ui/index.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// MCP instances and their processes
const mcpInstances = new Map()

// Initialize MCP instances
function initializeMCPs() {
  // Convex MCP
  const convexMCP = new ConvexMCP()
  mcpInstances.set('convex', convexMCP)

  // Material-UI MCP
  const materialUIMCP = new MaterialUIMCP()
  mcpInstances.set('material-ui', materialUIMCP)

  console.log('✅ All MCP instances initialized')
}

// Call MCP method directly
async function callMCP(mcpName, method, params = {}) {
  const mcp = mcpInstances.get(mcpName)
  if (!mcp) {
    throw new Error(`MCP '${mcpName}' not found`)
  }

  // Simulate the JSON-RPC call by invoking the handler directly
  try {
    switch (method) {
      case 'tools/list':
        return await mcp.server._requestHandlers.get('tools/list')({
          method: 'tools/list',
          params: {},
        })
      case 'tools/call':
        return await mcp.server._requestHandlers.get('tools/call')({
          method: 'tools/call',
          params,
        })
      case 'resources/list':
        return await mcp.server._requestHandlers.get('resources/list')({
          method: 'resources/list',
          params: {},
        })
      case 'resources/read':
        return await mcp.server._requestHandlers.get('resources/read')({
          method: 'resources/read',
          params,
        })
      case 'initialize':
        return {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {}, resources: {} },
          serverInfo: {
            name: `${mcpName}-mcp-server`,
            version: '1.0.0',
          },
        }
      case 'ping':
        return { status: 'pong' }
      case 'notifications/initialized':
        return null
      default:
        throw new Error(`Method ${method} not supported`)
    }
  } catch (error) {
    throw new Error(`Error calling ${method} on ${mcpName}: ${error.message}`)
  }
}

// Setup routes for each MCP
function setupMCPRoutes() {
  const mcpNames = ['convex', 'material-ui']

  mcpNames.forEach((mcpName) => {
    // Health check
    app.get(`/${mcpName}/health`, (req, res) => {
      res.json({
        status: 'healthy',
        service: `${mcpName}-mcp`,
        timestamp: new Date().toISOString(),
        mcp_process: mcpInstances.has(mcpName) ? 'running' : 'stopped',
      })
    })

    // MCP endpoint info (GET)
    app.get(`/${mcpName}`, (req, res) => {
      res.json({
        transport: 'MCP-over-HTTP',
        protocol: 'JSON-RPC 2.0',
        version: '2024-11-05',
        server: `${mcpName}-mcp-server`,
        methods: [
          'initialize',
          'tools/list',
          'tools/call',
          'resources/list',
          'resources/read',
          'ping',
        ],
        usage: 'POST with JSON-RPC 2.0 payload',
        endpoints: {
          '/health': 'Health check',
          '/tools': 'List available tools (REST)',
          '/resources': 'List available resources (REST)',
          '/': 'MCP JSON-RPC endpoint (POST)',
        },
      })
    })

    // MCP JSON-RPC endpoint (POST)
    app.post(`/${mcpName}`, async (req, res) => {
      try {
        console.log(
          `🔍 ${mcpName.toUpperCase()} MCP Request:`,
          JSON.stringify(req.body, null, 2)
        )

        const { jsonrpc, method, params, id } = req.body

        if (jsonrpc !== '2.0') {
          return res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32600, message: 'Invalid Request' },
            id,
          })
        }

        const result = await callMCP(mcpName, method, params)

        // For notifications, return 204 No Content
        if (method.startsWith('notifications/')) {
          return res.status(204).send()
        }

        res.json({
          jsonrpc: '2.0',
          result,
          id,
        })
      } catch (error) {
        console.error(`Error in ${mcpName} MCP:`, error.message)
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: error.message },
          id: req.body?.id,
        })
      }
    })

    // REST API endpoints for convenience
    app.get(`/${mcpName}/tools`, async (req, res) => {
      try {
        const tools = await callMCP(mcpName, 'tools/list')
        res.json({
          success: true,
          tools: tools.tools || [],
          count: tools.tools?.length || 0,
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        })
      }
    })

    app.get(`/${mcpName}/resources`, async (req, res) => {
      try {
        const resources = await callMCP(mcpName, 'resources/list')
        res.json({
          success: true,
          resources: resources.resources || [],
          count: resources.resources?.length || 0,
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        })
      }
    })

    // Tool execution
    app.post(`/${mcpName}/tools/:toolName`, async (req, res) => {
      try {
        const { toolName } = req.params
        const args = req.body || {}

        const result = await callMCP(mcpName, 'tools/call', {
          name: toolName,
          arguments: args,
        })

        res.json({
          success: true,
          tool: toolName,
          result: result,
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          tool: req.params.toolName,
        })
      }
    })

    // Resource reading
    app.get(`/${mcpName}/resources/*`, async (req, res) => {
      try {
        const resourceUri = req.url.replace(`/${mcpName}/resources/`, '')
        const fullUri = resourceUri.startsWith(`${mcpName}://`)
          ? resourceUri
          : `${mcpName}://${resourceUri}`

        const result = await callMCP(mcpName, 'resources/read', {
          uri: fullUri,
        })

        res.json({
          success: true,
          uri: fullUri,
          contents: result.contents || [],
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          uri: req.url,
        })
      }
    })
  })

  // Special endpoints for Material-UI
  app.get('/material-ui/components', async (req, res) => {
    try {
      const result = await callMCP('material-ui', 'resources/read', {
        uri: 'mui://components',
      })

      res.json({
        success: true,
        components: result.contents[0]
          ? JSON.parse(result.contents[0].text)
          : {},
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  })

  app.post('/material-ui/generate', async (req, res) => {
    try {
      const result = await callMCP('material-ui', 'tools/call', {
        name: 'generate_component',
        arguments: req.body,
      })

      res.json({
        success: true,
        generated: result,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  })
}

// Main page
app.get('/', (req, res) => {
  res.json({
    service: 'MCP Pool Server',
    version: '2.0.0',
    description: 'Unified HTTP server for multiple MCPs',
    endpoints: {
      '/health': 'Overall system health',
      '/convex': 'Convex MCP endpoint (JSON-RPC)',
      '/material-ui': 'Material-UI MCP endpoint (JSON-RPC)',
    },
  })
})

// System health
app.get('/health', (req, res) => {
  const mcpStatuses = {}
  for (const [name] of mcpInstances) {
    mcpStatuses[`${name}-mcp`] = 'running'
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      'mcp-pool-server': 'running',
      ...mcpStatuses,
    },
  })
})

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Initializing MCP Pool Server...')

    // Initialize all MCPs
    initializeMCPs()

    // Setup routes
    setupMCPRoutes()

    // Start HTTP server
    app.listen(port, '0.0.0.0', () => {
      console.log(`🏊 MCP Pool Server running on port ${port}`)
      console.log(`📋 Available MCPs: convex, material-ui`)
      console.log(`🔗 Main endpoint: http://localhost:${port}`)
      console.log(`🎯 Convex MCP: http://localhost:${port}/convex`)
      console.log(`🎨 Material-UI MCP: http://localhost:${port}/material-ui`)
    })
  } catch (error) {
    console.error('❌ Failed to start MCP Pool Server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
