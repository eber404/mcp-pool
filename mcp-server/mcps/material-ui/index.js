#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuração dos componentes Material-UI
const MUI_COMPONENTS = {
  Button: {
    description: 'Interactive button component with various styles and states',
    props: ['variant', 'color', 'size', 'disabled', 'startIcon', 'endIcon', 'fullWidth'],
    examples: [
      '<Button variant="contained" color="primary">Click me</Button>',
      '<Button variant="outlined" color="secondary" disabled>Disabled</Button>',
      '<Button variant="text" size="large" fullWidth>Full Width</Button>',
    ],
    documentation: 'https://mui.com/material-ui/react-button/',
  },
  TextField: {
    description: 'Input field component for text data with validation and styling',
    props: ['label', 'variant', 'value', 'onChange', 'placeholder', 'type', 'required', 'error', 'helperText'],
    examples: [
      '<TextField label="Name" variant="outlined" />',
      '<TextField label="Email" type="email" required />',
      '<TextField label="Password" type="password" variant="filled" />',
    ],
    documentation: 'https://mui.com/material-ui/react-text-field/',
  },
  Card: {
    description: 'Surface component for displaying content in contained format',
    props: ['elevation', 'variant', 'sx'],
    examples: [
      '<Card><CardContent>Basic card content</CardContent></Card>',
      '<Card elevation={3}><CardHeader title="Card Title" /></Card>',
      '<Card variant="outlined"><CardActions><Button>Action</Button></CardActions></Card>',
    ],
    documentation: 'https://mui.com/material-ui/react-card/',
  },
  Typography: {
    description: 'Text display component with consistent theming and hierarchy',
    props: ['variant', 'color', 'component', 'align', 'gutterBottom', 'noWrap'],
    examples: [
      '<Typography variant="h1">Main Heading</Typography>',
      '<Typography variant="body1" color="textSecondary">Body text</Typography>',
      '<Typography variant="caption" align="center">Caption text</Typography>',
    ],
    documentation: 'https://mui.com/material-ui/react-typography/',
  },
  Box: {
    description: 'Layout component for styling, spacing, and responsive design',
    props: ['sx', 'component', 'display', 'flexDirection', 'justifyContent', 'alignItems'],
    examples: [
      '<Box sx={{ padding: 2 }}>Content with padding</Box>',
      '<Box display="flex" justifyContent="center">Centered content</Box>',
      '<Box component="section" sx={{ backgroundColor: "primary.main" }}>Styled box</Box>',
    ],
    documentation: 'https://mui.com/system/react-box/',
  },
  Grid: {
    description: 'Responsive layout component using CSS Grid and Flexbox',
    props: ['container', 'item', 'xs', 'sm', 'md', 'lg', 'xl', 'spacing', 'direction'],
    examples: [
      '<Grid container spacing={2}><Grid item xs={12}>Full width</Grid></Grid>',
      '<Grid container><Grid item xs={6}>Half width</Grid></Grid>',
      '<Grid container direction="column" spacing={1}>Vertical layout</Grid>',
    ],
    documentation: 'https://mui.com/material-ui/react-grid/',
  },
  Paper: {
    description: 'Surface component that mimics physical paper with elevation',
    props: ['elevation', 'variant', 'square', 'sx'],
    examples: [
      '<Paper elevation={1}>Basic paper</Paper>',
      '<Paper variant="outlined" square>Outlined square paper</Paper>',
      '<Paper sx={{ padding: 3, backgroundColor: "grey.100" }}>Styled paper</Paper>',
    ],
    documentation: 'https://mui.com/material-ui/react-paper/',
  },
  Chip: {
    description: 'Compact component for tags, categories, or user input',
    props: ['label', 'variant', 'color', 'size', 'onDelete', 'onClick', 'avatar', 'icon'],
    examples: [
      '<Chip label="Basic chip" />',
      '<Chip label="Deletable" onDelete={() => {}} />',
      '<Chip label="Clickable" onClick={() => {}} color="primary" />',
    ],
    documentation: 'https://mui.com/material-ui/react-chip/',
  },
};

