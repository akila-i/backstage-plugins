import { LoggerService } from '@backstage/backend-plugin-api';
import { createOpenChoreoApiClient } from '@openchoreo/openchoreo-client-node';

// Type for complete component response
export interface ModelsCompleteComponent {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp?: string;
  };
  spec: {
    displayName: string;
    description?: string;
    type?: string;
  };
  builds?: any[];
  buildTemplates?: any[];
}

export class ComponentInfoService {
  private logger: LoggerService;
  private baseUrl: string;
  private token?: string;

  constructor(logger: LoggerService, baseUrl: string, token?: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async fetchComponentDetails(
    orgName: string,
    projectName: string,
    componentName: string,
  ): Promise<ModelsCompleteComponent> {
    this.logger.debug(
      `Fetching component details for: ${componentName} in project: ${projectName}, organization: ${orgName}`,
    );

    try {
      const client = createOpenChoreoApiClient({
        baseUrl: this.baseUrl,
        token: this.token,
        logger: this.logger,
      });

      const { data, error, response } = await client.GET(
        '/orgs/{orgName}/projects/{projectName}/components/{componentName}',
        {
          params: {
            path: { orgName, projectName, componentName },
          },
        },
      );

      if (error || !response.ok) {
        throw new Error(
          `Failed to fetch component: ${response.status} ${response.statusText}`,
        );
      }

      const apiResponse = data as any;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(
          `API returned unsuccessful response: ${JSON.stringify(apiResponse)}`,
        );
      }

      this.logger.debug(
        `Successfully fetched component details for: ${componentName}`,
      );
      return apiResponse.data as ModelsCompleteComponent;
    } catch (error) {
      this.logger.error(
        `Failed to fetch component details for ${componentName}: ${error}`,
      );
      throw error;
    }
  }
}
