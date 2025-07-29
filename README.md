# 🏊 MCP Pool - Servidor HTTP Unificado para MCPs

Sistema unificado que permite **hospedar múltiplos MCPs via HTTP** para acesso remoto de qualquer máquina na rede local.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 8080)                   │
│                   Reverse Proxy                        │
└─────────────────────────┬───────────────────────────────┘
                          │
                  All requests
                          │
            ┌─────────────▼─────────────┐
            │    MCP Pool Server        │
            │    (Port 3000)            │
            │    Unified HTTP Server    │
            └─────────────┬─────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
   │Convex   │       │Material │      │ Future  │
   │MCP Core │       │UI MCP   │      │ MCPs    │
   │         │       │Core     │      │         │
   └─────────┘       └─────────┘      └─────────┘
```

**Servidor Unificado:**
- **1 Container** apenas (mcp-pool-server)
- **MCPs organizados** por pastas em `/mcps/`
- **Endpoints limpos** - `/convex` e `/material-ui` (sem `/mcp`)
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

### 4. Acesso Remoto (Outras Máquinas)

Substitua `localhost` pelo IP do seu mini server:

```bash
# Do seu notebook/desktop
curl http://192.168.1.100:8080/
curl http://192.168.1.100:8080/convex/tools

# Conectar Claude Code remotamente
claude mcp add --transport http convex http://192.168.1.100:8080/convex
```

## 🛠️ Como Usar os MCPs

### 🗄️ Convex MCP (Banco de Dados)

**Endpoints disponíveis:**
```bash
# MCP-over-HTTP (JSON-RPC) - Para Claude Code
POST /convex                     # Endpoint principal MCP

# REST API - Para desenvolvimento
GET  /convex/                    # Info da API
GET  /convex/health              # Status
GET  /convex/tools               # Listar ferramentas
GET  /convex/resources           # Listar recursos
POST /convex/tools/create_table  # Criar tabela
POST /convex/tools/insert_document # Inserir dados
POST /convex/tools/query_documents # Consultar dados
GET  /convex/resources/tables    # Ver tabelas
```

**Exemplo - Criar tabela:**
```bash
curl -X POST http://localhost:8080/convex/tools/create_table \
  -H "Content-Type: application/json" \
  -d '{"name": "users", "schema": {"name": "string", "email": "string"}}'
```

### 🎨 Material-UI MCP (Componentes React)

**Endpoints disponíveis:**
```bash
# MCP-over-HTTP (JSON-RPC) - Para Claude Code
POST /material-ui                # Endpoint principal MCP

# REST API - Para desenvolvimento
GET  /material-ui/               # Info da API
GET  /material-ui/health         # Status
GET  /material-ui/tools          # Listar ferramentas
GET  /material-ui/components     # Listar componentes
POST /material-ui/generate       # Gerar componente
POST /material-ui/tools/generate_component # Gerar via tool
GET  /material-ui/resources/theme # Ver tema padrão
```

**Exemplo - Gerar Button:**
```bash
curl -X POST http://localhost:8080/material-ui/generate \
  -H "Content-Type: application/json" \
  -d '{
    "component": "Button",
    "props": {"variant": "contained", "color": "primary"},
    "children": "Salvar"
  }'
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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export class MeuNovoMCP {
  constructor() {
    this.server = new Server({
      name: 'meu-novo-mcp-server',
      version: '1.0.0',
    }, {
      capabilities: { tools: {}, resources: {} }
    });
    this.setupHandlers();
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
              parametro: { type: 'string', description: 'Descrição do parâmetro' }
            },
            required: ['parametro']
          }
        }
      ]
    }));

    // Implementar outras handlers...
  }

  // Implementar métodos das ferramentas...
}
```

3. **Registrar no servidor principal** (server.js):
```javascript
import { MeuNovoMCP } from './mcps/meu-novo-mcp/index.js';

// Adicionar na função initializeMCPs()
const meuNovoMCP = new MeuNovoMCP();
mcpInstances.set('meu-novo-mcp', meuNovoMCP);

// Adicionar no array mcpNames
const mcpNames = ['convex', 'material-ui', 'meu-novo-mcp'];
```

4. **Rebuild e testar:**
```bash
docker compose up -d --build
curl http://localhost:8080/meu-novo-mcp/health
claude mcp add --transport http meu-novo http://localhost:8080/meu-novo-mcp
```

## 🔧 Uso Local vs Remoto

### 📱 Para Uso Local (Claude Code)

Use os endpoints diretos:

```bash
# Endpoints limpos - sem /mcp
claude mcp add --transport http convex http://localhost:8080/convex
claude mcp add --transport http mui http://localhost:8080/material-ui
```

### 🌐 Para Uso Remoto (HTTP)

Use o servidor HTTP - conecta via REST API:

```bash
# Sua máquina conecta ao mini server
curl http://192.168.1.100:8080/convex/tools
curl http://192.168.1.100:8080/material-ui/components
```

### 🔄 Ambos Funcionam Simultaneamente!

- **Claude Code:** JSON-RPC via HTTP (endpoints diretos)
- **Desenvolvimento:** REST API (endpoints `/tools`, `/resources`)

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

## 🌐 Configuração de Rede

### Para acesso de outras máquinas:

1. **Certifique-se que a porta 8080 está aberta**
2. **Use o IP correto do mini server**
3. **Configure firewall se necessário**

```bash
# Descobrir IP do mini server
ip addr show

# Testar conectividade 
curl http://IP_DO_MINI_SERVER:8080/health
```

## 🔍 Troubleshooting

### Container não inicia:
```bash
docker compose logs mcp-server
```

### MCP não responde:
```bash
# Verificar se servidor está rodando
docker compose exec mcp-server ps aux

# Testar endpoint diretamente
curl http://localhost:3000/convex/health
```

### Nginx não consegue conectar:
```bash
# Verificar conectividade interna
docker compose exec nginx wget -qO- http://mcp-pool-server:3000/health
```

## ✨ Melhorias na v2.0

### ✅ **Endpoints Limpos:**
- **Antes:** `http://localhost:8080/convex/mcp`
- **Agora:** `http://localhost:8080/convex`

### ✅ **Arquitetura Simplificada:**
- **Antes:** 3 containers (nginx + 2 MCPs)
- **Agora:** 2 containers (nginx + 1 servidor unificado)

### ✅ **Organização Modular:**
- **Antes:** MCPs espalhados em pastas separadas
- **Agora:** MCPs organizados em `/mcp-server/mcps/`

### ✅ **Fácil Escalabilidade:**
- **Adicionar MCP:** Apenas 1 pasta + registrar no server.js
- **Sem Docker Compose changes**
- **Sem Nginx config changes**

## 📚 Links Úteis

- [Documentação MCP](https://github.com/modelcontextprotocol)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Proxy Configuration](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)

---

## ✅ **Resumo v2.0**

**Você agora tem:**
- ✅ **Servidor HTTP unificado** com arquitetura mais limpa
- ✅ **Endpoints simplificados** sem `/mcp` 
- ✅ **MCPs organizados** por pastas modulares
- ✅ **Fácil escalabilidade** para novos MCPs
- ✅ **Menos containers** para gerenciar
- ✅ **Mesmo poder** com melhor organização

**Use os novos endpoints limpos:**
```bash
claude mcp add --transport http convex http://minipc.local:8080/convex
claude mcp add --transport http mui http://minipc.local:8080/material-ui
```

**Sistema v2.0 pronto para uso!** 🎯