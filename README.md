# 🏊 MCP Pool - Servidor HTTP Unificado para MCPs

Sistema unificado que permite **hospedar múltiplos MCPs via HTTP**

## 🏗️ Arquitetura

**Servidor Unificado:**

- **1 Container** apenas (mcp-pool-server)
- **MCPs organizados** por pastas em `/mcps/`
- **Endpoints limpos** - `/convex` e `/material-ui`
- **Fácil escalabilidade** para adicionar novos MCPs

## 📁 Estrutura do Projeto

```
mcp-pool/
├── mcp-server/                  # Servidor HTTP unificado
│   ├── mcps/                    # MCPs organizados por pasta
│   │   ├── convex/
│   │   │   └── index.js         # Convex MCP Core
│   │   └── material-ui/
│   │       └── index.js         # Material-UI MCP Core
│   ├── server.js                # Servidor HTTP principal
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf               # Proxy configuration
├── docker-compose.yml           # Orchestração simplificada
├── .env                         # Configurações
└── README.md
```

## 🚀 Setup Rápido

### 1. Subir o Servidor

```bash
# Construir e iniciar todos os serviços
docker compose up -d --build

# Verificar status
docker compose ps
```

### 2. Conectar Claude Code via HTTP

Agora os endpoints são **mais limpos**:

```bash
# Convex MCP (endpoint direto)
claude mcp add --transport http convex http://minipc.local:8080/convex

# Material-UI MCP (endpoint direto)
claude mcp add --transport http mui http://minipc.local:8080/material-ui

# Verificar conexões
claude mcp list
```

### 3. Acessar MCPs via HTTP

O servidor estará disponível em `http://localhost:8080`:

```bash
# Página principal - lista MCPs disponíveis
curl http://localhost:8080/

# Health check do sistema
curl http://localhost:8080/health

# Convex MCP (endpoint limpo)
curl http://localhost:8080/convex
curl http://localhost:8080/convex/tools

# Material-UI MCP (endpoint limpo)
curl http://localhost:8080/material-ui
curl http://localhost:8080/material-ui/components
```

## ➕ Adicionar Novo MCP

### Passo a Passo Simplificado:

1. **Criar pasta do MCP:**

```bash
mkdir mcp-pool/mcp-server/mcps/meu-novo-mcp
cd mcp-pool/mcp-server/mcps/meu-novo-mcp
```

2. **Criar index.js** (MCP Core):

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

export class MeuNovoMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'meu-novo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: { tools: {}, resources: {} },
      }
    )
    this.setupHandlers()
  }

  setupHandlers() {
    // Definir ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'minha_ferramenta',
          description: 'Descrição da ferramenta',
          inputSchema: {
            type: 'object',
            properties: {
              parametro: {
                type: 'string',
                description: 'Descrição do parâmetro',
              },
            },
            required: ['parametro'],
          },
        },
      ],
    }))

    // Implementar outras handlers...
  }

  // Implementar métodos das ferramentas...
}
```

3. **Registrar no servidor principal** (server.js):

```javascript
import { MeuNovoMCP } from './mcps/meu-novo-mcp/index.js'

// Adicionar na função initializeMCPs()
const meuNovoMCP = new MeuNovoMCP()
mcpInstances.set('meu-novo-mcp', meuNovoMCP)

// Adicionar no array mcpNames
const mcpNames = ['convex', 'material-ui', 'meu-novo-mcp']
```

4. **Rebuild e testar:**

```bash
docker compose up -d --build
curl http://localhost:8080/meu-novo-mcp/health
claude mcp add --transport http meu-novo http://localhost:8080/meu-novo-mcp
```

## 🔧 Operações Comuns

```bash
# Ver logs em tempo real
docker compose logs -f

# Restart do servidor unificado
docker compose restart mcp-server

# Ver status detalhado
docker compose ps

# Rebuild após mudanças
docker compose up -d --build

# Parar tudo
docker compose down

# Ver logs de erro
docker compose logs nginx
docker compose logs mcp-server
```