export class MaterialUIMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'material-ui-mcp-server',
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
    // Lista de ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_component',
            description: 'Generate Material-UI component code with specified props',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'Name of the Material-UI component',
                  enum: Object.keys(MUI_COMPONENTS),
                },
                props: {
                  type: 'object',
                  description: 'Props to apply to the component',
                },
                children: {
                  type: 'string',
                  description: 'Content inside the component',
                },
                typescript: {
                  type: 'boolean',
                  description: 'Generate TypeScript version',
                  default: false,
                },
              },
              required: ['component'],
            },
          },
          {
            name: 'get_component_props',
            description: 'Get available props and documentation for a component',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'Name of the Material-UI component',
                  enum: Object.keys(MUI_COMPONENTS),
                },
              },
              required: ['component'],
            },
          },
          {
            name: 'create_theme',
            description: 'Generate a custom Material-UI theme configuration',
            inputSchema: {
              type: 'object',
              properties: {
                primaryColor: {
                  type: 'string',
                  description: 'Primary color for the theme',
                  default: '#1976d2',
                },
                secondaryColor: {
                  type: 'string',
                  description: 'Secondary color for the theme',
                  default: '#dc004e',
                },
                mode: {
                  type: 'string',
                  description: 'Theme mode',
                  enum: ['light', 'dark'],
                  default: 'light',
                },
                typography: {
                  type: 'object',
                  description: 'Typography customizations',
                },
              },
            },
          },
          {
            name: 'generate_form',
            description: 'Generate a complete form using Material-UI components',
            inputSchema: {
              type: 'object',
              properties: {
                fields: {
                  type: 'array',
                  description: 'Array of form fields',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      label: { type: 'string' },
                      type: { type: 'string' },
                      required: { type: 'boolean' },
                    },
                  },
                },
                submitLabel: {
                  type: 'string',
                  description: 'Submit button label',
                  default: 'Submit',
                },
              },
              required: ['fields'],
            },
          },
          {
            name: 'search_components',
            description: 'Search for Material-UI components by functionality',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for component functionality',
                },
                category: {
                  type: 'string',
                  description: 'Component category',
                  enum: ['input', 'display', 'layout', 'navigation', 'feedback'],
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // Lista de recursos disponíveis
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'mui://components',
            name: 'Material-UI Components',
            description: 'Complete list of available Material-UI components',
            mimeType: 'application/json',
          },
          {
            uri: 'mui://theme',
            name: 'Default Theme Configuration',
            description: 'Default Material-UI theme structure and values',
            mimeType: 'application/json',
          },
          {
            uri: 'mui://examples',
            name: 'Component Examples',
            description: 'Code examples for all components',
            mimeType: 'application/json',
          },
          {
            uri: 'mui://installation',
            name: 'Installation Guide',
            description: 'How to install and setup Material-UI',
            mimeType: 'text/markdown',
          },
        ],
      };
    });

    // Leitura de recursos
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'mui://components':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  components: MUI_COMPONENTS,
                  count: Object.keys(MUI_COMPONENTS).length,
                  categories: {
                    input: ['TextField', 'Button'],
                    display: ['Typography', 'Chip'],
                    layout: ['Box', 'Grid', 'Paper'],
                    surfaces: ['Card', 'Paper'],
                  },
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };

        case 'mui://theme':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  theme: {
                    palette: {
                      mode: 'light',
                      primary: { main: '#1976d2' },
                      secondary: { main: '#dc004e' },
                      error: { main: '#d32f2f' },
                      warning: { main: '#ed6c02' },
                      info: { main: '#0288d1' },
                      success: { main: '#2e7d32' },
                    },
                    typography: {
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                      h1: { fontSize: '2.125rem' },
                      h2: { fontSize: '1.5rem' },
                      body1: { fontSize: '1rem' },
                    },
                    spacing: 8,
                    breakpoints: {
                      xs: 0,
                      sm: 600,
                      md: 900,
                      lg: 1200,
                      xl: 1536,
                    },
                  },
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };

        case 'mui://examples':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  examples: Object.fromEntries(
                    Object.entries(MUI_COMPONENTS).map(([name, component]) => [
                      name,
                      {
                        description: component.description,
                        examples: component.examples,
                        documentation: component.documentation,
                      },
                    ])
                  ),
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };

        case 'mui://installation':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: `# Material-UI Installation Guide

## 1. Install Material-UI

\`\`\`bash
npm install @mui/material @emotion/react @emotion/styled
\`\`\`

## 2. Install Icon Package (Optional)

\`\`\`bash
npm install @mui/icons-material
\`\`\`

## 3. Setup Theme Provider

\`\`\`jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app content */}
    </ThemeProvider>
  );
}
\`\`\`

## 4. Import Components

\`\`\`jsx
import { Button, TextField, Card } from '@mui/material';
\`\`\`

## 5. Ready to Use!

Your Material-UI setup is complete. Start building beautiful React components!
`,
              },
            ],
          };

        default:
          throw new Error(`Resource not found: ${uri}`);
      }
    });

    // Execução de ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_component':
            return await this.generateComponent(args);
          case 'get_component_props':
            return await this.getComponentProps(args);
          case 'create_theme':
            return await this.createTheme(args);
          case 'generate_form':
            return await this.generateForm(args);
          case 'search_components':
            return await this.searchComponents(args);
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

  async generateComponent(args) {
    const { component, props = {}, children = '', typescript = false } = args;
    
    if (!MUI_COMPONENTS[component]) {
      throw new Error(`Unknown component: ${component}. Available: ${Object.keys(MUI_COMPONENTS).join(', ')}`);
    }

    const propsString = Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .filter(Boolean)
      .join(' ');

    const componentCode = `<${component}${propsString ? ' ' + propsString : ''}>${children}</${component}>`;
    
    const importStatement = `import { ${component} } from '@mui/material';`;
    
    const tsTypes = typescript ? `
// TypeScript Props Interface
interface ${component}Props {
${Object.entries(props).map(([key, value]) => 
  `  ${key}?: ${typeof value};`
).join('\n')}
}` : '';

    return {
      content: [
        {
          type: 'text',
          text: `🎨 Generated ${component} component!\n\n**Import:**\n\`\`\`jsx\n${importStatement}\n\`\`\`\n\n**Component:**\n\`\`\`jsx\n${componentCode}\n\`\`\`${typescript ? `\n\n**TypeScript Types:**\n\`\`\`typescript${tsTypes}\n\`\`\`` : ''}`,
        },
      ],
    };
  }

  async getComponentProps(args) {
    const { component } = args;
    
    if (!MUI_COMPONENTS[component]) {
      throw new Error(`Unknown component: ${component}`);
    }

    const componentData = MUI_COMPONENTS[component];
    
    return {
      content: [
        {
          type: 'text',
          text: `📋 ${component} Component Documentation\n\n**Description:**\n${componentData.description}\n\n**Available Props:**\n${componentData.props.map(prop => `• ${prop}`).join('\n')}\n\n**Examples:**\n\`\`\`jsx\n${componentData.examples.join('\n\n')}\n\`\`\`\n\n**Documentation:** ${componentData.documentation}`,
        },
      ],
    };
  }

  async createTheme(args) {
    const { primaryColor = '#1976d2', secondaryColor = '#dc004e', mode = 'light', typography = {} } = args;

    const themeConfig = {
      palette: {
        mode,
        primary: { main: primaryColor },
        secondary: { main: secondaryColor },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        ...typography,
      },
      spacing: 8,
    };

    const themeCode = `import { createTheme } from '@mui/material/styles';

const theme = createTheme(${JSON.stringify(themeConfig, null, 2)});

export default theme;`;

    return {
      content: [
        {
          type: 'text',
          text: `🎨 Custom Material-UI Theme Generated!\n\n\`\`\`javascript\n${themeCode}\n\`\`\`\n\n**Usage:**\n\`\`\`jsx\nimport { ThemeProvider } from '@mui/material/styles';\nimport theme from './theme';\n\nfunction App() {\n  return (\n    <ThemeProvider theme={theme}>\n      {/* Your app */}\n    </ThemeProvider>\n  );\n}\n\`\`\``,
        },
      ],
    };
  }

  async generateForm(args) {
    const { fields, submitLabel = 'Submit' } = args;

    const formFields = fields.map(field => {
      const { name, label, type = 'text', required = false } = field;
      return `    <TextField\n      name="${name}"\n      label="${label}"\n      type="${type}"\n      ${required ? 'required' : ''}\n      fullWidth\n      margin="normal"\n    />`;
    }).join('\n');

    const formCode = `import { Box, TextField, Button } from '@mui/material';

function MyForm() {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
${formFields}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        ${submitLabel}
      </Button>
    </Box>
  );
}

export default MyForm;`;

    return {
      content: [
        {
          type: 'text',
          text: `📝 Generated Material-UI Form!\n\n\`\`\`jsx\n${formCode}\n\`\`\``,
        },
      ],
    };
  }

  async searchComponents(args) {
    const { query, category } = args;
    
    const searchQuery = query.toLowerCase();
    const matchingComponents = Object.entries(MUI_COMPONENTS)
      .filter(([name, component]) => {
        const nameMatch = name.toLowerCase().includes(searchQuery);
        const descriptionMatch = component.description.toLowerCase().includes(searchQuery);
        return nameMatch || descriptionMatch;
      });

    const results = matchingComponents.map(([name, component]) => ({
      name,
      description: component.description,
      documentation: component.documentation,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `🔍 Search Results for "${query}"\n\n${results.length} components found:\n\n${results.map(result => 
            `**${result.name}**\n${result.description}\n📖 ${result.documentation}`
          ).join('\n\n')}`,
        },
      ],
    };
  }
}