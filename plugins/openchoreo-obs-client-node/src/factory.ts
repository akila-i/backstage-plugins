/**
 * Factory functions for creating OpenChoreo Observability API clients
 *
 * @packageDocumentation
 */

import { LoggerService } from '@backstage/backend-plugin-api';
import createClient, { type ClientOptions } from 'openapi-fetch';
import type { paths as ObservabilityPaths } from './generated/observability/types';

/**
 * Configuration options for OpenChoreo Observability API clients
 */
export interface OpenChoreoObsClientConfig {
  /**
   * Custom fetch implementation
   * Useful for testing or using a specific fetch polyfill
   */
  fetchApi?: typeof fetch;

  /**
   * Optional logger for debugging
   */
  logger?: LoggerService;
}

/**
 * Creates an OpenChoreo Observability API client
 *
 * @param config - Configuration options for the client
 * @returns Configured Observability API client instance
 *
 * @example
 * ```typescript
 * const obsClient = createOpenChoreoObsClient();
 *
 * const { data, error } = await obsClient.GET('/metrics', {
 *   params: { query: { limit: 10 } }
 * });
 * ```
 */
export function createOpenChoreoObsClient(config: OpenChoreoObsClientConfig) {
  const { fetchApi, logger } = config;

  logger?.debug(`Creating OpenChoreo Observability API client`);

  const clientOptions: ClientOptions = {
    fetch: fetchApi,
  };

  return createClient<ObservabilityPaths>(clientOptions);
}

/**
 * Creates OpenChoreo Observability API clients from Backstage configuration
 *
 * @param logger - Optional logger service
 * @returns Object containing observer API client
 *
 * @example
 * ```typescript
 * // In your Backstage backend module
 * const clients = createOpenChoreoObsClientsFromConfig(logger);
 * const { data: metrics } = await clients.obsClient.GET('/metrics', {
 *   params: { query: { limit: 10 } }
 * });
 */
export function createOpenChoreoObsClientsFromConfig(
  logger?: LoggerService,
) {
  logger?.info('Initializing OpenChoreo Observability API clients');

  const clientConfig: OpenChoreoObsClientConfig = {
    logger,
  };

  return {
    obsClient: createOpenChoreoObsClient(clientConfig),
  };
}
