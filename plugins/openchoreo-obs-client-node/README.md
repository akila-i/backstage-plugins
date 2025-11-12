# @openchoreo/backstage-plugin-openchoreo-obs-client-node

Auto-generated TypeScript API clients for [OpenChoreo Observability Add On API](https://github.com/openchoreo/openchoreo/tree/main/internal/observer).

This library provides type-safe, fully typed API clients for interacting with OpenChoreo Observability Add On API, built using `openapi-typescript` and `openapi-fetch` for maximum type safety and developer experience.

## Features

- ✨ **Fully Type-Safe**: Generated from OpenAPI specs with complete TypeScript types
- 🔄 **Auto-Regeneration**: Automatically regenerates clients on build
- 📦 **Zero Runtime Dependencies**: Uses native `fetch` API (Node.js 18+)
- 🎯 **Version-Controlled**: OpenChoreo version tracked in `package.json`
- 🔧 **Backstage Integration**: Factory functions for easy Backstage backend integration
- 🚀 **Modern Stack**: Built with `openapi-typescript` and `openapi-fetch`

## Installation

This package is part of the OpenChoreo Backstage plugins monorepo and is installed automatically when you install the workspace dependencies.

```bash
yarn install
```

## Quick Start

### Basic Usage

```typescript
import {
  createOpenChoreoObsClient,
} from '@openchoreo/backstage-plugin-openchoreo-obs-client-node';

// Create API client
const obsClient = createOpenChoreoObsClient();

// Query metrics with type-safe parameters
// TODO: Update the query to the correct OpenAPI spec
const { data: metrics, error: metricsError } = await obsClient.GET('/metrics', {
  params: {
    query: {
      limit: 10,
      offset: 0,
      filter: 'service eq "api-gateway"',
    },
  },
});

if (metricsError) {
  console.error('Error fetching metrics:', metricsError);
} else {
  console.log('Metrics:', metrics);
}
```

### Backstage Integration

For Backstage backend modules, use the config-based factory:

```typescript
import { createOpenChoreoObsClientsFromConfig } from '@openchoreo/backstage-plugin-openchoreo-obs-client-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

export function createMyService(config: Config, logger: LoggerService) {
  const { obsClient } = createOpenChoreoObsClientsFromConfig(
    config,
    logger,
  );

  // Use the client
  // TODO: Update the query to the correct OpenAPI spec
  const { data: logs } = await obsClient.GET('/logs');
  const { data: metrics } = await obsClient.GET('/metrics');


  return { logs,metrics };
}
```

## API Clients

This library provides API clients for OpenChoreo Observability Add On API:

### Observability API

Interact with OpenChoreo's Observability Add On API (Observer):

```typescript
// Query metrics
// TODO: Update the query to the correct OpenAPI spec
await obsClient.GET('/metrics', { params: { query: { limit: 10 } } });

// Get logs
// TODO: Update the query to the correct OpenAPI spec
await obsClient.GET('/logs', {
  params: {
    query: {
      service: 'api-gateway',
      severity: 'error'
    }
  }
});
```

## Generating API Clients

### Automatic Generation (Recommended)

Clients are automatically generated before build:

```bash
yarn build
```

This will:

1. Download OpenAPI specs from OpenChoreo repository (using version from `package.json`)
2. Generate TypeScript types
3. Build the package

### Manual Generation

Generate clients manually:

```bash
# Generate using version from package.json
yarn generate:clients

# Clean generated files
yarn clean:generated

# Clean and regenerate
yarn clean:generated && yarn generate:clients
```

### Testing Against Different Versions

Test against a specific OpenChoreo version without modifying `package.json`:

```bash
bash scripts/generate-clients.sh --openchoreo-version v0.2.0
```

## Upgrading OpenChoreo Version

To upgrade to a new OpenChoreo version:

1. **Update `package.json`**:

   ```json
   {
     "openchoreoVersion": "v0.2.0"
   }
   ```

2. **Regenerate clients**:

   ```bash
   yarn clean:generated
   yarn generate:clients
   ```

3. **Test the changes**:

   ```bash
   yarn build
   yarn test
   ```

4. **Commit**:
   ```bash
   git add plugins/openchoreo-obs-client-node/package.json
   git commit -m "chore: upgrade OpenChoreo Observability client to v0.2.0"
   ```

## Configuration Options

### OpenChoreoObsClientConfig

```typescript
interface OpenChoreoObsClientConfig {
  fetchApi?: typeof fetch; // Custom fetch implementation (optional)
  logger?: LoggerService; // Backstage logger (optional)
}
```

## Type Safety

All API endpoints, parameters, request bodies, and response types are fully typed:

```typescript
// ✅ TypeScript will validate paths, parameters, and responses
// TODO: Update the query to the correct OpenAPI spec
const { data } = await obsClient.GET('/metrics', {
  params: {
    query: {
      limit: 10,
      offset: 0,
      filter: 'service eq "api-gateway"',
    },
  },
});

// ❌ TypeScript will error on invalid paths
const { data } = await obsClient.GET('/invalid-path'); // Type error!

// ❌ TypeScript will error on invalid parameters
const { data } = await obsClient.GET('/metrics', {
  params: {
    query: {
      invalidParam: true, // Type error!
    },
  },
});
```

## Error Handling

`openapi-fetch` returns both `data` and `error`, never throws:

```typescript
const { data, error } = await obsClient.GET('/metrics');

if (error) {
  // Handle error (error is typed based on OpenAPI spec)
  console.error('API Error:', error);
  return;
}

// TypeScript knows data is defined here
console.log('Metrics:', data.metrics);
```

## Development

### Project Structure

```
plugins/openchoreo-obs-client-node/
├── src/
│   ├── generated/          # Auto-generated (gitignored)
│   │   └── observability/  # Observability API types
│   │       ├── types.ts
│   │       └── index.ts
│   ├── factory.ts          # Client factory functions
│   ├── index.ts            # Public API exports
│   └── version.ts          # OpenChoreo version (auto-generated)
├── openapi/                # Downloaded specs (gitignored)
│   └── observability.yaml
├── scripts/
│   └── generate-clients.sh # Generation script
├── package.json            # Contains openchoreoVersion field
└── README.md
```

### Scripts

- `yarn generate:clients` - Generate API clients from OpenAPI specs
- `yarn clean:generated` - Remove generated files
- `yarn build` - Build the package (auto-generates clients first)
- `yarn lint` - Lint the code
- `yarn test` - Run tests

## OpenChoreo Version Information

Current OpenChoreo version: Check `openchoreoVersion` in `package.json`

Generated clients are version-specific to the OpenChoreo release. The version constant is exported:

```typescript
import { OPENCHOREO_VERSION } from '@openchoreo/backstage-plugin-openchoreo-obs-client-node';

console.log('Using OpenChoreo version:', OPENCHOREO_VERSION); // e.g., "v0.1.0"
```

## Troubleshooting

### "Cannot find module './generated/observability'"

Run the generation script:

```bash
yarn generate:clients
```

### "Failed to download observability.yaml"

Check that the OpenChoreo version exists:

```bash
# Check available tags at:
# https://github.com/openchoreo/openchoreo/tags
```

### Type errors after upgrading OpenChoreo version

Clean and regenerate:

```bash
yarn clean:generated
yarn generate:clients
yarn build
```

## Contributing

This package is part of the OpenChoreo Backstage plugins monorepo. See the main repository README for contribution guidelines.

## License

Apache-2.0

## Links

- [OpenChoreo Observability Repository](https://github.com/openchoreo/openchoreo/tree/main/internal/observer)
- [OpenAPI Spec - Observability API](https://github.com/openchoreo/openchoreo/blob/main/cmd/observer/openapi.yaml) # TODO: Update the link to the correct OpenAPI spec
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [openapi-fetch](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-fetch)
