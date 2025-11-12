/**
 * OpenChoreo Observability API Client Library
 *
 * Auto-generated TypeScript clients for OpenChoreo Observability APIs.
 * This library provides type-safe API clients for interacting with the OpenChoreo Observability Platform.
 *
 * @packageDocumentation
 */

// Export factory functions
export {
  createOpenChoreoObsClient,
  createOpenChoreoObsClientsFromConfig,
  type OpenChoreoObsClientConfig,
} from './factory';

// Export version constant (generated during build)
export { OPENCHOREO_VERSION } from './version';

// Re-export generated types with namespaces to avoid conflicts
export type * as ObservabilityAPI from './generated/observability/types';
