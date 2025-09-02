#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export class ConvexMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'convex-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List of available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_table',
            description: 'Create a new table in Convex database',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the table to create',
                },
                schema: {
                  type: 'object',
                  description: 'Schema definition for the table',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'insert_document',
            description: 'Insert a document into a Convex table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to insert into',
                },
                document: {
                  type: 'object',
                  description: 'Document data to insert',
                },
              },
              required: ['table', 'document'],
            },
          },
          {
            name: 'query_documents',
            description: 'Query documents from a Convex table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to query from',
                },
                filter: {
                  type: 'object',
                  description: 'Filter criteria for the query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of documents to return',
                  default: 10,
                },
              },
              required: ['table'],
            },
          },
          {
            name: 'update_document',
            description: 'Update a document in a Convex table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name containing the document',
                },
                id: {
                  type: 'string',
                  description: 'Document ID to update',
                },
                updates: {
                  type: 'object',
                  description: 'Fields to update',
                },
              },
              required: ['table', 'id', 'updates'],
            },
          },
          {
            name: 'delete_document',
            description: 'Delete a document from a Convex table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name containing the document',
                },
                id: {
                  type: 'string',
                  description: 'Document ID to delete',
                },
              },
              required: ['table', 'id'],
            },
          },
        ],
      };
    });

    // List of available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'convex://tables',
            name: 'Database Tables',
            description: 'List of all tables in the Convex database',
            mimeType: 'application/json',
          },
          {
            uri: 'convex://schema',
            name: 'Database Schema',
            description: 'Complete schema definition of the database',
            mimeType: 'application/json',
          },
          {
            uri: 'convex://functions',
            name: 'Convex Functions',
            description: 'List of available Convex functions',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Resource reading
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'convex://tables':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  tables: ['users', 'messages', 'documents', 'sessions'],
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };

        case 'convex://schema':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  schema: {
                    users: {
                      fields: ['name', 'email', 'createdAt'],
                      indexes: ['email'],
                    },
                    messages: {
                      fields: ['content', 'userId', 'timestamp'],
                      indexes: ['userId', 'timestamp'],
                    },
                    documents: {
                      fields: ['title', 'content', 'tags', 'createdAt'],
                      indexes: ['tags', 'createdAt'],
                    },
                  },
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };

        case 'convex://functions':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  functions: {
                    queries: ['getUsers', 'getMessages', 'getDocuments'],
                    mutations: ['createUser', 'sendMessage', 'updateDocument'],
                    actions: ['sendEmail', 'processDocument'],
                  },
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Resource not found: ${uri}`);
      }
    });

    // Tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_table':
            return await this.createTable(args);
          case 'insert_document':
            return await this.insertDocument(args);
          case 'query_documents':
            return await this.queryDocuments(args);
          case 'update_document':
            return await this.updateDocument(args);
          case 'delete_document':
            return await this.deleteDocument(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Mock implementation of Convex operations
  async createTable(args) {
    const { name, schema } = args;
    
    const result = {
      success: true,
      table: name,
      schema: schema || {},
      created_at: new Date().toISOString(),
      message: `Table '${name}' created successfully`,
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ Table '${name}' created successfully!\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async insertDocument(args) {
    const { table, document } = args;
    
    const result = {
      success: true,
      table,
      document_id: `doc_${Date.now()}`,
      document,
      inserted_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ Document inserted into '${table}'!\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async queryDocuments(args) {
    const { table, filter, limit = 10 } = args;
    
    // Mock data based on table
    const mockData = {
      users: [
        { _id: 'user_1', name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01T00:00:00Z' },
        { _id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-02T00:00:00Z' },
      ],
      messages: [
        { _id: 'msg_1', content: 'Hello World!', userId: 'user_1', timestamp: '2024-01-01T10:00:00Z' },
        { _id: 'msg_2', content: 'How are you?', userId: 'user_2', timestamp: '2024-01-01T10:05:00Z' },
      ],
      documents: [
        { _id: 'doc_1', title: 'Welcome Guide', content: 'Getting started...', tags: ['guide'], createdAt: '2024-01-01T00:00:00Z' },
      ],
    };

    const documents = mockData[table] || [];
    const filteredDocs = documents.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: `📋 Query results from '${table}' (${filteredDocs.length} documents):\n\n${JSON.stringify(filteredDocs, null, 2)}`,
        },
      ],
    };
  }

  async updateDocument(args) {
    const { table, id, updates } = args;
    
    const result = {
      success: true,
      table,
      document_id: id,
      updates,
      updated_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ Document '${id}' updated in '${table}'!\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async deleteDocument(args) {
    const { table, id } = args;
    
    const result = {
      success: true,
      table,
      document_id: id,
      deleted_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `🗑️ Document '${id}' deleted from '${table}'!\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}