import {
  collectPipelineEnvNames,
  dataPlaneKey,
  dataPlaneRunsCilium,
  projectHasCiliumEnvironment,
  type WirelogsCiliumIndex,
} from './wirelogs';

describe('dataPlaneRunsCilium', () => {
  it('is true only when the netpol-provider annotation is cilium', () => {
    expect(
      dataPlaneRunsCilium({ 'openchoreo.dev/networkpolicyprovider': 'cilium' }),
    ).toBe(true);
    expect(
      dataPlaneRunsCilium({ 'openchoreo.dev/networkpolicyprovider': 'none' }),
    ).toBe(false);
    expect(dataPlaneRunsCilium({})).toBe(false);
    expect(dataPlaneRunsCilium(undefined)).toBe(false);
  });
});

describe('dataPlaneKey', () => {
  it('namespaces DataPlanes but not ClusterDataPlanes', () => {
    expect(dataPlaneKey('DataPlane', 'dp', 'ns')).toBe('DataPlane/ns/dp');
    expect(dataPlaneKey('ClusterDataPlane', 'cdp')).toBe(
      'ClusterDataPlane/cdp',
    );
  });
});

describe('collectPipelineEnvNames', () => {
  it('collects unique source and target environment names', () => {
    const pipeline = {
      spec: {
        promotionPaths: [
          {
            sourceEnvironmentRef: { kind: 'Environment', name: 'dev' },
            targetEnvironmentRefs: [{ kind: 'Environment', name: 'staging' }],
          },
          {
            sourceEnvironmentRef: { kind: 'Environment', name: 'staging' },
            targetEnvironmentRefs: [{ kind: 'Environment', name: 'prod' }],
          },
        ],
      },
    } as any;
    expect(collectPipelineEnvNames(pipeline).sort()).toEqual([
      'dev',
      'prod',
      'staging',
    ]);
  });

  it('returns [] for a pipeline with no promotion paths', () => {
    expect(collectPipelineEnvNames(undefined)).toEqual([]);
    expect(collectPipelineEnvNames({ spec: {} } as any)).toEqual([]);
  });
});

describe('projectHasCiliumEnvironment', () => {
  const makeIndex = (
    overrides: Partial<WirelogsCiliumIndex> = {},
  ): WirelogsCiliumIndex => ({
    envDpRefByNs: new Map([
      [
        'ns',
        new Map([
          ['dev', { kind: 'DataPlane', name: 'dp-dev' }],
          ['prod', { kind: 'ClusterDataPlane', name: 'cdp-prod' }],
        ]),
      ],
    ]),
    ciliumByDpKey: new Map([
      [dataPlaneKey('DataPlane', 'dp-dev', 'ns'), false],
      [dataPlaneKey('ClusterDataPlane', 'cdp-prod'), true],
    ]),
    pipelineEnvsByKey: new Map([['ns/pipe', ['dev', 'prod']]]),
    ...overrides,
  });

  it('is true when any pipeline env resolves to a Cilium DataPlane', () => {
    expect(projectHasCiliumEnvironment('ns', 'pipe', makeIndex())).toBe(true);
  });

  it('is false when no pipeline env runs Cilium', () => {
    const index = makeIndex({
      ciliumByDpKey: new Map([
        [dataPlaneKey('DataPlane', 'dp-dev', 'ns'), false],
        [dataPlaneKey('ClusterDataPlane', 'cdp-prod'), false],
      ]),
    });
    expect(projectHasCiliumEnvironment('ns', 'pipe', index)).toBe(false);
  });

  it('is false when the project has no deployment pipeline', () => {
    expect(projectHasCiliumEnvironment('ns', undefined, makeIndex())).toBe(
      false,
    );
  });

  it('is false when the pipeline has no known environments', () => {
    expect(projectHasCiliumEnvironment('ns', 'unknown', makeIndex())).toBe(
      false,
    );
  });

  it('is false when an env has no indexed DataPlane ref', () => {
    const index = makeIndex({
      envDpRefByNs: new Map([['ns', new Map()]]),
    });
    expect(projectHasCiliumEnvironment('ns', 'pipe', index)).toBe(false);
  });
});
